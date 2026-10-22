import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tours } from "@/data/tours";
import { courses } from "@/data/courses";
import TourCard from "@/components/TourCard";
import { IconChevron } from "@/components/icons/Chevron";
import { IconPhone } from "@/components/icons/MenuIcons";
import { regionGuides } from "@/lib/regionGuides";

// 지역 골프여행 소개 — 마쓰야마 안내(/guide/matsuyama)와 같은 모양, 내용은 상품·골프장 데이터에서 만든다 (SEO/GEO 2026-10-11)
const SITE = "https://www.padotour.com";
const PHONE = "010-5301-5250";
export const dynamicParams = false;

export function generateStaticParams() {
  return regionGuides.map((g) => ({ region: g.slug }));
}

function regionData(slug: string) {
  const g = regionGuides.find((x) => x.slug === slug);
  if (!g) return null;
  const today = new Date().toISOString().slice(0, 10);
  const list = tours.filter((t) => (t.region ?? "").includes(g.regionKey));
  // 출발일이 모두 지난 상품은 뺀다 (출발일 정보가 없는 상품은 남긴다)
  const live = list.filter((t) => {
    const ds = (t.departurePrices ?? []).map((d) => d.date);
    return ds.length === 0 || ds.some((d) => d >= today);
  });
  // 낮은 요금 순 — 요약칸 "○원부터"와 맨 위 상품 요금이 맞게 (하이난 최저가가 8번째에 있었다, 2026-10-22). 요금 없는 상품은 뒤로
  const won = (t: (typeof list)[number]) => Number(String(t.price ?? "").replace(/[^\d]/g, "")) || Infinity;
  const rows = (live.length > 0 ? live : list).slice().sort((a, b) => won(a) - won(b));
  const dates = rows.flatMap((t) => (t.departurePrices ?? []).map((d) => d.date)).filter((d) => d >= today).sort();
  // 요금은 상품 카드에 보이는 대표 요금(price)과 같게 — 달력 요금으로 따로 계산하면 카드(889,000원)와 어긋났다
  const prices = rows.map((t) => Number(String(t.price ?? "").replace(/[^\d]/g, ""))).filter((n) => n > 0);
  const tourIds = new Set(rows.map((t) => t.id));
  const regionCourses = courses.filter((c) => c.region.includes(g.regionKey) || c.relatedTourIds.some((id) => tourIds.has(id)));
  const incheon = rows.filter((t) => t.departure === "incheon" || t.departure === "both");
  const busan = rows.filter((t) => t.departure === "busan" || t.departure === "both");
  const hero = tours.find((t) => t.id === g.heroTourId)?.image ?? rows[0]?.image;
  return { g, rows, dates, low: prices.length ? Math.min(...prices) : undefined, regionCourses, incheon, busan, hero };
}

