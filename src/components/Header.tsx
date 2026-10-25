"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@/lib/queryStore";
import { IconFlag, IconStar, IconMegaphone, IconQuote, IconChat, IconShieldCheck, IconPlaneTakeoff, IconClipboard, IconPhone, IconCheck } from "./icons/MenuIcons";
import ExternalVerificationButton from "./ExternalVerificationModal";
import { IconChevron } from "./icons/Chevron";
import type { NavRegions } from "@/lib/navRegions";
import { DEPARTURES, DEP_HOME, type Dep } from "@/lib/departure";
import { onDepChange } from "@/lib/depSync";

// 공통 머리말 — 2줄 정리 (사장님 시안 2026-10-25)
//  1줄: 로고·여행의 파도 | 이름 검색창 | ✈ 출발지: 인천 ▾ | 내 예약·문의 | 고객센터
//  2줄: 국가 메뉴 + 커뮤니티 (기존 그대로)
//  - 맨 위 안내 띠(왜 여행의 파도·SGI·출발지 줄)는 없앴다: 회사 소개·보증 안내는 커뮤니티 하위 메뉴와 꼬리말로.
//  - 휴대폰: 1줄 로고 | 검색·메뉴, 2줄 출발지 ▾ | 내 예약·문의. 검색창은 접어 두고 '검색'을 누르면 펼친다.
//  - 출발지 버튼은 머리말·첫 화면 검색판이 같은 상태를 보여준다(검색판 변경 → depSync 알림 수신).

type HeaderProps = {
  departure?: "incheon" | "busan";
  /** 실제 출발지(청주·대구 포함) — 출발지 버튼 표시용. 헤더 나머지는 departure(인천/부산 화면)를 쓴다 */
  realDeparture?: Dep;
  navRegions: NavRegions;
};

type NavItem = {
  label: string;
  href: string;
  sub?: { label: string; href: string }[];
};

const DEP_LABEL: Record<Dep, string> = { incheon: "인천", busan: "부산", cheongju: "청주", daegu: "대구" };

// 나라별 지역 칸은 상품 데이터에서 자동으로 만든다(lib/navRegions.ts, 사장님 지시 2026-10-13).
const COUNTRIES: { code: string; label: string }[] = [
  { code: "japan", label: "일본" },
  { code: "china", label: "중국" },
  { code: "thailand", label: "태국" },
  { code: "vietnam", label: "베트남" },
  { code: "malaysia", label: "말레이시아" },
  { code: "philippines", label: "필리핀" },
  { code: "other", label: "기타" },
];

function buildNav(regions: NavRegions, dep?: "incheon" | "busan", keep = ""): NavItem[] {
  // keep: /tours 에서 고른 출발일·여행기간·인원·정렬 — 국가를 바꿔도 유지, 지역만 초기화 (사장님 지시 10/25)
  const q = (dep ? `&departure=${dep}` : "") + keep;
  const p = dep ? `?departure=${dep}${keep}` : keep ? `?${keep.slice(1)}` : "";
  return COUNTRIES.map((c) => {
    const sub = (regions[c.code] ?? [])
      .filter((r) => (dep ? r[dep] > 0 : true))
      .map((r) => ({ label: r.label, href: `/tours?country=${c.code}&region=${encodeURIComponent(r.region)}${q}` }));
    return { label: c.label, href: c.code === "other" ? `/tours${p}` : `/tours?country=${c.code}${q}`, sub: sub.length > 0 ? sub : undefined };
  });
}

/** 지금 보던 화면을 최대한 유지한 채 출발지만 바꾸는 주소 (상품 목록·공지는 departure= 만 교체, 그 외는 그 출발지 홈) */
function useDepHrefs(): (to: Dep) => string {
  const pathname = usePathname();
  const searchParams = useQuery();
  return (to: Dep) => {
    if (pathname === "/tours" || pathname === "/notice") {
      const q = new URLSearchParams(searchParams.toString());
      q.set("departure", to);
      return `${pathname}?${q.toString()}`;
    }
    return DEP_HOME[to];
  };
}

/** 바깥 클릭·ESC 로 닫히는 펼침 상자 공통 훅 */
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  return { open, setOpen, ref };
}

