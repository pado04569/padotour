"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TrustBar, { useSwitchHref } from "./TrustBar";
import ExternalVerificationButton from "./ExternalVerificationModal";
import { IconChevron, IconSwap } from "./icons/Chevron";

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
        { label: "후쿠오카", href: `/tours?country=japan&region=후쿠오카${q}` },
        { label: "마쓰야마", href: `/tours?country=japan&region=마쓰야마${q}` },
        { label: "다카마쓰", href: `/tours?country=japan&region=다카마쓰${q}` },
        { label: "북해도", href: `/tours?country=japan&region=북해도${q}` },
        { label: "도쿄/이바라키", href: `/tours?country=japan&region=도쿄${q}` },
        { label: "구마모토", href: `/tours?country=japan&region=구마모토${q}` },
        { label: "나고야", href: `/tours?country=japan&region=나고야${q}` },
        { label: "야마구치", href: `/tours?country=japan&region=야마구치${q}` },
        { label: "가고시마", href: `/tours?country=japan&region=가고시마${q}` },
        { label: "미야자키", href: `/tours?country=japan&region=미야자키${q}` },
        { label: "아오모리", href: `/tours?country=japan&region=아오모리${q}` },
        { label: "오사카", href: `/tours?country=japan&region=오사카${q}` },
        { label: "시즈오카", href: `/tours?country=japan&region=시즈오카${q}` },
        { label: "오키나와", href: `/tours?country=japan&region=오키나와${q}` },
      ],
    },
    {
      label: "중국",
      href: `/tours?country=china${q}`,
      sub: dep === "busan"
        ? [
            { label: "청도", href: `/tours?country=china&region=청도${q}` },
            { label: "연태", href: `/tours?country=china&region=연태${q}` },
            { label: "베이징/천진", href: `/tours?country=china&region=베이징${q}` },
            { label: "샤먼(하문)", href: `/tours?country=china&region=샤먼${q}` },
            { label: "장가계", href: `/tours?country=china&region=장가계${q}` },
          ]
        : [
            { label: "연태", href: `/tours?country=china&region=연태${q}` },
            { label: "위해", href: `/tours?country=china&region=위해${q}` },
            { label: "청도(칭다오)", href: `/tours?country=china&region=청도${q}` },
            { label: "하이난(해남도)", href: `/tours?country=china&region=하이난${q}` },
            { label: "곡부", href: `/tours?country=china&region=곡부${q}` },
          ],
    },
    {
      label: "태국",
      href: `/tours?country=thailand${q}`,
      sub: [
        { label: "방콕/파타야", href: `/tours?country=thailand&region=방콕${q}` },
        { label: "카오야이", href: `/tours?country=thailand&region=카오야이${q}` },
        { label: "치앙마이", href: `/tours?country=thailand&region=치앙마이${q}` },
      ],
    },
    {
      label: "베트남",
      href: `/tours?country=vietnam${q}`,
      sub: [
        { label: "하노이/하이퐁", href: `/tours?country=vietnam&region=하노이${q}` },
        { label: "다낭", href: `/tours?country=vietnam&region=다낭${q}` },
        { label: "나트랑/달랏", href: `/tours?country=vietnam&region=나트랑${q}` },
        { label: "푸꾸옥", href: `/tours?country=vietnam&region=푸꾸옥${q}` },
      ],
    },
    {
      label: "말레이시아",
      href: `/tours?country=malaysia${q}`,
      sub: [
        { label: "코타키나발루", href: `/tours?country=malaysia&region=코타키나발루${q}` },
        { label: "쿠알라룸푸르", href: `/tours?country=malaysia&region=쿠알라룸푸르${q}` },
      ],
    },
    {
      label: "필리핀",
      href: `/tours?country=philippines${q}`,
      sub: [
        { label: "클락", href: `/tours?country=philippines&region=클락${q}` },
        { label: "세부", href: `/tours?country=philippines&region=세부${q}` },
        { label: "마닐라", href: `/tours?country=philippines&region=마닐라${q}` },
      ],
    },
    {
      label: "기타",
      href: `/tours${p}`,
      sub: [
        { label: "괌/사이판", href: `/tours?country=other&region=괌${q}` },
        { label: "대만", href: `/tours?country=other&region=대만${q}` },
        { label: "라오스", href: `/tours?country=other&region=라오스${q}` },
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      const input = (e.currentTarget as HTMLFormElement).querySelector("input");
      input?.focus();
      setSearchHint(true);
      return;
    }
    setSearchHint(false);
    const dep = departure ? `&departure=${departure}` : "";
    router.push(`/tours?search=${encodeURIComponent(searchQuery.trim())}${dep}`);
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
            <form onSubmit={handleSearch} className="md:w-[95%] md:ml-auto flex items-center border-2 border-gray-200 focus-within:border-emerald-500 rounded-lg overflow-hidden transition-colors">
              <input
                type="text"
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
                  <Link href="/courses" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100">
                    ⛳ 골프장 소개
                  </Link>
                  <Link href="/reviews" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100">
                    ⭐ 여행후기
                  </Link>
                  <Link href={`/notice${p}`} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-100">
                    📢 공지/이벤트
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    🏢 대표자의 말
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
          <div className="border-b border-gray-100">
            <Link href="/courses" className="flex items-center gap-2 px-4 py-3.5 text-gray-700 font-medium text-sm" onClick={() => setMenuOpen(false)}>
              ⛳ 골프장 소개
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/reviews" className="flex items-center gap-2 px-4 py-3.5 text-gray-700 font-medium text-sm" onClick={() => setMenuOpen(false)}>
              ⭐ 여행후기
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href={`/notice${p}`} className="flex items-center gap-2 px-4 py-3.5 text-gray-700 font-medium text-sm" onClick={() => setMenuOpen(false)}>
              📢 공지/이벤트
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/about" className="flex items-center gap-2 px-4 py-3.5 text-gray-700 font-medium text-sm" onClick={() => setMenuOpen(false)}>
              🏢 대표자의 말
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <a href="https://pf.kakao.com/_bxoxnXxj/chat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3.5 text-yellow-700 font-bold text-sm" onClick={() => setMenuOpen(false)}>
              💬 카카오톡 상담
            </a>
          </div>
          <ExternalVerificationButton className="w-full px-4 py-3 min-h-11 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 transition-colors text-left">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">S</div>
            <span className="text-sm text-blue-700 font-semibold">여행사 등록·보증 정보 확인 (SGI 서울보증보험 가입)</span>
          </ExternalVerificationButton>
        </div>
      )}
    </header>
    </>
  );
}
