"use client";

// 홈 여행지 추천 영역 (사장님 작업지시 2026-10-25, 탭 B안=초록)
// 탭(치앙마이/코타키나발루/괌·사이판) → 대표 사진 + 소개 + 상품 최대 4개. 자동 넘김 없음.
import { useState } from "react";
import Link from "next/link";
import CountryFlag from "./CountryFlag";
import type { SpotRegion } from "@/lib/spotlight";

export default function DestinationSpotlight({ regions }: { regions: SpotRegion[] }) {
  const [sel, setSel] = useState(0);
  const r = regions[sel];
  if (!r) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pt-8 pb-9 md:pt-10 md:pb-12">
      <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1.5">어디로 떠날지 고민이라면</h2>
      <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-5 break-keep">여행지의 매력을 살펴보고, 나에게 맞는 상품을 골라보세요.</p>

      {/* 여행지 탭 — 자동으로 넘어가지 않고, 선택은 초록 글씨+밑줄 (B안) */}
      <div className="flex gap-6 md:gap-8 border-b border-gray-200 mb-5 md:mb-6 overflow-x-auto scrollbar-hide" role="tablist" aria-label="여행지 선택">
        {regions.map((g, i) => (
          <button
            key={g.key}
            role="tab"
            aria-selected={i === sel}
            onClick={() => setSel(i)}
            className={`flex-shrink-0 pb-2.5 pt-1 text-[15px] md:text-[17px] border-b-[3px] -mb-px transition-colors ${
              i === sel ? "text-emerald-700 font-black border-emerald-600" : "text-gray-500 font-bold border-transparent hover:text-emerald-700"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* 상단: PC는 사진 65 / 소개 35, 휴대폰은 사진 → 소개 (사진 위에 글·국기 올리지 않음) */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-4 lg:gap-7 mb-5 md:mb-7">
        <div className="rounded-2xl overflow-hidden bg-gray-100 h-[180px] sm:h-[250px] lg:h-[340px]">
          <img src={r.photo} alt={`${r.label} 골프장`} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-2.5 lg:gap-3 min-w-0">
          <p className="flex items-center gap-2 text-[13px] md:text-sm font-bold text-gray-500">
            <CountryFlag country={r.country} className="w-5 h-auto rounded-[2px] ring-1 ring-black/10" />
            {r.place}
            {r.dateRange && <span className="text-emerald-700 font-extrabold tracking-wide">{r.dateRange} 출발</span>}
          </p>
          <h3 className="text-lg md:text-[22px] font-black text-gray-900 leading-snug break-keep">{r.title}</h3>
          <p className="text-[14px] md:text-[16px] text-gray-700 leading-relaxed break-keep">{r.desc}</p>
          <ul className="flex flex-col gap-1.5 mt-0.5">
            {r.features.map((f) => (
              <li key={f} className="flex gap-1.5 text-[13.5px] md:text-[15px] text-gray-700 break-keep">
                <span className="text-emerald-600 font-black flex-shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 지역 상품 — 최대 4개, 반복 채움 없음 */}
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="font-black text-gray-900 text-[15px] md:text-[17px]">{r.label} 추천 상품</p>
        {r.cards.length > 0 && (
          <Link href={r.allHref} className="text-emerald-700 font-bold text-[13px] md:text-sm whitespace-nowrap hover:underline">
            {r.allLabel} →
          </Link>
        )}
      </div>

      {r.cards.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-gray-700 font-bold mb-2 break-keep">지금 이 출발지의 {r.label} 상품이 준비 중입니다.</p>
          <Link href={r.otherDepHref} className="inline-block text-emerald-700 font-bold text-sm hover:underline">
            {r.otherDepLabel} →
          </Link>
        </div>
      ) : (
        <div className="flex lg:grid lg:grid-cols-4 gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible scrollbar-hide snap-x">
          {r.cards.map((c) => (
            <Link
              key={c.id}
              href={`/tours/${c.id}`}
              className="flex-shrink-0 w-[72%] sm:w-[46%] lg:w-auto snap-start block rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 md:h-36 bg-gray-100 overflow-hidden">
                <img src={c.image} alt={c.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="p-3.5">
                <p className="flex items-center gap-1.5 text-[12px] text-gray-500 font-bold mb-1.5">
                  <CountryFlag country={c.country} className="w-4 h-auto rounded-[2px] ring-1 ring-black/10" />
                  {c.country} · {c.region}
                </p>
                <p className="text-[15px] md:text-[16px] font-extrabold text-gray-900 leading-snug break-keep line-clamp-2 min-h-[40px]">{c.title}</p>
                {c.meta && <p className="text-[13px] md:text-[13.5px] text-gray-500 mt-1.5">{c.meta}</p>}
                <p className="text-[16px] md:text-[17px] font-black text-[#D33F3F] mt-2">
                  {c.price}
                  <span className="text-[12.5px] text-gray-500 font-bold ml-1">1인</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
