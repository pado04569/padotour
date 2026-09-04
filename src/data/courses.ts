import coursesData from "./courses.json";

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
};

export const courses: Course[] = coursesData as Course[];
