import Link from "next/link";
import TourCard from "@/components/TourCard";
import HeroSlider from "@/components/HeroSlider";
import { tours } from "@/data/tours";
import { reviews } from "@/data/reviews";
import { notices } from "@/data/reviews";

const slides = [
  {
    image: "/images/golf-main.jpg",
    region: "후쿠오카",
    regionEn: "FUKUOKA",
    tagline: "가장 가까운 일본 · 규슈 명문 코스",
    href: "/tours?country=japan&departure=busan",
  },
  {
    image: "/images/golf-main.jpg",
    region: "방콕",
    regionEn: "BANGKOK",
    tagline: "아시아 최고의 골프 천국 · 합리적인 그린피",
    href: "/tours?country=thailand&departure=busan",
  },
  {
    image: "/images/golf-main.jpg",
    region: "하이난",
    regionEn: "HAINAN",
    tagline: "중국의 하와이 · 세계 수준 리조트 코스",
    href: "/tours?country=china&departure=busan",
  },
];

const subTabs = [
  { label: "일본 후쿠오카 골프", href: "/tours?country=japan&departure=busan" },
  { label: "일본 오사카 골프", href: "/tours?country=japan&departure=busan" },
  { label: "태국 방콕 골프", href: "/tours?country=thailand&departure=busan" },
  { label: "중국 하이난 골프", href: "/tours?country=china&departure=busan" },
];

export default function BusanHome() {
  const monthlyTours = tours
    .filter((t) => t.departure === "busan" || t.departure === "both")
    .slice(0, 4);

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

      {/* ===== 히어로 슬라이더 ===== */}
      <HeroSlider slides={slides} departure="busan" />

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
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 이 달의 골프여행 (4열) ===== */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-5 pb-2 border-b-2 border-blue-500 inline-block">
          이 달의 골프여행
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {monthlyTours.map((tour) => (
            <Link key={tour.id} href={`/tours/${tour.id}`} className="group block">
              <div className="overflow-hidden rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="overflow-hidden h-36 md:h-44 bg-gray-100">
                  <img
                    src={tour.image || "/images/golf-main.jpg"}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {tour.title}
                  </p>
                  <p className="text-blue-600 font-bold text-sm mt-1.5">
                    {tour.price === "문의" ? "가격 문의" : tour.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 프로모션 배너 ===== */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <Link href="/tours?country=japan&departure=busan" className="block relative overflow-hidden rounded-xl group">
          <img
            src="/images/golf-main.jpg"
            alt="일본 골프여행 특가"
            className="w-full h-32 md:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center px-8 md:px-12">
            <div className="text-white">
              <div className="text-xs md:text-sm font-bold text-yellow-300 mb-1">🇯🇵 일본 골프</div>
              <div className="text-xl md:text-3xl font-black leading-tight">
                후쿠오카 · 오사카<br />
                <span className="text-yellow-300">프리미엄 골프여행</span>
              </div>
              <div className="text-white/80 mt-1.5 text-xs md:text-sm">부산·김해공항 출발 · 항공 + 숙박 + 골프장 일괄 예약</div>
            </div>
          </div>
        </Link>
      </section>

      {/* ===== 추천 리조트 (3단) ===== */}
      <section className="max-w-6xl mx-auto px-4 mb-10 md:mb-14">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-5 pb-2 border-b-2 border-blue-500 inline-block">
          추천 골프 리조트
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              image: "/images/golf-main.jpg",
              tag: "일본 후쿠오카",
              title: "후쿠오카 명문 코스",
              subtitle: "규슈 최고의 골프 명소",
              desc: "하카타 시내 접근성 최고 · 온천 포함",
              href: "/tours?country=japan&departure=busan",
              color: "from-blue-900/70",
            },
            {
              image: "/images/golf-main.jpg",
              tag: "태국 방콕",
              title: "알파인 골프클럽",
              subtitle: "아시아 탑 100 명문 코스",
              desc: "합리적인 그린피 · 수준급 코스 컨디션",
              href: "/tours?country=thailand&departure=busan",
              color: "from-emerald-900/70",
            },
            {
              image: "/images/golf-main.jpg",
              tag: "중국 하이난",
              title: "미션힐스 골프리조트",
              subtitle: "세계 최대 규모 골프 리조트",
              desc: "72홀 · VIP 플레이팅 · 하이난항공",
              href: "/tours?country=china&departure=busan",
              color: "from-orange-900/70",
            },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="group block relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-52 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${item.color} to-transparent`} />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="text-xs font-bold text-yellow-300 mb-1">[{item.tag}]</div>
                <div className="text-lg md:text-xl font-black leading-tight">{item.title}</div>
                <div className="text-white/90 text-xs mt-0.5">{item.subtitle}</div>
                <div className="text-white/70 text-xs mt-0.5">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/tours?departure=busan"
            className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-full text-base transition-colors"
          >
            부산출발 전체 상품 보기 ({allBusanTours.length}개)
          </Link>
        </div>
      </section>

      {/* ===== 왜 여행의 파도인가요 ===== */}
      <section className="bg-blue-50 py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-3">왜 여행의 파도인가요?</h2>
          <p className="text-gray-500 text-base mb-8">골프여행 전문가이기 때문에 가능한 것들이 있습니다</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🏌️", title: "골프 전문 설계", desc: "코스 난이도, 그린피, 이동 동선까지\n골프에 최적화된 일정만 만듭니다" },
              { icon: "📞", title: "1:1 맞춤 상담", desc: "대형 여행사와 달리 대표가 직접 상담합니다.\n인원·예산·선호 코스에 맞게 조율해드립니다" },
              { icon: "💰", title: "합리적인 요금", desc: "불필요한 옵션 없이\n필요한 것만 포함한 실속 있는 가격" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 최근 후기 ===== */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-gray-800">⭐ 고객 후기</h2>
          <Link href="/reviews" className="text-blue-600 hover:text-blue-700 font-medium text-sm hidden sm:flex items-center gap-1">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {latestReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-3 text-sm">"{review.comment}"</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-gray-800">📢 공지 · 특가 이벤트</h2>
            <Link href="/notice" className="text-blue-600 hover:text-blue-700 font-medium text-sm">전체보기 →</Link>
          </div>
          <div className="space-y-3">
            {latestNotices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between gap-3 border border-gray-100">
                <div className="flex items-start gap-2 flex-1">
                  {notice.isEvent && (
                    <span className="flex-shrink-0 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md mt-0.5">이벤트</span>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{notice.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{notice.content}</p>
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
