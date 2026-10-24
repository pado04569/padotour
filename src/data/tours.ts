import toursData from "./tours.json";

export type Tour = {
  id: string;
  country: string;
  countryCode: string;
  region: string;
  title: string;
  /** 카드용 짧은 제목 (사장님 지시 2026-10-25) — 없으면 카드가 title 을 그대로 쓴다. SEO·상세 H1은 title 유지 */
  displayTitle?: string;
  subtitle?: string;
  nights: number;
  days: number;
  courses: number;
  roundsIncluded: number;
  holes?: number;
  minPeople?: number;
  period?: string;
  hotel?: string;
  hotelDesc?: string;
  golfCourse?: string;
  golfCourseDesc?: string;
  schedule?: { day: string; label: string; desc: string }[];
  highlights: string[];
  includes: string[];
  excludes: string[];
  cancelPolicy?: string[];
  departurePrices?: { date: string; price: number; nights?: number; days?: number }[];
  /** 날짜별이 아니라 홀수(선택 라운딩량)에 따라 요금이 갈리는 상품용 — 예: 54/72/90홀 3단계 */
  holePriceTiers?: { holes: number; pattern?: string; price: number; label?: string; nights?: number; days?: number; dates?: string[] }[];
  /** holePriceTiers 상품의 실제 출발일(YYYY-MM-DD) — 문의 접수 시 departureDate로 사용.
   *  단계에 nights가 있으면(박수별 요금 상품) departurePrices에서 그 박수의 출발일을 골라 쓴다. */
  holePriceDepartureDate?: string;
  price: string;
  image: string;
  images?: string[];
  productSummary?: string;
  hotelImages?: string[];
  courseImages?: string[];
  badge?: string;
  departure: "incheon" | "busan" | "cheongju" | "daegu" | "both";
  /** 검색엔진용 서술형 한 줄 소개 (제목 아래 렌더링, meta description으로도 사용) */
  seoIntro?: string;
  /** 검색엔진용 키워드 태그 목록 (상품 구성 아래 회색 텍스트로 렌더링) */
  seoKeywords?: string[];
  priceUpdatedDate?: string;
};

const allTours: Tour[] = toursData as Tour[];

// 출발일이 모두 지난 상품(=예약 불가능한 상품)은 자동으로 목록에서 제외
function isTourActive(tour: Tour): boolean {
  if (!tour.departurePrices || tour.departurePrices.length === 0) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tour.departurePrices.some((dp) => new Date(dp.date) >= today);
}

// 대표 요금(price)은 남은 출발일 중 최저가로 맞춘다 — 싼 출발일이 지나도 옛 값이 남아
// 카드·상세·검색 제목에 실제보다 싸게 보였다 (하이난 미션힐스 690,000 ↔ 실제 770,000 등 10개, 2026-10-22)
function withLivePrice(tour: Tour): Tour {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const left = (tour.departurePrices ?? []).filter((dp) => new Date(dp.date) >= today && dp.price > 0);
  if (left.length === 0 || !/\d/.test(tour.price)) return tour;
  const low = Math.min(...left.map((dp) => dp.price));
  return { ...tour, price: tour.price.replace(/[\d,]+/, low.toLocaleString("ko-KR")) };
}

export const tours: Tour[] = allTours.filter(isTourActive).map(withLivePrice);
// 출발일이 끝난 상품 — 목록에는 안 보이고, 옛 주소로 들어오면 같은 지역으로 넘긴다 (lib/endedTourRedirect.ts)
export const endedTours: Tour[] = allTours.filter((t) => !isTourActive(t));

export const countries = [
  { code: "all", label: "전체" },
  { code: "japan", label: "일본" },
  { code: "china", label: "중국" },
  { code: "thailand", label: "태국" },
  { code: "vietnam", label: "베트남" },
  { code: "malaysia", label: "말레이시아" },
  { code: "philippines", label: "필리핀" },
];
