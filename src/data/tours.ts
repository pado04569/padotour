export type Tour = {
  id: string;
  country: string;
  countryCode: string;
  region: string;
  title: string;
  nights: number;
  days: number;
  courses: number;
  roundsIncluded: number;
  highlights: string[];
  includes: string[];
  excludes: string[];
  price: string;
  image: string;
  badge?: string;
  departure: "incheon" | "busan" | "both";
};

export const tours: Tour[] = [
  {
    id: "japan-fukuoka",
    country: "일본",
    countryCode: "japan",
    region: "후쿠오카",
    title: "후쿠오카 골프여행",
    nights: 3,
    days: 4,
    courses: 2,
    roundsIncluded: 2,
    highlights: ["하카타 시내 접근성 최고", "규슈 명문 코스 2라운드", "온천 포함"],
    includes: ["항공", "숙박", "골프 2라운드", "조식", "공항 셔틀"],
    excludes: ["중식/석식", "캐디피", "카트피", "개인 경비"],
    price: "문의",
    image: "/images/japan-1.jpg",
    badge: "인기",
    departure: "both",
  },
  {
    id: "japan-hokkaido",
    country: "일본",
    countryCode: "japan",
    region: "홋카이도",
    title: "홋카이도 골프여행",
    nights: 4,
    days: 5,
    courses: 3,
    roundsIncluded: 3,
    highlights: ["여름 시원한 골프 천국", "광활한 페어웨이", "신선한 해산물"],
    includes: ["항공", "숙박", "골프 3라운드", "조식", "공항 셔틀"],
    excludes: ["중식/석식", "캐디피", "카트피", "개인 경비"],
    price: "문의",
    image: "/images/japan-2.jpg",
    badge: "여름 추천",
    departure: "incheon",
  },
  {
    id: "japan-matsuyama",
    country: "일본",
    countryCode: "japan",
    region: "마쓰야마",
    title: "마쓰야마 골프여행",
    nights: 3,
    days: 4,
    courses: 2,
    roundsIncluded: 2,
    highlights: ["도고온천 필수 코스", "시코쿠 명문 코스", "한적한 자연 속 라운딩"],
    includes: ["항공", "숙박", "골프 2라운드", "조식", "도고온천 입욕"],
    excludes: ["중식/석식", "캐디피", "카트피", "개인 경비"],
    price: "문의",
    image: "/images/japan-matsuyama.jpg",
    departure: "incheon",
  },
  {
    id: "china-hainan",
    country: "중국",
    countryCode: "china",
    region: "하이난",
    title: "하이난 골프여행",
    nights: 4,
    days: 5,
    courses: 3,
    roundsIncluded: 3,
    highlights: ["중국의 하와이", "세계 수준 리조트 코스", "따뜻한 날씨 연중 가능"],
    includes: ["항공", "숙박", "골프 3라운드", "조식", "리조트 시설"],
    excludes: ["중식/석식", "캐디피", "카트피", "개인 경비"],
    price: "문의",
    image: "/images/china.jpg",
    departure: "both",
  },
  {
    id: "malaysia-kota",
    country: "코타키나발루",
    countryCode: "malaysia",
    region: "코타키나발루",
    title: "코타키나발루 골프여행",
    nights: 4,
    days: 5,
    courses: 2,
    roundsIncluded: 3,
    highlights: ["열대 밀림 속 환상적인 코스", "석양 골프 명소", "저렴한 물가"],
    includes: ["항공", "숙박", "골프 3라운드", "조식", "공항 픽업"],
    excludes: ["중식/석식", "캐디피", "카트피", "개인 경비"],
    price: "문의",
    image: "/images/kota.jpg",
    departure: "incheon",
  },
  {
    id: "philippines-cebu",
    country: "필리핀",
    countryCode: "philippines",
    region: "세부",
    title: "세부 골프여행",
    nights: 4,
    days: 5,
    courses: 2,
    roundsIncluded: 3,
    highlights: ["바다 전망 골프코스", "연중 따뜻한 날씨", "리조트 수영장"],
    includes: ["항공", "숙박", "골프 3라운드", "조식", "리조트 시설"],
    excludes: ["중식/석식", "캐디피", "카트피", "개인 경비"],
    price: "문의",
    image: "/images/philippines.jpg",
    departure: "incheon",
  },
  {
    id: "thailand-bangkok",
    country: "태국",
    countryCode: "thailand",
    region: "방콕",
    title: "방콕 골프여행",
    nights: 4,
    days: 5,
    courses: 3,
    roundsIncluded: 4,
    highlights: ["아시아 최고의 골프 천국", "합리적인 그린피", "맛있는 태국 음식"],
    includes: ["항공", "숙박", "골프 4라운드", "조식", "공항 픽업"],
    excludes: ["중식/석식", "캐디피", "카트피", "개인 경비"],
    price: "문의",
    image: "/images/thailand.jpg",
    departure: "both",
  },
];

export const countries = [
  { code: "all", label: "전체" },
  { code: "japan", label: "일본" },
  { code: "china", label: "중국" },
  { code: "malaysia", label: "코타키나발루" },
  { code: "philippines", label: "필리핀" },
  { code: "thailand", label: "태국" },
];
