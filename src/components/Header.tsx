"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  departure?: "incheon" | "busan";
};

type NavItem = {
  label: string;
  href: string;
  sub?: { label: string; href: string }[];
};

function buildNav(dep?: string): NavItem[] {
  const q = dep ? `&departure=${dep}` : "";
  const p = dep ? `?departure=${dep}` : "";
  return [
    {
      label: "일본",
      href: `/tours?country=japan${q}`,
      sub: [
        { label: "후쿠오카", href: `/tours?country=japan&region=fukuoka${q}` },
        { label: "마쓰야마", href: `/tours?country=japan&region=matsuyama${q}` },
        { label: "다카마쓰", href: `/tours?country=japan&region=takamatsu${q}` },
        { label: "북해도", href: `/tours?country=japan&region=hokkaido${q}` },
        { label: "도쿄/이바라키", href: `/tours?country=japan&region=tokyo${q}` },
      ],
    },
    {
      label: "중국",
      href: `/tours?country=china${q}`,
      sub: [
        { label: "연태/위해", href: `/tours?country=china&region=yantai${q}` },
        { label: "청도(칭다오)", href: `/tours?country=china&region=qingdao${q}` },
        { label: "하이난(해남도)", href: `/tours?country=china&region=hainan${q}` },
        { label: "하문(셔먼)", href: `/tours?country=china&region=xiamen${q}` },
        { label: "광저우/심천", href: `/tours?country=china&region=guangzhou${q}` },
      ],
    },
    {
      label: "태국",
      href: `/tours?country=thailand${q}`,
      sub: [
        { label: "방콕/파타야", href: `/tours?country=thailand&region=bangkok${q}` },
        { label: "카오야이", href: `/tours?country=thailand&region=khaoyai${q}` },
        { label: "치앙마이", href: `/tours?country=thailand&region=chiangmai${q}` },
      ],
    },
    {
      label: "베트남",
      href: `/tours?country=vietnam${q}`,
      sub: [
        { label: "하노이/하이퐁", href: `/tours?country=vietnam&region=hanoi${q}` },
        { label: "다낭", href: `/tours?country=vietnam&region=danang${q}` },
        { label: "나트랑/달랏", href: `/tours?country=vietnam&region=nhatrang${q}` },
        { label: "푸꾸옥", href: `/tours?country=vietnam&region=phuquoc${q}` },
      ],
    },
    {
      label: "말레이시아",
      href: `/tours?country=malaysia${q}`,
      sub: [
        { label: "코타키나발루", href: `/tours?country=malaysia&region=kk${q}` },
        { label: "쿠알라룸푸르", href: `/tours?country=malaysia&region=kl${q}` },
      ],
    },
    {
      label: "필리핀",
      href: `/tours?country=philippines${q}`,
      sub: [
        { label: "클락", href: `/tours?country=philippines&region=clark${q}` },
        { label: "세부", href: `/tours?country=philippines&region=cebu${q}` },
        { label: "마닐라", href: `/tours?country=philippines&region=manila${q}` },
      ],
    },
    {
      label: "기타",
      href: `/tours${p}`,
      sub: [
        { label: "괌/사이판", href: `/tours?country=other&region=guam${q}` },
        { label: "대만", href: `/tours?country=other&region=taiwan${q}` },
        { label: "라오스", href: `/tours?country=other&region=laos${q}` },
      ],
    },
  ];
}

export default function Header({ departure }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const navItems = buildNav(departure);

  const accentColor =
    departure === "incheon" ? "bg-emerald-600" :
    departure === "busan" ? "bg-blue-600" :
    "bg-gray-800";

  const hoverAccent =
    departure === "busan" ? "hover:bg-blue-700" : "hover:bg-emerald-700";

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
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-0.5 rounded transition-colors"
          >
            예약확인
          </a>
        </div>
      </div>

      {/* ══ 2단: 로고 + 검색창 + SGI ══ */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-4">

          <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0 md:w-[340px]">
            <Image src="/images/logo.png" alt="여행의 파도" width={44} height={44} className="rounded-full md:w-[52px] md:h-[52px]" />
            <div className="hidden sm:block">
              <div className="text-base md:text-lg font-black text-gray-800 leading-tight">여행의 파도</div>
              <div className="text-[11px] text-gray-500">골프전문여행사</div>
            </div>
          </Link>

          <div className="flex-1 min-w-0">
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

          <div className="hidden lg:flex flex-shrink-0 w-[118px] justify-center items-center gap-2 border border-blue-200 bg-blue-50 rounded-lg px-2 py-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">S</div>
            <div className="text-xs leading-tight">
              <div className="font-bold text-blue-800 whitespace-nowrap">SGI 서울보증보험</div>
              <div className="text-blue-600">가입여행사</div>
            </div>
          </div>

          <div className="md:hidden flex items-center flex-shrink-0">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-700" aria-label="메뉴">
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

      {/* ══ 3단: 국가 네비 (데스크톱) ══ */}
      <div className={`${accentColor} hidden md:block`}>
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
                    className={`block text-white/85 hover:text-white ${hoverAccent} font-semibold px-4 py-3 text-sm transition-colors whitespace-nowrap`}
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
            </div>

            <div className="w-px h-6 bg-white/20 mx-2" />

            <div
              className="relative"
              onMouseEnter={() => setCommunityOpen(true)}
              onMouseLeave={() => setCommunityOpen(false)}
            >
              <button className={`flex items-center justify-center gap-1 text-white/85 hover:text-white ${hoverAccent} font-semibold w-[118px] py-3 text-sm transition-colors whitespace-nowrap`}>
                커뮤니티
                <svg className="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {communityOpen && (
                <div className="absolute right-0 top-full w-36 bg-white shadow-xl rounded-b-lg overflow-hidden border border-gray-100 z-50">
                  <Link href="/reviews" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100">
                    ⭐ 여행후기
                  </Link>
                  <Link href="/notice" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    📢 공지/이벤트
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
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-gray-800 font-semibold text-sm text-left"
                onClick={() => setOpenMobileSub(openMobileSub === item.label ? null : item.label)}
              >
                <span>{item.label}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${openMobileSub === item.label ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
          <div className="border-b border-gray-100">
            <Link href="/reviews" className="flex items-center gap-2 px-4 py-3.5 text-gray-700 font-medium text-sm" onClick={() => setMenuOpen(false)}>
              ⭐ 여행후기
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/notice" className="flex items-center gap-2 px-4 py-3.5 text-gray-700 font-medium text-sm" onClick={() => setMenuOpen(false)}>
              📢 공지/이벤트
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <a href="https://pf.kakao.com/_bxoxnXxj/chat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3.5 text-yellow-700 font-bold text-sm" onClick={() => setMenuOpen(false)}>
              💬 카카오톡 상담
            </a>
          </div>
          <div className="px-4 py-3 bg-blue-50 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">S</div>
            <span className="text-xs text-blue-700 font-semibold">SGI 서울보증보험 가입여행사</span>
          </div>
        </div>
      )}
    </header>
  );
}
