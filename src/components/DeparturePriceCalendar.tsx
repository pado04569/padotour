"use client";

import { useState } from "react";

type PriceEntry = { date: string; price: number };

type Props = {
  departurePrices: PriceEntry[];
  nights: number;
  days: number;
};

function formatPrice(p: number) {
  return (p / 10000).toFixed(1) + "만원";
}


export default function DeparturePriceCalendar({ departurePrices, nights, days }: Props) {
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

  const priceMap = new Map(departurePrices.map(p => [p.date, p.price]));

  // 3개월 표시
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

        {/* 캘린더 3개 (PC: 3열, 모바일: 1열 스크롤) */}
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
                        onClick={() => setSelected(isSelected ? null : ds)}
                        className={`rounded text-center py-1 text-[11px] font-bold transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        } ${dayOfWeek === 0 ? "!bg-red-100 !text-red-700 hover:!bg-red-200" + (isSelected ? " !bg-red-500 !text-white" : "") : ""}`}
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
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-6 py-3.5 rounded-full text-base transition-colors"
            >
              💬 {selected.replace(/-/g, ".")} 출발 예약 문의
            </a>
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
