"use client";

// 국가·지역으로 찾기 카드 — 좌우 배치형 (사장님 시안 2026-10-25)
// 상단 한 줄: 국가명 + 골프장 수 / 아래: 왼쪽 사진 + 오른쪽 지역 버튼 2열×2줄(4개)
// 사진 높이 = 버튼 두 줄 높이(44px×2 + 8px = 96px), object-cover
// 나머지 지역은 '지역 더 보기'로 펼침 — 펼친 지역은 사진 아래 전체 너비 사용
import { useState } from "react";
import Link from "next/link";
import { IconChevron } from "@/components/icons/Chevron";

type Region = { value: string; label: string };

export default function CountryRegionCard({
  label,
  href,
  count,
  image,
  regions,
}: {
  label: string;
  href: string;
  count: number;
  image: string;
  regions: Region[];
}) {
  const [open, setOpen] = useState(false);
  const first = regions.slice(0, 4);
  const rest = regions.slice(4);
  const btn =
    "inline-flex items-center justify-center h-11 px-2 rounded-xl bg-emerald-50 text-emerald-900 text-[15px] font-semibold hover:bg-emerald-100 transition-colors whitespace-nowrap overflow-hidden";

  return (
    <div className="p-3.5 md:p-4 border border-gray-200 rounded-2xl bg-white">
      <Link href={href} className="flex items-baseline justify-between gap-2 group mb-2.5">
        <span className="text-xl font-black text-gray-900 group-hover:text-emerald-700">{label}</span>
        <span className="inline-flex items-center text-sm font-semibold text-emerald-700 whitespace-nowrap">
          골프장 {count}곳<IconChevron className="w-4 h-4" />
        </span>
      </Link>

      <div className="flex gap-3 md:gap-4">
        <Link href={href} className="relative flex-none w-[104px] md:w-[150px] h-24 rounded-xl overflow-hidden bg-emerald-100">
          <img src={image} alt={`${label} 골프장`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
        </Link>
        <ul className="flex-1 min-w-0 grid grid-cols-2 gap-2 content-between" aria-label={`${label} 지역`}>
          {first.map((r) => (
            <li key={r.value} className="min-w-0">
              <Link href={`${href}&region=${encodeURIComponent(r.value)}`} className={`${btn} w-full`}>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {open && rest.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 mt-2" aria-label={`${label} 추가 지역`}>
          {rest.map((r) => (
            <li key={r.value} className="min-w-0">
              <Link href={`${href}&region=${encodeURIComponent(r.value)}`} className={`${btn} w-full`}>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-0.5 min-h-11 px-2 -my-1.5 text-[15px] font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {open ? "지역 접기" : `지역 ${rest.length}곳 더 보기`}
            <IconChevron className={`w-4 h-4 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
