"use client";

import { useState } from "react";

type PriceEntry = { date: string; price: number };

type Props = {
  departurePrices: PriceEntry[];
  nights: number;
  days: number;
  tourTitle?: string;
};

function formatPrice(p: number) {
  return p.toLocaleString("ko-KR") + "원";
}

export default function DeparturePriceCalendar({ departurePrices, nights, days, tourTitle }: Props) {
  const today = new Date();
  const [baseMonth, setBaseMonth] = useState(() => {
    const first = departurePrices.find(p => new Date(p.date) >= today);
    if (first) {
      const d = new Date(first.date);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [people, setPeople] = useState("2");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const priceMap = new Map(departurePrices.map(p => [p.date, p.price]));

  const months = [0, 1, 2].map(offset => {
    let month = baseMonth.month + offset;
    let year = baseMonth.year;
    while (month > 11) { month -= 12; year++; }
    return { year, month };
  });

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function dateStr(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedPrice = selected ? priceMap.get(selected) : null;
  const returnDate = selected ? (() => {
    const d = new Date(selected);
    d.setDate(d.getDate() + days - 1);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  })() : null;

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !phone.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourTitle: tourTitle ?? "골프여행 상품",
          departureDate: selected,
          nights,
          days,
          people,
          phone: phone.trim(),
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        alert("전송 중 오류가 발생했습니다. 전화(02-6401-5252)로 문의해 주세요.");
      }
    } catch {
      alert("전송 중 오류가 발생했습니다. 전화(02-6401-5252)로 문의해 주세요.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">📅 출발일 선택 · 요금 확인</h2>

      <div className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100">
        {/* 월 이동 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setBaseMonth(b => {
              let m = b.month - 1; let y = b.year;
              if (m < 0) { m = 11; y--; }
              return { year: y, month: m };
            })}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold"
          >
            ‹
          </button>
          <span className="text-sm font-bold text-gray-600">
            {months[0].year}.{String(months[0].month + 1).padStart(2, "0")} ~ {months[2].year}.{String(months[2].month + 1).padStart(2, "0")}
          </span>
          <button
            onClick={() => setBaseMonth(b => {
              let m = b.month + 1; let y = b.year;
              if (m > 11) { m = 0; y++; }
              return { year: y, month: m };
            })}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold"
          >
            ›
          </button>
        </div>

        {/* 캘린더 3개 */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {months.map(({ year, month }) => {
            const totalDays = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfWeek(year, month);
            const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

            return (
              <div key={`${year}-${month}`} className="flex-shrink-0 w-[200px] md:w-auto md:flex-1">
                <div className="text-center font-black text-gray-700 mb-2 text-sm">
                  {year}.{String(month + 1).padStart(2, "0")}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {weekDays.map((d, i) => (
                    <div key={d} className={`text-center text-[10px] font-bold py-1 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>
                      {d}
                    </div>
                  ))}
                  {cells.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const ds = dateStr(year, month, day);
                    const price = priceMap.get(ds);
                    const isSelected = selected === ds;
                    const isPast = new Date(ds) < today;
                    const dayOfWeek = (firstDay + day - 1) % 7;

                    if (!price || isPast) {
                      return (
                        <div key={i} className={`text-center py-1 text-[11px] ${isPast ? "text-gray-300" : dayOfWeek === 0 ? "text-red-300" : dayOfWeek === 6 ? "text-blue-300" : "text-gray-300"}`}>
                          {day}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => { setSelected(isSelected ? null : ds); setShowForm(false); setSent(false); }}
                        className={`rounded text-center py-1 text-[11px] font-bold transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-4 h-4 bg-emerald-100 rounded inline-block" /> 출발가능</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 bg-emerald-600 rounded inline-block" /> 선택됨</span>
        </div>
      </div>

      {/* 선택된 날짜 요금 표시 */}
      {selected && selectedPrice ? (
        <div className="mt-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-gray-500 mb-1">선택한 출발일</p>
              <p className="text-xl font-black text-gray-800">
                {selected.replace(/-/g, ".")} 출발
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {nights}박 {days}일 · 귀국 {returnDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">1인 요금 (성인·2인 이상)</p>
              <p className="text-3xl font-black text-emerald-700">{formatPrice(selectedPrice)}</p>
              <p className="text-xs text-gray-400 mt-0.5">유류할증료 포함</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-200">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full block text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-6 py-3.5 rounded-full text-base transition-colors"
              >
                📋 {selected.replace(/-/g, ".")} 출발 예약 문의
              </button>
            ) : sent ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-black text-blue-800 text-base">문의 접수 완료!</p>
                <p className="text-sm text-gray-600 mt-1">담당자가 카카오톡으로 견적서를 보내드립니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-sm font-bold text-gray-700 mb-2">📋 예약 문의 정보 입력</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">인원수</label>
                    <select
                      value={people}
                      onChange={e => setPeople(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <option key={n} value={n}>{n}명</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-[2]">
                    <label className="text-xs text-gray-500 mb-1 block">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      required
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-full text-sm"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !phone.trim()}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-black py-3 rounded-full text-sm transition-colors"
                  >
                    {sending ? "전송 중..." : "문의 접수하기"}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center">담당자가 카카오톡으로 견적서를 발송해 드립니다</p>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center text-gray-400 text-sm">
          출발 가능한 날짜(초록색)를 선택하면 요금이 표시됩니다
        </div>
      )}
    </div>
  );
}
