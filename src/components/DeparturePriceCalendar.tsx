"use client";

import { useState } from "react";
import { IconChevron } from "@/components/icons/Chevron";
import { IconCalendarDays } from "@/components/icons/MenuIcons";
import { announceTourDate } from "@/lib/tourBooking";

// 출발일 달력 — 한 달씩, 날짜마다 1인 요금을 만원 단위로 미리 보여준다 (사장님 작업지시 2026-10-25)
//  - 이달 최저가 날짜는 빨간 요금으로 표시하고, 머리에 "N월 최저가"를 단다. 최저가 판단은 실제 원 단위 가격.
//  - 날짜를 고르면 문의 패널(PC 오른쪽·휴대폰 아래 바)에 정확한 원 단위 요금이 뜬다. 입력창은 패널 하나로 통합.
//  - 마감 표시는 없다 — 마감은 거래처 확인 후에만 알 수 있어, 접수 후 안내한다 (사장님 확정 10/25).

type PriceEntry = { date: string; price: number; nights?: number; days?: number };

type Props = {
  departurePrices: PriceEntry[];
  nights: number;
  days: number;
};

const fmtWon = (p: number) => p.toLocaleString("ko-KR") + "원";
const shortWon = (p: number) => `${Math.floor(p / 10000)}만`;

