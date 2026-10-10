"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Tour } from "@/data/tours";
import { countries } from "@/data/tours";
import { IconChevron } from "./icons/Chevron";
import { availableDates, dateLabel, departureMap, localIso, minPeopleOf, type SortKey } from "@/lib/tourSearch";

// 출발일로 상품 찾기 (사장님 확정 2026-10-10)
//  - 검색 전: 출발일·여행지·인원 상세 검색 (휴대폰에서 첫 화면을 다 덮지 않게 2줄로 압축)
//  - 검색 후: "11월 5일 · 일본 · 2명 [조건 바꾸기]" 한 줄 바
//  - 조건 바꾸기: 휴대폰은 아래에서 올라오는 창, PC는 가운데 창
// 이동은 모두 링크(주소)로 한다 — 뒤로가기·새로고침·공유해도 조건이 남는다.

export type SearchPatch = { country?: string; date?: string; people?: number; sort?: SortKey };

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommend", label: "추천순" },
  { key: "date", label: "가까운 출발일순" },
  { key: "price", label: "낮은 가격순" },
];
const MAX_PEOPLE = 20;
const countryLabel = (code: string) => countries.find((c) => c.code === code)?.label ?? "전체";

const IconSearch = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
const IconCal = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
const IconPin = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
const IconUser = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5" /><path d="M16 5a3 3 0 0 1 0 6M21 20c-.4-2.6-1.8-4.4-3.8-5.1" /></svg>
);

