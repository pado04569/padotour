import Link from "next/link";
import TourCard from "@/components/TourCard";
import HeroSlider from "@/components/HeroSlider";
import { tours } from "@/data/tours";

const slides = [
  {
    image: "/images/hero-sapporo.jpg",
    region: "북해도",
    regionEn: "SAPPORO",
    tagline: "한여름 평균 26도 시원시원한 라운딩",
    href: "/tours?country=japan&region=북해도&departure=busan",
  },
  {
    image: "/images/golf-main.jpg",
    region: "방콕",
    regionEn: "BANGKOK",
    tagline: "아시아 최고의 골프 천국 · 합리적인 그린피",
    href: "/tours?country=thailand&departure=busan",
  },
  {
    image: "/images/hero-kota.jpg",
    region: "코타키나발루",
    regionEn: "KOTA KINABALU",
    tagline: "열대 밀림 속 환상적인 석양 골프",
    href: "/tours?country=malaysia&departure=busan",
  },
];

const subTabs = [
  { label: "일본", href: "/tours?country=japan&departure=busan" },
  { label: "중국", href: "/tours?country=china&departure=busan" },
  { label: "태국", href: "/tours?country=thailand&departure=busan" },
  { label: "베트남", href: "/tours?country=vietnam&departure=busan" },
  { label: "말레이시아", href: "/tours?country=malaysia&departure=busan" },
  { label: "필리핀", href: "/tours?country=philippines&departure=busan" },
];

export default function BusanHome() {
  const featuredIds = ["japan-matsuyama-juraku-hiyori-busan", "japan-beppu-kamenoi-busan", "japan-hokkaido-niseko", "thailand-chiangmai-4n6d"];
  const monthlyTours = [
    ...tours.filter((t) => featuredIds.includes(t.id)),
    ...tours.filter((t) => !featuredIds.includes(t.id) && (t.departure === "busan" || t.departure === "both") && t.price !== "문의"),
  ].slice(0, 8);

  const allBusanTours = tours.filter(
    (t) => t.departure === "busan" || t.departure === "both"
  );

  return (
    <div>
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
                  <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
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
            className="w-full h-64 md:h-[32rem] object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center px-8 md:px-12">
            <div className="text-white">
              <div className="text-xs md:text-sm font-bold text-yellow-300 mb-1">일본 골프</div>
              <div className="text-xl md:text-3xl font-black leading-tight">
                후쿠오카 · 삿포로 · 마쓰야마<br />
                <span className="text-yellow-300">프리미엄 골프여행</span>
              </div>
              <div className="text-white/80 mt-1.5 text-xs md:text-sm">부산·김해공항 출발 · 항공 + 숙박 + 골프장 일괄 예약</div>
            </div>
          </div>
        </Link>
      </section>

      {/* ===== 전체 상품 보기 ===== */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <Link
            href="/tours?departure=busan"
            className="inline-block min-w-[340px] border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold px-8 py-3 rounded-full text-base transition-colors"
          >
            전체 상품 보기 ({allBusanTours.length}개)
          </Link>
        </div>
      </section>

    </div>
  );
}
