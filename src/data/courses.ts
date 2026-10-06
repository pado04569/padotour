import coursesData from "./courses.json";
import toursData from "./tours.json";

export type CourseSpec = {
  label: string;
  value: string;
};

export type Course = {
  slug: string;
  name: string;
  /** 영문·현지 표기 (SEO 및 부제 노출용) */
  nameEn?: string;
  region: string;
  country: string;
  countryCode: string;
  /** 목록 카드·메타 설명에 쓰는 한 줄 요약 */
  summary?: string;
  /** 홀 수·파·전장·설계자 등 코스 스펙 */
  specs?: CourseSpec[];
  description: string;
  images: string[];
  /** 검색 유입용 해시태그 (# 없이 저장) */
  hashtags?: string[];
  relatedTourIds: string[];
  /** 상품 글에 다른 이름으로 적히는 경우 (예: "오리엔트 샤먼CC") — 자동 연결에 같이 쓴다 */
  aliases?: string[];
};

/** 띄어쓰기·점·괄호를 지워 "아마카세 CC"와 "아마카세CC"를 같은 이름으로 본다 */
const norm = (s?: string) => (s ?? "").replace(/[\s.·()\-]/g, "").toLowerCase();

type TourText = { id: string; golfCourse?: string; golfCourseDesc?: string; title?: string };
const tourTexts = (toursData as TourText[]).map((t) => ({
  id: t.id,
  text: [t.golfCourse, t.golfCourseDesc, t.title].map(norm).join("|"),
}));

/**
 * 골프장 소개에 붙는 상품 = 손으로 적은 relatedTourIds + 골프장 이름이 들어간 상품 전부.
 * 출발지(인천·부산)를 가리지 않으므로 골프장 소개는 인천·부산이 같은 페이지를 쓰고,
 * 상품을 새로 올리면 같은 이름의 골프장 소개에 자동으로 붙는다. (사장님 확정 2026-10-06)
 */
export const courses: Course[] = (coursesData as Course[]).map((c) => {
  const keys = [c.name, ...(c.aliases ?? [])].map(norm).filter((k) => k.length >= 3);
  const auto = tourTexts.filter((t) => keys.some((k) => t.text.includes(k))).map((t) => t.id);
  return { ...c, relatedTourIds: [...new Set([...c.relatedTourIds, ...auto])] };
});
