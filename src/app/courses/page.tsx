import Link from "next/link";
import Image from "next/image";
import { courses } from "@/data/courses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "골프장 소개 | 여행의 파도",
  description: "여행의파도가 안내하는 해외 골프장 소개 - 니세코CC, 가람부나이CC, 벳부골프클럽 등 코스별 상세 정보를 확인하세요.",
};

export default function CoursesPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">⛳ 골프장 소개</h1>
          <p className="text-emerald-100 text-sm md:text-lg">여행의 파도가 안내하는 해외 명문 골프장</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.map((course) => (
            <Link key={course.slug} href={`/courses/${course.slug}`} className="block group">
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                <div className="relative h-48 bg-emerald-100 overflow-hidden">
                  <Image
                    src={course.images[0]}
                    alt={course.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-emerald-700 text-white text-sm font-medium px-3 py-1 rounded-full z-10">
                    {course.country}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{course.name}</h3>
                  <p className="text-gray-400 text-xs">{course.region}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
