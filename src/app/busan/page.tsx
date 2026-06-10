import Link from "next/link";
import TourCard from "@/components/TourCard";
import { tours } from "@/data/tours";
import { reviews } from "@/data/reviews";
import { notices } from "@/data/reviews";

export default function BusanHome() {
  const busanJapanTours = tours
    .filter((t) => t.departure === "busan" || t.departure === "both")
    .filter((t) => t.countryCode === "japan")
    .slice(0, 3);

  const allBusanTours = tours.filter(
    (t) => t.departure === "busan" || t.departure === "both"
  );

  const latestReviews = reviews.slice(0, 3);
  const latestNotices = notices.slice(0, 3);

  return (
    <div>
      {/* ===== 출발지 배너 ===== */}
      <div className="bg-blue-600 text-white text-center py-2 text-xs md:text-sm font-semibold tracking-wide">
        ✈️ 김해공항 출발 골프여행 전문 &nbsp;|&nbsp;
        <Link href="/" className="underline hover:text-blue-200 transition-colors">
          출발지 변경
        </Link>
      </div>

      {/* ===== 히어로 섹션 ===== */}
      <section className="relative text-white py-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/golf-main.jpg" alt="골프여행" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/55"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block bg-yellow-400 text-gray-900 text-xs md:text-sm font-bold px-3 py-1.5 rounded-full mb-4 md:mb-6">
            ✈️ 김해공항 출발 · 골프여행 전문 여행사
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 md:mb-6">
            여행의 파도 부산과 함께<br />
            <span className="text-yellow-300">특별한 골프여행</span>을<br />
            떠나세요
          </h1>
          <p className="text-base md:text-xl text-blue-100 mb-3 md:mb-4 max-w-2xl mx-auto">
            일본 · 태국 · 중국<br />
            골프여행 전문가가 직접 설계합니다
          </p>
          <p className="text-blue-200 mb-7 md:mb-10 text-sm md:text-base">
            항공 + 숙박 + 골프장 일괄 예약 | 소수 정예 맞춤 여행
          </p>
          <div className="flex justify-center">
            <Link
              href="/tours?departure=busan"
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors shadow-lg border-2 border-blue-300/50"
            >
              ⛳ 상품 보러가기
            </Link>
          </div>

          {/* 신뢰 지표 */}
          <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-2 md:gap-6 text-center">
            {[
              { icon: "🏆", label: "골프여행", value: "전문 여행사" },
              { icon: "🌏", label: "운영 국가", value: "6개국" },
              { icon: "⭐", label: "고객 만족", value: "5.0점" },
              { icon: "👥", label: "동반 여행", value: "소수 정예" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-2xl px-4 py-3 md:px-6 md:py-4 w-[calc(50%-4px)] sm:w-auto">
                <div className="text-2xl md:text-3xl mb-1">{item.icon}</div>
                <div className="text-lg md:text-2xl font-black">{item.value}</div>
                <div className="text-blue-200 text-xs md:text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 국가별 빠른 탭 ===== */}
      <section className="bg-white border-b border-gray-100 py-4 md:py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { label: "🇯🇵 일본", href: "/tours?country=japan&departure=busan" },
              { label: "🇨🇳 중국", href: "/tours?country=china&departure=busan" },
              { label: "🇹🇭 태국", href: "/tours?country=thailand&departure=busan" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex-shrink-0 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 text-gray-700 font-medium px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm md:text-base transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 인기 상품 (일본) ===== */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800">🇯🇵 인기 일본 골프여행</h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">부산·김해공항 출발 베스트 상품</p>
          </div>
          <Link
            href="/tours?country=japan&departure=busan"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base hidden sm:flex items-center gap-1"
          >
            전체보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {busanJapanTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="text-center mt-6 md:mt-8">
          <Link
            href="/tours?departure=busan"
            className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-6 py-2.5 md:px-8 md:py-3 rounded-full text-base md:text-lg transition-colors"
          >
            부산출발 전체 상품 보기 ({allBusanTours.length}개)
          </Link>
        </div>
      </section>

      {/* ===== 여행의 파도 소개 ===== */}
      <section className="bg-blue-50 py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-3 md:mb-4">왜 여행의 파도인가요?</h2>
          <p className="text-gray-500 text-base md:text-lg mb-7 md:mb-10">골프여행 전문가이기 때문에 가능한 것들이 있습니다</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: "🏌️",
                title: "골프 전문 설계",
                desc: "코스 난이도, 그린피, 이동 동선까지\n골프에 최적화된 일정만 만듭니다",
              },
              {
                icon: "📞",
                title: "1:1 맞춤 상담",
                desc: "대형 여행사와 달리 대표가 직접 상담합니다.\n인원·예산·선호 코스에 맞게 조율해드립니다",
              },
              {
                icon: "💰",
                title: "합리적인 요금",
                desc: "불필요한 옵션 없이\n필요한 것만 포함한 실속 있는 가격",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">{item.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">{item.title}</h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm md:text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 최근 후기 ===== */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800">⭐ 고객 후기</h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">실제 여행을 다녀오신 고객님들의 이야기</p>
          </div>
          <Link
            href="/reviews"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base hidden sm:flex items-center gap-1"
          >
            전체보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {latestReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-md p-5 md:p-6 border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg md:text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-3 md:mb-4 text-sm md:text-base">"{review.comment}"</p>
              <div className="flex items-center justify-between text-xs md:text-sm text-gray-400">
                <span className="font-medium text-gray-600">{review.name}</span>
                <span>{review.country} · {review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 공지/이벤트 ===== */}
      <section className="bg-gray-50 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-800">📢 공지 · 특가 이벤트</h2>
            <Link href="/notice" className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">
              전체보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {latestNotices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-xl p-4 md:p-5 shadow-sm flex items-start justify-between gap-3 border border-gray-100"
              >
                <div className="flex items-start gap-2 md:gap-3 flex-1">
                  {notice.isEvent && (
                    <span className="flex-shrink-0 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md mt-0.5">
                      이벤트
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-sm md:text-base">{notice.title}</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5 md:mt-1">{notice.content}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">{notice.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