export default function DeparturePriceCalendar({ departurePrices, nights, days }: Props) {
  const today = new Date();
  const [view, setView] = useState(() => {
    const first = departurePrices.find((p) => new Date(p.date) >= today);
    const d = first ? new Date(first.date) : today;
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  // 처음부터 가장 가까운 출발일을 골라 둔다 — 문의 패널 기본값과 같게 (지시서 4·5)
  const [selected, setSelected] = useState<string | null>(() =>
    departurePrices.map((p) => p.date).filter((d) => new Date(d) >= today).sort()[0] ?? null);
  // 출발 없는 날짜를 눌렀을 때 안내 — 반응 없는 클릭 방지 (클래리티 2026-09-15)
  const [hint, setHint] = useState<{ day: string; nearest: string | null } | null>(null);

  const entryMap = new Map(departurePrices.map((p) => [p.date, p]));
  const upcoming = departurePrices.map((p) => p.date).filter((d) => new Date(d) >= today).sort();
  const lastDeparture = upcoming[upcoming.length - 1] ?? null;

  const { year, month } = view;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // 이달 최저가 — 같은 조건(이 상품 1인 요금)의 실제 원 단위 가격으로 판단
  const monthPrices = upcoming
    .filter((d) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
    .map((d) => entryMap.get(d)!.price);
  const monthLow = monthPrices.length ? Math.min(...monthPrices) : null;

  const moveMonth = (dir: 1 | -1) => {
    setView((v) => {
      let m = v.month + dir;
      let y = v.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      // 지난달로는 내려가지 않는다
      if (y < today.getFullYear() || (y === today.getFullYear() && m < today.getMonth())) return v;
      return { year: y, month: m };
    });
  };

  function nearestDeparture(ds: string) {
    const t = new Date(ds).getTime();
    let best: string | null = null;
    for (const d of upcoming) {
      if (best === null || Math.abs(new Date(d).getTime() - t) < Math.abs(new Date(best).getTime() - t)) best = d;
    }
    return best;
  }
  const shortDate = (ds: string) => { const [, m, d] = ds.split("-"); return `${Number(m)}/${Number(d)}`; };

  const pick = (ds: string | null) => {
    setSelected(ds);
    setHint(null);
    const e = ds ? entryMap.get(ds) : null;
    announceTourDate(e && ds ? { date: ds, price: e.price, nights: e.nights ?? nights, days: e.days ?? days } : null);
  };
  function pickNearest(ds: string) {
    const d = new Date(ds);
    if (d.getFullYear() !== year || d.getMonth() !== month) setView({ year: d.getFullYear(), month: d.getMonth() });
    pick(ds);
  }

  const selectedEntry = selected ? entryMap.get(selected) : null;
  const selNights = selectedEntry?.nights ?? nights;
  const selDays = selectedEntry?.days ?? days;
  const daysNum = Number(selDays);
  const returnDate = selected && Number.isFinite(daysNum) && daysNum > 0 ? (() => {
    const d = new Date(selected);
    d.setDate(d.getDate() + daysNum - 1);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  })() : null;

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
        <h2 className="text-lg font-black text-gray-800 pb-2 border-b-2 border-accent-teal inline-flex items-center gap-1.5">
          <span className="text-brand-blue"><IconCalendarDays /></span>출발일별 요금
        </h2>
        <p className="text-[13px] text-slate-500 pb-1">1인 요금 · 만원 단위 표시</p>
        {monthLow != null && (
          <p className="ml-auto pb-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[13px] font-bold text-emerald-800">
            {month + 1}월 최저가 <b className="text-red-600">{shortWon(monthLow)}</b>
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200">
        {/* 달 이동 — 한 달씩 */}
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
            <IconChevron dir="left" className="w-5 h-5" />
          </button>
          <p className="text-[17px] font-black text-gray-800">{year}년 {month + 1}월</p>
          <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
            <IconChevron className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => (
            <div key={d} className={`text-center text-[12px] font-bold py-1 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const ds = dateStr(day);
            const entry = entryMap.get(ds);
            const isPast = new Date(ds) < today;
            const dayOfWeek = (firstDay + day - 1) % 7;
            const dayColor = dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-600" : "text-gray-800";

            if (isPast) {
              return (
                <div key={i} className="h-[56px] flex flex-col items-center justify-start pt-1 text-[14px] text-gray-300">{day}</div>
              );
            }
            if (!entry) {
              const inGap = lastDeparture !== null && ds < lastDeparture;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${month + 1}월 ${day}일 출발 없음`}
                  onClick={() => setHint({ day: ds, nearest: nearestDeparture(ds) })}
                  className={`h-[56px] rounded-lg flex flex-col items-center justify-start pt-1 gap-1 hover:bg-gray-50 ${hint?.day === ds ? "bg-gray-100" : ""}`}
                >
                  <span className={`text-[14px] font-semibold leading-7 ${dayOfWeek === 0 ? "text-red-400" : dayOfWeek === 6 ? "text-blue-400" : "text-gray-500"}`}>{day}</span>
                  {inGap && <span className="text-[11px] text-gray-400 leading-none">-</span>}
                </button>
              );
            }
            const isSelected = selected === ds;
            const isLow = monthLow != null && entry.price === monthLow;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(isSelected ? null : ds)}
                aria-pressed={isSelected}
                aria-label={`${month + 1}월 ${day}일 출발 · 1인 ${fmtWon(entry.price)}`}
                className="h-[56px] rounded-lg flex flex-col items-center justify-start pt-1 gap-0.5 hover:bg-blue-50/60 transition-colors"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-bold leading-none ${isSelected ? "bg-brand-blue text-white" : dayColor}`}>{day}</span>
                <span className={`text-[11px] md:text-[12px] font-bold leading-none ${isSelected ? "text-brand-blue" : "text-slate-600"}`}>{Math.floor(entry.price / 10000)}만</span>
                {isLow && <span className="text-[9px] font-bold text-red-500 leading-none">최저가</span>}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-[12px] text-gray-500">숫자는 1인 요금(만원 단위) · <b className="text-red-500">최저가</b>는 이달 가장 낮은 요금 · <b>-</b>는 요금 미등록(문의)</p>

        {hint && (
          <div role="status" className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600">
            <span><b className="text-gray-800">{shortDate(hint.day)}</b>은 출발이 없어요.</span>
            {hint.nearest ? (
              <span>
                가까운 출발일은{" "}
                <button type="button" onClick={() => pickNearest(hint.nearest!)} className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-800">
                  {shortDate(hint.nearest)}
                </button>
                이에요.
              </span>
            ) : (
              <span>남은 출발일이 없어요. 전화·카톡으로 문의해 주세요.</span>
            )}
          </div>
        )}
      </div>

      {/* 선택한 날짜 요약 — 정확한 원 단위 요금. 입력은 문의 패널(PC 오른쪽 · 휴대폰 아래 바)에서 */}
      {selected && selectedEntry ? (
        <div className="mt-3 rounded-2xl bg-soft-blue border border-brand-blue/20 px-4 py-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <p className="text-[15px] font-black text-slate-900">
            {selected.replace(/-/g, ".")} 출발 · {selNights}박 {selDays}일{returnDate ? ` · 귀국 ${returnDate}` : ""}
          </p>
          <p className="text-slate-900"><b className="text-[20px] font-black text-red-600">{fmtWon(selectedEntry.price)}</b> <span className="text-[13px] font-semibold">(1인요금)</span></p>
          <p className="w-full text-[12px] text-slate-500">예약문의는 <span className="lg:hidden">아래 <b>예약문의</b> 버튼</span><span className="hidden lg:inline">오른쪽 <b>문의 패널</b></span>에서 이어 주세요. 유류할증료 포함 요금입니다.</p>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-slate-500 text-center">날짜를 누르면 정확한 1인 요금이 표시됩니다</p>
      )}
    </div>
  );
}
