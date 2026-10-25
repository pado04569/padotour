"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Tour } from "@/data/tours";
import { IconChevron } from "./icons/Chevron";
import { availableDates, dateLabel, departureMap, localIso, matchesNights, minPeopleOf, NIGHTS_OPTIONS, nightsText, parseNights, type NightsFilter, type SortKey } from "@/lib/tourSearch";
import DateCalendar from "./DateCalendar";
import PeopleStepper from "./PeopleStepper";

// 조건 바 (사장님 작업지시 2026-10-25 ②③)
//  - 홈 검색창과 같은 용어·순서: 출발공항 · 출발일 · 여행기간 · 인원 · 골프여행 검색
//  - 국가 선택 칸은 없다 — 국가 이동은 상단 메뉴, 지역은 본문 지역 버튼·지도에서
//  - 출발일을 누르면 날짜 선택창만 연다(국가 선택을 반복 노출하지 않는다)
// 이동은 모두 링크(주소)로 한다 — 뒤로가기·새로고침·공유해도 조건이 남는다.

export type SearchPatch = { country?: string; date?: string; people?: number; nights?: NightsFilter; sort?: SortKey; departure?: string };

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommend", label: "추천순" },
  { key: "date", label: "가까운 출발일순" },
  { key: "price", label: "낮은 가격순" },
];
const DEP_OPTIONS = [
  { value: "", label: "전체 공항" },
  { value: "incheon", label: "인천" },
  { value: "busan", label: "부산" },
  { value: "cheongju", label: "청주" },
  { value: "daegu", label: "대구" },
];
const IconMoon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
);
const IconSearch = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
const IconCal = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
const IconPlane = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 19h19M6 16l-2.5-5 2-.5 3 3 5-1.5-4-7.5 2.5-.5 6.5 7 4.5-1a1.7 1.7 0 0 1 1 3.2L6 16z" /></svg>
);

