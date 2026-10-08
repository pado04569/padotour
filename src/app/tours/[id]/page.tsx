import Link from "next/link";
import { tours } from "@/data/tours";
import PhotoGrid from "@/components/PhotoGrid";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DeparturePriceCalendar from "@/components/DeparturePriceCalendar";
import HolePriceTierSelector from "@/components/HolePriceTierSelector";
import ContactOptions from "@/components/ContactOptions";
import ViewItemTracker from "@/components/ViewItemTracker";
import ShareButton from "@/components/ShareButton";
import { Sentences, Steps } from "@/components/ReadableText";
import { STANDARD_CANCEL_POLICY, CANCEL_POLICY_NOTE, isCancelLadderLine } from "@/data/cancelPolicy";
import { flightInfo, departureSummary } from "@/lib/tripFacts";
import { tourFaqs } from "@/lib/tourFaq";

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

  // 박수별 요금 상품(요금 단계에 nights가 있음) — 일정 칸·일정 제목을 "3박4일 · 4박5일 · 5박6일"로
  const nightTiers = (tour.holePriceTiers ?? []).filter((t) => t.nights != null && t.days != null);
  const tierNightsText = nightTiers.length > 0 ? nightTiers.map((t) => `${t.nights}박${t.days}일`).join(" · ") : undefined;
  const tierNightsRange =
    nightTiers.length > 1
      ? `${nightTiers[0].nights}박${nightTiers[0].days}일 ~ ${nightTiers[nightTiers.length - 1].nights}박${nightTiers[nightTiers.length - 1].days}일`
      : tierNightsText;

  const dep =tour.departure === "incheon" ? "incheon" : tour.departure === "busan" ? "busan" : undefined;
  const backHref = dep ? `/${dep}` : "/";
  const heroImage = tour.images && tour.images.length > 0 ? tour.images[0] : tour.image;

  // 취소·환불 규정은 표준으로 통일한다(사장님 확정 2026-09-09).
  // 기존 cancelPolicy 에 섞여 있던 상품별 안내사항(추가요금·싱글룸·차량 조건 등)은 버리지 않고 따로 보여준다.
  const productNotes = (tour.cancelPolicy ?? []).filter((line) => !isCancelLadderLine(line));

  /**
   * 화면에 보일 제목을 줄 단위로 나눈다. (검색용 제목은 나누지 않는다)
   *   ① "｜" 가 있으면 그 자리에서 나눈다.
   *   ② 없으면 "3박4일" 뒤에서 나눈다. "3박4일·4박5일" 처럼 이어진 것은 한 덩어리로 본다.
   *   ③ 뒤에 남는 것이 없거나 "(…)" 괄호뿐이면 나누지 않는다 — 짧은 꼬리가 혼자 남으면 더 지저분하다.
   */
  // 최소 인원이 딱 4인(이상)으로 정해진 상품 — "2~3인은 추가요금" 같은 조건부 문구가 붙은 상품은 제외
  const strictMinPeople = (() => {
    const mp = tour.minPeople as unknown;
    const n = typeof mp === "number" ? mp : typeof mp === "string" && /^\s*\d+\s*인?\s*$/.test(mp) ? parseInt(mp, 10) : 0;
    return n >= 3 ? n : undefined;
  })();

  const titleLines = (() => {
    const t = tour.title.trim();

    // 자를 지점을 앞에서부터 찾는다: ① "골프여행" 뒤  ② "3박4일" 뒤
    const cutAfter = (text: string, re: RegExp): [string, string] | null => {
      const m = text.match(re);
      if (!m || m.index === undefined) return null;
      const head = text.slice(0, m.index + m[0].length).trim();
      const tail = text.slice(m.index + m[0].length).trim();
      // 뒤에 남는 게 없거나 괄호 부연뿐이면 자르지 않는다
      if (!head || !tail || tail.startsWith("(")) return null;
      return [head, tail];
    };

    const NIGHTS = /\d+박\s?\d+일(?:\s*·\s*\d+박\s?\d+일)*/;

    // "｜" 는 사장님이 직접 지정한 줄바꿈이다. 그 경계는 그대로 두고,
    // 첫 덩어리만 "골프여행" 뒤에서 한 번 더 나눈다.
    if (t.includes("｜")) {
      const segs = t.split("｜").map((s) => s.trim()).filter(Boolean);
      const first = cutAfter(segs[0], /골프여행/);
      return first ? [first[0], first[1], ...segs.slice(1)] : segs;
    }

    const lines: string[] = [];
    let rest = t;

    const byTrip = cutAfter(rest, /골프여행/);
    if (byTrip) {
      lines.push(byTrip[0]);
      rest = byTrip[1];
    }

    const byNights = cutAfter(rest, NIGHTS);
    if (byNights) {
      lines.push(byNights[0], byNights[1]);
    } else {
      lines.push(rest);
    }

    return lines;
  })();

  // 항공편·출발일 — 일정 문장 속에 묻혀 있어 AI 요약에서 빠졌다(ChatGPT로 온 손님이 비행시간을 몰랐음, 2026-10)
  const flights = flightInfo(tour);
  const departures = departureSummary(tour);

  // 자주 묻는 질문 — 네이버 블로그는 AI 로봇을 막아두어, AI 검색이 읽을 수 있는 Q&A를 홈페이지에 둔다 (2026-10)
  const faqs = tourFaqs(tour);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // 구조화 데이터 — 여행 상품은 Product 가 아니라 TouristTrip 이 맞다.
  // (Product 는 별점·리뷰를 요구해 서치콘솔 경고가 났었다. TouristTrip 은 요구하지 않는다.)
  const tripJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: [
      tour.seoIntro ?? tour.subtitle ?? tour.productSummary ?? tour.title,
      flights.outbound && `가는 편: ${flights.outbound}.`,
      flights.inbound && `오는 편: ${flights.inbound}.`,
      tour.period && `출발 기간: ${tour.period}.`,
    ]
      .filter(Boolean)
      .join(" "),
    url: `https://www.padotour.com/tours/${tour.id}`,
    image: tour.image ? `https://www.padotour.com${tour.image}` : undefined,
    touristType: "골프여행",
    itinerary: {
      "@type": "ItemList",
      itemListElement:
        tour.schedule && tour.schedule.length > 0
          ? tour.schedule.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: `${s.day} ${s.label}` }))
          : [{ "@type": "ListItem", position: 1, name: tour.region ?? tour.country }],
    },
    offers: departures
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "KRW",
          lowPrice: departures.lowPrice,
          highPrice: departures.highPrice,
          offerCount: departures.count,
          availabilityStarts: departures.first,
          availabilityEnds: departures.last,
          url: `https://www.padotour.com/tours/${tour.id}#departure`,
        }
      : undefined,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ViewItemTracker
        itemId={tour.id}
        itemName={tour.title}
        country={tour.country}
        region={tour.region}
      />

      {/* ── 히어로 이미지 ── */}
      <div className="relative w-full h-72 md:h-96 bg-gray-200 overflow-hidden">
        {/* 첫 화면의 가장 큰 그림이라 먼저 받게 한다 (클래리티 LCP 4초, 2026-09-15) */}
        {/* 눌러도 아무 일이 없어 손님이 계속 누른 자리였다 — 크게보기를 달았다 (클래리티 배달못한클릭 9회, 2026-09-16) */}
        <PhotoGrid images={[heroImage]} altBase={tour.title} variant="hero" />
        {/* 사진을 가리지 않는 것이 우선 — 어둡게 덧씌우지 않는다 (사장님 확정 2026-09-10) */}
        {/* pointer-events-none — 덧씌운 층이 사진 클릭을 가로채지 않게 한다 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        {/* 모바일: 세로 가운데 정렬 / PC: 기존처럼 아래 정렬 */}
        <div className="absolute inset-0 flex items-center px-5 py-6 md:p-8 text-white pointer-events-none">
          {/* 제목이 두 줄로 안정적으로 나뉘므로 가운데 정렬한다 (사장님 확정 2026-09-10) */}
          <div className="max-w-4xl mx-auto w-full text-center">
            <div className="flex items-center justify-center gap-2 mb-2.5">
              <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded">{tour.country}</span>
              <span className="text-xs text-white/80">{tour.region}</span>
              {/* "부산출발 신규" 빨간 뱃지는 빼둔다 — 제목에 이미 [부산출발]이 있고,
                  홈페이지에서 신규 여부를 알릴 필요가 크지 않다. (사장님 확정 2026-09-10)
                  목록 카드에는 그대로 남아 있다. */}
            </div>
            {/* break-keep — 한글 단어 중간에서 줄이 끊기지 않게 한다 */}
            {/* 제목 줄바꿈은 글자수가 아니라 의미로 판단한다 (사장님 확정 2026-09-10).
                골프장 이름이 길 수 있어 길이 기준은 쓰지 않는다. 검색용 제목(metadata)은 한 줄 그대로. */}
            {/* 제목 속 요금을 보고 누르는 손님이 있었다 → 출발일·요금표로 내려가게 한다 (클래리티 배달못한클릭, 2026-10-08 오키나와 카누차) */}
            <h1 className="text-xl md:text-4xl font-black leading-snug break-keep">
              <Link href="#departure" className="pointer-events-auto hover:underline">
                {titleLines.map((line, li) => (
                  <span key={li} className="block">{line}</span>
                ))}
              </Link>
            </h1>
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

          // 최소 인원 — 데이터가 숫자(2)일 때도, 문자열("4인 (2인 시 송영비 추가)")일 때도 맞게 보이도록.
          // 예전에는 무조건 "인 이상"을 붙여 "2인인 이상"이 되었다.
          const mp = tour.minPeople;
          const mpStr = mp == null ? "" : String(mp).trim();
          const mpMatch = mpStr.match(/^([^(]+?)\s*(\(.*\))?$/);
          const mpHead = mpMatch ? mpMatch[1].trim() : mpStr;
          const mpNote = mpMatch && mpMatch[2] ? mpMatch[2].trim() : "";
          const mpBase = mpHead ? (/인$/.test(mpHead) ? `${mpHead} 이상` : `${mpHead}인 이상`) : "";
          const minPeopleText = mpBase ? (mpNote ? `${mpBase}\n${mpNote}` : mpBase) : "문의";
          return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "🌙", label: "일정", value: tierNightsText ?? `${tour.nights}박 ${tour.days}일` },
            // 무제한 상품은 "무제한라운드 무제한 라운딩홀"처럼 겹쳐 보였다 → "무제한 라운드"만 (사장님 확정 2026-10-02)
            { icon: "⛳", label: "라운드", value: String(tour.roundsIncluded).includes("무제한") ? "무제한 라운드" : `${tour.roundsIncluded}라운드 ${holesText}` },
            { icon: "👥", label: "최소 인원", value: minPeopleText },
            { icon: "📅", label: "출발 기간", value: tour.period ?? "연중 출발" },
          ].map((item) => (
            // 카드처럼 보여 눌러도 반응 없는 클릭이 있었다(클래리티 배달못한클릭, 2026-10-02 "출발 기간" 칸) → 출발일·요금으로 스크롤
            <Link key={item.label} href="#departure" className="block min-w-0 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-3 md:p-4 text-center border border-gray-100">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-gray-500 mb-1">{item.label}</div>
              {/* 내용이 길면 줄을 나누고 글자를 줄인다 — 칸 하나만 길어져 어색해지는 것을 막는다 */}
              <div className={`font-bold text-gray-800 break-keep [overflow-wrap:anywhere] leading-snug space-y-0.5 ${
                item.value.length > 45 ? "text-[11px]" : item.value.length > 24 ? "text-xs" : "text-sm"
              }`}>
                {/* 줄 경계: 줄바꿈 / " / " / 기간의 " ~ " 앞.
                    "36~54홀" 처럼 공백 없는 물결표는 나누지 않는다. */}
                {item.value.split(/\n|\s+\/\s+|\s+(?=~\s)/).map((line, li) => (
                  <div key={li}>{line.trim().replace(/·/g, "·\u200b")}</div>
                ))}
              </div>
            </Link>
          ))}
        </div>
          );
        })()}

        {/* ── 항공편·출발일 한눈에 ── */}
        {/* 그림·달력이 아니라 글자로 둔다 — AI 검색이 이 문장을 그대로 읽어 간다 (2026-10, ChatGPT 유입 손님 사례) */}
        {(flights.outbound || flights.inbound || departures) && (
          <dl className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 mb-8 space-y-2.5 text-sm break-keep">
            {flights.outbound && (
              <div className="flex gap-3">
                <dt className="flex-shrink-0 whitespace-nowrap font-bold text-gray-500">✈️ 가는 편</dt>
                <dd className="text-gray-800">{flights.outbound}</dd>
              </div>
            )}
            {flights.inbound && (
              <div className="flex gap-3">
                <dt className="flex-shrink-0 whitespace-nowrap font-bold text-gray-500">🛬 오는 편</dt>
                <dd className="text-gray-800">{flights.inbound}</dd>
              </div>
            )}
            {departures && (
              <div className="flex gap-3">
                <dt className="flex-shrink-0 whitespace-nowrap font-bold text-gray-500">📅 출발일</dt>
                <dd className="text-gray-800">
                  <Link href="#departure" className="hover:underline">
                    {departures.rangeText}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        )}

        {/* ── 상품 요약 박스 ── */}
        {/* 카드처럼 보여 눌러도 반응 없는 클릭이 많았다(클래리티 배달못한클릭 20회, 2026-09-17) → 문의 폼으로 스크롤하게 만든다 */}
        <Link href="#inquiry" className="block bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 mb-8 hover:bg-emerald-100 transition-colors">
          <p className="text-xs text-gray-500 mb-2">{tour.region} 골프여행 상품 구성</p>
          {/* 한 덩어리로 붙어 있으면 읽기 어렵다 → 문장 단위로 줄을 나눈다 */}
          <div className="space-y-1.5">
            {(tour.productSummary ?? `${tour.golfCourse ?? ""} ${tour.roundsIncluded}회 라운딩 · ${tour.hotel ?? ""} 숙박`)
              .split(/\n|(?<=다\.)\s*|(?<=[며고],)\s+/)
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
          <p className="text-xs text-emerald-600 font-bold mt-3">👇 문의하기</p>
        </Link>

        {/* ── 출발일 캘린더 + 요금 / 홀수별 요금 ── */}
        {tour.holePriceTiers && tour.holePriceTiers.length > 0 ? (
          <div id="departure" className="mb-8 scroll-mt-4">
            {tour.period && (
              <p className="text-sm text-gray-500 mb-2">{tour.period} · {tierNightsText ? "일정 선택제 요금" : "홀수 선택제 요금"}</p>
            )}
            <HolePriceTierSelector
              tourTitle={tour.title}
              departureDate={tour.holePriceDepartureDate ?? ""}
              nights={tour.nights}
              days={tour.days}
              tiers={tour.holePriceTiers}
              departurePrices={tour.departurePrices}
            />
          </div>
        ) : tour.departurePrices && tour.departurePrices.length > 0 ? (
          <div id="departure" className="mb-8 scroll-mt-4">
            <DeparturePriceCalendar
              departurePrices={tour.departurePrices}
              nights={tour.nights}
              days={tour.days}
              tourTitle={tour.title}
              minPeople={strictMinPeople}
            />
          </div>
        ) : (
          <div id="departure" className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 mb-8 scroll-mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-0.5">인천출발 기준</p>
              <p className="text-3xl md:text-4xl font-black text-red-600">{tour.price}</p>
              <p className="text-xs text-gray-400 mt-1">※ 출발일에 따라 요금이 상이합니다</p>
            </div>
          </div>
        )}

        {/* ── 하이라이트 ── */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">✨ 이 상품의 특징</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 카드처럼 보여 눌러도 반응 없는 클릭이 많았다(클래리티 배달못한클릭, 2026-09-21 녹화 확인:
                "직항, 이동시간 단축" 2회 · "셀프+카트 라운드" 1회) → 문의 폼으로 스크롤하게 만든다 */}
            {tour.highlights.map((h, i) => (
              <Link key={i} href="#inquiry" className="flex items-start gap-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl p-4 transition-colors">
                <span className="text-emerald-500 font-black text-lg mt-0.5">✓</span>
                {/* 줄바꿈(\n)이 들어 있으면 그대로 나눈다. break-keep 으로 "2인 1실" 같은 말이 쪼개지지 않게 한다 */}
                <span className="text-gray-800 font-medium text-sm leading-relaxed break-keep">
                  {h.split("\n").map((line, li) => (
                    <span key={li} className="block">{line.trim()}</span>
                  ))}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 호텔 정보 + 사진 ── */}
        {tour.hotel && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">🏨 {tour.region} 골프여행 숙박 호텔</h2>
            {/* 골프장 정보 박스와 같은 이유로 문의 폼 링크를 단다 (클래리티 배달못한클릭, 2026-09-17) */}
            <Link href="#inquiry" className="block bg-gray-50 hover:bg-gray-100 rounded-2xl p-5 border border-gray-100 mb-3 transition-colors">
              <div className="font-black text-gray-800 text-base mb-2">{tour.hotel}</div>
              {tour.hotelDesc && <Sentences text={tour.hotelDesc} />}
            </Link>
            {tour.hotelImages && tour.hotelImages.length > 0 && (
              <PhotoGrid images={tour.hotelImages} altBase={tour.hotel} />
            )}
          </div>
        )}

        {/* ── 골프장 정보 + 사진 ── */}
        {tour.golfCourse && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">⛳ {tour.region} 골프장 정보</h2>
            {/* 카드처럼 보여 눌러도 반응 없는 클릭이 많았다(클래리티 배달못한클릭 16회, 2026-09-17) → 문의 폼으로 스크롤하게 만든다 */}
            <Link href="#inquiry" className="block bg-gray-50 hover:bg-gray-100 rounded-2xl p-5 border border-gray-100 mb-3 transition-colors">
              <div className="font-black text-gray-800 text-base mb-2">{tour.golfCourse}</div>
              {tour.golfCourseDesc && <Sentences text={tour.golfCourseDesc} />}
            </Link>
            {tour.courseImages && tour.courseImages.length > 0 && (
              <PhotoGrid images={tour.courseImages} altBase={tour.golfCourse} objectTop />
            )}
          </div>
        )}

        {/* ── 포함/불포함 ── */}
        {/* 두 박스도 카드처럼 보여 눌러도 반응이 없었다(클래리티 배달못한클릭, 2026-09-21 녹화 확인:
            "그린피 + 카트피 + 락카피" 클릭) → 문의 폼으로 스크롤하게 만든다 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="#inquiry" className="block bg-green-50 hover:bg-green-100 rounded-2xl p-5 border border-green-100 transition-colors">
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
          </Link>
          <Link href="#inquiry" className="block bg-red-50 hover:bg-red-100 rounded-2xl p-5 border border-red-100 transition-colors">
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
          </Link>
        </div>

        {/* ── 여행 일정 ── */}
        {tour.schedule && tour.schedule.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">📋 {tour.region} 골프여행 {tierNightsRange ?? `${tour.nights}박${tour.days}일`} 일정</h2>
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

        {/* ── 자주 묻는 질문 ── */}
        {/* 답은 전부 상품 데이터에서 뽑는다 — 데이터에 없는 질문은 나오지 않는다 (src/lib/tourFaq.ts) */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-emerald-500 inline-block">❓ {tour.region} 골프여행 자주 묻는 질문</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-gray-50 border border-gray-100 rounded-xl">
                <summary className="cursor-pointer list-none px-4 py-3 font-bold text-gray-800 text-sm flex items-start justify-between gap-3 break-keep">
                  <span>Q. {f.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0">▾</span>
                </summary>
                {/* 요금은 사이트 전체에서 빨간색 — 답변 속 금액도 맞춘다 */}
                <p className="px-4 pb-4 text-sm text-gray-700 leading-relaxed break-keep">
                  {f.a.split(/(\d{1,3}(?:,\d{3})+원(?:부터|~)?)/).map((part, pi) =>
                    pi % 2 === 1 ? <span key={pi} className="font-bold text-red-600">{part}</span> : part,
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* ── 예약 문의 · 맞춤 견적 ── */}
        {/* id="inquiry" — 위쪽 상품 요약/호텔/골프장 박스를 누르면 여기로 스크롤된다 */}
        <div id="inquiry" className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 text-blue-700 mb-8 scroll-mt-4">
          <h3 className="text-xl font-black mb-1">예약 문의 · 맞춤 견적</h3>
          <p className="text-blue-600 text-sm mb-5">출발일, 인원, 예산을 알려주시면 바로 견적을 드립니다</p>
          <ContactOptions tourTitle={tour.title} nights={tour.nights} days={tour.days} minPeople={strictMinPeople} />

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
