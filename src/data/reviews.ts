import reviewsData from "./reviews.json";
import noticesData from "./notices.json";

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

export type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
  isEvent: boolean;
};

export const reviews: Review[] = reviewsData as Review[];
export const notices: Notice[] = noticesData as Notice[];
