import { notices } from "@/data/reviews";
import { tours } from "@/data/tours";
import TourCard from "@/components/TourCard";

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


export default async function NoticePage({
  searchParams,
}: {
  searchParams: Promise<{ departure?: string }>;
}) {
  const { departure } = await searchParams;

  // 날짜(expiresAt)가 지난 특가·공지는 자동으로 목록에서 뺀다 (사장님 지적 2026-09-28)
  const today = new Date().toISOString().slice(0, 10);
  const activeNotices = notices
    .filter((n) => !n.expiresAt || n.expiresAt >= today)
    // 인천/부산 출발지가 다른 공지는 안 보여준다 (사장님 지적 2026-09-29: 부산출발로 들어갔는데 인천출발 상품이 떴음)
    .filter((n) => {
      if (!departure || !n.tourId) return true;
      const linkedTour = tours.find((t) => t.id === n.tourId);
      if (!linkedTour) return true;
      return linkedTour.departure === departure || linkedTour.departure === "both";
    });

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
        {activeNotices.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-12">현재 진행 중인 공지·이벤트가 없습니다.</p>
        )}
        <div className="space-y-4 md:space-y-5">
          {activeNotices.map((notice) => {
            // 연결된 상품(tourId)이 있으면 사진과 클릭 가능한 상품카드와 동일하게 보여준다 (사장님 요청 2026-09-29)
            const linkedTour = notice.tourId ? tours.find((t) => t.id === notice.tourId) : undefined;

            if (linkedTour) {
              return (
                <div key={notice.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-shadow">
                  {notice.isEvent ? (
                    <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg mb-3">
                      이벤트
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-lg mb-3">
                      공지
                    </span>
                  )}
                  <div className="max-w-none">
                    <TourCard tour={linkedTour} featured />
                  </div>
                  <p className="text-gray-400 text-xs mt-4 text-center">{notice.date}</p>
                </div>
              );
            }

            return (
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
            );
          })}
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
