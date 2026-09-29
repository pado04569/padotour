import reviewsData from "./reviews.json";
import noticesData from "./notices.json";

export type Review = {
  id: string;
  title: string;
  name: string;
  country: string;
  countryCode: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
  images?: string[];
  kakaoImage?: string;
  hashtags?: string[];
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
  isEvent: boolean;
  expiresAt?: string; // 이 날짜(YYYY-MM-DD)가 지나면 공지·이벤트 목록에서 자동으로 내려간다
  tourId?: string; // 연결된 상품 id — 있으면 공지 카드도 상품카드와 동일하게 사진+클릭 가능하게 렌더링
};

export const reviews: Review[] = reviewsData as Review[];
export const notices: Notice[] = noticesData as Notice[];
