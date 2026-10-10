import Link from "next/link";
import { buildCourseGroups } from "@/lib/courseGroups";
import { IconChevron } from "@/components/icons/Chevron";

// 메인(인천·부산) "나라별 골프장 소개" — 사진 중심 나라 타일 (사장님 선택 G1 티저형, 2026-10-09)
// 골프장 이름만 나열하면 고객이 모른다 → 나라 이름·곳 수·대표 지역을 먼저 보여주고, 자세한 탐색은 /courses(G3)에서.
export default function CountryCourseTiles() {
  const groups = buildCourseGroups();
  return (
    <section className="max-w-6xl mx-auto px-4 pb-10 md:pb-14">
      <h2 className="text-xl md:text-2xl font-black text-gray-800 pb-2 border-b-2 border-emerald-500 inline-block">
        국가별 골프장 소개
      </h2>
      <p className="text-gray-600 text-[15px] md:text-base mt-2.5 mb-5 break-keep">
        여행 전 실제 라운딩할 골프장을 국가별로 미리 확인해 보세요.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {groups.map((g) => (
          <Link
            key={g.key}
            href={g.href}
            className="group relative block aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-emerald-100"
          >
            <img
              src={g.image}
              alt={`${g.label} 골프장`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* 글자가 사진에 묻히지 않게 아래쪽을 진하게 (Codex 검수: 대비 4.5:1 이상) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% via-black/45 to-black/80" />
            <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-white break-keep">
              <div className="text-[22px] md:text-2xl font-black leading-tight">{g.label}</div>
              <div className="flex items-center gap-0.5 text-[15px] md:text-base font-bold mt-0.5">
                골프장 {g.count}곳
                <IconChevron className="w-4 h-4" />
              </div>
              <div className="text-sm md:text-[15px] text-white/90 mt-1 leading-snug line-clamp-2">
                <span className="md:hidden">
                  {g.regions.slice(0, 2).map((r) => r.label).join(" · ")}
                  {g.regions.length > 2 ? " 외" : ""}
                </span>
                <span className="hidden md:inline">
                  {g.regions.slice(0, 3).map((r) => r.label).join(" · ")}
                  {g.regions.length > 3 ? " 외" : ""}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/courses"
          className="inline-flex items-center justify-center gap-1 w-full max-w-[340px] min-h-[52px] px-8 rounded-full border-2 font-bold text-base transition-colors border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        >
          골프장 전체보기
          <IconChevron className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
