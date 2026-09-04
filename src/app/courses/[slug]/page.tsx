import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { courses } from "@/data/courses";
import { tours } from "@/data/tours";
import TourCard from "@/components/TourCard";

const SITE_URL = "https://www.padotour.com";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return {};

  const title = `${course.country} ${course.region} ${course.name} 골프장 소개 | 여행의 파도`;
  const description =
    `${course.country} ${course.region}에 있는 ${course.name} 코스 소개입니다. ` +
    (course.summary ?? course.description.slice(0, 80)) +
    ` ${course.name}가 포함된 골프여행 패키지도 함께 확인하세요.`;

  return {
    title,
    description,
    keywords: course.hashtags,
    alternates: { canonical: `${SITE_URL}/courses/${course.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/courses/${course.slug}`,
      images: course.images.length > 0 ? [{ url: course.images[0] }] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const relatedTours = tours.filter((t) => course.relatedTourIds.includes(t.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    name: course.name,
    alternateName: course.nameEn,
    description: course.summary ?? course.description.split("\n\n")[0],
    url: `${SITE_URL}/courses/${course.slug}`,
    image: course.images.map((src) => `${SITE_URL}${src}`),
    address: {
      "@type": "PostalAddress",
      addressCountry: course.country,
      addressLocality: course.region,
    },
    keywords: course.hashtags?.join(", "),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "골프장 소개", item: `${SITE_URL}/courses` },
      { "@type": "ListItem", position: 3, name: course.name, item: `${SITE_URL}/courses/${course.slug}` },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <nav aria-label="breadcrumb" className="text-emerald-100 text-xs md:text-sm mb-2">
            <Link href="/" className="hover:text-white">홈</Link>
            <span className="mx-1.5">›</span>
            <Link href="/courses" className="hover:text-white">골프장 소개</Link>
            <span className="mx-1.5">›</span>
            <span className="text-white">{course.name}</span>
          </nav>
          <p className="text-emerald-100 text-sm mb-1">
            {course.country} · {course.region} 골프장 소개
          </p>
          <h1 className="text-2xl md:text-4xl font-black">{course.name}</h1>
          {course.nameEn && <p className="text-emerald-100 text-sm md:text-base mt-1.5">{course.nameEn}</p>}
          {course.summary && (
            <p className="text-white/95 text-sm md:text-lg mt-3 max-w-3xl leading-relaxed">{course.summary}</p>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
          {course.images.map((src, i) => (
            <div key={i} className={`relative aspect-square rounded-xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
              <Image src={src} alt={`${course.country} ${course.region} ${course.name} 코스 사진 ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        {course.specs && course.specs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-5 md:p-8 border border-gray-100 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4">{course.name} 코스 정보</h2>
            <dl className="divide-y divide-gray-100">
              {course.specs.map((spec) => (
                <div key={spec.label} className="py-2.5 md:py-3 flex flex-col sm:flex-row sm:gap-4">
                  <dt className="w-full sm:w-40 shrink-0 text-sm font-bold text-emerald-700">{spec.label}</dt>
                  <dd className="text-sm md:text-base text-gray-700 leading-relaxed">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100 mb-10 md:mb-12">
          <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4">
            {course.country} {course.region} {course.name} 코스 소개
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">{course.description}</p>

          {course.hashtags && course.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-gray-100">
              {course.hashtags.map((tag) => (
                <span key={tag} className="text-xs md:text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
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
