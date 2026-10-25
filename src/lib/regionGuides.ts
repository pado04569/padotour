// 지역 골프여행 소개 페이지(/guide/[slug]) 설정 — SEO/GEO 작업 (사장님 승인 2026-10-11)
// 소개 문장은 실제 상품·골프장 데이터에 있는 사실만 쓴다. 상품·골프장·출발기간·요금은 화면에서 데이터로 자동 계산한다.
// 마쓰야마도 2026-10-11부터 같은 방식(손으로 쓴 옛 안내 → 데이터 자동, 사장님 승인). 주소 /guide/matsuyama 는 그대로.

export type RegionGuide = {
  slug: string;
  /** tours.json 의 region 에 이 글자가 들어 있으면 이 지역 상품 */
  regionKey: string;
  name: string;
  nameEn: string;
  country: string;
  countryCode: string;
  heroTourId: string;
  intro: string[];
};

export const regionGuides: RegionGuide[] = [
  {
    slug: "matsuyama",
    regionKey: "마쓰야마",
    name: "마쓰야마",
    nameEn: "MATSUYAMA",
    country: "일본",
    countryCode: "japan",
    heroTourId: "japan-matsuyama-city-2n3d-busan",
    intro: [
      "마쓰야마는 시코쿠 에히메현의 중심 도시입니다. 시내 중심 호텔에 숙박하며 PGM 마쓰야마 국제CC·씨사이드CC·호조CC·치산CC 등에서 라운드하고, 라운드 후에는 오카이도 상점가·마쓰야마성은 걸어서, 도고온천은 노면전차로 다녀올 수 있습니다.",
      "에어부산 김해 직항으로 가는 2박3일·3박4일 상품이 있고, 2인부터 출발합니다.",
    ],
  },
  {
    slug: "fukuoka",
    regionKey: "후쿠오카",
    name: "후쿠오카",
    nameEn: "FUKUOKA",
    country: "일본",
    countryCode: "japan",
    heroTourId: "japan-fukuoka-tosu",
    intro: [
      "후쿠오카 골프여행은 두 가지로 나뉩니다. 후쿠오카 근교 도스의 호텔에 숙박하며 카오·워너스·포레스트난칸·아마카세·그린랜드 같은 규슈 골프장을 라운딩하는 일정과, 온천 도시 벳부의 호텔에 숙박하며 벳부 골프장을 라운딩하는 일정입니다.",
      "인천과 부산(김해) 모두 출발 상품이 있어 가까운 공항을 고르면 됩니다.",
    ],
  },
  {
    slug: "kumamoto",
    regionKey: "구마모토",
    name: "구마모토",
    nameEn: "KUMAMOTO",
    country: "일본",
    countryCode: "japan",
    heroTourId: "japan-kumamoto",
    intro: [
      "구마모토 골프여행은 아소산 자락의 골프 리조트에 묵는 일정입니다. 인천 출발은 아소 그랑비리오 호텔에 머물며 아소 그랑비리오 골프장을 라운딩하고, 부산 출발은 아소 스카이블루 골프 리조트에 머뭅니다.",
      "두 곳 모두 숙소와 골프장이 붙어 있는 리조트형이라 이동이 짧습니다.",
    ],
  },
  {
    slug: "hainan",
    regionKey: "하이난",
    name: "하이난",
    nameEn: "HAINAN",
    country: "중국",
    countryCode: "china",
    heroTourId: "china-hainan-missionhills",
    intro: [
      "하이난 골프여행은 하이커우를 중심으로 미란CC, 고염전CC, 미션힐스, 삼공리CC 등을 라운딩하는 일정입니다. 미란국제공항호텔·고염전밸리호텔·미션힐스 리조트·풀만호텔 중 상품마다 숙소가 다릅니다.",
      "3박4일부터 7박8일까지 일정이 있고, 지금은 인천 출발 상품을 판매합니다.",
    ],
  },
  {
    slug: "chiangmai",
    regionKey: "치앙마이",
    name: "치앙마이",
    nameEn: "CHIANG MAI",
    country: "태국",
    countryCode: "thailand",
    heroTourId: "thailand-chiangmai-royal-golftel",
    intro: [
      "치앙마이 골프여행은 숙소 방식이 다양합니다. 골프장 안 골프텔(로얄 치앙마이·가싼 파노라마·메조)에 숙박하며 매일 같은 코스를 라운딩하는 일정, 시내 호텔에 숙박하며 여러 골프장을 라운딩하는 일정, 독채 풀빌라에 묵는 일정이 있습니다.",
      "부산(김해) 출발 상품이 많고, 인천 출발 상품도 있습니다.",
    ],
  },
];