/** ✈ 출발지: 인천 ▾ — 하나의 버튼으로 통합 (사장님 확정 문구 10/25: 선택 전 '출발지 선택') */
function DepartureButton({ dep, compact }: { dep?: Dep; compact?: boolean }) {
  const { open, setOpen, ref } = useDropdown();
  const href = useDepHrefs();
  const item = "flex items-center gap-2 min-h-[46px] px-3.5 rounded-lg text-base font-bold text-main-text hover:bg-soft-blue";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 min-h-11 ${compact ? "px-2.5" : "px-3.5"} rounded-full border-[1.5px] border-blue-300 bg-white text-blue-800 font-bold text-[15px] hover:bg-blue-50 whitespace-nowrap`}
      >
        <IconPlaneTakeoff className="w-[18px] h-[18px] text-brand-blue" />
        {dep
          ? (compact
            ? <>출발지: <b className="font-black">{DEP_LABEL[dep]}</b></>
            : <><b className="font-black">{DEP_LABEL[dep]}</b><span aria-hidden="true" className="text-blue-300">·</span>출발지 변경</>)
          : "출발지 선택"}
        <IconChevron dir="down" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full mt-1 z-[60] flex flex-col min-w-[200px] p-1.5 rounded-xl bg-white border border-line shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          {DEPARTURES.map((d) => (
            <Link key={d} role="menuitem" href={href(d)} onClick={() => setOpen(false)} className={item} aria-current={dep === d ? "true" : undefined}>
              <span className="flex-1">{DEP_LABEL[d]} 출발</span>
              {dep === d && <IconCheck className="w-4 h-4 text-emerald-700" />}
            </Link>
          ))}
          <span aria-hidden="true" className="h-px my-1 mx-2 bg-line" />
          <Link role="menuitem" href="/" onClick={() => setOpen(false)} className={`${item} font-semibold text-blue-700`}>
            출발공항 다시 선택
          </Link>
        </div>
      )}
    </div>
  );
}

/** 고객센터 — 전화·카카오톡 (PC 오른쪽 끝) */
function CustomerCenter({ busan }: { busan?: boolean }) {
  const { open, setOpen, ref } = useDropdown();
  const item = "flex items-center gap-2 min-h-[46px] px-3.5 rounded-lg text-[15px] font-bold text-main-text hover:bg-soft-blue whitespace-nowrap";
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex flex-col items-center justify-center gap-0.5 min-w-16 min-h-11 px-1 text-gray-700 hover:text-brand-blue">
        <IconPhone className="w-5 h-5" />
        <span className="text-[14px] font-semibold leading-none">고객센터</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-[60] flex flex-col min-w-[220px] p-1.5 rounded-xl bg-white border border-line shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <a role="menuitem" href="tel:01053015250" className={item}><IconPhone className="w-4 h-4 text-brand-blue" />010-5301-5250</a>
          <a role="menuitem" href={busan ? "tel:07047985252" : "tel:0264015252"} className={item}><IconPhone className="w-4 h-4 text-brand-blue" />{busan ? "070-4798-5252" : "02-6401-5252"}</a>
          <a role="menuitem" href="https://pf.kakao.com/_bxoxnXxj/chat" target="_blank" rel="noopener noreferrer" className={item}>
            <span className="w-5 h-5 rounded-md bg-kakao-yellow text-main-text flex items-center justify-center"><IconChat className="w-3.5 h-3.5" /></span>카카오톡 상담
          </a>
          <p className="px-3.5 py-2 text-[13px] text-slate-500">평일 09:00~18:00 · 토 09:00~14:00</p>
        </div>
      )}
    </div>
  );
}

export default function Header({ departure, realDeparture, navRegions }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // 휴대폰 접이식 검색창
  const [communityOpen, setCommunityOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // 출발지 표시 — 첫 화면 검색판에서 바꾸면 알림을 받아 같이 바뀐다 (사장님 지시 10/25)
  // 페이지가 바뀌어 넘겨받은 출발지가 달라지면 그리는 중에 알아채 되돌린다 (React 권장 파생 상태 방식)
  const propDep = realDeparture ?? departure;
  const [dep, setDep] = useState<Dep | undefined>(propDep);
  const [prevPropDep, setPrevPropDep] = useState<Dep | undefined>(propDep);
  if (propDep !== prevPropDep) { setPrevPropDep(propDep); setDep(propDep); }
  useEffect(() => onDepChange((d) => setDep(d)), []);

  const navPathname = usePathname();
  const navQuery = useQuery();
  const navKeep = (() => {
    if (navPathname !== "/tours") return "";
    let s = "";
    for (const k of ["date", "nights", "people", "sort"]) {
      const v = navQuery.get(k);
      if (v) s += `&${k}=${encodeURIComponent(v)}`;
    }
    return s;
  })();
  const navItems = buildNav(navRegions, departure, navKeep);
  // 지금 보고 있는 국가 — /tours?country= 와 일치하는 메뉴를 강조한다 (Codex 10/25)
  const curCountry = navPathname === "/tours" ? navQuery.get("country") ?? "" : "";
  const isCurNav = (href: string) => Boolean(curCountry) && new URLSearchParams(href.split("?")[1] ?? "").get("country") === curCountry;
  const p = departure ? `?departure=${departure}` : "";

  const homeHref =
    departure === "incheon" ? "/incheon" :
    departure === "busan" ? "/busan" :
    "/";

  // 검색어 없이 돋보기를 누르면 입력칸으로 커서를 옮기고 안내 문구를 보여준다 (클래리티 "반응 없는 클릭" 대응)
  const [searchHint, setSearchHint] = useState(false);

  // 검색은 양식 이동(GET /tours?search=…) — router.push 는 휴대폰 크기 시험에서 가끔 멈췄다 (10/21)
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

  const searchForm = (autoFocus?: boolean) => (
    <form action="/tours" method="get" onSubmit={handleSearch} className="flex-1 flex items-center border-2 border-gray-200 focus-within:border-emerald-500 rounded-lg overflow-hidden transition-colors min-w-0">
      {departure && <input type="hidden" name="departure" value={departure} />}
      <input
        type="text"
        name="search"
        value={searchQuery}
        autoFocus={autoFocus}
        onChange={(e) => { setSearchQuery(e.target.value); if (searchHint) setSearchHint(false); }}
        onBlur={() => setSearchHint(false)}
        placeholder={searchHint ? "검색어를 입력해 주세요 (예: 후쿠오카)" : "여행지·골프장 이름으로 검색"}
        aria-invalid={searchHint || undefined}
        className="flex-1 px-3 min-h-11 md:px-4 text-[15px] placeholder:text-gray-500 outline-none bg-white min-w-0"
      />
      <button type="submit" aria-label="검색" className="w-11 min-h-11 md:w-12 flex items-center justify-center bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors border-l border-gray-200 flex-shrink-0">
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );

  const communityItem = "flex items-center gap-2 px-4 py-3 text-sm text-body-text hover:bg-page-bg transition-colors border-b border-gray-100 last:border-0 text-left w-full";

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">

      {/* ══ 1줄: 로고 | 검색 | 출발지 | 내 예약·문의 | 고객센터 ══ */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-1.5 md:py-2.5 flex items-center gap-2 md:gap-3">

          <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0 mr-auto md:mr-0">
            <Image src="/images/logo.png" alt="여행의 파도" width={44} height={44} className="rounded-full md:w-[52px] md:h-[52px]" />
            <div>
              <div className="text-base md:text-lg font-black text-gray-800 leading-tight whitespace-nowrap">여행의 파도</div>
              <div className="text-[11px] text-gray-500 whitespace-nowrap">골프전문여행사</div>
            </div>
          </Link>

          {/* PC 검색창 — 420px 기준, 오른쪽에 출발지·고객 메뉴 (사장님 시안 10/25) */}
          <div className="hidden md:flex flex-1 min-w-0 max-w-[560px] ml-2 mr-1">{searchForm()}</div>
          <div className="hidden md:block">
            <DepartureButton dep={dep} />
          </div>
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Link href="/my-inquiries" className="flex flex-col items-center justify-center gap-0.5 min-w-20 min-h-11 px-1 text-gray-700 hover:text-brand-blue">
              <IconClipboard className="w-5 h-5" />
              <span className="text-[14px] font-semibold leading-none whitespace-nowrap">내 예약·문의</span>
            </Link>
            <CustomerCenter busan={departure === "busan"} />
          </div>

          {/* 휴대폰: 검색(접힘) + 메뉴 */}
          <div className="md:hidden flex items-center flex-shrink-0 gap-0.5">
            <button
              type="button"
              onClick={() => { setSearchOpen((v) => !v); setMenuOpen(false); }}
              aria-expanded={searchOpen}
              aria-label="검색 열기"
              className="min-w-11 h-11 px-1 flex flex-col items-center justify-center gap-0.5 text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-[12px] font-semibold leading-none">검색</span>
            </button>
            <button onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} className="min-w-11 h-11 px-1 flex flex-col items-center justify-center gap-0.5 text-gray-700" aria-label="메뉴">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
              <span className="text-[12px] font-semibold leading-none">메뉴</span>
            </button>
          </div>
        </div>

        {/* 휴대폰 2줄: 출발지 ▾ | 내 예약·문의 */}
        <div className="md:hidden max-w-6xl mx-auto px-4 pb-2 flex items-center justify-between gap-2">
          <DepartureButton dep={dep} compact />
          <Link href="/my-inquiries" className="inline-flex items-center gap-1.5 min-h-11 px-2 text-[15px] font-bold text-gray-800">
            <IconClipboard className="w-[18px] h-[18px] text-gray-500" />내 예약·문의
          </Link>
        </div>

        {/* 휴대폰 접이식 검색창 — 기존 이름·자연어 검색 그대로 */}
        {searchOpen && (
          <div className="md:hidden max-w-6xl mx-auto px-4 pb-2.5 flex items-center gap-1.5">
            {searchForm(true)}
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="검색 닫기" className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* ══ 2줄: 국가 메뉴 (데스크톱) ══ */}
      <div className="bg-white border-b border-gray-200 hidden md:block">
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
                    aria-current={isCurNav(item.href) ? "page" : undefined}
                    className={`block px-4 py-3 text-base transition-colors whitespace-nowrap ${isCurNav(item.href) ? "text-brand-blue font-extrabold shadow-[inset_0_-2.5px_0_#2457C5]" : "text-gray-700 hover:text-black hover:bg-gray-100 font-semibold"}`}
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

            <div className="w-px h-6 bg-gray-200 mx-2" />

            <div
              className="relative"
              onMouseEnter={() => setCommunityOpen(true)}
              onMouseLeave={() => setCommunityOpen(false)}
            >
              <button className="flex items-center justify-center gap-1 text-gray-700 hover:text-black hover:bg-gray-100 font-semibold w-[118px] py-3 text-base transition-colors whitespace-nowrap">
                커뮤니티
                <IconChevron dir="down" className="w-4 h-4 text-gray-500" />
              </button>
              {communityOpen && (
                <div className="absolute right-0 top-full w-52 bg-white shadow-xl rounded-b-lg overflow-hidden border border-gray-100 z-50">
                  <Link href={`/notice${p}`} className={communityItem}>
                    <span className="text-brand-blue"><IconMegaphone /></span>공지/이벤트
                  </Link>
                  <Link href="/reviews" className={communityItem}>
                    <span className="text-brand-blue"><IconStar /></span>여행후기
                  </Link>
                  <Link href="/courses" className={communityItem}>
                    <span className="text-brand-blue"><IconFlag /></span>골프장 소개
                  </Link>
                  <Link href="/about" className={communityItem}>
                    <span className="text-brand-blue"><IconQuote /></span>대표자의 말
                  </Link>
                  {/* 정보 메뉴와 회사 안내 사이 구분선 (Codex 10/25) */}
                  <div aria-hidden="true" className="h-px my-1 mx-3 bg-gray-200" />
                  {/* '여행의 파도 소개'는 대표자의 말과 내용이 겹쳐 고급 소개문 정리 전까지 숨김 (사장님 지시 10/25) */}
                  <ExternalVerificationButton className={communityItem}>
                    <span className="text-brand-blue"><IconShieldCheck /></span>여행업 등록·보증 안내
                  </ExternalVerificationButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 모바일 전체 메뉴 ══ */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg max-h-[75vh] overflow-y-auto">
          {/* 고객센터 — 전체 메뉴 맨 위 (사장님 지시 10/25) */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-[13px] font-bold text-blue-900 mb-2 flex items-center gap-1.5"><IconPhone className="w-4 h-4" />고객센터 · 평일 09:00~18:00</p>
            <div className="flex gap-2">
              <a href="tel:01053015250" className="flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-lg bg-white border border-blue-200 text-blue-800 font-bold text-sm" onClick={() => setMenuOpen(false)}>
                <IconPhone className="w-4 h-4" />010-5301-5250
              </a>
              <a href="https://pf.kakao.com/_bxoxnXxj/chat" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-lg bg-[#FAE100] border border-[#F0D600] text-gray-900 font-bold text-sm" onClick={() => setMenuOpen(false)}>
                <IconChat className="w-4 h-4" />카카오톡
              </a>
            </div>
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
          <div className="h-2 bg-gray-50 border-b border-gray-100" aria-hidden="true" />
          {/* 휴대폰 메뉴 순서: 공지/이벤트 → 여행후기 → 골프장 소개 → 대표자의 말 → 여행의 파도 소개 → 카카오톡 → 등록·보증 (사장님 지시 10/10·10/25) */}
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
          {/* '여행의 파도 소개'는 고급 소개문 정리 전까지 숨김 (사장님 지시 10/25) */}
          <ExternalVerificationButton className="w-full px-4 py-3 min-h-11 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 transition-colors text-left">
            <span className="text-brand-blue"><IconShieldCheck /></span>
            <span className="text-sm text-brand-blue font-semibold">여행업 등록·보증 안내 (SGI 서울보증보험 가입)</span>
          </ExternalVerificationButton>
        </div>
      )}
    </header>
  );
}
