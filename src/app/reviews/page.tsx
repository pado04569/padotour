import { reviews } from "@/data/reviews";
import ReviewBrowser from "@/components/ReviewBrowser";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "고객 후기 | 여행의 파도 골프여행",
  description: "여행의 파도와 함께 해외 골프여행을 다녀오신 고객들의 실제 후기입니다.",
  alternates: { canonical: "https://www.padotour.com/reviews" },
  openGraph: {
    title: "고객 후기 | 여행의 파도 골프여행",
    description: "여행의 파도와 함께 해외 골프여행을 다녀오신 고객들의 실제 후기입니다.",
    url: "https://www.padotour.com/reviews",
  },
};


export default function ReviewsPage() {
  return (
    <div>
      <section className="bg-emerald-400 text-white py-7 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* 제목 변경 (사장님 확정 2026-10-10) — '실제 고객'을 지나치게 강조하지 않는다 */}
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">여행의 파도 고객 여행후기</h1>
          <p className="text-emerald-50 text-[15px] md:text-lg">직접 다녀오신 고객님들의 골프여행 이야기입니다.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* 예전 '제목 목록 + 전체 후기 펼침' 중복 구조 대신 목록형(R2) + 상세 창 (사장님 확정 2026-10-10) */}
        <ReviewBrowser reviews={reviews} />

        <div className="text-center mt-10 md:mt-12 bg-emerald-50 rounded-2xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2 md:mb-3">후기를 남겨주세요</h2>
          <p className="text-gray-600 mb-5 md:mb-6 text-sm md:text-base">여행을 다녀오셨다면 카카오톡으로 후기를 보내주세요 😊</p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg transition-colors"
          >
            💬 카카오톡으로 후기 보내기
          </a>
        </div>
      </section>
    </div>
  );
}
