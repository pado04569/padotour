import Link from "next/link";
import Image from "next/image";
import { courses } from "@/data/courses";
import type { Metadata } from "next";

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
function groupByCountry() {
  const map = new Map<string, typeof courses>();
  for (const course of courses) {
    const list = map.get(course.country) ?? [];
    list.push(course);
    map.set(course.country, list);
  }
  return [...map.entries()];
}

export default function CoursesPage() {
  const grouped = groupByCountry();

  return (
    <div>
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">해외 골프장 소개</h1>
          <p className="text-emerald-100 text-sm md:text-lg">
            여행의 파도가 안내하는 나라별 골프장 — 홀 구성·전장·설계자까지 확인하고 상품으로 바로 이동하세요.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {grouped.map(([country, list]) => (
          <div key={country} className="mb-10 md:mb-14 last:mb-0">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-1">{country} 골프장</h2>
            <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">
              {[...new Set(list.map((c) => c.region))].join(" · ")} · 총 {list.length}곳
            </p>

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
