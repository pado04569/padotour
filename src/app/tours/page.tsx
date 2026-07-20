"use client";

import { useState, Suspense } from "react";
import TourCard from "@/components/TourCard";
import { tours, countries } from "@/data/tours";
import { useSearchParams } from "next/navigation";

function ToursContent() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get("country") || "all";
  const regionParam = searchParams.get("region") || "";
  const departureParam = searchParams.get("departure") || "";
  const [selected, setSelected] = useState(initialCountry);

  const filtered = (() => {
    let result = selected === "all" ? tours : tours.filter((t) => t.countryCode === selected);
    if (regionParam) {
      result = result.filter((t) => t.region && t.region.includes(regionParam));
    }
    if (departureParam) {
      result = result.filter((t) => t.departure === departureParam || t.departure === "both");
    }
    return result;
  })();

  return (
    <div>
      {/* 헤더 */}
      {regionParam ? (
        <section className="bg-emerald-600 text-white py-2">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-white font-bold text-base md:text-lg">{regionParam === "괌" ? "괌/사이판" : regionParam} 골프여행 패키지</p>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">⛳ 골프여행 상품</h1>
            <p className="text-emerald-100 text-sm md:text-lg">일본·중국·동남아 골프여행 전문 패키지</p>
          </div>
        </section>
      )}

      {/* 국가 탭 — region이 선택된 경우 숨김 */}
      {!regionParam && (
        <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-2.5 md:py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelected(c.code)}
                  className={`flex-shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-full font-medium text-sm md:text-base transition-colors ${
                    selected === c.code
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 상품 그리드 */}
      <section className={`max-w-6xl mx-auto px-4 ${regionParam && filtered.length === 1 ? "pt-1 pb-3" : "py-8 md:py-10"}`}>
        <p className={`text-gray-500 text-sm md:text-base ${regionParam && filtered.length === 1 ? "mb-1" : "mb-4 md:mb-6"}`}>
          총 <span className="font-bold text-emerald-700">{filtered.length}개</span> 상품
        </p>
        {filtered.length > 0 ? (
          regionParam && filtered.length <= 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
              {filtered.map((tour) => (
                <div key={tour.id} className={filtered.length === 1 ? "sm:col-span-2" : ""}>
                  <TourCard tour={tour} featured={filtered.length === 1} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 md:py-20 text-gray-400">
            <div className="text-5xl md:text-6xl mb-4">⛳</div>
            <p className="text-lg md:text-xl">준비 중인 상품입니다.</p>
            <p className="mt-2 text-sm md:text-base">카카오톡으로 문의해 주세요!</p>
          </div>
        )}
      </section>

      {/* 문의 안내 */}
      <section className="bg-emerald-50 py-2.5 md:py-3">
        <div className="max-w-3xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
          <p className="text-gray-700 font-bold text-sm md:text-base">
            원하는 상품이 없나요? 지역·날짜·인원을 알려주시면 맞춤 견적을 바로 드립니다.
          </p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap"
          >
            💬 카카오톡 맞춤 견적 문의
          </a>
        </div>
      </section>
    </div>
  );
}

export default function ToursPage() {
  return (
    <Suspense>
      <ToursContent />
    </Suspense>
  );
}
