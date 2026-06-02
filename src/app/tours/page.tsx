"use client";

import { useState, Suspense } from "react";
import TourCard from "@/components/TourCard";
import { tours, countries } from "@/data/tours";
import { useSearchParams } from "next/navigation";

function ToursContent() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get("country") || "all";
  const [selected, setSelected] = useState(initialCountry);

  const filtered = selected === "all" ? tours : tours.filter((t) => t.countryCode === selected);

  return (
    <div>
      {/* 헤더 */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-2">⛳ 골프여행 상품</h1>
          <p className="text-emerald-100 text-lg">일본·중국·동남아 골프여행 전문 패키지</p>
        </div>
      </section>

      {/* 국가 탭 */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-base transition-colors ${
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

      {/* 상품 그리드 */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-gray-500 mb-6 text-base">
          총 <span className="font-bold text-emerald-700">{filtered.length}개</span> 상품
        </p>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">⛳</div>
            <p className="text-xl">준비 중인 상품입니다.</p>
            <p className="mt-2">카카오톡으로 문의해 주세요!</p>
          </div>
        )}
      </section>

      {/* 문의 안내 */}
      <section className="bg-emerald-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-3">원하는 상품이 없나요?</h2>
          <p className="text-gray-600 mb-6 text-lg">
            지역·날짜·인원을 알려주시면 맞춤 견적을 바로 드립니다.
          </p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-8 py-4 rounded-full text-xl transition-colors"
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
