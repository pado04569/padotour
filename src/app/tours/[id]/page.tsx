import Link from "next/link";
import { tours } from "@/data/tours";
import { notFound } from "next/navigation";
import DeparturePriceCalendar from "@/components/DeparturePriceCalendar";
import ContactOptions from "@/components/ContactOptions";

export async function generateStaticParams() {
  return tours.map((t) => ({ id: t.id }));
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = tours.find((t) => t.id === id);
  if (!tour) notFound();

  const dep = tour.departure === "incheon" ? "incheon" : tour.departure === "busan" ? "busan" : undefined;
  const backHref = dep ? `/${dep}` : "/";
  const heroImage = tour.images && tour.images.length > 0 ? tour.images[0] : tour.image;

  return (
    <div className="bg-white">

      {/* ── 히어로 이미지 ── */}
      <div className="relative w-full h-64 md:h-96 bg-gray-200 overflow-hidden">
        <img
          src={heroImage}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded">🇯🇵 {tour.country}</span>
              <span className="text-xs text-white/80">{tour.region}</span>
              {tour.badge && <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded">{tour.badge}</span>}
            </div>
            <h1 className="text-2xl md:text-4xl font-black leading-tight">{tour.title}</h1>
            {tour.subtitle && <p className="text-white/90 mt-1 text-sm md:text-base">{tour.subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── 핵심 정보 요약 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "🌙", label: "일정", value: `${tour.nights}박 ${tour.days}일` },
            { icon: "⛳", label: "라운드", value: `${tour.roundsIncluded}라운드 ${tour.holes ?? tour.roundsIncluded * 18}홀` },
            { icon: "👥", label: "최소 인원", value: tour.minPeople ? `${tour.minPeople}인 이상` : "문의" },
            { icon: "📅", label: "출발 기간", value: tour.period ?? "연중 출발" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3 md:p-4 text-center border border-gray-100">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
              <div className="text-sm font-bold text-gray-800">{item.value}</div>
            </div>
          ))}
        </div>

        {/* ── 상품 요약 박스 ── */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 mb-8">
          <p className="text-xs text-gray-500 mb-1">상품 구성</p>
          <p className="text-xl md:text-2xl font-black text-emerald-800 leading-snug">
            벳부cc &nbsp;{tour.roundsIncluded}회 라운딩 &nbsp;·&nbsp; 카메노이 호텔 숙박
          </p>
          {tour.subtitle && <p className="text-sm text-gray-600 mt-1.5">{tour.subtitle}</p>}
        </div>

        {/* ── 출발일 캘린더 + 요금 ── */}
        {tour.departurePrices && tour.departurePrices.length > 0 ? (
          <div className="mb-8">
            <DeparturePriceCalendar
              departurePrices={tour.departurePrices}
              nights={tour.nights}
              days={tour.days}
            />
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-0.5">인천출발 기준</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-700">{tour.price}</p>
              <p className="text-xs text-gray-400 mt-1">※ 출발일에 따라 요금이 상이합니다</p>
            </div>
          </div>
        )}

        {/* ── 하이라이트 ── */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">✨ 이 상품의 특징</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tour.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4">
                <span className="text-emerald-500 font-black text-lg mt-0.5">✓</span>
                <span className="text-gray-800 font-medium text-sm">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 호텔 정보 + 사진 ── */}
        {tour.hotel && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">🏨 숙박 호텔</h2>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-3">
              <div className="font-black text-gray-800 text-base mb-1">{tour.hotel}</div>
              <div className="text-sm text-gray-600">{tour.hotelDesc}</div>
            </div>
            {tour.hotelImages && tour.hotelImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tour.hotelImages.map((img, i) => (
                  <div key={i} className="overflow-hidden rounded-xl aspect-[4/3] bg-gray-100">
                    <img src={img} alt={`${tour.hotel} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 골프장 정보 + 사진 ── */}
        {tour.golfCourse && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">⛳ 골프장 정보</h2>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-3">
              <div className="font-black text-gray-800 text-base mb-1">{tour.golfCourse}</div>
              <div className="text-sm text-gray-600">{tour.golfCourseDesc}</div>
            </div>
            {tour.courseImages && tour.courseImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tour.courseImages.map((img, i) => (
                  <div key={i} className="overflow-hidden rounded-xl aspect-[4/3] bg-gray-100">
                    <img src={img} alt={`${tour.golfCourse} ${i + 1}`} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 포함/불포함 ── */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
            <h3 className="font-black text-green-800 mb-3 flex items-center gap-2">
              <span className="text-lg">✅</span> 포함 내역
            </h3>
            <ul className="space-y-1.5">
              {tour.includes.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
            <h3 className="font-black text-red-800 mb-3 flex items-center gap-2">
              <span className="text-lg">❌</span> 불포함 내역
            </h3>
            <ul className="space-y-1.5">
              {tour.excludes.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-red-400">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 여행 일정 ── */}
        {tour.schedule && tour.schedule.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">📋 여행 일정</h2>
            <div className="space-y-3">
              {tour.schedule.map((s, i) => (
                <div key={i} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 text-center">
                    <div className="bg-emerald-600 text-white text-xs font-black px-2 py-1 rounded-lg whitespace-nowrap">{s.day}</div>
                    <div className="text-xs text-emerald-600 font-semibold mt-1 whitespace-nowrap">{s.label}</div>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed pt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 취소/환불 규정 ── */}
        {tour.cancelPolicy && tour.cancelPolicy.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">📌 취소·환불 규정</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-3">※ 항공 선발권 구매 후 취소 시 항공 취소수수료 별도 발생</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tour.cancelPolicy.map((item, i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 text-xs text-gray-700 border border-yellow-100 text-center">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 예약 문의 · 맞춤 견적 ── */}
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 text-white mb-8">
          <h3 className="text-xl font-black mb-1">예약 문의 · 맞춤 견적</h3>
          <p className="text-gray-300 text-sm mb-5">출발일, 인원, 예산을 알려주시면 바로 견적을 드립니다</p>
          <ContactOptions />
        </div>

        {/* ── 뒤로가기 ── */}
        <div className="text-center">
          <Link href={`/tours?country=${tour.countryCode}${dep ? `&departure=${dep}` : ""}`} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            ← 전체 상품 목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
