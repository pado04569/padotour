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
  departurePrices?: { date: string; price: number }[];
  price: string;
  image: string;
  images?: string[];
  hotelImages?: string[];
  courseImages?: string[];
  badge?: string;
  departure: "incheon" | "busan" | "both";
};

export const tours: Tour[] = toursData as Tour[];

export const countries = [
  { code: "all", label: "전체" },
  { code: "japan", label: "일본" },
  { code: "china", label: "중국" },
  { code: "thailand", label: "태국" },
  { code: "vietnam", label: "베트남" },
  { code: "malaysia", label: "말레이시아" },
  { code: "philippines", label: "필리핀" },
];
