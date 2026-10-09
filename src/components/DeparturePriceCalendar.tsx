"use client";

import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import YellowArrow from "@/components/YellowArrow";
import { PEOPLE_OPTIONS, PEOPLE_MAX_LABEL, isValidPhone, phoneHint, todayKST } from "@/lib/inquiryForm";

type PriceEntry = { date: string; price: number; nights?: number; days?: number };

type Props = {
  departurePrices: PriceEntry[];
  nights: number;
  days: number;
  tourTitle?: string;
  /** 4인 이상 출발 상품이면 4 — 그보다 적은 인원은 "예약불가"로 막는다 */
  minPeople?: number;
};

function formatPrice(p: number) {
  return p.toLocaleString("ko-KR") + "원";
}

export default function DeparturePriceCalendar({ departurePrices, nights, days, tourTitle, minPeople }: Props) {
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
  const [people, setPeople] = useState(String(minPeople ?? 2));
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // 출발 없는 회색 날짜를 눌렀을 때 알려주는 안내.
  // 예전엔 눌러도 아무 반응이 없어 클래리티 "반응 없는 클릭"으로 잡혔다 (2026-09-15)
  const [hint, setHint] = useState<{ day: string; nearest: string | null } | null>(null);

  const priceMap = new Map(departurePrices.map(p => [p.date, p.price]));
  const entryMap = new Map(departurePrices.map(p => [p.date, p]));

  const upcoming = departurePrices.map(p => p.date).filter(d => new Date(d) >= today).sort();
  // 출발일 사이에 빠진 날(예: 10/8~10, 10/26~31)은 칸 안에 "없음"을 적어 눌러보기 전에 알 수 있게 한다.
  // 마지막 출발일 뒤는 전부 비어 있어 표시하면 달력이 "없음"으로 덮이므로 출발 기간 안쪽만 (2026-10-05)
  const lastDeparture = upcoming[upcoming.length - 1] ?? null;
  function nearestDeparture(ds: string) {
    const t = new Date(ds).getTime();
    let best: string | null = null;
    for (const d of upcoming) {
      if (best === null || Math.abs(new Date(d).getTime() - t) < Math.abs(new Date(best).getTime() - t)) best = d;
    }
    return best;
  }
  function shortDate(ds: string) {
    const [, m, d] = ds.split("-");
    return `${Number(m)}/${Number(d)}`;
  }
  function pickNearest(ds: string) {
    const d = new Date(ds);
    const y = d.getFullYear(), m = d.getMonth();
    const visible = months.some(v => v.year === y && v.month === m);
    if (!visible) setBaseMonth({ year: y, month: m });
    setSelected(ds);
    setShowForm(false);
    setSent(false);
    setHint(null);
  }

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
  const selectedEntry = selected ? entryMap.get(selected) : null;
  const selectedNights = selectedEntry?.nights ?? nights;
  const selectedDays = selectedEntry?.days ?? days;
  // tours.json 의 nights/days 는 글자("4")나 범위("3~4")로 들어 있는 상품이 많다(63개 중 38개, 2026-09-15).
  // 글자 그대로 더하면 "5"+"4"="54" 가 되어 10/5 출발이 "귀국 11/22" 로 나왔다 → 숫자로 바꾸고, 한 숫자가 아니면 귀국일을 숨긴다.
  const daysNum = Number(selectedDays);
  const returnDate = selected && Number.isFinite(daysNum) && daysNum > 0 ? (() => {
    const d = new Date(selected);
    d.setDate(d.getDate() + daysNum - 1);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  })() : null;

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 달력의 "출발 예약 문의" 폼도 문의 이벤트를 보낸다 (2026-09-15).
  // 예전엔 아래쪽 ContactOptions 폼만 측정돼서, 이 폼으로 들어온 문의는 GA4 에 하나도 안 잡혔다.
  // 이벤트 이름·방식은 ContactOptions 와 같게 하고, 어느 폼인지 method 로 구분한다.
  const openedOnce = useRef(false);
  const startedOnce = useRef(false);

  function openForm() {
    setShowForm(true);
    if (!openedOnce.current) {
      openedOnce.current = true;
      track("inquiry_open", { item_name: tourTitle, method: "calendar" });
    }
  }

  function markStart(field: "people" | "phone") {
    if (startedOnce.current) return;
    startedOnce.current = true;
    track("inquiry_start", { item_name: tourTitle, first_field: field, method: "calendar" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !isValidPhone(phone) || !agreed) return;
    setSending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourTitle: tourTitle ?? "골프여행 상품",
          departureDate: selected,
          nights: selectedNights,
          days: selectedDays,
          people,
          phone: phone.trim(),
          agreedPrivacy: true,
        }),
      });
      if (res.ok) {
        setSent(true);
        // 전환 — 연락처는 보내지 않는다. 인원수만.
        track("generate_lead", { item_name: tourTitle, people: Number(people), method: "calendar" });
      } else {
        track("inquiry_fail", { item_name: tourTitle, reason: `status_${res.status}`, method: "calendar" });
        alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
      }
    } catch {
      track("inquiry_fail", { item_name: tourTitle, reason: "network", method: "calendar" });
      alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
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
          {/* 두 화살표 사이 텍스트라 눌러도 반응 없는 클릭이 잡혔다(클래리티 배달못한클릭 3회, 2026-09-28)
              → 누르면 가장 가까운 출발 가능 달로 돌아가게 한다 */}
          <button
            type="button"
            onClick={() => {
              const first = departurePrices.find(p => new Date(p.date) >= today);
              if (first) {
                const d = new Date(first.date);
                setBaseMonth({ year: d.getFullYear(), month: d.getMonth() });
              }
            }}
            aria-label="가장 가까운 출발 가능 달로 이동"
            className="text-sm font-bold text-gray-600 hover:text-emerald-600 hover:bg-gray-200 rounded-lg px-2 py-1 transition-colors"
          >
            {months[0].year}.{String(months[0].month + 1).padStart(2, "0")} ~ {months[2].year}.{String(months[2].month + 1).padStart(2, "0")}
          </button>
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

        {/* 휴대폰은 석 달이 옆으로 미는 띠라 월 제목을 눌러 달을 바꾸려는 손님이 있었다
            (클래리티 배달못한클릭 '2026.10' 4회, 2026-10-04) → 미는 방법을 한 줄로 알려준다 (사장님 확정 2026-10-05) */}
        <p className="md:hidden text-right text-xs font-bold text-emerald-600 mb-1.5">
          옆으로 밀어 다음 달 보기 ›
        </p>
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

                    if (isPast) {
                      return (
                        <div key={i} className="text-center py-1 text-[11px] text-gray-300">
                          {day}
                        </div>
                      );
                    }

                    if (!price) {
                      const inGap = lastDeparture !== null && ds < lastDeparture;
                      return (
                        <button
                          key={i}
                          type="button"
                          aria-label={`${month + 1}월 ${day}일 출발 없음`}
                          onClick={() => setHint({ day: ds, nearest: nearestDeparture(ds) })}
                          className={`rounded text-center py-1 text-[11px] leading-tight hover:bg-gray-200 ${inGap ? "bg-gray-100" : ""} ${hint?.day === ds ? "bg-gray-200" : ""} ${dayOfWeek === 0 ? "text-red-300" : dayOfWeek === 6 ? "text-blue-300" : "text-gray-300"}`}
                        >
                          {day}
                          {inGap && <span className="block text-[8px] text-gray-400 leading-none mt-0.5">없음</span>}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => { setSelected(isSelected ? null : ds); setShowForm(false); setSent(false); setHint(null); }}
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
          <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-100 border border-gray-200 rounded inline-block" /> 출발없음</span>
        </div>

        {hint && (
          <div role="status" className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-600">
            <span><b className="text-gray-800">{shortDate(hint.day)}</b>은 출발이 없어요.</span>
            {hint.nearest ? (
              <span>
                가까운 출발일은{" "}
                <button
                  type="button"
                  onClick={() => pickNearest(hint.nearest!)}
                  className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                >
                  {shortDate(hint.nearest)}
                </button>
                이에요.
              </span>
            ) : (
              <span>남은 출발일이 없어요. 카톡으로 문의해 주세요.</span>
            )}
          </div>
        )}
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
                {selectedNights}박 {selectedDays}일{returnDate ? ` · 귀국 ${returnDate}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">{minPeople != null ? "1인 요금" : "1인 요금 (성인·2인 이상)"}</p>
              <p className="text-3xl font-black text-red-600">{formatPrice(selectedPrice)}</p>
              <p className="text-xs text-gray-400 mt-0.5">유류할증료 포함</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-200">
            {!showForm ? (
              <button
                onClick={openForm}
                className="w-full block text-center bg-[#FAE100] hover:bg-[#F0D600] text-gray-900 font-black px-6 py-3.5 rounded-full text-base transition-colors"
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
                    <div className="relative">
                      <select
                        value={people}
                        onChange={e => { markStart("people"); setPeople(e.target.value); }}
                        className="w-full appearance-none border border-gray-200 rounded-xl pl-3 pr-9 py-2.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
                      >
                        {PEOPLE_OPTIONS.map(n => (
                          <option key={n} value={n} disabled={minPeople != null && n < minPeople}>
                            {PEOPLE_MAX_LABEL(n)}{minPeople != null && n < minPeople ? " · 예약불가" : ""}
                          </option>
                        ))}
                      </select>
                      <YellowArrow />
                    </div>
                  </div>
                  <div className="flex-[2]">
                    <label className="text-xs text-gray-500 mb-1 block">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => { markStart("phone"); setPhone(e.target.value); }}
                      placeholder="010-0000-0000"
                      required
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    {phoneHint(phone) && <p className="text-[11px] text-red-600 mt-1">{phoneHint(phone)}</p>}
                  </div>
                </div>
                {/* 개인정보 수집·이용 동의 — 서버가 동의 없이는 접수를 거절한다(2026-09-28부터). 이 폼에만 빠져 있어 접수가 전부 오류였다 */}
                <div>
                  <label className="flex items-start gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 flex-shrink-0"
                      required
                    />
                    <span>
                      개인정보 수집·이용에 동의합니다.{" "}
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setShowPrivacy(!showPrivacy); }}
                        className="underline text-emerald-700"
                      >
                        {showPrivacy ? "내용 접기" : "내용 보기"}
                      </button>
                    </span>
                  </label>
                  {showPrivacy && (
                    <div className="mt-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-[10px] text-gray-500 leading-relaxed space-y-0.5">
                      <p>· 수집 항목: 휴대폰 번호, 출발 희망일, 인원수</p>
                      <p>· 수집 목적: 예약 문의 상담 및 맞춤 견적 안내</p>
                      <p>· 보유 기간: 문의 처리 완료 후 1년 (예약문의 내역 조회 서비스 제공을 위해 보관)</p>
                      <p>· 동의를 거부하실 수 있으며, 이 경우 문의 접수가 제한됩니다.</p>
                    </div>
                  )}
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
                    disabled={sending || !isValidPhone(phone) || !agreed}
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
