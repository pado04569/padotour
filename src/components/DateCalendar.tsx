"use client";

import { useState } from "react";
import { IconChevron } from "./icons/Chevron";
import { dateLabel } from "@/lib/tourSearch";

// 출발일 달력 — 초록 점은 실제 출발일 자료가 있는 날만 (사장님 확정 2026-10-10)
// 상품 목록 '조건 정하기'와 첫 화면 검색이 같은 달력을 쓴다 (2026-10-25). 상품 데이터는 싣지 않는다.
export default function DateCalendar({
  avail,
  value,
  onChange,
  today,
}: {
  /** 출발 가능한 날짜(YYYY-MM-DD) */
  avail: Set<string>;
  value: string;
  onChange: (iso: string) => void;
  today: string;
}) {
  // 달력 범위: 이번 달 ~ 출발일 자료가 있는 마지막 달
  const sorted = [...avail].sort();
  const firstMonth = today.slice(0, 7);
  const lastMonth = sorted.length ? sorted[sorted.length - 1].slice(0, 7) : firstMonth;
  const [month, setMonth] = useState(() => {
    const m = (value || sorted[0] || today).slice(0, 7);
    return m < firstMonth ? firstMonth : m;
  });
  const shift = (n: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const [y, m] = month.split("-").map(Number);
  const lead = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];

  return (
    <div className="border-[1.5px] border-slate-200 rounded-2xl p-2.5">
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={() => shift(-1)} disabled={month <= firstMonth} aria-label="이전 달" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-25">
          <IconChevron dir="left" className="w-5 h-5" />
        </button>
        <span className="text-base font-extrabold text-slate-900" aria-live="polite">{y}년 {m}월</span>
        <button type="button" onClick={() => shift(1)} disabled={month >= lastMonth} aria-label="다음 달" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-25">
          <IconChevron dir="right" className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[13px] text-slate-500 mb-0.5" aria-hidden="true">
        {"일월화수목금토".split("").map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`b${i}`} />;
          const ok = avail.has(iso);
          const on = value === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={!ok && !on}
              onClick={() => onChange(iso)}
              aria-pressed={on}
              aria-label={`${dateLabel(iso)}${ok ? " 출발 가능" : " 출발 상품 없음"}`}
              className={`h-11 flex flex-col items-center justify-center rounded-[10px] text-[15px] transition-colors ${
                on ? "bg-emerald-600 text-white font-extrabold" : ok ? "text-slate-900 font-semibold hover:bg-emerald-50" : "text-slate-300"
              }`}
            >
              {Number(iso.slice(8))}
              {ok && !on && <i className="block w-1 h-1 rounded-full bg-emerald-500 mt-0.5" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="text-[12.5px] text-slate-500 mt-1.5 px-0.5">초록 점: 출발 가능한 상품이 있는 날</p>
    </div>
  );
}
