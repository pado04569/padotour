"use client";

import Link from "next/link";
import { IconFlag, IconStar, IconMegaphone, IconQuote, IconChat, IconShieldCheck } from "./icons/MenuIcons";
import Image from "next/image";
import { useState } from "react";
import TrustBar, { useSwitchHref } from "./TrustBar";
import ExternalVerificationButton from "./ExternalVerificationModal";
import { IconChevron, IconSwap } from "./icons/Chevron";
import type { NavRegions } from "@/lib/navRegions";

type HeaderProps = {
  departure?: "incheon" | "busan";
  navRegions: NavRegions;
};

type NavItem = {
  label: string;
  href: string;
  sub?: { label: string; href: string }[];
};

// 나라별 지역 칸은 상품 데이터에서 자동으로 만든다(lib/navRegions.ts, 사장님 지시 2026-10-13).
// 출발지를 고른 화면이면 그 출발지 상품이 있는 지역만, 고르지 않았으면 전체.
const COUNTRIES: { code: string; label: string }[] = [
  { code: "japan", label: "일본" },
  { code: "china", label: "중국" },
  { code: "thailand", label: "태국" },
  { code: "vietnam", label: "베트남" },
  { code: "malaysia", label: "말레이시아" },
  { code: "philippines", label: "필리핀" },
  { code: "other", label: "기타" },
];

function buildNav(regions: NavRegions, dep?: "incheon" | "busan"): NavItem[] {
  const q = dep ? `&departure=${dep}` : "";
  const p = dep ? `?departure=${dep}` : "";
  return COUNTRIES.map((c) => {
    const sub = (regions[c.code] ?? [])
      .filter((r) => (dep ? r[dep] > 0 : true))
      .map((r) => ({ label: r.label, href: `/tours?country=${c.code}&region=${encodeURIComponent(r.region)}${q}` }));
    // 지역이 하나도 없으면 빈 펼침 상자가 뜨지 않게 sub 를 두지 않는다
    return { label: c.label, href: c.code === "other" ? `/tours${p}` : `/tours?country=${c.code}${q}`, sub: sub.length > 0 ? sub : undefined };
  });
}


