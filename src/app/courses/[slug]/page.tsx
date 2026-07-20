import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { courses } from "@/data/courses";
import { tours } from "@/data/tours";
import TourCard from "@/components/TourCard";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return {};
  return {
    title: `${course.name} 골프여행 | 여행의 파도`,
    description: `${course.name} 코스 소개와 ${course.name}가 포함된 ${course.region} 골프여행 패키지를 확인하세요. ${course.description.slice(0, 60)}...`,
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const relatedTours = tours.filter((t) => course.relatedTourIds.includes(t.id));

  return (
    <div>
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-emerald-100 text-sm mb-1">{course.country} · {course.region}</p>
          <h1 className="text-2xl md:text-4xl font-black">⛳ {course.name}</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
          {course.images.map((src, i) => (
            <div key={i} className={`relative aspect-square rounded-xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
              <Image src={src} alt={`${course.name} 사진 ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100 mb-10 md:mb-12">
          <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4">{course.name} 코스 소개</h2>
          <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">{course.description}</p>
        </div>

        {relatedTours.length > 0 && (
          <div>
            <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 md:mb-6">{course.name} 포함 골프여행 상품</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {relatedTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-10 md:mt-12 bg-emerald-50 rounded-2xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2 md:mb-3">{course.name} 골프여행 문의</h2>
          <p className="text-gray-600 mb-5 md:mb-6 text-sm md:text-base">일정·인원을 알려주시면 맞춤 견적을 바로 드립니다.</p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg transition-colors"
          >
            💬 카카오톡으로 문의하기
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link href="/courses" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            ← 골프장 목록으로
          </Link>
        </div>
      </section>
    </div>
  );
}
