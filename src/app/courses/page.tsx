import type { Metadata } from "next";
import { courses } from "@/data/courses";
import { buildCourseGroups, courseHoles } from "@/lib/courseGroups";
import CourseMapExplorer from "@/components/CourseMapExplorer";

const SITE_URL = "https://www.padotour.com";

export const metadata: Metadata = {
  title: "해외 골프장 소개 | 일본·태국·중국·괌·사이판 골프여행 - 여행의 파도",
  description:
    "여행의파도가 직접 보내는 해외 골프장 소개입니다. 일본(니세코CC·케도인CC·벳부골프클럽), 태국(가산CC·메조CC), 중국 청도(영해CC·화산CC), 괌·사이판·코타키나발루 코스별 홀 구성과 전장, 설계자, 포함 상품을 확인하세요.",
  keywords: [
    "해외골프장", "해외골프여행", "일본골프여행", "태국골프여행", "중국골프여행",
    "괌골프여행", "사이판골프여행", "골프패키지", "골프장소개",
  ],
  alternates: { canonical: `${SITE_URL}/courses` },
};

// 목록·지도는 한 탐색 구조를 같이 쓴다 — 제목·경로·국가/지역 선택창 공통, 보기 방식만 전환 (사장님 지시 2026-10-25)
export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; region?: string; view?: string }>;
}) {
  const { country, region, view } = await searchParams;

  // country 는 "guam,saipan" 처럼 여러 나라일 수 있다 (나라별 묶음 '괌·사이판'·'기타')
  const codes = country ? country.split(",") : [];
  const groups = buildCourseGroups();
  const currentGroup = codes.length ? groups.find((g) => codes.every((c) => g.codes.includes(c))) : undefined;

  const explorerGroups = groups.map((g) => ({
    key: g.key,
    label: g.label,
    count: g.count,
    image: g.image,
    regions: g.regions.map((r) => {
      const rc = courses.filter((c) => g.codes.includes(c.countryCode) && (c.region === r.value || c.region.split("/").map((t) => t.trim()).includes(r.value)));
      return { value: r.value, label: r.label, count: rc.length, image: rc[0]?.images[0] ?? g.image };
    }),
  }));
  const explorerCourses = courses.map((c) => ({ slug: c.slug, name: c.name, region: c.region, countryCode: c.countryCode, country: c.country, holes: courseHoles(c), image: c.images[0], summary: c.summary ?? "" }));

  return (
    <div>
      <section className="bg-hero-info text-white py-5 md:py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">해외 골프장 소개</h1>
          <p className="text-emerald-50 text-sm md:text-base">국가와 지역을 골라 목록이나 지도로 둘러보세요.</p>
        </div>
      </section>
      <CourseMapExplorer
        mode={view === "map" ? "map" : "list"}
        groups={explorerGroups}
        courses={explorerCourses}
        initialG={currentGroup?.key ?? null}
        initialR={region ?? null}
      />
    </div>
  );
}