export default function Header({ departure, navRegions }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = buildNav(navRegions, departure);
  const switchHref = useSwitchHref(departure);
  const p = departure ? `?departure=${departure}` : "";

  const accentColor = "bg-white";
  const hoverAccent = "hover:bg-gray-100";

  const homeHref =
    departure === "incheon" ? "/incheon" :
    departure === "busan" ? "/busan" :
    "/";

  // 검색어 없이 돋보기를 누르면 예전엔 아무 일도 없었다 — 클래리티 "반응 없는 클릭"(상품 목록 2회, 2026-09-15).
  // 이제 입력칸으로 커서를 옮기고 안내 문구를 보여준다.
  const [searchHint, setSearchHint] = useState(false);

  // 검색은 보통 양식 이동(GET /tours?search=…)으로 한다 — router.push 는 휴대폰 크기 시험에서 가끔 멈췄다
  // (10/21, 11회 중 2회, 멈춘 화면은 계속 멈춤). 스크립트가 늦게 떠도 이동한다. 빈 검색만 여기서 막는다.
  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    if (!searchQuery.trim()) {
      e.preventDefault();
      const input = e.currentTarget.querySelector("input");
      input?.focus();
      setSearchHint(true);
      return;
    }
    setSearchHint(false);
    const input = e.currentTarget.elements.namedItem("search") as HTMLInputElement | null;
    if (input) input.value = searchQuery.trim();
  }

  return (
    <>
    {/* 신뢰 영역(왜 여행의 파도·등록·보증·출발지·내 예약/문의) — 붙어 다니지 않고 스크롤하면 올라간다 (UX 개편 2026-10-09) */}
    <TrustBar departure={departure} />
    <header className="bg-white shadow-md sticky top-0 z-50">

      {/* ══ 2단: 로고 + 검색창 + SGI ══ */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-2 md:py-3 flex items-center gap-2 md:gap-4">

          <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0 md:w-[340px]">
            <Image src="/images/logo.png" alt="여행의 파도" width={44} height={44} className="rounded-full md:w-[52px] md:h-[52px]" />
            <div className="hidden sm:block">
              <div className="text-base md:text-lg font-black text-gray-800 leading-tight">여행의 파도</div>
              <div className="text-[11px] text-gray-500">골프전문여행사</div>
            </div>
          </Link>

          {/* PC는 검색창을 5% 줄여 로고 쪽에 여유 — 오른쪽 끝은 위 '내 예약/문의'와 맞춘다 (사장님 선택 2026-10-09) */}
          <div className="flex-1 min-w-0">
            <form action="/tours" method="get" onSubmit={handleSearch} className="md:w-[95%] md:ml-auto flex items-center border-2 border-gray-200 focus-within:border-emerald-500 rounded-lg overflow-hidden transition-colors">
              {departure && <input type="hidden" name="departure" value={departure} />}
              <input
                type="text"
                name="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (searchHint) setSearchHint(false); }}
                onBlur={() => setSearchHint(false)}
                placeholder={searchHint ? "검색어를 입력해 주세요 (예: 후쿠오카, 치앙마이)" : "여행지·골프장 검색"}
                aria-invalid={searchHint || undefined}
                className="flex-1 px-3 min-h-11 md:px-4 text-[15px] placeholder:text-gray-500 outline-none bg-white min-w-0"
              />
              <button type="submit" aria-label="검색" className="w-11 min-h-11 md:w-12 flex items-center justify-center bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors border-l border-gray-200 flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* SGI·등록정보 확인은 맨 위 신뢰 영역 한 곳에만 둔다 — 로고 옆 배지는 중복이라 뺐다 (사장님 지적 2026-10-09) */}

          <div className="md:hidden flex items-center flex-shrink-0">
            <button onClick={() => setMenuOpen(!menuOpen)} className="min-w-11 h-11 -mr-1 px-1 flex items-center justify-center gap-1 text-gray-700" aria-label="메뉴">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
              <span className="text-sm font-semibold">메뉴</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══ 3단: 국가 네비 (데스크톱) ══ */}
      <div className={`${accentColor} border-b border-gray-200 hidden md:block`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center justify-evenly">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`block text-gray-700 hover:text-black ${hoverAccent} font-semibold px-4 py-3 text-base transition-colors whitespace-nowrap`}
                  >
                    {item.label}
                  </Link>
                  {item.sub && openDropdown === item.label && (
                    <div className="absolute left-0 top-full w-40 bg-white shadow-xl rounded-b-lg overflow-hidden border border-gray-100 z-50">
                      {item.sub.map((s) => (
                        <Link
                          key={s.label}
                          href={s.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-50 last:border-0"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* 골프장 소개는 상품 찾는 메뉴와 섞이지 않게 이 줄에서 뺐다 → 메인 "나라별 골프장 소개" 섹션·커뮤니티 메뉴로 (사장님 확정 2026-10-09) */}
            </div>

            <div className="w-px h-6 bg-gray-200 mx-2" />

            <div
              className="relative"
              onMouseEnter={() => setCommunityOpen(true)}
              onMouseLeave={() => setCommunityOpen(false)}
            >
              <button className={`flex items-center justify-center gap-1 text-gray-700 hover:text-black ${hoverAccent} font-semibold w-[118px] py-3 text-base transition-colors whitespace-nowrap`}>
                커뮤니티
                <IconChevron dir="down" className="w-4 h-4 text-gray-500" />
              </button>
              {communityOpen && (
                <div className="absolute right-0 top-full w-36 bg-white shadow-xl rounded-b-lg overflow-hidden border border-gray-100 z-50">
                  <Link href="/courses" className="flex items-center gap-2 px-4 py-3 text-sm text-body-text hover:bg-page-bg transition-colors border-b border-gray-100">
                    <span className="text-brand-blue"><IconFlag /></span>골프장 소개
                  </Link>
                  <Link href="/reviews" className="flex items-center gap-2 px-4 py-3 text-sm text-body-text hover:bg-page-bg transition-colors border-b border-gray-100">
                    <span className="text-brand-blue"><IconStar /></span>여행후기
                  </Link>
                  <Link href={`/notice${p}`} className="flex items-center gap-2 px-4 py-3 text-sm text-body-text hover:bg-page-bg transition-colors border-b border-gray-100">
                    <span className="text-brand-blue"><IconMegaphone /></span>공지/이벤트
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 px-4 py-3 text-sm text-body-text hover:bg-page-bg transition-colors">
                    <span className="text-brand-blue"><IconQuote /></span>대표자의 말
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 모바일 드롭다운 ══ */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg max-h-[75vh] overflow-y-auto">
          {/* 출발지 변경 — 어디로 바뀌는지 바로 보이게 (UX 개편 2026-10-09) */}
          <div className="flex gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100">
            <Link
              href={switchHref}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {departure ? <IconSwap className="w-4 h-4" /> : null}
              {departure === "incheon" ? "부산 출발 보기" : departure === "busan" ? "인천 출발 보기" : "출발공항 선택하기"}
            </Link>
            <Link
              href="/my-inquiries"
              className="flex items-center justify-center min-h-11 px-4 rounded-lg bg-[#FAE100] border border-[#F0D600] text-gray-900 font-bold text-sm"
              onClick={() => setMenuOpen(false)}
            >
              내 예약/문의
            </Link>
          </div>
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-gray-800 font-semibold text-sm text-left"
                onClick={() => setOpenMobileSub(openMobileSub === item.label ? null : item.label)}
              >
                <span>{item.label}</span>
                <IconChevron dir={openMobileSub === item.label ? "up" : "down"} className="w-4 h-4 text-gray-400" />
              </button>
              {openMobileSub === item.label && item.sub && (
                <div className="bg-gray-50 border-t border-gray-100">
                  {item.sub.map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      className="block px-8 py-2.5 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 border-b border-gray-100 last:border-0"
                      onClick={() => setMenuOpen(false)}
                    >
                      · {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* 상품 메뉴(나라)와 콘텐츠 메뉴 사이 구분 */}
          <div className="h-2 bg-gray-50 border-b border-gray-100" aria-hidden="true" />
          {/* 휴대폰 메뉴 순서: 공지/이벤트 → 여행후기 → 골프장 소개 → 대표자의 말 → 카카오톡 → 등록·보증 (사장님 지시 10/10) */}
          <div className="border-b border-gray-100">
            <Link href={`/notice${p}`} className="flex items-center gap-2.5 px-4 py-3.5 text-body-text font-medium text-sm hover:bg-page-bg" onClick={() => setMenuOpen(false)}>
              <span className="text-brand-blue"><IconMegaphone /></span>공지/이벤트
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/reviews" className="flex items-center gap-2.5 px-4 py-3.5 text-body-text font-medium text-sm hover:bg-page-bg" onClick={() => setMenuOpen(false)}>
              <span className="text-brand-blue"><IconStar /></span>여행후기
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/courses" className="flex items-center gap-2.5 px-4 py-3.5 text-body-text font-medium text-sm hover:bg-page-bg" onClick={() => setMenuOpen(false)}>
              <span className="text-brand-blue"><IconFlag /></span>골프장 소개
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/about" className="flex items-center gap-2.5 px-4 py-3.5 text-body-text font-medium text-sm hover:bg-page-bg" onClick={() => setMenuOpen(false)}>
              <span className="text-brand-blue"><IconQuote /></span>대표자의 말
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <a href="https://pf.kakao.com/_bxoxnXxj/chat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-3.5 text-main-text font-bold text-sm hover:bg-page-bg" onClick={() => setMenuOpen(false)}>
              <span className="w-6 h-6 -m-0.5 rounded-md bg-kakao-yellow text-main-text flex items-center justify-center"><IconChat className="w-4 h-4" /></span>카카오톡 상담
            </a>
          </div>
          <ExternalVerificationButton className="w-full px-4 py-3 min-h-11 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 transition-colors text-left">
            <span className="text-brand-blue"><IconShieldCheck /></span>
            <span className="text-sm text-brand-blue font-semibold">여행사 등록·보증 정보 확인 (SGI 서울보증보험 가입)</span>
          </ExternalVerificationButton>
        </div>
      )}
    </header>
    </>
  );
}
