"use client";

import { Suspense } from "react";
import Link from "next/link";
import TourCard from "@/components/TourCard";
import { tours, countries } from "@/data/tours";
import { useSearchParams } from "next/navigation";
import { IconChevron } from "@/components/icons/Chevron";
import { IconFlag, IconChat } from "@/components/icons/MenuIcons";
import RegionNavigator, { type RegionOption } from "@/components/RegionNavigator";
import DepartureSearch, { type SearchPatch } from "@/components/DepartureSearch";
import type { Tour } from "@/data/tours";
import { datesWithin, pickBalanced, dateLabel, departureMap, isIsoDate, localIso, minPeopleOf, sortTours, tourFacts, type SortKey } from "@/lib/tourSearch";
import { parseQuery, matchesKeywords } from "@/lib/queryParser";

function ToursContent() {
  const searchParams = useSearchParams();
  const today = localIso();
  // 머리말 검색창 글(search=) — "11월5일 일본 2명"을 날짜·나라·지역·인원·낱말로 풀어 아래 조건에 채운다 (작업지시서 13-E, 2026-10-11)
  // 주소에 직접 들어온 조건(country= 등)이 있으면 그쪽이 먼저다.
  const searchQ = (searchParams.get("search") || "").trim();
  const parsed = searchQ ? parseQuery(searchQ, today, tours) : null;
  // 국가는 주소(country=)로만 정한다 — 국가 버튼을 누르면 주소가 바뀌어 휴대폰 "뒤로"가 이전 국가로 돌아간다 (2026-10-10)
  const selected = searchParams.get("country") || parsed?.country || "all";
  const regionParam = searchParams.get("region") || parsed?.region || "";
  // 검색 글에 출발공항이 있으면 그쪽이 먼저 ("부산출발 일본" — 인천 화면에서 검색해도 부산출발 상품을 찾는다)
  const departureParam = parsed?.departure || searchParams.get("departure") || "";
  // 출발일로 상품 찾기 (6단계) — date=2026-11-05&people=2&sort=date. 기존 country·region·departure·map 과 겹치지 않는 이름
  const dateParam = isIsoDate(searchParams.get("date")) ? searchParams.get("date")! : parsed?.date ?? "";
  const peopleRaw = searchParams.get("people") ? Number(searchParams.get("people")) : parsed?.people ?? NaN;
  const hasPeople = Number.isInteger(peopleRaw) && peopleRaw >= 1 && peopleRaw <= 20;
  const people = hasPeople ? peopleRaw : 2;
  const sortRaw = searchParams.get("sort");
  const sort: SortKey = sortRaw === "date" || sortRaw === "price" ? sortRaw : "recommend";
  // 검색 글에서 나온 "11월" 같은 달, 상품명·골프장에서 찾을 낱말
  const monthParam = !dateParam ? parsed?.month ?? "" : "";
  const keywords = parsed?.keywords ?? [];
  const searching = Boolean(dateParam) || hasPeople || Boolean(searchQ);


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

  // 목록 주소 만들기 — 출발지(주소 또는 마지막 선택)와 검색 조건(출발일·인원·정렬)을 계속 붙인다.
  // 국가를 바꾸면 지역·지도는 비운다. 국가 탭과 검색창의 여행지가 같은 country= 하나를 쓰므로 항상 일치한다.
  function hrefWith(p: SearchPatch & { region?: string }) {
    const country = p.country ?? selected;
    const sameCountry = country === selected;
    const q = new URLSearchParams();
    if (country !== "all") q.set("country", country);
    const region = p.region ?? (sameCountry ? regionParam : "");
    if (region) q.set("region", region);
    if (savedDeparture) q.set("departure", savedDeparture);
    const date = p.date ?? dateParam;
    if (date) q.set("date", date);
    const ppl = p.people ?? (hasPeople ? people : undefined);
    if (ppl) q.set("people", String(ppl));
    const s = p.sort ?? sort;
    if (s !== "recommend") q.set("sort", s);
    if (sameCountry && p.region === undefined && searchParams.get("map") === "1") q.set("map", "1");
    // 정렬만 바꿀 때는 검색 글(달·낱말)을 그대로 둔다. 조건을 직접 바꾸면 그 조건이 새 기준이 된다
    const onlySort = p.country === undefined && p.date === undefined && p.people === undefined && p.region === undefined;
    if (searchQ && onlySort) q.set("search", searchQ);
    return q.size ? `/tours?${q.toString()}` : "/tours";
  }
  // 국가 탭 — 검색 조건은 그대로 두고 국가만 바꾼다
  const allHref = (code: string) => hrefWith({ country: code });

  // 출발공항으로 거른 전체 — 검색창 달력(출발 가능 날짜)·결과 수 계산에도 같은 범위를 쓴다
  const pool = departureParam ? tours.filter((t) => t.departure === departureParam || t.departure === "both") : tours;
  const listed = (() => {
    let result = selected === "all" ? pool : pool.filter((t) => t.countryCode === selected);
    if (regionParam) {
      result = result.filter((t) => t.region && t.region.includes(regionParam));
    }
    // "12월 치앙마이"처럼 달만 말하면 그 달에 실제 출발일이 있는 상품만
    if (monthParam) result = result.filter((t) => [...departureMap(t).keys()].some((d) => d >= today && d.startsWith(monthParam)));
    if (keywords.length) result = result.filter((t) => matchesKeywords(t, keywords));
    return result;
  })();
  // 검색 글에 인원이 없으면 인원으로 거르지 않는다(멋대로 2명으로 정하지 않는다)
  const peopleUnset = Boolean(searchQ) && !hasPeople;
  const fitsPeople = (t: Tour) => {
    if (peopleUnset) return true;
    const min = minPeopleOf(t);
    return min === null || min <= people;
  };
  // 검색 결과: 그 날짜에 실제 출발일이 있는 상품만. 인원이 모자란 상품은 따로 묶는다(섞지 않음)
  const onDate = dateParam ? listed.filter((t) => departureMap(t).has(dateParam)) : listed;
  const filtered = sortTours(searching ? onDate.filter(fitsPeople) : listed, sort, today, dateParam || undefined);
  const needMore = searching ? sortTours(onDate.filter((t) => !fitsPeople(t)), sort, today, dateParam || undefined) : [];
  // 정확한 날짜가 없을 때: 전후 7일 안의 실제 출발일만 (더 먼 날짜는 보여주지 않는다 — 사장님 지시 10/10)
  const NEAR_DAYS = 7;
  // 검색은 ±7일 전체, 화면에는 전후 균형 맞춰 최대 4개(2열×2행) — 항공 출발 패턴을 한눈에 (사장님 지시 10/10)
  const nearby = dateParam && filtered.length === 0 ? pickBalanced(datesWithin(listed.filter(fitsPeople), dateParam, today, NEAR_DAYS), 4) : [];
  const countryName = countries.find((c) => c.code === selected)?.label ?? "전체";
  const monthText = monthParam ? `${+monthParam.slice(5)}월 출발` : "";
  const placeText = regionParam ? (regionParam === "괌" ? "괌/사이판" : regionParam) : selected === "all" ? "전체 여행지" : countryName;
  const depName = savedDeparture === "incheon" ? "인천출발" : savedDeparture === "busan" ? "부산출발" : "";
  const card = (tour: Tour) => {
    const price = dateParam ? departureMap(tour).get(dateParam) : undefined;
    return (
      <TourCard
        key={tour.id}
        tour={tour}
        facts={tourFacts(tour)}
        datePrice={price ? { label: `${dateLabel(dateParam, "short")} 출발 · 1인`, price } : undefined}
      />
    );
  };

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

  const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6";
  const conditionText = [monthText, regionParam ? placeText : countryName, depName, peopleUnset ? "" : `${people}명 기준`].filter(Boolean).join(" · ");
  // 맞춤 견적 카드에 보여줄 검색 조건: 날짜 · 여행지(지역을 골랐으면 지역) · 인원
  const searchCondition = [
    dateParam ? dateLabel(dateParam, "plain") : monthText,
    placeText,
    peopleUnset ? "" : `${people}명`,
  ].filter(Boolean).join(" · ");
  // 검색 결과 — ① 조건에 맞는 상품 ② (없으면) 가까운 출발일 ③ 인원이 더 필요한 상품. 서로 섞지 않는다
  function renderResults() {
    return (
      <div className="break-keep">
        {/* 검색창 글로 들어왔으면 무엇을 알아들었는지 먼저 보여준다 */}
        {parsed && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-white border-[1.5px] border-line">
            <p className="text-[15px] text-body-text">
              <span className="font-bold text-main-text">&lsquo;{searchQ}&rsquo;</span> 검색
            </p>
            {parsed.understood.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-sm text-slate-500 self-center mr-0.5">이렇게 찾았어요</span>
                {parsed.understood.map((u) => (
                  <span key={u} className="inline-flex items-center h-8 px-3 rounded-full bg-emerald-50 text-emerald-800 text-sm font-bold">{u}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-1">알아들은 조건이 없어 전체 상품에서 찾았어요.</p>
            )}
            {parsed.notes.map((n) => <p key={n} className="text-sm text-amber-800 mt-1.5">{n}</p>)}
          </div>
        )}
        {filtered.length > 0 ? (
          <>
            <div className="px-4 py-3.5 rounded-2xl bg-emerald-50 border-[1.5px] border-emerald-200 mb-4">
              <p className="text-[17px] md:text-lg font-black text-emerald-800">
                {dateParam ? `${dateLabel(dateParam)} 정확히 출발 가능한 상품 ${filtered.length}개` : monthText ? `${monthText} 가능한 상품 ${filtered.length}개` : `조건에 맞는 상품 ${filtered.length}개`}
              </p>
              <p className="text-sm text-body-text mt-0.5">{conditionText}</p>
              {dateParam && <p className="text-sm text-body-text">카드의 요금은 {dateLabel(dateParam, "plain")} 출발 1인 요금입니다.</p>}
            </div>
            <div className={grid}>{filtered.map(card)}</div>
          </>
        ) : (
          <>
            <div className="px-4 py-3.5 rounded-2xl bg-slate-50 border-[1.5px] border-slate-200">
              <p className="text-[17px] md:text-lg font-black text-slate-900">
                {dateParam ? `${dateLabel(dateParam, "plain")}에 정확히 출발 가능한 상품이 없습니다.` : "조건에 맞는 상품이 없습니다."}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">{conditionText}</p>
            </div>
            {dateParam && (nearby.length > 0 ? (
              <div className="mt-5">
                <h2 className="text-lg font-black text-slate-900">가까운 출발일 상품</h2>
                <p className="text-sm text-slate-600 mt-0.5 mb-2.5">
                  선택하신 날짜 전후 7일 안의 실제 출발일이에요. 날짜를 누르면 그 날짜 상품만 보여드려요
                </p>
                {/* 가까운 순(같은 거리면 이후 날짜 먼저) — 버튼 글자는 datesWithin 의 diff·count 그대로 */}
                <div className="grid grid-cols-2 gap-2 md:max-w-xl">
                  {nearby.map((d) => (
                    <Link
                      key={d.date}
                      href={hrefWith({ date: d.date })}
                      scroll={false}
                      className="flex flex-col justify-center min-h-14 px-3.5 py-2 rounded-xl border-[1.5px] border-emerald-500 bg-white hover:bg-emerald-50"
                    >
                      <span className="text-[16px] font-extrabold text-emerald-800">{dateLabel(d.date)}</span>
                      <span className="text-[13px] font-semibold text-slate-500">
                        {Math.abs(d.diff)}일 {d.diff > 0 ? "후" : "전"} · 상품 {d.count}개
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null)}
            {/* 날짜가 맞지 않아 떠나실 고객을 상담으로 잇는 보조 영역.
                전후 7일에도 없으면 안내와 카카오 상담을 한 카드로 합친다(노란 상자 2개 연속 금지 — 사장님 지시 10/10) */}
            {/* 가운데 정렬, 버튼은 글자 너비 그대로 가운데(mx-auto) — 사장님 지시 10/10 */}
            <div className={`${dateParam && nearby.length === 0 ? "mt-5" : "mt-4"} px-4 py-4 rounded-2xl bg-yellow-50 text-center`}>
              {dateParam && nearby.length === 0 && (
                <p className="text-[16px] font-extrabold text-slate-900 mb-2">
                  선택하신 날짜 전후 7일에는{" "}
                  <br />
                  출발 가능한 상품이 없습니다.
                </p>
              )}
              <p className="text-[15px] font-semibold text-slate-700">
                원하시는 날짜가 꼭 필요하시면{" "}
                <br />
                담당자가 확인 후 안내해 드릴게요.
              </p>
              <a
                href="https://pf.kakao.com/_bxoxnXxj/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 mx-auto flex w-fit items-center min-h-11 px-4 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-[15px] font-bold"
              >
                <span className="inline-flex items-center gap-1.5"><IconChat className="w-[18px] h-[18px]" />카카오톡 맞춤 견적 문의</span>
              </a>
            </div>
          </>
        )}

        {needMore.length > 0 && (
          <div className="mt-8">
            <div className="px-4 py-3.5 rounded-2xl bg-amber-50 border-[1.5px] border-amber-200 mb-4">
              <p className="text-[17px] md:text-lg font-black text-slate-900">
                인원이 더 필요한 상품 {needMore.length}개{dateParam ? ` (${dateLabel(dateParam, "plain")} 출발)` : ""}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">최소 출발 인원이 {people}명보다 많은 상품이에요. 조인·추가요금 가능 여부는 상담으로 확인해 드려요.</p>
            </div>
            <div className={grid}>{needMore.map(card)}</div>
          </div>
        )}

        {/* 검색 결과가 있을 때 맨 아래 맞춤 견적 — 고객이 넣은 조건을 그대로 보여준다 (사장님 지시 10/10)
            카카오 채널 채팅 링크는 글을 미리 채워 보낼 수 없어 화면 표시까지만. 링크는 기존 그대로 */}
        {filtered.length > 0 && (
          <div className="mt-8 px-4 py-4 rounded-2xl bg-yellow-50 text-center">
            <p className="text-[16px] font-extrabold text-slate-900 mb-1.5">찾으시는 상품이 없나요?</p>
            <p className="text-[15px] text-slate-700">
              <strong className="font-extrabold text-slate-900">{searchCondition}</strong> 조건을{" "}
              <br className="md:hidden" />
              카카오톡으로 남겨주시면{" "}
              <br />
              담당자가 확인 후 안내해 드릴게요.
            </p>
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 mx-auto flex w-fit items-center min-h-11 px-4 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-[15px] font-bold"
            >
              <span className="inline-flex items-center gap-1.5"><IconChat className="w-[18px] h-[18px]" />카카오톡 맞춤 견적 문의</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      {regionParam ? (
        <section className="bg-hero-commerce text-white py-2">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-white font-bold text-base md:text-lg">{regionParam === "괌" ? "괌/사이판" : regionParam} 골프여행 패키지</p>
          </div>
        </section>
      ) : (
        <section className="bg-hero-commerce text-white py-7 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            {/* 이모지 대신 흰 선 깃발 — 제목보다 튀지 않게 살짝 작고 흐리게 (사장님 지시 10/11) */}
            <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2 flex items-center gap-2 md:gap-3"><IconFlag className="w-6 h-6 md:w-8 md:h-8 text-white/90" />골프여행 상품</h1>
            <p className="text-white/[0.82] text-sm md:text-lg">일본·중국·동남아 골프여행 전문 패키지</p>
          </div>
        </section>
      )}

      {/* 출발일로 상품 찾기 — 검색 전엔 상세 검색, 검색 후엔 한 줄 바 + 정렬 (사장님 확정 2026-10-10) */}
      <DepartureSearch
        key={`${selected}|${dateParam}|${people}`}
        pool={pool}
        country={selected}
        date={dateParam}
        people={people}
        sort={sort}
        active={searching}
        hrefWith={hrefWith}
        periodLabel={monthText || undefined}
        peopleLabel={peopleUnset ? "인원 전체" : undefined}
        placeLabel={regionParam ? placeText : undefined}
      />

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
      <section className={`max-w-6xl mx-auto px-4 ${regionParam && filtered.length === 1 && !searching ? "pt-1 pb-3" : searching ? "pt-5 pb-8 md:pt-7 md:pb-10" : "py-8 md:py-10"}`}>
        {regionOptions.length > 1 && (
          <div className={regionParam ? "pt-4" : ""}>
            <RegionNavigator
              key={`${selected}-${regionParam}`}
              countryCode={selected}
              regions={regionOptions}
              selected={regionParam || undefined}
              departure={departureParam || undefined}
              keepQuery={{ date: dateParam, people: hasPeople ? String(people) : "", sort: sort === "recommend" ? "" : sort }}
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
        {searching ? (
          renderResults()
        ) : (
          <>
            <p className={`text-gray-500 text-sm md:text-base ${regionParam && filtered.length === 1 ? "mb-1" : "mb-4 md:mb-6"}`}>
              총 <span className="font-bold text-emerald-700">{filtered.length}개</span> 상품
            </p>
            {filtered.length > 0 ? (
              regionParam && filtered.length <= 2 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                  {filtered.map((tour) => (
                    <div key={tour.id} className={filtered.length === 1 ? "sm:col-span-2" : ""}>
                      <TourCard tour={tour} featured={filtered.length === 1} facts={filtered.length === 1 ? undefined : tourFacts(tour)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">{filtered.map(card)}</div>
              )
            ) : (
              <div className="text-center py-16 md:py-20 text-gray-400">
                <div className="flex justify-center mb-4 text-gray-300"><IconFlag className="w-12 h-12 md:w-14 md:h-14" /></div>
                <p className="text-lg md:text-xl">준비 중인 상품입니다.</p>
                <p className="mt-2 text-sm md:text-base">카카오톡으로 문의해 주세요!</p>
              </div>
            )}
          </>
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

      {/* 문의 안내 — 날짜로 검색 중이면 결과 아래 크림색 카드가 맞춤 견적을 맡으므로 중복이라 뺀다.
          검색하지 않은 일반 목록에서만 기존 문구 그대로 (사장님 지시 10/10) */}
      {!searching && (
      <section className="bg-emerald-50 py-2.5 md:py-3">
        <div className="max-w-3xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
          <p className="text-gray-700 font-bold text-sm md:text-base">
            {/* 응답 시간을 약속하는 말("바로")은 쓰지 않는다 (사장님 지시 10/11) */}
            <span className="block md:inline">원하는 상품이 없나요?</span>{" "}
            지역·날짜·인원을 알려주시면 <span className="whitespace-nowrap">확인 후 견적을 전달드립니다.</span>
          </p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-1.5"><IconChat className="w-[18px] h-[18px]" />카카오톡 맞춤 견적 문의</span>
          </a>
        </div>
      </section>
      )}
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
