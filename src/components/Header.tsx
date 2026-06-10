"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="여행의 파도" width={52} height={52} className="rounded-full" />
          <div>
            <div className="text-xl font-bold text-blue-700 leading-tight">여행의 파도</div>
            <div className="text-xs text-gray-500">골프여행 전문 여행사</div>
          </div>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/tours" className="text-gray-700 hover:text-emerald-600 font-medium text-lg transition-colors">
            골프여행 상품
          </Link>
          <Link href="/reviews" className="text-gray-700 hover:text-emerald-600 font-medium text-lg transition-colors">
            여행 후기
          </Link>
          <Link href="/notice" className="text-gray-700 hover:text-emerald-600 font-medium text-lg transition-colors">
            공지/이벤트
          </Link>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 flex flex-col gap-1">
          <Link
            href="/tours"
            className="py-3 text-gray-700 font-medium text-lg border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            ⛳ 골프여행 상품
          </Link>
          <Link
            href="/reviews"
            className="py-3 text-gray-700 font-medium text-lg border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            ⭐ 여행 후기
          </Link>
          <Link
            href="/notice"
            className="py-3 text-gray-700 font-medium text-lg border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            📢 공지/이벤트
          </Link>
        </div>
      )}
    </header>
  );
}
