import Link from "next/link";
import { tours, endedTours } from "@/data/tours";
import { courses } from "@/data/courses";
import PhotoGrid from "@/components/PhotoGrid";
import { notFound, permanentRedirect } from "next/navigation";
import { endedTourTarget } from "@/lib/endedTourRedirect";
import type { Metadata } from "next";
import DeparturePriceCalendar from "@/components/DeparturePriceCalendar";
import TourGallery from "@/components/TourGallery";
import InquiryDock from "@/components/InquiryDock";
import CountryFlag from "@/components/CountryFlag";
import HolePriceTierSelector from "@/components/HolePriceTierSelector";
import ViewItemTracker from "@/components/ViewItemTracker";
import ShareButton from "@/components/ShareButton";
import { Sentences, Steps } from "@/components/ReadableText";
import { IconCalendarDays, IconCircleHelp, IconPlaneTakeoff, IconPlaneLanding, IconArrowRight, IconArrowLeft, IconMoon, IconUsers, IconSparkles, IconCheck, IconCircleCheck, IconCircleX, IconBuilding, IconPin, IconFlag } from "@/components/icons/MenuIcons";

// 항공편 문장 "A → B" 의 글자 화살표를 작은 선 화살표로 (글자는 그대로 — AI 검색이 읽는 문장, 2026-10-10)
function FlightLine({ text }: { text: string }) {
  const parts = text.split(/\s*→\s*/);
  return (
    <>
      {parts.map((p, i) => {
        // 구간마다 새 줄 (지시서 예시: "인천국제공항 출발(…) →" / "후쿠오카국제공항 도착(…)")
        if (i === parts.length - 1) return <span key={i} className="block">{p}</span>;
        // 화살표는 앞 구간의 마지막 낱말에 붙여 둔다 — 혼자 다음 줄 첫머리로 넘어가 들여쓴 것처럼 보였다
        // "출발(ZE650, 20:40)"처럼 괄호 속 편명·시각은 한 덩어리로 — 괄호 앞 낱말부터 화살표까지 줄바꿈 없이
        // 단, 괄호가 길면(예: "(또는 SC8010 22:15~23:40)") 묶음이 휴대폰 폭을 넘어 화면 밖으로 나갔다 → 마지막 낱말만 묶는다 (최종 QA 10/11)
        const paren = p.lastIndexOf("(");
        const byParen = paren > 0 ? p.lastIndexOf(" ", paren) : -1;
        const cut = byParen > 0 && p.length - byParen <= 20 ? byParen : p.lastIndexOf(" ");
        return (
          <span key={i} className="block">
            {cut > 0 ? p.slice(0, cut + 1) : ""}
            <span className="whitespace-nowrap">
              {cut > 0 ? p.slice(cut + 1) : p}
              <span className="sr-only"> → </span>
              <IconArrowRight className="inline-block w-4 h-4 ml-1 -mt-0.5 text-blue-500" />
            </span>
          </span>
        );
      })}
    </>
  );
}
import { STANDARD_CANCEL_POLICY, CANCEL_POLICY_NOTE, isCancelLadderLine } from "@/data/cancelPolicy";
import { flightInfo, departureSummary } from "@/lib/tripFacts";
import { tourFaqs } from "@/lib/tourFaq";
import { stayText } from "@/lib/stay";
import { parsePeopleCondition, roomBasisOf } from "@/lib/peopleCondition";
import { IconChevron } from "@/components/icons/Chevron";
import { regionGuides } from "@/lib/regionGuides";
import { tourSeoTitle, tourSeoDescription } from "@/lib/seoMeta";

