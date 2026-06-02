export type Review = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
};

export const reviews: Review[] = [
  {
    id: "1",
    name: "김○○ 님",
    country: "일본 후쿠오카",
    countryCode: "japan",
    rating: 5,
    comment: "처음 골프여행이었는데 사장님이 처음부터 끝까지 꼼꼼하게 챙겨주셔서 너무 편하게 다녀왔어요. 코스도 너무 좋았고 다음엔 홋카이도 가고 싶어요!",
    date: "2025.10",
  },
  {
    id: "2",
    name: "박○○ 님",
    country: "태국 방콕",
    countryCode: "thailand",
    rating: 5,
    comment: "4박5일에 4라운드인데 가격이 합리적이에요. 코스 상태도 좋고 캐디들도 친절했습니다. 여행의 파도는 믿을 수 있는 여행사예요.",
    date: "2025.09",
  },
  {
    id: "3",
    name: "이○○ 님",
    country: "코타키나발루",
    countryCode: "malaysia",
    rating: 5,
    comment: "석양 보면서 치는 골프가 이런 거구나 싶었어요. 친구 4명이서 갔는데 모두 만족했고 내년에 또 예약하려고요.",
    date: "2025.08",
  },
  {
    id: "4",
    name: "최○○ 님",
    country: "일본 마쓰야마",
    countryCode: "japan",
    rating: 5,
    comment: "도고온천에서 피로를 풀고 다음날 라운딩하는 일정이 최고였습니다. 사장님이 직접 코스 추천도 해주시고 정말 전문가십니다.",
    date: "2025.07",
  },
];

export const notices = [
  {
    id: "1",
    title: "🏌️ 2025 하반기 일본 골프여행 얼리버드 특가",
    content: "후쿠오카·홋카이도 3박4일 특가 진행 중. 선착순 마감.",
    date: "2025.06.01",
    isEvent: true,
  },
  {
    id: "2",
    title: "태국 방콕 골프여행 신규 코스 추가",
    content: "세계 100대 코스 포함 신규 일정 업데이트. 문의 환영.",
    date: "2025.05.20",
    isEvent: false,
  },
  {
    id: "3",
    title: "🎉 코타키나발루 3박5일 특별 프로모션",
    content: "6~8월 출발 한정 특가. 2인 이상 예약 시 추가 혜택.",
    date: "2025.05.10",
    isEvent: true,
  },
];
