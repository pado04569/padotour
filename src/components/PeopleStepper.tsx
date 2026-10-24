"use client";

import { IconUsers } from "./icons/MenuIcons";

// 인원 − / + 칸 — 상품 목록 검색과 첫 화면 검색이 같이 쓴다 (2026-10-25)
// 상품 데이터를 안 싣는 파일이라 공항 홈(서버 화면)에서도 가볍게 쓸 수 있다.
export const MAX_PEOPLE = 20;

export default function PeopleStepper({
  value,
  onChange,
  compact,
  boxClass,
  labelClass,
}: {
  value: number;
  onChange: (n: number) => void;
  compact?: boolean;
  /** 바깥 상자 모양을 통째로 바꿀 때 (첫 화면 검색판 안에서는 테두리 없이) */
  boxClass?: string;
  labelClass?: string;
}) {
  // 버튼은 글자보다 넓게(48px, Codex 검수 10/25) — 50~60대 고객이 쉽게 누르게
  const btn = "w-12 h-12 flex-none rounded-full border-[1.5px] border-slate-300 bg-white flex items-center justify-center text-[22px] leading-none text-slate-700 hover:border-emerald-500 disabled:opacity-35 disabled:hover:border-slate-300";
  return (
    <div className={boxClass ?? `flex items-center gap-1.5 min-[400px]:gap-2 ${compact ? "" : "min-h-14"} pl-3 min-[400px]:pl-3.5 pr-1.5 py-1 rounded-xl border-[1.5px] border-slate-300 bg-white`}>
      <span className="text-emerald-600 hidden min-[400px]:block md:block"><IconUsers className="w-5 h-5" /></span>
      <span className="flex flex-col flex-1 min-w-0 whitespace-nowrap">
        <span className={labelClass ?? "text-[13px] font-semibold text-slate-500 leading-tight"}>인원</span>
        <span className="text-[17px] font-extrabold text-slate-900 leading-tight" aria-live="polite">{value}명</span>
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="인원 한 명 줄이기">−</button>
      <button type="button" className={btn} onClick={() => onChange(Math.min(MAX_PEOPLE, value + 1))} disabled={value >= MAX_PEOPLE} aria-label="인원 한 명 늘리기">+</button>
    </div>
  );
}