export async function generateStaticParams() {
  return tours.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tour = tours.find((t) => t.id === id);
  if (!tour) return {};
  // 검색 결과용 제목·설명은 seoMeta 한 곳에서 만든다 — 화면 제목(h1)은 tour.title 그대로 (2026-10-21)
  const description = tourSeoDescription(tour);
  return {
    title: tourSeoTitle(tour),
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
  if (!tour) {
    // 출발일이 끝난 상품: 서버에서 영구 이동(308) — 검색엔진이 새 주소로 옮겨 간다. 모르는 주소만 404
    const ended = endedTours.find((t) => t.id === id);
    if (ended) permanentRedirect(endedTourTarget(ended, tours));
    notFound();
  }

  // 박수별 요금 상품(요금 단계에 nights가 있음) — 일정 칸·일정 제목을 "3박4일 · 4박5일 · 5박6일"로
  const nightTiers = (tour.holePriceTiers ?? []).filter((t) => t.nights != null && t.days != null);
  // 같은 박수가 출발 요일별로 두 줄인 상품(사이판 3박5일 월/목·금)은 "3박5일 · 3박5일"로 겹쳐 보였다 → 한 번만 (2026-10-09)
  const tierNightsText = nightTiers.length > 0 ? [...new Set(nightTiers.map((t) => `${t.nights}박${t.days}일`))].join(" · ") : undefined;
  const tierNightsRange =
    nightTiers.length > 1
      ? `${nightTiers[0].nights}박${nightTiers[0].days}일 ~ ${nightTiers[nightTiers.length - 1].nights}박${nightTiers[nightTiers.length - 1].days}일`
      : tierNightsText;

  // 지역 소개 페이지가 있으면 경로의 지역 이름은 그 페이지로 (SEO/GEO 2026-10-11)
  const guide = (() => { const g = regionGuides.find((x) => (tour.region ?? "").includes(x.regionKey)); return g ? `/guide/${g.slug}` : undefined; })();
  const dep = tour.departure === "both" ? undefined : tour.departure;
  const backHref = dep ? `/${dep}` : "/";

  // 취소·환불 규정은 표준으로 통일한다(사장님 확정 2026-09-09).
  // 기존 cancelPolicy 에 섞여 있던 상품별 안내사항(추가요금·싱글룸·차량 조건 등)은 버리지 않고 따로 보여준다.
  const productNotes = (tour.cancelPolicy ?? []).filter((line) => !isCancelLadderLine(line));

  // ── 상단 좌우 배치용 (사장님 작업지시 2026-10-25) — 전부 기존 등록 정보에서만 뽑는다
  // 칩은 짧게 — "54홀 (18홀 × 3회)" 같은 부연은 뺀다 (사장님 지시 10/25)
  const holesRaw0 = tour.holes ?? `${tour.roundsIncluded * 18}`;
  const holesNum = String(holesRaw0).match(/총\s*(\d+)\s*홀/)?.[1] ?? String(holesRaw0).match(/(\d+)\s*홀/)?.[1];
  const holesShortTop = holesNum ? `총 ${holesNum}홀` : `${String(holesRaw0).split("\n")[0]}`;
  const depLabel = tour.departure === "both" ? "인천·부산 출발" : tour.departure === "busan" ? "부산 출발" : "인천 출발";
  const galleryImages = tour.images && tour.images.length > 0 ? tour.images : tour.image ? [tour.image] : [];
  // 인원 조건 해석은 lib/peopleCondition.ts 한 곳 — 칩·문의 기본값·인원 선택 제한·?people= 검증이 같은 결과를 쓴다 (챗GPT 감사 10/27)
  //   최소 출발 인원 · 표시 요금 기준 · 객실 기준 · 항공 운임 기준 · 추가금/요금 확인을 따로 읽는다. 인원을 곱한 합계는 만들지 않는다.
  const peopleCond = parsePeopleCondition(tour.minPeople);
  const peopleInfo = {
    chip: peopleCond.chip,
    basis: peopleCond.basisText,
    airfare: peopleCond.airfareText,
    // 불포함 내역 아래 "인원 조건" — 추가금·인원별 요금 확인 원문과 조인·시즌 같은 출발 조건을 모두 보존한다
    extra: [...peopleCond.extraLines, ...peopleCond.conditionLines].join(" · "),
  };
  const minPeopleChip = peopleInfo.chip;
  // 출발 기간 칩 — 괄호 부연·"매일/지정 출발" 꼬리를 떼고 기간만 (사장님 지시 10/25)
  // 시작 달이 지났으면 남은 출발일(없으면 이번 달) 기준으로 당긴다 — "2026년 7월 ~ 12월"이 10월에도 남아 있었다 (가상 고객 체험 10/25, tours.json 은 그대로)
  const periodChip = (() => {
    const p = (tour.period ?? "연중 출발").replace(/\([^)]*\)/g, "").trim().replace(/\s*(매일|지정일?)\s*출발$/, "").trim().replace(/(\d+월)\s*\d+일/g, "$1").trim();
    const m = p.match(/^(\d{4})년\s*(\d{1,2})월/);
    if (!m) return p;
    const nowYm = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 7);
    const next = (tour.departurePrices ?? []).map((d) => d.date).filter((d) => d.slice(0, 7) >= nowYm).sort()[0];
    const startYm = (next ?? nowYm).slice(0, 7);
    if (`${m[1]}-${m[2].padStart(2, "0")}` >= startYm) return p;
    const e = p.match(/~\s*(?:(\d{4})년\s*)?(\d{1,2})월\s*$/);
    const endYm = e ? `${e[1] ?? m[1]}-${e[2].padStart(2, "0")}` : `${m[1]}-${m[2].padStart(2, "0")}`;
    if (endYm < startYm) return p; // 기간이 이미 끝난 상품은 손대지 않는다
    const startText = `${startYm.slice(0, 4)}년 ${Number(startYm.slice(5, 7))}월`;
    return endYm === startYm ? startText : p.replace(m[0], startText);
  })();
  // 괄호 덩어리는 줄 중간에서 끊기지 않게 — "(2인 1실)" "(36홀, 9홀 코스 4개)" (사장님 지시 10/25)
  const noWrapParens = (t: string) =>
    t.split(/(\([^)]*\))/).map((part, i) =>
      part.startsWith("(") ? <span key={i} className="whitespace-nowrap">{part}</span> : <span key={i}>{part}</span>);
  // 골프장 소개가 "안 들어간" 골프장에만 한 줄 요약 (사장님 지시 10/25, 중복 금지)
  // 판단: 소개 한 줄의 고유 낱말(3자 이상)이 상품의 골프장 설명에 2개 이상 이미 있으면 같은 소개로 보고 뺀다
  const descText = tour.golfCourseDesc ?? "";
  const relatedCourses = courses.filter((c) => c.relatedTourIds.includes(tour.id));
  const summaryOverlaps = (summary: string) => {
    const words = summary.split(/[^0-9A-Za-z가-힣]+/).filter((w) => w.length >= 3);
    return words.filter((w) => descText.includes(w)).length >= 2;
  };
  // 골프장 칩: 소개 페이지 자료(specs)에서 홀수·파/전장·개장만 뽑는다. 없는 항목은 비운다 (사장님 확정 2026-10-25, 지어내지 않음)
  const courseChips = (c: (typeof courses)[number]): string[] => {
    const get = (label: string) => c.specs?.find((sp) => sp.label === label)?.value ?? "";
    const chips: string[] = [];
    const holes = (get("코스 구성") || get("홀 / 파")).match(/\d+홀/)?.[0];
    if (holes) chips.push(holes);
    const parLen = get("파 / 전장") || [get("파"), get("전장")].filter(Boolean).join(" / ");
    if (parLen) chips.push(parLen.replace(/\s*\/\s*/, " · ").replace(/\s*\(.*$/, "").replace(/^\d+홀 합계\s*/, "총 전장 "));
    const open = (get("개장") || get("개장 / 리디자인")).match(/(19|20)\d{2}년/)?.[0];
    if (open) chips.push(`${open} 개장`);
    return chips;
  };
  // 골프장이 1곳뿐이고 상품 설명이 충분하면 한 줄 소개는 겹치니 칩만 (사장님 지적 10/25 메조)
  const linkedCourses = relatedCourses
    .map((c) => ({
      course: c,
      chips: courseChips(c),
      showSummary: Boolean(c.summary) && !summaryOverlaps(c.summary ?? "") && !(relatedCourses.length === 1 && descText.length >= 40),
    }))
    .filter((x) => x.chips.length > 0 || x.showSummary);

  /**
   * 화면에 보일 제목을 줄 단위로 나눈다. (검색용 제목은 나누지 않는다)
   *   ① "｜" 가 있으면 그 자리에서 나눈다.
   *   ② 없으면 "3박4일" 뒤에서 나눈다. "3박4일·4박5일" 처럼 이어진 것은 한 덩어리로 본다.
   *   ③ 뒤에 남는 것이 없거나 "(…)" 괄호뿐이면 나누지 않는다 — 짧은 꼬리가 혼자 남으면 더 지저분하다.
   */
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
      // "골프여행" 바로 뒤가 "3박5일"뿐이면 따로 한 줄을 만들지 않고 앞줄에 붙인다
      // 예) [인천출발] 하롱베이 골프여행 3박5일 / 드래곤링크스·FLC하롱베이·뚜언쩌우 3색 72홀 (사장님 지시 2026-10-10)
      if (byTrip && NIGHTS.test(byNights[0]) && byNights[0].replace(NIGHTS, "").trim() === "") {
        lines[lines.length - 1] = `${lines[lines.length - 1]} ${byNights[0]}`;
        lines.push(byNights[1]);
      } else {
        lines.push(byNights[0], byNights[1]);
      }
    } else {
      lines.push(rest);
    }

    return lines;
  })();

  // 항공편·출발일 — 일정 문장 속에 묻혀 있어 AI 요약에서 빠졌다(ChatGPT로 온 손님이 비행시간을 몰랐음, 2026-10)
  const flights = flightInfo(tour);
  // 편명(ZE891 등)은 괄호 속에서 앞으로 빼 더 잘 보이게 (사장님 지시 10/25 정정) — 대체편(또는 …)은 그대로
  const flightNoOf = (t: string) => t.match(/\b([A-Z\d][A-Z]\d{3,4})\b/)?.[1] ?? "";
  const stripFlightNo = (t: string) => t.replace(/\(([A-Z\d][A-Z]\d{3,4}),\s*/, "(").replace(/\s*\b[A-Z\d][A-Z]\d{3,4}\b(?=\s)/, "").replace(/\(\s+/g, "(");
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
      "@id": "https://www.padotour.com/#organization",
      name: "여행의 파도",
      url: "https://www.padotour.com",
    },
  };

  // 화면 위 경로 표시(홈 › 국가 › 지역 › 상품 상세)와 같은 순서의 BreadcrumbList (SEO 감사 2026-10-11)
  const SITE = "https://www.padotour.com";
  const crumbs = [
    { name: "홈", item: `${SITE}${dep ? `/${dep}` : "/"}` },
    { name: tour.country, item: `${SITE}/tours?country=${tour.countryCode}${dep ? `&departure=${dep}` : ""}` },
    ...(tour.region
      ? [{ name: tour.region, item: guide ? `${SITE}${guide}` : `${SITE}/tours?country=${tour.countryCode}&region=${encodeURIComponent(tour.region)}${dep ? `&departure=${dep}` : ""}` }]
      : []),
    { name: tour.title, item: `${SITE}/tours/${tour.id}` },
  ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ViewItemTracker
        itemId={tour.id}
        itemName={tour.title}
        country={tour.country}
        region={tour.region}
      />

      {/* ── 경로 표시 (사장님 확정 B2, 2026-10-10) ──
          검색으로 바로 들어와도 "홈 › 국가 › 지역 › 상품 상세" 로 상위 화면에 갈 수 있게. 국가·지역은 상품 데이터 그대로.
          휴대폰은 한 줄만 쓰고, 좁으면 마지막 "상품 상세" 를 숨긴다 */}
      <nav aria-label="현재 위치" className="bg-slate-50 border-b border-slate-200">
        <ol className="max-w-6xl mx-auto px-4 flex items-center gap-1.5 min-h-11 text-[15px] whitespace-nowrap overflow-hidden">
          {[
            { label: "홈", href: dep ? `/${dep}` : "/" },
            { label: tour.country, href: `/tours?country=${tour.countryCode}${dep ? `&departure=${dep}` : ""}` },
            ...(tour.region
              ? [{ label: tour.region, href: guide ?? `/tours?country=${tour.countryCode}&region=${encodeURIComponent(tour.region)}${dep ? `&departure=${dep}` : ""}` }]
              : []),
          ].map((c, i, arr) => (
            <li key={c.label} className="flex items-center gap-1.5 flex-none">
              <Link href={c.href} className="text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-blue-200 min-h-11 inline-flex items-center">
                {c.label}
              </Link>
              <span className={i === arr.length - 1 ? "hidden min-[400px]:flex" : "flex"}>
                <IconChevron className="w-4 h-4 text-slate-400" />
              </span>
            </li>
          ))}
          <li aria-current="page" className="hidden min-[400px]:block text-slate-800 font-semibold truncate">상품 상세</li>
        </ol>
      </nav>

      {/* ── 상단: 왼쪽 사진 갤러리 55 + 오른쪽 상품 정보 45 (사장님 작업지시 2026-10-25, 어두운 덮개 제거) ── */}
      <div className="max-w-6xl mx-auto px-4 pt-5 md:pt-7">
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] gap-5 lg:gap-10 lg:items-start">
          <TourGallery images={galleryImages} alt={tour.title} />
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="flex items-center gap-2 text-[15px] font-bold text-slate-600">
                <CountryFlag country={tour.country} /> {tour.country}{tour.region ? ` · ${tour.region}` : ""}
              </p>
              <ShareButton title={tour.title} itemId={tour.id} className="flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-full" />
            </div>
            {/* 제목은 원본 그대로(검색·SEO 유지) — 줄만 의미 단위로 나눈다. 누르면 출발일·요금으로 (클래리티 10/8) */}
            <h1 className="text-[21px] md:text-[26px] font-black leading-snug break-keep text-slate-900">
              <Link href="#departure" className="hover:underline">
                {titleLines.map((line, li) => (
                  <span key={li} className="block">
                    {line.split("·").map((part, pi, arr) => (
                      <span key={pi}>{part}{pi < arr.length - 1 && <>{"\u2060·"}<wbr /></>}</span>
                    ))}
                  </span>
                ))}
              </Link>
            </h1>
            {tour.subtitle && <p className="text-[15px] text-slate-600 mt-2 break-keep">{tour.subtitle}</p>}
            <ul className="flex flex-wrap gap-2 mt-3.5" aria-label="상품 기본 정보">
              {[
                { icon: <IconPlaneTakeoff className="w-4 h-4" />, text: depLabel },
                { icon: <IconMoon className="w-4 h-4" />, text: tierNightsText ?? stayText(tour.nights, tour.days, " ") },
                { icon: <IconFlag className="w-4 h-4" />, text: String(tour.roundsIncluded).includes("무제한") ? "무제한 라운드" : holesShortTop },
                // 본문 핵심 정보 4칸을 없애고 칩으로 합쳤다 (사장님 확정 '나', 2026-10-25)
                ...(minPeopleChip ? [{ icon: <IconUsers className="w-4 h-4" />, text: minPeopleChip }] : []),
                { icon: <IconCalendarDays className="w-4 h-4" />, text: periodChip || "연중 출발" },
              ].map((c) => (
                <li key={c.text} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-[13px] font-bold text-slate-700">
                  <span className="text-brand-blue">{c.icon}</span>{c.text}
                </li>
              ))}
            </ul>
            {/* 요금이 "문의"뿐인 상품은 1인 가격 대신 요금 문의로 (사장님 확정 10/25) */}
            {/원/.test(departures?.lowPriceText ?? tour.price ?? "") ? (
              <p className="mt-5 text-[15px] font-bold text-slate-900">
                <b className="text-[30px] md:text-[32px] font-black text-red-600">{departures?.lowPriceText ?? (tour.price ?? "").replace(/~\s*$/, "")}</b>부터{" "}
                <span className="text-[14px] font-semibold">(1인요금)</span>
              </p>
            ) : (
              <p className="mt-5 text-[22px] font-black text-red-600">요금 문의</p>
            )}
            {peopleInfo.basis && <p className="mt-1.5 text-[13px] font-semibold text-slate-600">{peopleInfo.basis}</p>}
            {peopleInfo.airfare && <p className="mt-1.5 text-[13px] font-semibold text-slate-600">{peopleInfo.airfare}</p>}
            <a href="#departure" className="mt-4 w-full min-h-12 rounded-xl border-[1.5px] border-brand-blue text-brand-blue hover:bg-blue-50 text-[15px] font-black flex items-center justify-center gap-1.5">
              <IconCalendarDays className="w-5 h-5" />출발일별 요금 보기
            </a>
          </div>
        </div>
      </div>

      {/* ── 본문 70 + 오른쪽 문의 패널 30 (휴대폰: 사진→정보→달력→상세, 패널은 아래 고정 바) ── */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-1 lg:pb-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="min-w-0">

        {/* ── 출발일 캘린더 + 요금 / 홀수별 요금 ── */}
        {tour.holePriceTiers && tour.holePriceTiers.length > 0 ? (
          <div id="departure" className="mb-8 scroll-mt-28 md:scroll-mt-32">
            {tour.period && (
              <p className="text-sm text-gray-500 mb-2">{tour.period} · {tierNightsText ? "일정 선택제 요금" : "홀수 선택제 요금"}</p>
            )}
            <HolePriceTierSelector
              tourId={tour.id}
              tourTitle={tour.title}
              departureDate={tour.holePriceDepartureDate ?? ""}
              nights={tour.nights}
              days={tour.days}
              tiers={tour.holePriceTiers}
              departurePrices={tour.departurePrices}
              peopleCond={peopleCond}
            />
          </div>
        ) : tour.departurePrices && tour.departurePrices.length > 0 ? (
          <div id="departure" className="mb-8 scroll-mt-28 md:scroll-mt-32">
            <DeparturePriceCalendar
              departurePrices={tour.departurePrices}
              nights={tour.nights}
              days={tour.days}
            />
          </div>
        ) : (
          <div id="departure" className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 mb-8 scroll-mt-28 md:scroll-mt-32 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-0.5">{depLabel} 기준</p>
              <p className="text-3xl md:text-4xl font-black text-red-600">{tour.price}</p>
              <p className="text-xs text-gray-400 mt-1">※ 날짜별 요금이 준비 중인 상품이에요 — 출발일 요금은 <b>요금 문의</b>로 바로 확인해 드립니다</p>
            </div>
          </div>
        )}


        {/* 본문 핵심 정보 4칸은 상단 칩으로 합쳐 없앴다 (사장님 확정 "나", 2026-10-25) */}

        {/* ── 항공편·출발일 한눈에 ── */}
        {/* 그림·달력이 아니라 글자로 둔다 — AI 검색이 이 문장을 그대로 읽어 간다 (2026-10, ChatGPT 유입 손님 사례) */}
        {(flights.outbound || flights.inbound || departures) && (
          <dl className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 mb-8 space-y-2.5 text-sm break-keep">
            {flights.outbound && (
              <div className="flex gap-3">
                <dt className="flex-shrink-0 whitespace-nowrap font-bold text-gray-500 flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 md:h-5"><span className="flex items-center gap-2 h-5"><span className="text-brand-blue"><IconPlaneTakeoff /></span>가는 편</span>{flightNoOf(flights.outbound) && <b className="px-1.5 py-0.5 rounded bg-blue-50 text-brand-blue text-[13px] font-extrabold">{flightNoOf(flights.outbound)}</b>}</dt>
                <dd className="text-gray-800 leading-5"><FlightLine text={stripFlightNo(flights.outbound)} /></dd>
              </div>
            )}
            {flights.inbound && (
              <div className="flex gap-3">
                <dt className="flex-shrink-0 whitespace-nowrap font-bold text-gray-500 flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 md:h-5"><span className="flex items-center gap-2 h-5"><span className="text-brand-blue"><IconPlaneLanding /></span>오는 편</span>{flightNoOf(flights.inbound) && <b className="px-1.5 py-0.5 rounded bg-blue-50 text-brand-blue text-[13px] font-extrabold">{flightNoOf(flights.inbound)}</b>}</dt>
                <dd className="text-gray-800 leading-5"><FlightLine text={stripFlightNo(flights.inbound)} /></dd>
              </div>
            )}
            {departures && (
              <div className="flex gap-3">
                <dt className="flex-shrink-0 whitespace-nowrap font-bold text-gray-500 flex items-center gap-2 h-5"><span className="text-brand-blue"><IconCalendarDays /></span>출발일</dt>
                <dd className="text-gray-800 leading-5">
                  {/* 좁은 화면에서 날짜·"중 40일 출발"이 중간에 끊기지 않게 덩어리로 (사장님 지시 10/25) */}
                  <Link href="#departure" className="hover:underline">
                    {(() => {
                      const [range, tail] = departures.rangeText.split(/ 중 (.+)/);
                      const [a, bPart] = range.split(" ~ ");
                      return (
                        <>
                          <span className="whitespace-nowrap">{a}</span>
                          {bPart && <> ~ <span className="whitespace-nowrap">{bPart}</span></>}
                          {tail && <> <span className="whitespace-nowrap">중 {tail}</span></>}
                        </>
                      );
                    })()}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        )}

        {/* ── 상품 요약 박스 ── */}
        {/* 카드처럼 보여 눌러도 반응 없는 클릭이 많았다(클래리티 배달못한클릭 20회, 2026-09-17) → 문의 폼으로 스크롤하게 만든다 */}
        <Link href="#departure" className="block bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-6 mb-8 hover:bg-emerald-100 transition-colors">
          <p className="text-xs text-gray-500 mb-2">{tour.region} 골프여행 상품 구성</p>
          {/* 한 덩어리로 붙어 있으면 읽기 어렵다 → 문장 단위로 줄을 나눈다 */}
          <div className="space-y-1.5">
            {(tour.productSummary ?? `${tour.golfCourse ?? ""} ${tour.roundsIncluded}회 라운딩 · ${tour.hotel ?? ""} 숙박`)
              .replace(/\s*\n+\s*/g, " ").split(/(?<=다\.)\s*/)
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
          {/* '문의하기' 줄은 뺀다 (사장님 지시 10/25) — 박스 자체가 출발일·요금으로 이동 */}
        </Link>

        {/* ── 하이라이트 ── */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-accent-teal inline-flex items-center gap-1.5"><span className="text-brand-blue"><IconSparkles /></span>이 상품의 특징</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 카드처럼 보여 눌러도 반응 없는 클릭이 많았다(클래리티 배달못한클릭, 2026-09-21 녹화 확인:
                "직항, 이동시간 단축" 2회 · "셀프+카트 라운드" 1회) → 문의 폼으로 스크롤하게 만든다 */}
            {tour.highlights.map((h, i) => (
              <Link key={i} href="#departure" className="flex items-start gap-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl p-4 transition-colors">
                <span className="text-emerald-600 mt-0.5"><IconCheck className="w-5 h-5" /></span>
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
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-accent-teal inline-flex items-center gap-1.5"><span className="text-brand-blue"><IconBuilding /></span>{tour.region} 골프여행 숙박 호텔</h2>
            {/* 골프장 정보 박스와 같은 이유로 문의 폼 링크를 단다 (클래리티 배달못한클릭, 2026-09-17) */}
            <Link href="#departure" className="block bg-gray-50 hover:bg-gray-100 rounded-2xl p-5 border border-gray-100 mb-3 transition-colors">
              <div className="font-black text-gray-800 text-base mb-2 break-keep">{noWrapParens(tour.hotel)}</div>
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
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-accent-teal inline-flex items-center gap-1.5"><span className="text-brand-blue"><IconFlag /></span>{tour.region} 골프장 정보</h2>
            {/* 카드처럼 보여 눌러도 반응 없는 클릭이 많았다(클래리티 배달못한클릭 16회, 2026-09-17) → 문의 폼으로 스크롤하게 만든다 */}
            <Link href="#departure" className="block bg-gray-50 hover:bg-gray-100 rounded-2xl p-5 border border-gray-100 mb-3 transition-colors">
              <div className="font-black text-gray-800 text-base mb-2 break-keep">{noWrapParens(tour.golfCourse)}</div>
              {tour.golfCourseDesc && <Sentences text={tour.golfCourseDesc} />}
            </Link>
            {/* 골프장마다 한 줄 소개 — 이름만 나열하지 않는다 (사장님 지시 10/25). 소개 페이지의 한 줄 요약을 그대로 가져온다 */}
            {/* 소개 페이지 링크는 빼고 글로만 — 상품을 보던 고객이 페이지를 떠나지 않게 (사장님 확정 가안, 2026-10-25) */}
            {linkedCourses.length > 0 && (
              <ul className="space-y-2 mb-3">
                {linkedCourses.map(({ course: c, chips, showSummary }) => (
                  <li key={c.slug} className="bg-white border border-gray-100 rounded-xl px-4 py-3.5">
                    <p className="font-bold text-[16px] text-slate-900">{c.name}</p>
                    {chips.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5 mt-2" aria-label={`${c.name} 기본 정보`}>
                        {chips.map((chip, i) => (
                          <li key={chip} className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[14px] md:text-[15px] font-bold whitespace-nowrap ${i === 0 ? "text-brand-blue" : "text-slate-700"}`}>
                            {chip}
                          </li>
                        ))}
                      </ul>
                    )}
                    {showSummary && <p className="text-[15px] text-gray-700 mt-2 leading-relaxed break-keep">{c.summary}</p>}
                  </li>
                ))}
              </ul>
            )}
            {tour.courseImages && tour.courseImages.length > 0 && (
              <PhotoGrid images={tour.courseImages} altBase={tour.golfCourse} objectTop />
            )}
          </div>
        )}

        {/* ── 포함/불포함 ── */}
        {/* 두 박스도 카드처럼 보여 눌러도 반응이 없었다(클래리티 배달못한클릭, 2026-09-21 녹화 확인:
            "그린피 + 카트피 + 락카피" 클릭) → 문의 폼으로 스크롤하게 만든다 */}
        {/* 문의 패널 "현지 별도 비용 보기"가 여기로 내려온다 */}
        <div id="extra-costs" className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 scroll-mt-28 md:scroll-mt-32">
          <Link href="#departure" className="block bg-emerald-50 hover:bg-emerald-100 rounded-2xl p-5 border border-emerald-100 transition-colors">
            <h3 className="font-black text-emerald-800 mb-3 flex items-center gap-2">
              <IconCircleCheck /> 포함 내역
            </h3>
            <ul className="space-y-1.5">
              {tour.includes.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-emerald-500">•</span> {item}
                </li>
              ))}
            </ul>
          </Link>
          <Link href="#departure" className="block bg-red-50 hover:bg-red-100 rounded-2xl p-5 border border-red-100 transition-colors">
            <h3 className="font-black text-red-800 mb-3 flex items-center gap-2">
              <IconCircleX /> 불포함 내역
            </h3>
            <ul className="space-y-1.5">
              {tour.excludes.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-red-400">•</span> {item}
                </li>
              ))}
              {(peopleInfo.extra || peopleInfo.airfare) && (
                <li id="extra-people" className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-red-400">•</span> 인원 조건: {[peopleInfo.extra, peopleInfo.airfare].filter(Boolean).join(" · ")} (확인 후 안내)
                </li>
              )}
            </ul>
          </Link>
        </div>

        {/* ── 여행 일정 ── */}
        {tour.schedule && tour.schedule.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-accent-teal inline-flex items-center gap-1.5"><span className="text-brand-blue"><IconCalendarDays /></span>{tour.region} 골프여행 {tierNightsRange ?? stayText(tour.nights, tour.days)} 일정</h2>
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
          <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-accent-teal inline-flex items-center gap-1.5"><span className="text-brand-blue"><IconCircleHelp /></span>{tour.region} 골프여행 자주 묻는 질문</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-gray-50 border border-gray-100 rounded-xl">
                <summary className="cursor-pointer list-none px-4 py-3 font-bold text-gray-800 text-sm flex items-start justify-between gap-3 break-keep">
                  <span>Q. {f.q}</span>
                  <IconChevron dir="down" className="w-4 h-4 mt-0.5 text-gray-400 group-open:rotate-[270deg] transition-transform flex-shrink-0" />
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

        {/* ── 일행에게 보내기 + 요금 기준 안내 (문의는 오른쪽 패널·아래 고정 바로 통합, 지시서 5) ── */}
        <div className="mb-8">
          <ShareButton
            title={tour.title}
            itemId={tour.id}
            className="w-full bg-white hover:bg-ice-blue text-brand-blue border-2 border-brand-blue/30 font-black px-8 py-2 rounded-xl text-sm"
          />
          <p className="text-xs text-slate-ink mt-2 text-center">함께 가실 분에게 이 상품을 보내보세요</p>
          {tour.priceUpdatedDate && (() => {
            const d = new Date(tour.priceUpdatedDate);
            const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
            return (
              <div className="text-[11px] text-slate-ink mt-4 leading-relaxed space-y-1 break-keep">
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
              <IconPin className="w-4 h-4" />취소·환불 규정 보기
              <IconChevron dir="down" className="w-4 h-4 text-gray-400 group-open:rotate-[270deg] transition-transform" />
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

          </div>

          {/* 오른쪽 문의 패널 (PC sticky) + 휴대폰 아래 고정 바 + 문의 입력 창 */}
          <InquiryDock
            tourId={tour.id}
            tourTitle={tour.title}
            nights={tour.nights}
            days={tour.days}
            peopleCond={peopleCond}
            roomBasis={roomBasisOf(tour)}
            defaultSel={null /* 날짜를 미리 고르지 않는다 — 검색 날짜는 달력이 주소에서 받아 알린다 (사장님 A안 10/25) */}
            priceText={departures?.lowPriceText ?? (tour.price ?? "").replace(/~\s*$/, "")}
            hasCalendar={Boolean(!tour.holePriceTiers?.length && tour.departurePrices?.length)}
          />
        </div>

        {/* ── 뒤로가기 — 화면 전체 기준 가운데, 위아래 여백은 기존의 1/3 (사장님 지시 2026-10-25) */}
        <div className="text-center pt-3 pb-7 md:py-3 -mt-2 md:mt-0">
          <Link href={`/tours?country=${tour.countryCode}${dep ? `&departure=${dep}` : ""}`} className="group inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold text-[15px]">
            <IconArrowLeft className="w-[18px] h-[18px] transition-transform md:group-hover:-translate-x-0.5" />{tour.country} 상품 목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
