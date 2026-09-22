import { notices } from "@/data/reviews";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지·이벤트 | 여행의 파도 골프여행",
  description: "여행의 파도 골프여행 특가 소식과 신규 상품 안내입니다.",
  alternates: { canonical: "https://www.padotour.com/notice" },
  openGraph: {
    title: "공지·이벤트 | 여행의 파도 골프여행",
    description: "여행의 파도 골프여행 특가 소식과 신규 상품 안내입니다.",
    url: "https://www.padotour.com/notice",
  },
};


export default function NoticePage() {
  return (
    <div>
      <section className="bg-emerald-400 text-white py-10 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">📢 공지 · 이벤트</h1>
          <p className="text-emerald-100 text-sm md:text-lg">특가 소식과 새로운 상품 안내</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10 md:py-12">
        {/* 특가·공지가 페이지의 주인공 — 가운데 정렬로 크게 보여준다 (사장님 요청 2026-09-23) */}
        <div className="space-y-4 md:space-y-5">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 hover:shadow-md transition-shadow text-center"
            >
              {notice.isEvent ? (
                <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg mb-3">
                  이벤트
                </span>
              ) : (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-lg mb-3">
                  공지
                </span>
              )}
              <h3 className="font-black text-gray-800 text-xl md:text-3xl mb-3 leading-snug">{notice.title}</h3>
              <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">{notice.content}</p>
              <p className="text-gray-400 text-xs mt-4">{notice.date}</p>
            </div>
          ))}
        </div>

        {/* 카카오톡 채널 유도는 작게 (사장님 요청 2026-09-23) */}
        <div className="mt-8 md:mt-10 flex items-center justify-center gap-3 bg-emerald-50 rounded-full px-5 py-3 max-w-md mx-auto">
          <span className="text-xs md:text-sm text-gray-600">특가 소식을 가장 먼저 받아보세요</span>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors"
          >
            💬 채널 추가
          </a>
        </div>
      </section>
    </div>
  );
}
