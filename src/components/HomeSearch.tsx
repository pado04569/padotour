"use client";

import { useState } from "react";
import Link from "next/link";
import { DEP_AIRPORT, DEPARTURES, type Dep } from "@/lib/departure";
import { availFor, groupCount, metaKey, regionOptionsFor, type SearchMeta } from "@/lib/homeSearch";
import { regionLabel } from "@/lib/regionNames";
import { dateLabel, localIso, NIGHTS_OPTIONS, type NightsFilter } from "@/lib/tourSearch";
import { IconCalendarDays, IconCheck, IconMoon, IconPin, IconPlaneTakeoff, IconSearch } from "./icons/MenuIcons";
import { IconChevron } from "./icons/Chevron";
import DateCalendar from "./DateCalendar";
import PickerSheet from "./PickerSheet";
import PeopleStepper from "./PeopleStepper";

// 공항 홈 첫 화면 골프여행 검색 (사장님 확정 A안, 2026-10-25)
//  - 옅은 파랑 바탕 + 흰 입력칸 + 파란 검색 버튼. 제목 "어디로 골프여행을 떠나세요?"
//  - PC: [출발공항 | 국가·지역 | 출발일 | 인원 | 골프여행 검색] 한 줄 + 같은 판 안에 여행기간
//  - 휴대폰: [출발공항|국가·지역] / [출발일|인원] / 여행기간 / 전체 너비 검색 버튼 — 조건을 다 고른 뒤 맨 마지막에 검색
//  - 검색은 주소로 /tours 에 넘긴다(걸러내기는 상품 목록이 한다 — 같은 로직 하나만). 새로고침·뒤로가기·공유해도 조건이 남는다.
//  - 출발공항을 바꾸면 그 공항에 없는 나라·지역은 '전체 여행지'로 되돌리고, 나라를 바꾸면 지역을 비운다. 날짜·인원은 건드리지 않는다.

const DEP_SHORT: Record<Dep, string> = { incheon: "인천", busan: "부산", cheongju: "청주", daegu: "대구" };
type Sheet = null | "airport" | "place" | "date";
type Draft = { dep: Dep; country: string; region: string; date: string; people: number; nights: NightsFilter };

