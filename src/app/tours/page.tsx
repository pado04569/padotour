"use client";

import { Suspense } from "react";
import Link from "next/link";
import TourCard from "@/components/TourCard";
import { tours, countries } from "@/data/tours";
import { useSearchParams } from "next/navigation";
import { IconChevron } from "@/components/icons/Chevron";
import RegionNavigator, { type RegionOption } from "@/components/RegionNavigator";

function ToursContent() {
  const searchParams = useSearchParams();
  // 국가는 주소(country=)로만 정한다 — 국가 버튼을 누르면 주소가 바뀌어 휴대폰 "뒤로"가 이전 국가로 돌아간다 (2026-10-10)
  const selected = searchParams.get("country") || "all";
  const regionParam = searchParams.get("region") || "";
  const departureParam = searchParams.get("departure") || "";


  // 뒤로가기 3단계 (소 → 중 → 대)
  //   소: 상품 상세      → "← 태국 상품 목록으로"   (tours/[id]/page.tsx)
  //   중: 나라별 목록    → "← 전체 상품 목록으로"
  //   대: 전체 목록      → "← 메인 화면으로"
  // 출발지: 주소 → 없으면 마지막으로 고른 출발지(ClientLayout 과 같은 저장값). 이 화면은 브라우저에서만 그려진다
  const savedDeparture = (() => {
    if (departureParam === "incheon" || departureParam === "busan") return departureParam;
    try {
      const v = typeof window !== "undefined" ? localStorage.getItem("padotour_departure") : null;
      return v === "incheon" || v === "busan" ? v : "";
    } catch {
      return "";
    }
  })();
  const homeHref =
    savedDeparture === "incheon" ? "/incheon" : savedDeparture === "busan" ? "/busan" : "/";

  // 나라 또는 지역으로 걸러진 상태인가
  const isFiltered = selected !== "all" || regionParam !== "";

  // 전체 목록으로 — 필터 상태(state)와 주소(URL)를 함께 되돌린다
  // 국가 목록 주소 — 출발지(주소 또는 마지막 선택)를 계속 붙여 국가를 여러 번 바꿔도 출발지가 유지된다
  function allHref(code: string) {
    const q = new URLSearchParams();
    if (code !== "all") q.set("country", code);
    if (savedDeparture) q.set("departure", savedDeparture);
    return q.size ? `/tours?${q.toString()}` : "/tours";
  }

  const filtered = (() => {
    let result = selected === "all" ? tours : tours.filter((t) => t.countryCode === selected);
    if (regionParam) {
      result = result.filter((t) => t.region && t.region.includes(regionParam));
    }
    if (departureParam) {
      result = result.filter((t) => t.departure === departureParam || t.departure === "both");
    }
    return result;
  })();

  // 국가를 고르면 그 국가 상품의 실제 지역으로 버튼을 만든다 ("방콕/파타야"는 방콕·파타야로 나눔) — N3 지역 선택
  const regionOptions: RegionOption[] = (() => {
    if (selected === "all") return [];
    const count = new Map<string, number>();
    for (const t of tours) {
      if (t.countryCode !== selected || !t.region) continue;
      if (departureParam && t.departure !== departureParam && t.departure !== "both") continue;
      for (const r of t.region.split("/").map((x) => x.trim()).filter(Boolean)) count.set(r, (count.get(r) ?? 0) + 1);
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([label, c]) => ({ label, count: c }));
  })();

  return (
    <div>
      {/* 헤더 */}
      {regionParam ? (
        <section className="bg-emerald-600 text-white py-2">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-white font-bold text-base md:text-lg">{regionParam === "괌" ? "괌/사이판" : regionParam} 골프여행 패키지</p>
          </div>
        </section>
      ) : (
        <section className="bg-emerald-400 text-white py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">⛳ 골프여행 상품</h1>
            <p className="text-emerald-100 text-sm md:text-lg">일본·중국·동남아 골프여행 전문 패키지</p>
          </div>
        </section>
      )}

      {/* 국가 탭 — region이 선택된 경우 숨김 */}
      {!regionParam && (
        <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-2.5 md:py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {countries.map((c) => (
                // 버튼(router.push) 대신 링크 — 휴대폰 폭에서 router.push 가 멈추는 경우가 있어 링크로 이동한다 (2026-10-10 시험에서 발견)
                <Link
                  key={c.code}
                  href={allHref(c.code)}
                  scroll={false}
                  aria-current={selected === c.code ? "page" : undefined}
                  className={`flex-shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-full font-medium text-sm md:text-base transition-colors ${
                    selected === c.code
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 상품 그리드 */}
      <section className={`max-w-6xl mx-auto px-4 ${regionParam && filtered.length === 1 ? "pt-1 pb-3" : "py-8 md:py-10"}`}>
        {regionOptions.length > 1 && (
          <div className={regionParam ? "pt-4" : ""}>
            <RegionNavigator
              key={`${selected}-${regionParam}`}
              countryCode={selected}
              regions={regionOptions}
              selected={regionParam || undefined}
              departure={departureParam || undefined}
              initialOpen={searchParams.get("map") === "1"}
            />
          </div>
        )}
        {/* 전체 목록 → 고른 출발공항 메인으로 (사장님 확정 N4, 2026-10-10). 브라우저 뒤로가기가 아니라 출발지 기준 주소로 이동 */}
        {!isFiltered && savedDeparture && (
          <Link
            href={homeHref}
            className="-mt-2 mb-1 inline-flex items-center gap-1 min-h-11 text-emerald-700 hover:text-emerald-800 font-semibold text-[15px]"
          >
            <IconChevron dir="left" className="w-4 h-4" />
            {savedDeparture === "incheon" ? "인천출발 홈" : "부산출발 홈"}
          </Link>
        )}
        <p className={`text-gray-500 text-sm md:text-base ${regionParam && filtered.length === 1 ? "mb-1" : "mb-4 md:mb-6"}`}>
          총 <span className="font-bold text-emerald-700">{filtered.length}개</span> 상품
        </p>
        {filtered.length > 0 ? (
          regionParam && filtered.length <= 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
              {filtered.map((tour) => (
                <div key={tour.id} className={filtered.length === 1 ? "sm:col-span-2" : ""}>
                  <TourCard tour={tour} featured={filtered.length === 1} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 md:py-20 text-gray-400">
            <div className="text-5xl md:text-6xl mb-4">⛳</div>
            <p className="text-lg md:text-xl">준비 중인 상품입니다.</p>
            <p className="mt-2 text-sm md:text-base">카카오톡으로 문의해 주세요!</p>
          </div>
        )}

        {/* 뒤로가기 — 걸러진 목록이면 전체 목록으로(중→대), 전체 목록이면 메인으로(대→홈) */}
        <div className="text-center mt-8 md:mt-10">
          {isFiltered ? (
            <Link
              href={allHref("all")}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-[15px] min-h-11"
            >
              <IconChevron dir="left" className="w-4 h-4" />전체 상품 목록으로
            </Link>
          ) : (
            <Link
              href={homeHref}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-[15px] min-h-11"
            >
              <IconChevron dir="left" className="w-4 h-4" />메인 화면으로
            </Link>
          )}
        </div>
      </section>

      {/* 문의 안내 */}
      <section className="bg-emerald-50 py-2.5 md:py-3">
        <div className="max-w-3xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
          <p className="text-gray-700 font-bold text-sm md:text-base">
            원하는 상품이 없나요? 지역·날짜·인원을 알려주시면 맞춤 견적을 바로 드립니다.
          </p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap"
          >
            💬 카카오톡 맞춤 견적 문의
          </a>
        </div>
      </section>
    </div>
  );
}

export default function ToursPage() {
  return (
    <Suspense>
      <ToursContent />
    </Suspense>
  );
}
