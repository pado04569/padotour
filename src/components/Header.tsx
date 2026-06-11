"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  departure?: "incheon" | "busan";
};

const countryNavIncheon = [
  { label: "일본", href: "/tours?country=japan&departure=incheon" },
  { label: "중국", href: "/tours?country=china&departure=incheon" },
  { label: "태국", href: "/tours?country=thailand&departure=incheon" },
  { label: "동남아", href: "/tours?country=malaysia&departure=incheon" },
  { label: "미주", href: "/tours?country=america&departure=incheon" },
  { label: "맞춤골프", href: "/tours?departure=incheon" },
];

const countryNavBusan = [
  { label: "일본", href: "/tours?country=japan&departure=busan" },
  { label: "중국", href: "/tours?country=china&departure=busan" },
  { label: "태국", href: "/tours?country=thailand&departure=busan" },
  { label: "동남아", href: "/tours?country=malaysia&departure=busan" },
  { label: "미주", href: "/tours?country=america&departure=busan" },
  { label: "맞춤골프", href: "/tours?departure=busan" },
];

const countryNavDefault = [
  { label: "일본", href: "/tours?country=japan" },
  { label: "중국", href: "/tours?country=china" },
  { label: "태국", href: "/tours?country=thailand" },
  { label: "동남아", href: "/tours?country=malaysia" },
  { label: "미주", href: "/tours?country=america" },
  { label: "맞춤골프", href: "/tours" },
];

export default function Header({ departure }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const navItems =
    departure === "incheon" ? countryNavIncheon :
    departure === "busan" ? countryNavBusan :
    countryNavDefault;

  const accentColor =
    departure === "incheon" ? "bg-emerald-600" :
    departure === "busan" ? "bg-blue-600" :
    "bg-gray-800";

  const homeHref =
    departure === "incheon" ? "/incheon" :
    departure === "busan" ? "/busan" :
    "/";

  const depParam = departure ? `?departure=${departure}` : "";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const dep = departure ? `&departure=${departure}` : "";
    router.push(`/tours?search=${encodeURIComponent(searchQuery.trim())}${dep}`);
    setSearchOpen(false);
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">

      {/* ══ 1단: 공지바 ══ */}
      <div className="bg-gray-800 text-gray-300 text-xs">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <span className="flex-shrink-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              NOTICE
            </span>
            <span className="truncate text-[11px] md:text-xs">
              🔔 여행의 파도 골프전문 여행사 · 서울보증보험 가입 여행사
            </span>
          </div>
          <div className="hidden md:flex flex-shrink-0 items-center gap-3">
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-0.5 rounded transition-colors"
            >
              예약확인
            </a>
          </div>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden flex-shrink-0 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded"
          >
            예약확인
          </a>
        </div>
      </div>

      {/* ══ 2단: 로고(좌) + 검색창(중앙) + SGI(우) ══ */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-4">

          {/* 로고 — 일본+중국 열 너비만큼 고정폭으로 검색창 시작점을 태국 위치로 맞춤 */}
          <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0 md:w-[340px]">
            <Image src="/images/logo.png" alt="여행의 파도" width={44} height={44} className="rounded-full md:w-[52px] md:h-[52px]" />
            <div className="hidden sm:block">
              <div className="text-base md:text-lg font-black text-gray-800 leading-tight">여행의 파도</div>
              <div className="text-[11px] text-gray-500">골프전문여행사</div>
            </div>
          </Link>

          {/* 검색창 — 모바일/데스크톱 모두 항상 표시 */}
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex items-center border-2 border-gray-200 focus-within:border-emerald-500 rounded-lg overflow-hidden transition-colors">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="여행지, 골프장, 국가명으로 검색"
                className="flex-1 px-3 py-2 md:px-4 md:py-2.5 text-sm outline-none bg-white min-w-0"
              />
              <button type="submit" className="px-3 py-2 md:px-4 md:py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors border-l border-gray-200 flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>



          {/* SGI 배지 — 검색창 바로 오른쪽 */}
          <div className="hidden lg:flex flex-shrink-0 w-[118px] justify-center items-center gap-2 border border-blue-200 bg-blue-50 rounded-lg px-2 py-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">S</div>
            <div className="text-xs leading-tight">
              <div className="font-bold text-blue-800 whitespace-nowrap">SGI 서울보증보험</div>
              <div className="text-blue-600">가입여행사</div>
            </div>
          </div>

          {/* 모바일 햄버거 */}
          <div className="md:hidden flex items-center flex-shrink-0">
            <button onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} className="p-2 text-gray-700" aria-label="메뉴">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ══ 3단: 국가 네비 (데스크톱) — 균등 배치 ══ */}
      <div className={`${accentColor} hidden md:block`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* 국가 메뉴 — 균등 분배 */}
            <div className="flex flex-1 items-center justify-evenly">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white/85 hover:text-white hover:bg-white/20 font-semibold px-4 py-3 text-sm transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* 구분선 */}
            <div className="w-px h-6 bg-white/20 mx-2" />

            {/* 커뮤니티 드롭다운 */}
            <div
              className="relative"
              onMouseEnter={() => setCommunityOpen(true)}
              onMouseLeave={() => setCommunityOpen(false)}
            >
              <button className="flex items-center justify-center gap-1 text-white/85 hover:text-white hover:bg-white/20 font-semibold w-[118px] py-3 text-sm transition-colors whitespace-nowrap">
                커뮤니티
                <svg className="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {communityOpen && (
                <div className="absolute right-0 top-full w-36 bg-white shadow-xl rounded-b-lg overflow-hidden border border-gray-100 z-50">
                  <Link
                    href="/reviews"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100"
                  >
                    ⭐ 여행후기
                  </Link>
                  <Link
                    href="/notice"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    📢 공지/이벤트
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 모바일 검색바 (돋보기 누르면 헤더 아래 펼쳐짐) ══ */}
      {searchOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2.5">
          <form onSubmit={handleSearch} className="flex items-center border-2 border-emerald-500 rounded-lg overflow-hidden">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="여행지, 골프장, 국가명으로 검색"
              className="flex-1 px-3 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="px-4 py-2.5 bg-emerald-500 text-white flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ══ 모바일 드롭다운 ══ */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col">
            <Link href="/reviews" className="px-4 py-3.5 text-gray-700 font-medium text-sm border-b border-gray-100 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              ⭐ 여행후기
            </Link>
            <Link href="/notice" className="px-4 py-3.5 text-gray-700 font-medium text-sm border-b border-gray-100 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              📢 공지/이벤트
            </Link>
            <a href="https://pf.kakao.com/_bxoxnXxj/chat" target="_blank" rel="noopener noreferrer" className="px-4 py-3.5 text-yellow-700 font-bold text-sm flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              💬 카카오톡 상담
            </a>
          </div>
          <div className="px-4 py-3 bg-blue-50 border-t border-blue-100 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">S</div>
            <span className="text-xs text-blue-700 font-semibold">SGI 서울보증보험 가입여행사</span>
          </div>
        </div>
      )}
    </header>
  );
}
