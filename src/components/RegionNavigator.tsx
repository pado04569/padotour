"use client";

import { useState } from "react";
import Link from "next/link";
import { REGION_MAPS } from "@/lib/regionMaps";
import { MapSvg } from "./CourseRegionMap";

// 상품 목록 지역 선택 (사장님 확정 N3, 2026-10-10)
// 지역 버튼을 먼저 보여주고, 지도는 "지도로 위치 보기"를 누른 사람에게만 펼친다(기본 접힘).
// 버튼·지도 모두 주소(region=)로 거르므로 기존 상품 필터 로직을 그대로 쓴다. 지도를 펼친 채 고르면 map=1 로 펼침 유지.
export type RegionOption = { label: string; count: number };

const COUNTRY_LABEL: Record<string, string> = { japan: "일본", china: "중국", thailand: "태국", vietnam: "베트남", malaysia: "말레이시아", philippines: "필리핀", other: "기타" };

export default function RegionNavigator({
  countryCode,
  regions,
  selected,
  departure,
  initialOpen,
  keepQuery,
}: {
  countryCode: string;
  regions: RegionOption[];
  selected?: string;
  departure?: string;
  initialOpen?: boolean;
  /** 출발일로 상품 찾기 조건(date·people·sort) — 지역을 바꿔도 검색 조건이 유지되게 그대로 붙인다 (2026-10-10) */
  keepQuery?: Record<string, string>;
}) {
  const map = REGION_MAPS[countryCode];
  const [open, setOpen] = useState(Boolean(initialOpen && map));
  const href = (region?: string, keepMap = open) => {
    const q = new URLSearchParams({ country: countryCode });
    if (region) q.set("region", region);
    if (departure) q.set("departure", departure);
    for (const [k, v] of Object.entries(keepQuery ?? {})) if (v) q.set(k, v);
    if (keepMap && map) q.set("map", "1");
    return `/tours?${q.toString()}`;
  };
  const chip = (on: boolean) =>
    `flex-none inline-flex items-center gap-1 min-h-11 px-4 rounded-full text-[15px] font-semibold transition-colors ${
      on ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;
  const name = COUNTRY_LABEL[countryCode] ?? "";

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h2 className="text-[17px] font-extrabold text-gray-900">지역 선택</h2>
        {map && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="region-map"
            className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full border-2 border-emerald-500 bg-white text-emerald-800 text-[15px] font-bold hover:bg-emerald-50 transition-colors"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z" /><path d="M9 4v14M15 6v14" />
            </svg>
            {open ? "지도 닫기" : "지도로 위치 보기"}
          </button>
        )}
      </div>

      {/* 휴대폰은 한 줄 옆으로 밀기(13개라도 화면을 덮지 않게), PC는 여러 줄 */}
      <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <Link href={href()} className={chip(!selected)} aria-current={!selected ? "page" : undefined}>
          {name} 전체
        </Link>
        {regions.map((r) => (
          <Link key={r.label} href={href(r.label)} className={chip(selected === r.label)} aria-current={selected === r.label ? "page" : undefined}>
            {r.label}
            <span className={selected === r.label ? "text-white/80" : "text-gray-500"}>{r.count}</span>
          </Link>
        ))}
      </div>
      <p className="md:hidden text-[13px] text-gray-500 mt-1">옆으로 밀어 다른 지역 보기</p>

      {map && open && (
        <div id="region-map" className="mt-3 p-3 border border-gray-300 rounded-2xl bg-white shadow-sm md:max-w-[520px]">
          <div className="flex items-center gap-2 mb-2 px-1 text-[15px]">
            <span className="text-gray-600">현재 선택</span>
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full font-bold ${selected ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`}>
              {selected ?? `${name} 전체`}
            </span>
          </div>
          <MapSvg map={map} regions={regions.map((r) => r.label)} selected={selected} hrefFor={(r) => href(r, true)} idSuffix="t" />
          <p className="text-sm text-gray-600 mt-2.5 leading-relaxed break-keep">
            대략적인 위치입니다.
            <br />
            지역 이름을 누르면 그 지역 상품만 보여드려요.
          </p>
        </div>
      )}
    </div>
  );
}
