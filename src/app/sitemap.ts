import { MetadataRoute } from "next";
import { tours } from "@/data/tours";
import { courses } from "@/data/courses";

const BASE_URL = "https://www.padotour.com";

// 빌드(배포) 시각. 배포할 때만 바뀌므로 "매일 전부 수정됨"으로 오해받지 않는다.
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: `${BASE_URL}/`, priority: 1 },
    { url: `${BASE_URL}/incheon`, priority: 0.9 },
    { url: `${BASE_URL}/busan`, priority: 0.9 },
    { url: `${BASE_URL}/tours`, priority: 0.9 },
    { url: `${BASE_URL}/guide/matsuyama`, priority: 0.9 },
    { url: `${BASE_URL}/courses`, priority: 0.8 },
    { url: `${BASE_URL}/reviews`, priority: 0.7 },
    { url: `${BASE_URL}/notice`, priority: 0.5 },
    { url: `${BASE_URL}/about`, priority: 0.5 },
  ].map((page) => ({
    url: page.url,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: page.priority,
  }));

  // 상품은 요금 등록일이 있으면 그 날짜를 쓴다.
  // 매번 오늘 날짜를 주면 "전 페이지가 매일 바뀐다"는 뜻이 되어 크롤러가 신호를 무시한다.
  const tourPages = tours.map((tour) => ({
    url: `${BASE_URL}/tours/${tour.id}`,
    lastModified: tour.priceUpdatedDate ? new Date(tour.priceUpdatedDate) : BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const coursePages = courses.map((course) => ({
    url: `${BASE_URL}/courses/${course.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...tourPages, ...coursePages];
}
