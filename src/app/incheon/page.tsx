import Link from "next/link";
import TourCard from "@/components/TourCard";
import HeroSlider from "@/components/HeroSlider";
import CountryCourseTiles from "@/components/CountryCourseTiles";
import { tours } from "@/data/tours";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인천출발 골프여행 | 여행의 파도",
  description: "인천공항 출발 해외 골프여행 패키지. 일본·태국·중국·베트남·필리핀 골프투어 일정과 요금을 확인하세요.",
  alternates: { canonical: "https://www.padotour.com/incheon" },
  openGraph: {
    title: "인천출발 골프여행 | 여행의 파도",
    description: "인천공항 출발 해외 골프여행 패키지. 일본·태국·중국·베트남·필리핀 골프투어 일정과 요금을 확인하세요.",
    url: "https://www.padotour.com/incheon",
  },
};


const slides = [
  {
    image: "/images/hero-kota.jpg",
    region: "코타키나발루",
    regionEn: "KOTA KINABALU",
    tagline: "열대 밀림 속 환상적인 석양 골프",
    href: "/tours?country=malaysia&departure=incheon",
  },
  {
    image: "/images/hero-saipan-coralocean-2.jpg",
    region: "괌·사이판",
    regionEn: "GUAM · SAIPAN",
    tagline: "가을·겨울에도 부담 없는 괌·사이판, 가깝고 편안한 남태평양 골프",
    href: "/tours?country=other&departure=incheon",
  },
  {
    image: "/images/hero-chiangmai-2.jpg",
    region: "치앙마이",
    regionEn: "CHIANG MAI",
    tagline: "가을겨울 한국골퍼들이 가장 선호하는 치앙마이, 태국골프의 중심",
    href: "/tours?country=thailand&region=치앙마이&departure=incheon",
  },
];

const subTabs = [
  { label: "일본", href: "/tours?country=japan&departure=incheon" },
  { label: "중국", href: "/tours?country=china&departure=incheon" },
  { label: "태국", href: "/tours?country=thailand&departure=incheon" },
  { label: "베트남", href: "/tours?country=vietnam&departure=incheon" },
  { label: "말레이시아", href: "/tours?country=malaysia&departure=incheon" },
  { label: "필리핀", href: "/tours?country=philippines&departure=incheon" },
];

export default function IncheonHome() {
  const featuredIds = ["japan-takamatsu-shido", "japan-matsuyama-juraku-hiyori", "japan-hokkaido-sapporo-comfort", "japan-beppu-kamenoi", "japan-oita-pacific"];
  const monthlyTours = [
    ...tours.filter((t) => featuredIds.includes(t.id)),
    ...tours.filter((t) => !featuredIds.includes(t.id) && (t.departure === "incheon" || t.departure === "both") && t.price !== "문의"),
  ].slice(0, 8);

  const allIncheonTours = tours.filter(
    (t) => t.departure === "incheon" || t.departure === "both"
  );

  return (
    <div>
      {/* ===== 히어로 슬라이더 ===== */}
      <HeroSlider slides={slides} departure="incheon" />

      {/* ===== 하위 카테고리 탭 ===== */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {subTabs.map((tab, i) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  i === 0
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                    : "border-transparent text-gray-600 hover:text-emerald-600 hover:border-emerald-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 지금 떠나기 좋은 골프여행 (4열) ===== */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* 제목 변경 (사장님 확정 O3, 2026-10-10): "이 달의 골프여행" → "지금 떠나기 좋은 골프여행" */}
        <h2 className="text-xl md:text-2xl font-black text-gray-800 pb-2 border-b-2 border-emerald-500 inline-block">
          지금 떠나기 좋은 골프여행
        </h2>
        <p className="text-gray-500 text-[15px] md:text-base mt-2 mb-4 md:mb-5 break-keep">계절과 출발 시기에 맞춰 골라본 추천 골프여행</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {monthlyTours.map((tour) => (
            <Link key={tour.id} href={`/tours/${tour.id}`} className="group block">
              <div className="overflow-hidden rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="overflow-hidden h-36 md:h-44 bg-gray-100">
                  <img
                    src={tour.image || "/images/golf-main.jpg"}
                    alt={tour.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-600 transition-colors">
                    {tour.title}
                  </p>
                  <p className="text-red-600 font-bold text-sm mt-1.5">
                    {tour.price === "문의" ? "가격 문의" : tour.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 전체 상품 보기 ===== */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <Link
            href="/tours?departure=incheon"
            className="inline-flex items-center justify-center gap-1 w-full max-w-[340px] min-h-[52px] px-8 rounded-full border-2 font-bold text-base transition-colors border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            전체 상품 보기 ({allIncheonTours.length}개)
          </Link>
        </div>
      </section>

      {/* ===== 국가별 골프장 소개 — 전체 상품 보기 바로 아래 (사장님 확정 O3, 2026-10-10). 중간 일본 배너는 첫 화면 사진과 겹쳐 뺐다 ===== */}
      <CountryCourseTiles />

    </div>
  );
}