export default function HomeSearch({ dep, meta }: { dep: Dep; meta: SearchMeta }) {
  const [draft, setDraft] = useState<Draft>({ dep, country: "all", region: "", date: "", people: 2, nights: 0 });
  const [sheet, setSheet] = useState<Sheet>(null);
  const today = localIso() > meta.today ? localIso() : meta.today;

  const countryLabel = (code: string) => meta.countries.find((c) => c.code === code)?.label ?? "전체 여행지";
  const placeText = draft.region ? regionLabel(draft.region) : draft.country === "all" ? "전체 여행지" : countryLabel(draft.country);
  // 지역 이름이 길면 휴대폰에서 칸을 한 줄 전체로 (글씨를 줄이지 않는다)
  const wide = draft.region !== "";

  const pickDep = (d: Dep) => {
    setDraft((s) => {
      let { country, region } = s;
      if (country !== "all" && !meta.groups[metaKey(d, country)]) { country = "all"; region = ""; }
      else if (region && !meta.groups[metaKey(d, country, region)]) region = "";
      return { ...s, dep: d, country, region };
    });
    setSheet(null);
  };

  const q = new URLSearchParams();
  if (draft.country !== "all") q.set("country", draft.country);
  if (draft.region) q.set("region", draft.region);
  q.set("departure", draft.dep);
  if (draft.date) q.set("date", draft.date);
  if (draft.nights) q.set("nights", String(draft.nights));
  q.set("people", String(draft.people));
  const searchHref = `/tours?${q.toString()}`;

  // 입력칸 — 휴대폰은 흰 상자, PC는 흰 검색판 안의 한 칸(왼쪽 얇은 구분선)
  const field = (opts: { order: string; divider?: boolean; wide?: boolean }) =>
    `${opts.order} ${opts.wide ? "col-span-2 md:col-span-1" : ""} w-full flex items-center gap-2.5 max-[374px]:gap-2 min-h-14 px-3 max-[374px]:px-2.5 rounded-xl border-[1.5px] border-slate-300 bg-white text-left hover:border-emerald-500 ` +
    `md:min-h-[64px] md:px-4 md:rounded-none md:border-0 md:hover:bg-page-bg md:hover:border-0 ${opts.divider ? "md:shadow-[inset_1.5px_0_0_#E5EAF0]" : ""}`;
  const label = "text-[14px] font-semibold text-slate-600 leading-tight";
  // 360px 폰(갤럭시 작은 화면)에서는 16px — 지시서 최소값. 그래야 "전체 여행지"가 안 잘린다
  const value = "text-[17px] max-[374px]:text-[16px] font-extrabold leading-tight truncate";
  const chevron = <IconChevron dir="down" className="w-4 h-4 text-slate-600 flex-none ml-auto" />;

  const countriesHere = meta.countries.filter((c) => meta.groups[metaKey(draft.dep, c.code)]);
  const regions = regionOptionsFor(meta, draft.dep, draft.country);
  const chip = (on: boolean) =>
    `inline-flex items-center justify-center md:justify-start gap-1 min-h-12 w-full md:w-auto px-3.5 rounded-full text-[15px] font-bold border-[1.5px] transition-colors ${on ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-[#D9E1EA] text-main-text hover:bg-slate-50"}`;

  return (
    <section className="bg-soft-blue border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        <h2 className="text-[22px] md:text-[30px] font-black text-main-text tracking-tight leading-tight">어디로 골프여행을 떠나세요?</h2>
        <p className="text-[15px] md:text-[17px] text-body-text mt-1 mb-3 md:mb-5 break-keep">출발일과 여행지를 골라 나에게 맞는 골프여행을 찾아보세요.</p>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_1.6fr_1.05fr_1.25fr_auto] md:gap-0 md:bg-white md:rounded-2xl md:overflow-hidden md:border-[1.5px] md:border-[#D9E1EA] md:shadow-[0_6px_22px_rgba(23,52,95,0.10)]">
          <button type="button" onClick={() => setSheet("airport")} aria-haspopup="dialog" className={field({ order: "order-1", wide })}>
            <IconPlaneTakeoff className="w-5 h-5 text-brand-blue" />
            <span className="flex flex-col min-w-0">
              <span className={label}>출발공항</span>
              <span className={`${value} text-slate-900`}>{DEP_SHORT[draft.dep]}</span>
            </span>
            {chevron}
          </button>
          <button type="button" onClick={() => setSheet("place")} aria-haspopup="dialog" className={field({ order: "order-2", divider: true, wide })}>
            <IconPin className="w-5 h-5 text-brand-blue" />
            <span className="flex flex-col min-w-0">
              <span className={label}>국가·지역</span>
              <span className={`${value} text-slate-900`}>{placeText}</span>
            </span>
            {chevron}
          </button>
          <button type="button" onClick={() => setSheet("date")} aria-haspopup="dialog" className={field({ order: "order-3", divider: true })}>
            <IconCalendarDays className="w-5 h-5 text-brand-blue" />
            <span className="flex flex-col min-w-0">
              <span className={label}>출발일</span>
              <span className={`${value} ${draft.date ? "text-slate-900" : "text-slate-600"}`}>{draft.date ? dateLabel(draft.date) : "날짜 미정"}</span>
            </span>
            {chevron}
          </button>
          <div className="order-4 min-w-0 md:shadow-[inset_1.5px_0_0_#E5EAF0]">
            <PeopleStepper
              value={draft.people}
              onChange={(n) => setDraft((s) => ({ ...s, people: n }))}
              boxClass="flex items-center gap-1.5 min-[400px]:gap-2 min-h-14 md:min-h-[64px] pl-3 min-[400px]:pl-3.5 md:pl-4 pr-1.5 md:pr-2 py-1 rounded-xl border-[1.5px] border-slate-300 bg-white md:rounded-none md:border-0 md:bg-transparent"
              labelClass={label}
            />
          </div>

          {/* 여행기간 — 휴대폰은 검색 버튼 위(조건을 다 고른 뒤 검색): 제목 한 줄 + 칩 3+2 격자(마지막 칩이 혼자 남지 않게, Codex 10/25). PC는 검색줄 아래 같은 판 안 한 줄 */}
          <div className="order-5 md:order-6 col-span-2 md:col-span-5 flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 py-1 md:px-4 md:py-3 md:border-t md:border-line">
            <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-main-text mr-1">
              <IconMoon className="w-5 h-5 text-brand-blue" />여행기간
            </span>
            <div className="grid grid-cols-3 gap-2 md:contents">
            {NIGHTS_OPTIONS.map((o) => {
              const on = draft.nights === o.value;
              return (
                <button key={String(o.value)} type="button" aria-pressed={on} onClick={() => setDraft((s) => ({ ...s, nights: o.value }))} className={chip(on)}>
                  {on && <IconCheck className="w-4 h-4" />}
                  {o.label}
                </button>
              );
            })}
            </div>
          </div>

          <Link
            href={searchHref}
            className="order-6 md:order-5 col-span-2 md:col-span-1 flex items-center justify-center gap-2 min-h-14 md:min-h-0 md:m-2 px-6 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-[18px] font-extrabold whitespace-nowrap"
          >
            <IconSearch className="w-[22px] h-[22px]" />골프여행 검색
          </Link>
        </div>
      </div>

      {sheet === "airport" && (
        <PickerSheet title="출발공항" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-2">
            {DEPARTURES.map((d) => {
              const on = draft.dep === d;
              const n = groupCount(meta, d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => pickDep(d)}
                  aria-pressed={on}
                  className={`flex items-center gap-3 min-h-14 px-4 rounded-xl border-[1.5px] text-left transition-colors ${on ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="text-[17px] font-extrabold text-slate-900">{DEP_SHORT[d]}출발</span>
                    <span className="text-[14px] text-slate-600">{DEP_AIRPORT[d]}{n ? ` · 상품 ${n}개` : " · 준비 중"}</span>
                  </span>
                  {on && <IconCheck className="w-5 h-5 text-emerald-700" />}
                </button>
              );
            })}
          </div>
        </PickerSheet>
      )}

      {sheet === "place" && (
        <PickerSheet
          title="국가·지역"
          onClose={() => setSheet(null)}
          footer={
            <button type="button" onClick={() => setSheet(null)} className="w-full flex items-center justify-center min-h-14 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-lg font-extrabold">
              선택 완료
            </button>
          }
        >
          <h3 className="text-sm font-bold text-slate-600 mb-1.5">나라</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={draft.country === "all"} onClick={() => { setDraft((s) => ({ ...s, country: "all", region: "" })); setSheet(null); }} className={chip(draft.country === "all")}>
              {draft.country === "all" && <IconCheck className="w-4 h-4" />}전체 여행지
            </button>
            {countriesHere.map((c) => {
              const on = draft.country === c.code;
              return (
                <button key={c.code} type="button" aria-pressed={on} onClick={() => setDraft((s) => ({ ...s, country: c.code, region: s.country === c.code ? s.region : "" }))} className={chip(on)}>
                  {on && <IconCheck className="w-4 h-4" />}{c.label}
                </button>
              );
            })}
          </div>
          {draft.country !== "all" && regions.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-slate-600 mt-5 mb-1.5">{countryLabel(draft.country)} 안 지역 <span className="font-medium text-slate-500">(숫자는 상품 수)</span></h3>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-pressed={draft.region === ""} onClick={() => { setDraft((s) => ({ ...s, region: "" })); setSheet(null); }} className={chip(draft.region === "")}>
                  {draft.region === "" && <IconCheck className="w-4 h-4" />}{countryLabel(draft.country)} 전체
                </button>
                {regions.map((r) => {
                  const on = draft.region === r.key;
                  return (
                    <button key={r.key} type="button" aria-pressed={on} onClick={() => { setDraft((s) => ({ ...s, region: r.key })); setSheet(null); }} className={chip(on)}>
                      {on && <IconCheck className="w-4 h-4" />}{r.label} <span className={`text-[13px] font-semibold ${on ? "text-white/85" : "text-slate-500"}`}>{r.n}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </PickerSheet>
      )}

      {sheet === "date" && (
        <PickerSheet
          title="출발일"
          onClose={() => setSheet(null)}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setDraft((s) => ({ ...s, date: "" })); setSheet(null); }} className="flex items-center justify-center min-h-14 rounded-xl border-[1.5px] border-slate-300 bg-white text-main-text text-base font-bold hover:bg-slate-50">
                날짜 미정으로 두기
              </button>
              <button type="button" onClick={() => setSheet(null)} className="flex items-center justify-center min-h-14 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-base font-extrabold">
                선택 완료
              </button>
            </div>
          }
        >
          <p className="text-[14px] text-slate-600 mb-2 break-keep">
            {placeText} · {DEP_SHORT[draft.dep]}출발 기준으로 출발 가능한 날에 초록 점이 있어요. 날짜를 정하지 않아도 검색할 수 있어요.
          </p>
          <DateCalendar avail={availFor(meta, draft.dep, draft.country, draft.region)} value={draft.date} onChange={(iso) => { setDraft((s) => ({ ...s, date: iso })); setSheet(null); }} today={today} />
        </PickerSheet>
      )}
    </section>
  );
}
