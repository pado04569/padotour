"use client";

import { useEffect, useState } from "react";
import { IconChevron } from "@/components/icons/Chevron";
import { IconCalendarDays, IconPhone, IconChat } from "@/components/icons/MenuIcons";
import { announceTourDate, requestInquiryOpen } from "@/lib/tourBooking";

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
  // 한국 날짜 글자로 비교 — 시간대 섞인 Date 비교로 하루 어긋나던 것 통일, 오늘 출발은 예약 불가라 제외 (2026-10-25)
  const todayStr = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const [view, setView] = useState(() => {
    const first = departurePrices.find((p) => p.date > todayStr);
    const d = first ? new Date(first.date) : today;
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  // 날짜를 미리 고르지 않는다 — 가장 가까운 날짜가 고객이 고른 일정처럼 보였다 (가상 고객 체험·사장님 A안 10/25).
  // 목록에서 검색한 날짜(?date=)를 들고 오면 그 날짜를 고른다.
  const [selected, setSelected] = useState<string | null>(null);
  // 출발 없는 날짜를 눌렀을 때 안내 — 반응 없는 클릭 방지 (클래리티 2026-09-15). searched = 검색해서 들고 온 날짜
  const [hint, setHint] = useState<{ day: string; nearest: string | null; searched?: boolean } | null>(null);

  const entryMap = new Map(departurePrices.map((p) => [p.date, p]));
  const upcoming = departurePrices.map((p) => p.date).filter((d) => d > todayStr).sort();
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

  // 검색한 출발일 이어받기 — 정적 페이지라 주소는 화면에서 읽는다
  useEffect(() => {
    const ds = new URLSearchParams(window.location.search).get("date") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ds) || ds <= todayStr) return;
    const d = new Date(ds);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    // 문의 패널(InquiryDock)이 듣기 시작한 뒤에 알리도록 한 박자 늦춘다 — 같은 순간에 보내면 패널이 못 받는다 (2026-10-25 검증에서 발견)
    const id = window.setTimeout(() => {
      if (entryMap.has(ds)) pick(ds);
      else setHint({ day: ds, nearest: nearestDeparture(ds), searched: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

        <p className="mt-3 text-[12px] text-gray-500 break-keep">
          <span className="whitespace-nowrap">숫자는 1인 요금(만원 단위)</span> · <span className="whitespace-nowrap"><b className="text-red-500">최저가</b>는 이달 가장 낮은 요금</span> · <span className="whitespace-nowrap"><b>-</b>는 출발일이 없는 날짜</span>
        </p>

        {hint && (
          <div role="status" className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600">
            {hint.searched ? (
              <span>선택하신 날짜(<b className="text-gray-800">{shortDate(hint.day)}</b>)는 출발이 없습니다. 다른 날짜를 선택해 주세요.</span>
            ) : (
              <span><b className="text-gray-800">{shortDate(hint.day)}</b>은 출발이 없어요.</span>
            )}
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
        /* 요약칸을 누르면 바로 예약문의 입력 창 — 안내 문장은 뺀다 (사장님 지시 10/25) */
        <button type="button" onClick={requestInquiryOpen} className="mt-3 w-full rounded-2xl bg-soft-blue hover:bg-blue-100/70 border border-brand-blue/20 px-4 py-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-left transition-colors">
          <p className="text-[15px] font-black text-slate-900">
            {selected.replace(/-/g, ".")} 출발 · {selNights}박 {selDays}일{returnDate ? ` · 귀국 ${returnDate}` : ""}
          </p>
          <p className="text-slate-900"><b className="text-[20px] font-black text-red-600">{fmtWon(selectedEntry.price)}</b> <span className="text-[13px] font-semibold">(1인요금)</span></p>
          <span className="inline-flex items-center min-h-10 px-4 rounded-full bg-brand-blue text-white text-[14px] font-black">예약문의</span>
        </button>
      ) : (
        <p className="mt-3 text-[14px] font-bold text-slate-600 text-center">출발일을 선택해 주세요 <span className="font-normal text-slate-500 whitespace-nowrap">· 정확한 1인 요금이 표시됩니다</span></p>
      )}

      {/* 전화번호는 열어 보여주고, 카카오는 그 아래 세로로 (사장님 지시 10/25) */}
      <div className="mt-2.5 space-y-2 lg:hidden">
        <a href="tel:010-5301-5250" className="w-full min-h-[52px] rounded-xl border-[1.5px] border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-[16px] font-bold flex items-center justify-center gap-2">
          <IconPhone className="w-[18px] h-[18px] text-brand-blue" />전화문의 010-5301-5250
        </a>
        <a href="https://pf.kakao.com/_bxoxnXxj/chat" target="_blank" rel="noopener noreferrer" className="w-full min-h-[52px] rounded-xl bg-[#FAE100] hover:bg-[#F0D600] text-[#191919] text-[16px] font-bold flex items-center justify-center gap-2">
          <IconChat className="w-[18px] h-[18px]" />카카오톡 문의
        </a>
      </div>
    </div>
  );
}
