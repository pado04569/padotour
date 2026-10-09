import { tours, type Tour } from "@/data/tours";
import { flightInfo, departureSummary } from "@/lib/tripFacts";
import { stayText } from "@/lib/stay";

/**
 * 상품별 자주 묻는 질문 — 손님이 전화로 실제로 묻는 것들을 상품 데이터에서 그대로 답한다.
 *
 * 왜: 네이버 블로그는 ChatGPT·Perplexity 로봇을 막아둬서(robots.txt) AI가 못 읽는다.
 * AI 검색에 보이는 창구는 홈페이지뿐이라, "질문 → 짧고 정확한 답" 형태로 남겨둔다. (2026-10, GEO)
 *
 * 원칙: 데이터에 없는 내용은 지어내지 않는다 — 답할 재료가 없으면 그 질문을 빼버린다.
 */

export type Faq = { q: string; a: string };

const PHONE = "010-5301-5250";

const DEP_LABEL: Record<Tour["departure"], string> = {
  incheon: "인천",
  busan: "부산(김해)",
  both: "인천·부산",
};

const pick = (items: string[], re: RegExp) => items.filter((i) => re.test(i));

export function tourFaqs(tour: Tour): Faq[] {
  const faqs: Faq[] = [];
  const region = tour.region ?? tour.country;

  // 1) 항공편
  const f = flightInfo(tour);
  if (f.outbound || f.inbound) {
    faqs.push({
      q: "비행기는 몇 시에 출발하나요?",
      a: [f.outbound && `가는 편은 ${f.outbound}입니다.`, f.inbound && `오는 편은 ${f.inbound}입니다.`, "항공 스케줄은 항공사 사정으로 바뀔 수 있어 예약 시 다시 안내드립니다."]
        .filter(Boolean)
        .join(" "),
    });
  }

  // 2) 출발일·요금
  const d = departureSummary(tour);
  if (d || tour.period) {
    faqs.push({
      q: "언제 출발할 수 있고, 요금은 얼마인가요?",
      a: [
        d
          ? `${d.rangeText}하며, 가장 저렴한 날은 ${d.cheapestDateText} 출발 ${d.lowPriceText}입니다.`
          : [`출발 기간은 ${tour.period}입니다.`, tour.price && `요금은 ${tour.price.replace(/~$/, "부터")}입니다.`].filter(Boolean).join(" "),
        d
          ? "출발일별 요금은 이 페이지의 출발일 달력에서 확인하실 수 있고, 유류할증료·환율에 따라 달라질 수 있습니다."
          : "요금은 유류할증료·환율에 따라 달라질 수 있습니다.",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  // 3) 최소 인원
  if (tour.minPeople != null) {
    const mp = String(tour.minPeople).trim();
    const base = /인/.test(mp) ? mp : `${mp}인`;
    faqs.push({
      q: "몇 명부터 갈 수 있나요?",
      a: `최소 출발 인원은 ${base}입니다. 인원 조건은 전화(${PHONE})로 상담해 드립니다.`,
    });
  }

  // 일정·홀수 선택지 — "3박5일 54홀", "4박6일 72홀" … (같은 구성이 출발 요일별로 두 줄이면 한 번만)
  const tierChoices = [...new Set((tour.holePriceTiers ?? []).map((t) =>
    `${t.nights != null && t.days != null ? `${t.nights}박${t.days}일 ` : ""}${t.holes}홀`))];
  const tierStays = [...new Set((tour.holePriceTiers ?? []).filter((t) => t.nights != null).map((t) => `${t.nights}박`))];

  // 4) 라운딩·골프장
  if (tour.roundsIncluded || tour.holes || tour.golfCourse) {
    // roundsIncluded·holes 가 "무제한" 같은 글자인 상품도 있다 — 숫자일 때만 "라운드"·"홀"을 붙인다
    const rounds = typeof tour.roundsIncluded === "number" ? `${tour.roundsIncluded}라운드` : "";
    const holesRaw = tour.holes != null ? String(tour.holes).split("\n")[0].trim() : rounds ? `${tour.roundsIncluded * 18}` : "";
    const holes = /^\d+$/.test(holesRaw) ? `${holesRaw}홀` : holesRaw;
    // "18홀 x 3회"처럼 횟수가 이미 들어 있으면 "3라운드"를 또 붙이지 않는다
    let play = rounds && !/라운|회/.test(holes) ? `${rounds} ${holes}` : holes || rounds;
    // 일정·홀수를 고르는 상품(holePriceTiers)은 선택지 전체로 답한다 — 한 가지만 쓰면 AI가 "이 상품은 3박5일 54홀"로 단정한다 (2026-10-09)
    if (tierChoices.length > 1) play = `${tierChoices.join(" / ")} 중에서 고르실 수 있습니다`;
    faqs.push({
      q: "라운딩은 몇 홀이고, 어느 골프장에서 치나요?",
      a: [play && (tierChoices.length > 1 ? `라운딩은 ${play.trim()}.` : `라운딩은 ${play.trim()}입니다.`), tour.golfCourse && `골프장은 ${tour.golfCourse}입니다.`].filter(Boolean).join(" "),
    });
  }

  // 5) 캐디피·카트비
  const golfIn = pick(tour.includes, /그린피|캐디|카트/);
  const golfOut = pick(tour.excludes, /캐디|카트/);
  if (golfIn.length || golfOut.length) {
    faqs.push({
      q: "그린피·캐디피·카트비는 포함인가요?",
      a: [golfIn.length && `포함: ${golfIn.join(", ")}.`, golfOut.length && `불포함(현지 지불): ${golfOut.join(", ")}.`].filter(Boolean).join(" "),
    });
  }

  // 6) 숙소
  if (tour.hotel) {
    const a = tierStays.length > 1
      ? `${tour.hotel}에서 묵습니다 (고르신 일정에 따라 ${tierStays.join("·")}).`
      : String(tour.nights).includes("박") ? `${tour.hotel}에서 묵습니다 (${stayText(tour.nights, tour.days)}).` : `${tour.hotel}에서 ${tour.nights}박 합니다.`;
    faqs.push({ q: "숙소는 어디인가요?", a });
  }

  // 7) 식사
  const mealIn = pick(tour.includes, /식/);
  const mealOut = pick(tour.excludes, /식/);
  if (mealIn.length || mealOut.length) {
    faqs.push({
      q: "식사는 포함인가요?",
      a: [mealIn.length && `포함: ${mealIn.join(", ")}.`, mealOut.length && `불포함: ${mealOut.join(", ")}.`].filter(Boolean).join(" "),
    });
  }

  // 8) 다른 공항 출발 — 같은 지역의 다른 출발지 상품이 있을 때만
  const other = tours.filter((t) => t.id !== tour.id && t.region === tour.region && t.departure !== tour.departure);
  if (other.length > 0) {
    const otherDep = [...new Set(other.map((t) => DEP_LABEL[t.departure]))].join("·");
    faqs.push({
      q: `${otherDep}에서도 출발하는 ${region} 골프여행이 있나요?`,
      a: `네, 있습니다. ${other.map((t) => t.title).join(" / ")} 상품을 확인해 보세요.`,
    });
  }

  // 9) 예약 방법 (전 상품 공통)
  faqs.push({
    q: "예약은 어떻게 하나요?",
    a: `홈페이지에서 바로 결제하지 않습니다. 이 페이지 아래 "예약 문의 · 맞춤 견적"에 출발일과 인원을 남기시거나 전화(${PHONE})로 연락 주시면, 담당자가 견적을 보내드립니다. ${DEP_LABEL[tour.departure]} 출발 상품입니다.`,
  });

  return faqs;
}
