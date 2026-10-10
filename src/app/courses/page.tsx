import Link from "next/link";
import Image from "next/image";
import { courses } from "@/data/courses";
import type { Metadata } from "next";
import { IconChevron } from "@/components/icons/Chevron";
import { buildCourseGroups, matchesRegion } from "@/lib/courseGroups";
import { REGION_MAPS } from "@/lib/regionMaps";
import CourseRegionMap from "@/components/CourseRegionMap";

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

/** 나라 → 지역 순으로 묶어 노출 (국가별 검색 유입 대응) */
function groupByCountry(list: typeof courses) {
  const map = new Map<string, typeof courses>();
  for (const course of list) {
    const arr = map.get(course.country) ?? [];
    arr.push(course);
    map.set(course.country, arr);
  }
  return [...map.entries()];
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; region?: string; map?: string }>;
}) {
  const { country, region, map: mapParam } = await searchParams;

  // country 는 "guam,saipan" 처럼 여러 나라일 수 있다 (나라별 묶음 '괌·사이판'·'기타')
  const codes = country ? country.split(",") : [];
  const filtered = courses.filter((c) => {
    if (codes.length && !codes.includes(c.countryCode)) return false;
    if (region && !matchesRegion(c, region)) return false;
    return true;
  });
  const grouped = groupByCountry(filtered);
  const isFiltered = Boolean(country || region);
  const groups = buildCourseGroups();
  const currentGroup = codes.length ? groups.find((g) => codes.every((c) => g.codes.includes(c))) : undefined;
  const filterLabel = filtered[0]
    ? [currentGroup?.label ?? filtered[0].country, region].filter(Boolean).join(" ")
    : null;
  const regionMap = currentGroup ? REGION_MAPS[currentGroup.key] : undefined;
  const chip = "inline-flex items-center min-h-11 px-3.5 rounded-full text-[15px] font-semibold transition-colors";

  return (
    <div>
      <section className="bg-emerald-400 text-white py-5 md:py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">
            {isFiltered && filterLabel ? `${filterLabel} 골프장` : "해외 골프장 소개"}
          </h1>
          {isFiltered && (
            <Link href="/courses" className="inline-flex items-center gap-1 text-emerald-50 hover:text-white text-sm underline underline-offset-2">
              <IconChevron dir="left" className="w-4 h-4" />전체 골프장 보기
            </Link>
          )}
        </div>
      </section>

      {/* 나라·지역으로 찾기 — 탐색형 (사장님 확정 G3, 2026-10-09). 메인은 나라 타일(G1), 여기서는 지역까지 바로 고른다 */}
      {!isFiltered && (
        <section className="max-w-6xl mx-auto px-4 pt-8 md:pt-10">
          <h2 className="text-lg md:text-xl font-black text-gray-800 mb-1">국가·지역으로 찾기</h2>
          <p className="text-gray-600 text-[15px] mb-4 break-keep">국가를 누르면 그 국가 골프장 전체, 지역을 누르면 그 지역 골프장만 보여드려요.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {groups.map((g) => (
              <div key={g.key} className="flex gap-3 md:gap-4 p-3 border border-gray-200 rounded-2xl bg-white">
                <Link href={g.href} className="relative flex-none w-[92px] h-[92px] md:w-[120px] md:h-[120px] rounded-xl overflow-hidden bg-emerald-100">
                  <img src={g.image} alt={`${g.label} 골프장`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={g.href} className="flex items-baseline justify-between gap-2 group">
                    <span className="text-xl font-black text-gray-900 group-hover:text-emerald-700">{g.label}</span>
                    <span className="inline-flex items-center text-sm font-bold text-emerald-700 whitespace-nowrap">
                      골프장 {g.count}곳<IconChevron className="w-4 h-4" />
                    </span>
                  </Link>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {/* 지역이 많은 나라(일본 16곳)는 8개까지만 — 나머지는 나라 화면의 지역 버튼에서 */}
                    {g.regions.slice(0, 8).map((r) => (
                      <Link
                        key={r.value}
                        href={`${g.href}&region=${encodeURIComponent(r.value)}`}
                        className={`${chip} bg-emerald-50 text-emerald-800 hover:bg-emerald-100`}
                      >
                        {r.label}
                      </Link>
                    ))}
                    {g.regions.length > 8 && (
                      <Link href={g.href} className={`${chip} gap-0.5 text-gray-600 hover:text-emerald-700`}>
                        지역 {g.regions.length - 8}곳 더 보기<IconChevron className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-lg md:text-xl font-black text-gray-800 mt-10 md:mt-12 -mb-2">전체 골프장</h2>
        </section>
      )}

      {/* 나라를 고른 상태 — 그 나라의 지역 버튼으로 바로 좁힌다 */}
      {currentGroup && currentGroup.regions.length > 1 && (
        <nav
          aria-label="지역 선택"
          className={`max-w-6xl mx-auto px-4 pt-6 ${regionMap ? "flex flex-col md:grid md:grid-cols-[minmax(0,440px)_1fr] md:gap-6 md:items-start" : ""}`}
        >
          <div className="flex flex-wrap gap-2 content-start">
            <Link
              href={`${currentGroup.href}${mapParam === "1" ? "&map=1" : ""}`}
              className={`${chip} ${!region ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {currentGroup.label} 전체
            </Link>
            {currentGroup.regions.map((r) => (
              <Link
                key={r.value}
                href={`${currentGroup.href}&region=${encodeURIComponent(r.value)}${mapParam === "1" ? "&map=1" : ""}`}
                aria-current={region === r.value ? "page" : undefined}
                className={`${chip} ${region === r.value ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {r.label}
              </Link>
            ))}
          </div>
          {/* 지역 위치 보조 지도 — PC는 버튼 왼쪽, 휴대폰은 버튼 위에 접힘 */}
          {regionMap && (
            <div className="order-first">
              <CourseRegionMap
                map={regionMap}
                regions={currentGroup.regions.map((r) => r.value)}
                selected={region}
                hrefFor={(r) => `${currentGroup.href}&region=${encodeURIComponent(r)}&map=1`}
                openOnMobile={mapParam === "1"}
              />
            </div>
          )}
        </nav>
      )}

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {grouped.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-12">해당 지역에 등록된 골프장이 아직 없습니다.</p>
        )}
        {grouped.map(([country, list]) => (
          <div key={country} className="mb-10 md:mb-14 last:mb-0">
            <div className="flex flex-wrap items-baseline gap-x-2 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-black text-gray-800">{country}골프장</h2>
              {/* 지역 이름을 길게 늘어놓던 문장은 뺐다 — 지역은 위 버튼·지도로 (사장님 지적 2026-10-09) */}
              <p className="text-gray-500 text-base md:text-lg font-bold">총 {list.length}곳</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {list.map((course) => (
                <Link key={course.slug} href={`/courses/${course.slug}`} className="block group">
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full">
                    <div className="relative h-48 bg-emerald-100 overflow-hidden">
                      <Image
                        src={course.images[0]}
                        alt={`${course.country} ${course.region} ${course.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 right-3 bg-emerald-700 text-white text-sm font-medium px-3 py-1 rounded-full z-10">
                        {course.region}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-800 mb-1">{course.name}</h3>
                      {course.summary && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{course.summary}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
