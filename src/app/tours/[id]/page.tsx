import Link from "next/link";
import { tours } from "@/data/tours";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DeparturePriceCalendar from "@/components/DeparturePriceCalendar";
import ContactOptions from "@/components/ContactOptions";
import ViewItemTracker from "@/components/ViewItemTracker";
import ShareButton from "@/components/ShareButton";
import { Sentences, Steps } from "@/components/ReadableText";
import { STANDARD_CANCEL_POLICY, CANCEL_POLICY_NOTE, isCancelLadderLine } from "@/data/cancelPolicy";

export async function generateStaticParams() {
  return tours.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tour = tours.find((t) => t.id === id);
  if (!tour) return {};
  const description = tour.seoIntro ?? tour.subtitle ?? tour.productSummary ?? tour.title;
  return {
    title: `${tour.title} | 여행의 파도`,
    description,
    // UTM 파라미터가 붙은 주소가 따로 색인되지 않도록 대표 주소를 지정한다
    alternates: { canonical: `https://www.padotour.com/tours/${tour.id}` },
    openGraph: {
      title: tour.title,
      description,
      url: `https://www.padotour.com/tours/${tour.id}`,
      images: tour.image ? [{ url: tour.image }] : undefined,
    },
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = tours.find((t) => t.id === id);
  if (!tour) notFound();

  const dep = tour.departure === "incheon" ? "incheon" : tour.departure === "busan" ? "busan" : undefined;
  const backHref = dep ? `/${dep}` : "/";
  const heroImage = tour.images && tour.images.length > 0 ? tour.images[0] : tour.image;

  // 취소·환불 규정은 표준으로 통일한다(사장님 확정 2026-09-09).
  // 기존 cancelPolicy 에 섞여 있던 상품별 안내사항(추가요금·싱글룸·차량 조건 등)은 버리지 않고 따로 보여준다.
  const productNotes = (tour.cancelPolicy ?? []).filter((line) => !isCancelLadderLine(line));

  // 구조화 데이터 — 여행 상품은 Product 가 아니라 TouristTrip 이 맞다.
  // (Product 는 별점·리뷰를 요구해 서치콘솔 경고가 났었다. TouristTrip 은 요구하지 않는다.)
  const tripJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.seoIntro ?? tour.subtitle ?? tour.productSummary ?? tour.title,
    url: `https://www.padotour.com/tours/${tour.id}`,
    image: tour.image ? `https://www.padotour.com${tour.image}` : undefined,
    touristType: "골프여행",
    itinerary: {
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: tour.region ?? tour.country },
      ],
    },
    provider: {
      "@type": "TravelAgency",
      name: "여행의 파도",
      url: "https://www.padotour.com",
    },
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }}
      />
      <ViewItemTracker
        itemId={tour.id}
        itemName={tour.title}
        country={tour.country}
        region={tour.region}
      />

      {/* ── 히어로 이미지 ── */}
      <div className="relative w-full h-72 md:h-96 bg-gray-200 overflow-hidden">
        <img
          src={heroImage}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        {/* 사진을 가리지 않는 것이 우선 — 어둡게 덧씌우지 않는다 (사장님 확정 2026-09-10) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* 모바일: 세로 가운데 정렬 / PC: 기존처럼 아래 정렬 */}
        <div className="absolute inset-0 flex items-center md:items-end px-5 py-6 md:p-8 text-white">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded">{tour.country}</span>
              <span className="text-xs text-white/80">{tour.region}</span>
              {tour.badge && <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded">{tour.badge}</span>}
            </div>
            {/* break-keep — 한글 단어 중간에서 줄이 끊기지 않게 한다 */}
            <h1 className="text-xl md:text-4xl font-black leading-snug break-keep">{tour.title}</h1>
          </div>
        </div>

        {/* 공유 — 모바일에서 주소를 긁을 방법이 없어 우상단에 고정 배치 */}
        <ShareButton
          title={tour.title}
          itemId={tour.id}
          className="absolute top-4 right-4 bg-black/45 hover:bg-black/65 text-white font-bold text-xs px-3 py-2 rounded-full backdrop-blur-sm"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── 핵심 정보 요약 ── */}
        {(() => {
          const holesRaw = tour.holes ?? `${tour.roundsIncluded * 18}`;
          const holesText = String(holesRaw).includes("홀") ? String(holesRaw) : `${holesRaw}홀`;
          return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "🌙", label: "일정", value: `${tour.nights}박 ${tour.days}일` },
            { icon: "⛳", label: "라운드", value: `${tour.roundsIncluded}라운드 ${holesText}` },
            { icon: "👥", label: "최소 인원", value: tour.minPeople ? `${tour.minPeople}인 이상` : "문의" },
            { icon: "📅", label: "출발 기간", value: tour.period ?? "연중 출발" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3 md:p-4 text-center border border-gray-100">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-gray-500 mb-1">{item.label}</div>
              {/* 내용이 길면 줄을 나누고 글자를 줄인다 — 칸 하나만 길어져 어색해지는 것을 막는다 */}
              <div className={`font-bold text-gray-800 break-keep leading-snug space-y-0.5 ${
                item.value.length > 45 ? "text-[11px]" : item.value.length > 24 ? "text-xs" : "text-sm"
              }`}>
                {item.value.split(/\n|\s+\/\s+/).map((line, li) => (
                  <div key={li}>{line.trim()}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
          );
        })()}

        {/* ── 상품 요약 박스 ── */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 mb-8">
          <p className="text-xs text-gray-500 mb-2">{tour.region} 골프여행 상품 구성</p>
          {/* 한 덩어리로 붙어 있으면 읽기 어렵다 → 문장 단위로 줄을 나눈다 */}
          <div className="space-y-1.5">
            {(tour.productSummary ?? `${tour.golfCourse ?? ""} ${tour.roundsIncluded}회 라운딩 · ${tour.hotel ?? ""} 숙박`)
              .split(/(?<=다\.)\s*/)
              .map((s) => s.trim())
              .filter(Boolean)
              .map((sentence, i) => (
                <p key={i} className="text-base md:text-xl font-bold text-emerald-800 leading-relaxed break-keep">
                  {sentence}
                </p>
              ))}
          </div>
          {/* subtitle 은 화면에 쓰지 않는다 — 위 상품 구성과 아래 숙소 섹션에 같은 내용이 이미 있다.
              데이터는 남겨둔다(검색용 설명의 예비값). 사장님 확정 2026-09-10 */}
          {tour.seoKeywords && tour.seoKeywords.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {tour.seoKeywords.map((k) => `#${k}`).join(" ")}
            </p>
          )}
        </div>

        {/* ── 출발일 캘린더 + 요금 ── */}
        {tour.departurePrices && tour.departurePrices.length > 0 ? (
          <div className="mb-8">
            <DeparturePriceCalendar
              departurePrices={tour.departurePrices}
              nights={tour.nights}
              days={tour.days}
              tourTitle={tour.title}
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
                {/* 줄바꿈(\n)이 들어 있으면 그대로 나눈다. break-keep 으로 "2인 1실" 같은 말이 쪼개지지 않게 한다 */}
                <span className="text-gray-800 font-medium text-sm leading-relaxed break-keep">
                  {h.split("\n").map((line, li) => (
                    <span key={li} className="block">{line.trim()}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 호텔 정보 + 사진 ── */}
        {tour.hotel && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">🏨 {tour.region} 골프여행 숙박 호텔</h2>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-3">
              <div className="font-black text-gray-800 text-base mb-2">{tour.hotel}</div>
              {tour.hotelDesc && <Sentences text={tour.hotelDesc} />}
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
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">⛳ {tour.region} 골프장 정보</h2>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-3">
              <div className="font-black text-gray-800 text-base mb-2">{tour.golfCourse}</div>
              {tour.golfCourseDesc && <Sentences text={tour.golfCourseDesc} />}
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
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">📋 {tour.region} 골프여행 {tour.nights}박{tour.days}일 일정</h2>
            <div className="space-y-3">
              {tour.schedule.map((s, i) => (
                <div key={i} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 w-16 flex items-start justify-center">
                    <div className="bg-emerald-600 text-white text-xs font-black px-2 py-1 rounded-lg text-center">{s.day}</div>
                  </div>
                  <div className="pt-0.5 min-w-0">
                    <p className="font-bold text-emerald-700 mb-1.5 text-sm">{s.label}</p>
                    <Steps text={s.desc} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 예약 문의 · 맞춤 견적 ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 text-blue-700 mb-8">
          <h3 className="text-xl font-black mb-1">예약 문의 · 맞춤 견적</h3>
          <p className="text-blue-600 text-sm mb-5">출발일, 인원, 예산을 알려주시면 바로 견적을 드립니다</p>
          <ContactOptions tourTitle={tour.title} nights={tour.nights} days={tour.days} />

          {/* 같이 갈 일행에게 보내는 경로 — 골프여행은 대개 여럿이 간다 */}
          <div className="mt-6">
            <ShareButton
              title={tour.title}
              itemId={tour.id}
              className="w-full bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-300 font-black px-8 py-2 rounded-xl text-sm"
            />
            <p className="text-xs text-blue-500 mt-2 text-center">함께 가실 분에게 이 상품을 보내보세요</p>
          </div>

          {tour.priceUpdatedDate && (() => {
            const d = new Date(tour.priceUpdatedDate);
            const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
            return (
              <div className="text-[11px] text-blue-400 mt-4 leading-relaxed space-y-1 break-keep">
                <p>※ 이 상품은 {label}에 등록된 상품으로, 등록월 유류할증료가 반영된 요금입니다.</p>
                <p>{d.getMonth() + 1}월 이후 문의하실 경우 요금 변동이 있을 수 있는 점 안내드립니다.</p>
              </div>
            );
          })()}
        </div>

        {/* ── 취소/환불 규정 ── (문의 아래에 둔다: 알아보는 단계 고객에게 부담을 주지 않기 위해)
             표준 규정을 전 상품 공통으로 노출한다. 상품별 안내사항은 그 아래에 따로 남긴다. */}
        <div className="mb-8">
          <details className="group bg-gray-50 border border-gray-200 rounded-xl">
            <summary className="cursor-pointer list-none px-4 py-2.5 text-xs font-bold text-gray-500 flex items-center gap-1.5">
              📌 취소·환불 규정 보기
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                {STANDARD_CANCEL_POLICY.map((item, i) => (
                  <div key={i} className="bg-white rounded-md px-2 py-1.5 text-[11px] text-gray-500 border border-gray-100 text-center">
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{CANCEL_POLICY_NOTE}</p>

              {productNotes.length > 0 && (
                <>
                  <p className="text-[11px] font-bold text-gray-500 mt-4 mb-1.5">이 상품의 추가 안내</p>
                  <ul className="space-y-1">
                    {productNotes.map((item, i) => (
                      <li key={i} className="text-[11px] text-gray-500 leading-relaxed pl-2.5 relative before:content-['·'] before:absolute before:left-0">
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </details>
        </div>

        {/* ── 뒤로가기 (소 → 중) : 이 상품이 속한 나라 목록으로 ── */}
        <div className="text-center">
          <Link href={`/tours?country=${tour.countryCode}${dep ? `&departure=${dep}` : ""}`} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            ← {tour.country} 상품 목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
