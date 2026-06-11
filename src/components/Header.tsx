"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  departure?: "incheon" | "busan";
};

const noticeText = "🔔 여행의 파도 골프여행 전문 여행사 · 서울보증보험 가입 여행사 · 관광사업등록 제 2022-000029 호";

const countryNavIncheon = [
  { label: "🇯🇵 일본", href: "/tours?country=japan&departure=incheon" },
  { label: "🇨🇳 중국", href: "/tours?country=china&departure=incheon" },
  { label: "🇹🇭 태국", href: "/tours?country=thailand&departure=incheon" },
  { label: "🌏 동남아", href: "/tours?country=malaysia&departure=incheon" },
  { label: "⛳ 전체상품", href: "/tours?departure=incheon" },
];

const countryNavBusan = [
  { label: "🇯🇵 일본", href: "/tours?country=japan&departure=busan" },
  { label: "🇨🇳 중국", href: "/tours?country=china&departure=busan" },
  { label: "🇹🇭 태국", href: "/tours?country=thailand&departure=busan" },
  { label: "⛳ 전체상품", href: "/tours?departure=busan" },
];

const countryNavDefault = [
  { label: "🇯🇵 일본", href: "/tours?country=japan" },
  { label: "🇨🇳 중국", href: "/tours?country=china" },
  { label: "🇹🇭 태국", href: "/tours?country=thailand" },
  { label: "🌏 동남아", href: "/tours?country=malaysia" },
  { label: "⛳ 전체상품", href: "/tours" },
];

export default function Header({ departure }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const dep = departure ? `&departure=${departure}` : "";
    router.push(`/tours?search=${encodeURIComponent(searchQuery.trim())}${dep}`);
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* ── 1단: 공지 티커 + 로그인/회원가입/예약확인 ── */}
      <div className="bg-gray-800 text-gray-300 text-xs">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between gap-4">
          {/* 공지 */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex-shrink-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              NOTICE
            </span>
            <span className="truncate">{noticeText}</span>
          </div>
          {/* 우측 링크 */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/admin" className="hover:text-white transition-colors">로그인</Link>
            <span className="text-gray-600">|</span>
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              회원가입
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-0.5 rounded transition-colors"
            >
              예약확인
            </a>
          </div>
        </div>
      </div>

      {/* ── 2단: 로고 + 검색창 + 서울보증보험 ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* 로고 */}
          <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0">
            <Image src="/images/logo.png" alt="여행의 파도" width={52} height={52} className="rounded-full" />
            <div className="hidden sm:block">
              <div className="text-lg font-black text-gray-800 leading-tight">여행의 파도</div>
              <div className="text-[11px] text-gray-500">골프전문 여행사</div>
            </div>
          </Link>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="flex items-center border-2 border-gray-200 focus-within:border-emerald-500 rounded-lg overflow-hidden transition-colors">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="여행지, 골프장, 국가명으로 검색"
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors border-l border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* 서울보증보험 배지 */}
          <div className="hidden md:flex flex-shrink-0 items-center gap-2 border border-blue-200 bg-blue-50 rounded-lg px-3 py-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">S</div>
            <div className="text-xs leading-tight">
              <div className="font-bold text-blue-800">SGI 서울보증보험</div>
              <div className="text-blue-600">가입여행사</div>
            </div>
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 text-gray-700 flex-shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── 3단: 국가별 네비게이션 ── */}
      <div className={`${accentColor} hidden md:block`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white/80 hover:text-white hover:bg-white/20 font-semibold px-5 py-3 text-sm transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex-1" />
            <Link
              href="/reviews"
              className="text-white/80 hover:text-white hover:bg-white/20 font-semibold px-5 py-3 text-sm transition-colors"
            >
              ⭐ 여행후기
            </Link>
            <Link
              href="/notice"
              className="text-white/80 hover:text-white hover:bg-white/20 font-semibold px-5 py-3 text-sm transition-colors"
            >
              📢 공지/이벤트
            </Link>
          </div>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="py-3 text-gray-700 font-medium text-base border-b border-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reviews"
              className="py-3 text-gray-700 font-medium text-base border-b border-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              ⭐ 여행후기
            </Link>
            <Link
              href="/notice"
              className="py-3 text-gray-700 font-medium text-base"
              onClick={() => setMenuOpen(false)}
            >
              📢 공지/이벤트
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