export function SortBar({ sort, hrefFor }: { sort: SortKey; hrefFor: (s: SortKey) => string }) {
  return (
    <nav aria-label="정렬" className="grid grid-cols-3 w-full md:w-auto md:max-w-[480px] rounded-xl border-[1.5px] border-[#D9E1EA] overflow-hidden bg-white">
      {SORTS.map((s, i) => (
        <Link
          key={s.key}
          href={hrefFor(s.key)}
          scroll={false}
          replace
          aria-current={sort === s.key ? "true" : undefined}
          className={`flex items-center justify-center min-h-[46px] px-2.5 text-[15px] whitespace-nowrap transition-colors ${i ? "border-l-[1.5px] border-[#D9E1EA]" : ""} ${
            sort === s.key ? "bg-brand-blue text-white font-extrabold" : "text-main-text font-semibold hover:bg-page-bg"
          }`}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export default function DepartureSearch({
  pool,
  country,
  date,
  people,
  nights,
  departure,
  hrefWith,
  openSignal,
}: {
  /** 출발공항으로 이미 걸러진 상품 — 달력의 출발 가능 날짜와 결과 수 계산에 쓴다 */
  pool: Tour[];
  country: string;
  date: string;
  people: number;
  /** 박수 0(전체) · 2~8 · "5+"(5박 이상) */
  nights: NightsFilter;
  /** 주소의 출발공항 (없으면 "") */
  departure: string;
  hrefWith: (p: SearchPatch) => string;
  /** 결과 0개 화면의 '검색 조건 수정' 버튼 — 숫자가 바뀌면 날짜 선택창을 연다 */
  openSignal?: number;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ date, people, nights, departure });
  // 주소가 바뀌면(뒤로가기 등) 부모가 key 를 바꿔 입력값을 새로 맞춘다

  const [seenSignal, setSeenSignal] = useState(openSignal ?? 0);
  if ((openSignal ?? 0) !== seenSignal) { setSeenSignal(openSignal ?? 0); setDraft({ date, people, nights, departure }); setOpen(true); }
  const searchHref = hrefWith({ date: draft.date, people: draft.people, nights: draft.nights, departure: draft.departure });

  const field = "flex items-center gap-2.5 min-h-14 px-3.5 rounded-xl border-[1.5px] border-slate-300 bg-white text-left hover:border-brand-blue";
  const label = "text-[13px] font-semibold text-slate-500 leading-tight";
  const value = "text-[17px] font-extrabold leading-tight truncate";

  return (
    <div className="rounded-2xl bg-soft-blue p-2.5 md:p-3 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-[1fr_1.1fr_1fr_1.15fr_auto] gap-2 md:gap-2.5">
        {/* 출발공항 — 홈과 같은 용어 (사장님 지시 ①) */}
        <label className={`relative ${field} cursor-pointer`}>
          <span className="text-brand-blue"><IconPlane /></span>
          <span className="flex flex-col min-w-0 flex-1">
            <span className={label}>출발공항</span>
            <span className={`${value} text-slate-900`}>{DEP_OPTIONS.find((o) => o.value === draft.departure)?.label ?? "전체 공항"}</span>
          </span>
          <IconChevron dir="down" className="w-4 h-4 text-slate-600 flex-none" />
          <select
            aria-label="출발공항"
            value={draft.departure}
            onChange={(e) => setDraft((d) => ({ ...d, departure: e.target.value }))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {DEP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        {/* 출발일 — 누르면 날짜 선택창만 */}
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={field}>
          <span className="text-brand-blue"><IconCal /></span>
          <span className="flex flex-col min-w-0">
            <span className={label}>출발일</span>
            <span className={`${value} ${draft.date ? "text-slate-900" : "text-slate-600"}`}>{draft.date ? dateLabel(draft.date) : "날짜 선택"}</span>
          </span>
        </button>
        {/* 여행기간 — 홈과 같은 용어 (예전 '박수') */}
        <label className={`relative ${field} cursor-pointer`}>
          <span className="text-brand-blue"><IconMoon /></span>
          <span className="flex flex-col min-w-0 flex-1">
            <span className={label}>여행기간</span>
            <span className={`${value} text-slate-900`}>{nightsText(draft.nights)}</span>
          </span>
          <IconChevron dir="down" className="w-4 h-4 text-slate-600 flex-none" />
          <select
            aria-label="여행기간"
            value={String(draft.nights)}
            onChange={(e) => setDraft((d) => ({ ...d, nights: parseNights(e.target.value) }))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {NIGHTS_OPTIONS.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
          </select>
        </label>
        <PeopleStepper value={draft.people} onChange={(n) => setDraft((d) => ({ ...d, people: n }))} />
        <div className="col-span-2 md:contents">
          <Link
            href={searchHref}
            scroll={false}
            className="flex items-center justify-center gap-1.5 min-h-14 px-6 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-[17px] font-extrabold whitespace-nowrap"
          >
            <IconSearch />골프여행 검색
          </Link>
        </div>
      </div>

      {open && (
        <DateSheet
          pool={pool}
          country={country}
          draft={draft}
          setDraft={setDraft}
          onClose={() => setOpen(false)}
          resultHref={searchHref}
        />
      )}
    </div>
  );
}

// 날짜 선택창 — 출발일만 (국가 선택을 반복 노출하지 않는다, 사장님 지시 ③)
function DateSheet({
  pool,
  country,
  draft,
  setDraft,
  onClose,
  resultHref,
}: {
  pool: Tour[];
  country: string;
  draft: { date: string; people: number; nights: NightsFilter; departure: string };
  setDraft: React.Dispatch<React.SetStateAction<{ date: string; people: number; nights: NightsFilter; departure: string }>>;
  onClose: () => void;
  resultHref: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const today = localIso();

  const inCountry = useMemo(() => (country === "all" ? pool : pool.filter((t) => t.countryCode === country)), [pool, country]);
  const avail = useMemo(() => availableDates(inCountry, today), [inCountry, today]);

  const count = useMemo(
    () =>
      inCountry.filter((t) => {
        if (draft.date && !departureMap(t).has(draft.date)) return false;
        if (!matchesNights(t, draft.nights)) return false;
        const min = minPeopleOf(t);
        return min === null || min <= draft.people;
      }).length,
    [inCountry, draft.date, draft.people, draft.nights],
  );

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-drawer-open", "");
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.removeAttribute("data-drawer-open");
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/45" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-t-[20px] md:rounded-2xl shadow-2xl px-4 pt-2.5 pb-5 md:p-6 break-keep"
      >
        <div className="md:hidden w-11 h-[5px] rounded-full bg-slate-300 mx-auto mb-2" aria-hidden="true" />
        <div className="flex items-center justify-between mb-2">
          <h2 id={titleId} className="text-[19px] font-black text-slate-900">출발일 선택</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div className="flex items-center justify-end mb-1.5">
          {draft.date && (
            <button type="button" onClick={() => setDraft((d) => ({ ...d, date: "" }))} className="min-h-11 px-2 -mr-2 text-sm font-semibold text-slate-500 underline underline-offset-2">
              날짜 지우기
            </button>
          )}
        </div>
        <DateCalendar avail={avail} value={draft.date} onChange={(iso) => setDraft((d) => ({ ...d, date: iso }))} today={today} />

        <Link
          href={resultHref}
          scroll={false}
          onClick={onClose}
          className="mt-4 flex items-center justify-center gap-1.5 min-h-14 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-lg font-extrabold"
        >
          <IconSearch />
          {count > 0 ? `상품 ${count}개 보기` : "상품 보기"}
        </Link>
      </div>
    </div>
  );
}