// 월·일 사이는 NBSP — 375px에서 "3월 / 31일"로 끊겼다
const md = (iso: string) => `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일`;

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const d = regionData(region);
  if (!d) return {};
  const deps = [d.incheon.length && "인천", d.busan.length && "부산"].filter(Boolean).join("·");
  // 검색 결과에서 요금·상품 수가 먼저 보이게 (네이버 '마쓰야마 골프여행' 30일 노출 1,414·클릭 1, 2026-10-21)
  const low = d.low ? ` ${d.low.toLocaleString("ko-KR")}원~` : "";
  const title = `${d.g.name} 골프여행${low} | ${deps} 출발 상품 ${d.rows.length}개·골프장 ${d.regionCourses.length}곳 - 여행의파도`;
  const description = `${deps} 출발 ${d.g.name} 골프여행 ${d.rows.length}개 상품을 한곳에서 비교하세요.${low ? ` 항공 포함${low.replace("~", "")}부터.` : ""} 골프장 ${d.regionCourses.length}곳 소개. ${d.g.intro[0].slice(0, 60)}…`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/guide/${d.g.slug}` },
    openGraph: { title, description, url: `${SITE}/guide/${d.g.slug}`, images: d.hero ? [{ url: d.hero }] : undefined },
  };
}

export default async function RegionGuidePage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const d = regionData(region);
  if (!d) notFound();
  const { g, rows, dates, low, regionCourses, incheon, busan, hero } = d;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE },
      { "@type": "ListItem", position: 2, name: `${g.country} 골프여행`, item: `${SITE}/tours?country=${g.countryCode}` },
      { "@type": "ListItem", position: 3, name: `${g.name} 골프여행`, item: `${SITE}/guide/${g.slug}` },
    ],
  };
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${g.name} 골프여행 상품`,
    itemListElement: rows.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/tours/${t.id}`, name: t.title })),
  };

  const groups = [
    { label: "인천 출발", items: incheon },
    { label: "부산(김해) 출발", items: busan },
  ].filter((x) => x.items.length > 0);

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />

      {/* 히어로 — 마쓰야마 안내와 같은 모양 */}
      <div className="relative">
        {hero && <img src={hero} alt={`${g.name} 골프장 전경`} className="w-full h-64 md:h-96 object-cover" />}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <p className="text-emerald-300 text-sm font-semibold mb-2 tracking-widest">{g.nameEn} GOLF GUIDE</p>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{g.name} 골프여행</h1>
          <p className="text-white/90 text-base md:text-lg">
            {groups.map((x) => x.label).join(" · ")} · 상품 {rows.length}개
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="현재 위치" className="text-sm text-gray-500 mb-8 flex items-center flex-wrap gap-1">
          <Link href="/" className="hover:text-emerald-700">홈</Link>
          <IconChevron className="w-3.5 h-3.5" />
          <Link href={`/tours?country=${g.countryCode}`} className="hover:text-emerald-700">{g.country} 골프여행</Link>
          <IconChevron className="w-3.5 h-3.5" />
          <span className="text-gray-800 font-semibold">{g.name}</span>
        </nav>

        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            {g.name} 골프여행은 어떤가요?
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            {g.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {/* 요약 네 칸은 눌리는 것처럼 보여 배달못한클릭이 잡혔다(/guide/hainan 2회, 2026-10-22) — 누르면 상품 목록으로 내려간다 */}
          <ul className="grid grid-cols-2 gap-3 mt-6 text-sm">
            {[
              { label: "출발 공항", value: groups.map((x) => x.label.replace(" 출발", "")).join(" · "), price: false },
              { label: "판매 중인 출발일", value: dates.length ? `${md(dates[0])} ~ ${md(dates[dates.length - 1])}` : "문의", price: false },
              { label: "상품", value: `${rows.length}개`, price: false },
              { label: "1인 요금", value: low ? `${low.toLocaleString()}원부터` : "문의", price: true },
            ].map((s) => (
              <li key={s.label}>
                <a href="#tour-list" className="block h-full bg-gray-50 hover:bg-emerald-50 rounded-xl p-4 border border-gray-100 transition-colors">
                  <span className="flex items-center justify-between text-gray-500 mb-1">
                    {s.label}
                    <IconChevron dir="down" className="w-4 h-4 text-gray-400" />
                  </span>
                  <span className={`block font-bold ${s.price ? "text-red-600" : "text-gray-800"}`}>{s.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {regionCourses.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
              {g.name} 골프장 {regionCourses.length}곳
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {regionCourses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className="flex gap-3 items-center bg-gray-50 hover:bg-emerald-50 rounded-xl p-3 border border-gray-100 transition-colors">
                    {c.images[0] && <img src={c.images[0]} alt={`${c.name} 코스`} className="w-20 h-16 rounded-lg object-cover flex-none" loading="lazy" />}
                    <span className="min-w-0">
                      <span className="block font-bold text-gray-800">{c.name}</span>
                      {c.summary && <span className="block text-sm text-gray-600 mt-0.5 line-clamp-2">{c.summary}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {groups.map((grp, i) => (
          <section key={grp.label} id={i === 0 ? "tour-list" : undefined} className="mb-14 scroll-mt-20">
            <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
              {grp.label} {g.name} 골프여행
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {grp.items.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </section>
        ))}

        <section className="bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-3xl text-center text-white p-10">
          <h2 className="text-2xl font-black mb-2">{g.name}, 언제 출발하시겠어요?</h2>
          <p className="text-emerald-100 mb-6 text-sm">출발일·인원을 알려주시면 견적을 보내드립니다.</p>
          <a
            href={`tel:${PHONE}`}
            className="inline-block bg-white text-emerald-800 font-black px-8 py-3 rounded-full text-lg hover:bg-emerald-50 transition-colors"
          >
            <span className="inline-flex items-center gap-2"><IconPhone className="w-5 h-5" />{PHONE}</span>
          </a>
          <p className="text-emerald-200 text-xs mt-4">
            <Link href={`/tours?country=${g.countryCode}`} className="inline-flex items-center gap-1 underline">
              다른 {g.country} 골프여행 상품 보기<IconChevron className="w-4 h-4" />
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