function Stepper({ value, onChange, compact }: { value: number; onChange: (n: number) => void; compact?: boolean }) {
  const btn = "w-11 h-11 flex-none rounded-full border-[1.5px] border-slate-300 bg-white flex items-center justify-center text-[22px] leading-none text-slate-700 hover:border-emerald-500 disabled:opacity-35 disabled:hover:border-slate-300";
  return (
    <div className={`flex items-center gap-1.5 min-[400px]:gap-2 ${compact ? "" : "min-h-14"} pl-3 min-[400px]:pl-3.5 pr-1.5 py-1 rounded-xl border-[1.5px] border-slate-300 bg-white`}>
      <span className="text-emerald-600 hidden min-[400px]:block md:block"><IconUser /></span>
      <span className="flex flex-col flex-1 min-w-0 whitespace-nowrap">
        <span className="text-[13px] font-semibold text-slate-500 leading-tight">인원</span>
        <span className="text-[17px] font-extrabold text-slate-900 leading-tight" aria-live="polite">{value}명</span>
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="인원 한 명 줄이기">−</button>
      <button type="button" className={btn} onClick={() => onChange(Math.min(MAX_PEOPLE, value + 1))} disabled={value >= MAX_PEOPLE} aria-label="인원 한 명 늘리기">+</button>
    </div>
  );
}

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
          className={`flex items-center justify-center min-h-[46px] px-1 text-[15px] whitespace-nowrap transition-colors ${i ? "border-l-[1.5px] border-[#D9E1EA]" : ""} ${
            // 선택된 정렬 = Brand Blue (검정 선택 상태는 쓰지 않는다 — 사장님 지시 10/10)
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
  sort,
  active,
  hrefWith,
  periodLabel,
  placeLabel,
  peopleLabel,
}: {
  /** 출발공항으로 이미 걸러진 상품 — 달력의 출발 가능 날짜와 결과 수 계산에 쓴다 */
  pool: Tour[];
  country: string;
  date: string;
  people: number;
  sort: SortKey;
  /** 검색을 한 상태인가 (주소에 date 또는 people 이 있음) */
  active: boolean;
  hrefWith: (p: SearchPatch) => string;
  /** 검색창 글이 "11월"처럼 달만 말했을 때 바에 보여줄 말 */
  periodLabel?: string;
  /** 지역까지 골랐으면 나라 대신 지역 이름 */
  placeLabel?: string;
  /** 검색 글에 인원이 없을 때 "인원 전체" */
  peopleLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ country, date, people });
  // 주소가 바뀌면(뒤로가기·국가 탭 등) 부모가 key 를 바꿔 입력값을 새로 맞춘다

  const openSheet = () => { setDraft({ country, date, people }); setOpen(true); };
  const searchHref = hrefWith({ country: draft.country, date: draft.date, people: draft.people });

  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`max-w-6xl mx-auto px-4 py-3.5 md:py-5 ${active ? "md:flex md:items-center md:gap-5" : ""}`}>
        {active ? (
          // 검색 후 — 한 줄 요약 바. 바 전체를 눌러도 조건 창이 열린다
          <button
            type="button"
            onClick={openSheet}
            aria-haspopup="dialog"
            className="w-full md:flex-1 md:max-w-2xl flex items-center gap-3 min-h-[60px] pl-4 pr-2 py-2 rounded-full border-2 border-emerald-500 bg-white shadow-[0_2px_10px_rgba(16,185,129,0.12)] text-left"
          >
            <span className="text-emerald-600 flex-none"><IconSearch /></span>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="text-base md:text-[17px] font-extrabold text-slate-900 truncate">
                {date ? dateLabel(date, "plain") : periodLabel ?? "출발일 전체"} · {placeLabel ?? countryLabel(country)} · {peopleLabel ?? `${people}명`}
              </span>
              <span className="text-[13px] text-slate-500">출발일 · 여행지 · 인원</span>
            </span>
            {/* 행동 버튼 — 선택된 필터(초록 꽉 찬 알약)와 구분되게 테두리형 */}
            <span className="flex-none inline-flex items-center min-h-11 px-4 rounded-full border-[1.5px] border-accent-teal bg-white text-emerald-700 text-[15px] font-extrabold whitespace-nowrap">조건 바꾸기</span>
          </button>
        ) : (
          // 검색 전 — 상세 검색. 휴대폰은 [출발일|여행지] / [인원|상품 찾기] 2줄
          <>
            <h2 className="text-[17px] md:text-xl font-black text-slate-900 mb-2.5">출발일로 상품 찾기</h2>
            <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1.15fr_auto] gap-2 md:gap-2.5 md:max-w-4xl">
              <button type="button" onClick={openSheet} aria-haspopup="dialog" className="flex items-center gap-2.5 min-h-14 px-3.5 rounded-xl border-[1.5px] border-slate-300 bg-white text-left hover:border-emerald-500">
                <span className="text-emerald-600"><IconCal /></span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-slate-500 leading-tight">출발일</span>
                  <span className={`text-[17px] font-extrabold leading-tight truncate ${draft.date ? "text-slate-900" : "text-emerald-700"}`}>{draft.date ? dateLabel(draft.date) : "날짜 선택"}</span>
                </span>
              </button>
              <button type="button" onClick={openSheet} aria-haspopup="dialog" className="flex items-center gap-2.5 min-h-14 px-3.5 rounded-xl border-[1.5px] border-slate-300 bg-white text-left hover:border-emerald-500">
                <span className="text-emerald-600"><IconPin /></span>
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-semibold text-slate-500 leading-tight">여행지</span>
                  <span className="text-[17px] font-extrabold text-slate-900 leading-tight truncate">{countryLabel(draft.country)}</span>
                </span>
                <IconChevron dir="down" className="w-4 h-4 text-slate-400 flex-none" />
              </button>
              <div className="col-span-2 grid grid-cols-[1.45fr_1fr] gap-2 md:contents">
              <Stepper value={draft.people} onChange={(n) => setDraft((d) => ({ ...d, people: n }))} />
              <Link
                href={searchHref}
                scroll={false}
                className="flex items-center justify-center gap-1.5 min-h-14 px-6 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-[17px] font-extrabold whitespace-nowrap"
              >
                <IconSearch />상품 찾기
              </Link>
              </div>
            </div>
          </>
        )}
        {/* 정렬 — 검색 후 PC에서는 조건 바 옆에 붙여 상품이 더 빨리 보이게 */}
        <div className={`mt-2.5 ${active ? "md:mt-0 md:w-[440px] md:flex-none" : "md:mt-3"}`}>
          <SortBar sort={sort} hrefFor={(s) => hrefWith({ sort: s })} />
        </div>
      </div>

      {open && (
        <ConditionSheet
          pool={pool}
          draft={draft}
          setDraft={setDraft}
          onClose={() => setOpen(false)}
          resultHref={searchHref}
        />
      )}
    </section>
  );
}

function ConditionSheet({
  pool,
  draft,
  setDraft,
  onClose,
  resultHref,
}: {
  pool: Tour[];
  draft: { country: string; date: string; people: number };
  setDraft: React.Dispatch<React.SetStateAction<{ country: string; date: string; people: number }>>;
  onClose: () => void;
  resultHref: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const today = localIso();

  const inCountry = useMemo(() => (draft.country === "all" ? pool : pool.filter((t) => t.countryCode === draft.country)), [pool, draft.country]);
  const avail = useMemo(() => availableDates(inCountry, today), [inCountry, today]);

  // 결과 수 — 실제 자료로 계산 (그 인원으로 출발 가능한 상품). 0이면 숫자 없이 "상품 보기"
  const count = useMemo(
    () =>
      inCountry.filter((t) => {
        if (draft.date && !departureMap(t).has(draft.date)) return false;
        const min = minPeopleOf(t);
        return min === null || min <= draft.people;
      }).length,
    [inCountry, draft.date, draft.people],
  );

  // 달력 범위: 이번 달 ~ 출발일 자료가 있는 마지막 달
  const sorted = useMemo(() => [...avail].sort(), [avail]);
  const firstMonth = today.slice(0, 7);
  const lastMonth = sorted.length ? sorted[sorted.length - 1].slice(0, 7) : firstMonth;
  const [month, setMonth] = useState(() => {
    const m = (draft.date || sorted[0] || today).slice(0, 7);
    return m < firstMonth ? firstMonth : m;
  });
  const shift = (n: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-drawer-open", "");
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
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
  }, [onClose]);

  const [y, m] = month.split("-").map(Number);
  const lead = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];

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
          <h2 id={titleId} className="text-[19px] font-black text-slate-900">조건 정하기</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {/* 출발일 달력 — 초록 점은 실제 출발일 자료가 있는 날만 */}
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-sm font-bold text-slate-600">출발일</h3>
          {draft.date && (
            <button type="button" onClick={() => setDraft((d) => ({ ...d, date: "" }))} className="min-h-11 px-2 -mr-2 text-sm font-semibold text-slate-500 underline underline-offset-2">
              날짜 지우기
            </button>
          )}
        </div>
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
              const on = draft.date === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!ok && !on}
                  onClick={() => setDraft((d) => ({ ...d, date: iso }))}
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

        {/* 여행지 — 국가 탭과 같은 목록 */}
        <h3 className="text-sm font-bold text-slate-600 mt-3.5 mb-1.5">여행지</h3>
        {/* 7개 국가가 휴대폰 폭을 넘으므로 옆으로 숨기지 않고 두 줄로 모두 보여준다 */}
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, country: c.code }))}
              aria-pressed={draft.country === c.code}
              className={`flex-none min-h-11 px-4 rounded-full text-[15px] font-bold transition-colors ${
                draft.country === c.code ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <h3 className="text-sm font-bold text-slate-600 mt-3.5 mb-1.5">인원</h3>
        <Stepper value={draft.people} onChange={(n) => setDraft((d) => ({ ...d, people: n }))} />

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
