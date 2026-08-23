import toursData from "./tours.json";

export type Tour = {
  id: string;
  country: string;
  countryCode: string;
  region: string;
  title: string;
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
  price: string;
  image: string;
  images?: string[];
  productSummary?: string;
  hotelImages?: string[];
  courseImages?: string[];
  badge?: string;
  departure: "incheon" | "busan" | "both";
  /** 검색엔진용 서술형 한 줄 소개 (제목 아래 렌더링, meta description으로도 사용) */
  seoIntro?: string;
  /** 검색엔진용 키워드 태그 목록 (상품 구성 아래 회색 텍스트로 렌더링) */
  seoKeywords?: string[];
};

const allTours: Tour[] = toursData as Tour[];

// 출발일이 모두 지난 상품(=예약 불가능한 상품)은 자동으로 목록에서 제외
function isTourActive(tour: Tour): boolean {
  if (!tour.departurePrices || tour.departurePrices.length === 0) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tour.departurePrices.some((dp) => new Date(dp.date) >= today);
}

export const tours: Tour[] = allTours.filter(isTourActive);

export const countries = [
  { code: "all", label: "전체" },
  { code: "japan", label: "일본" },
  { code: "china", label: "중국" },
  { code: "thailand", label: "태국" },
  { code: "vietnam", label: "베트남" },
  { code: "malaysia", label: "말레이시아" },
  { code: "philippines", label: "필리핀" },
];
