"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@/lib/queryStore";
import { DEPARTURES, type Dep } from "@/lib/departure";
import ExternalVerificationButton from "./ExternalVerificationModal";
import { IconChevron, IconSwap } from "./icons/Chevron";

const DEP_LABEL: Record<Dep, string> = { incheon: "인천", busan: "부산", cheongju: "청주", daegu: "대구" };
const MAIN_OTHER: Record<Dep, Dep> = { incheon: "busan", busan: "incheon", cheongju: "incheon", daegu: "busan" };

// 지금 보던 화면을 최대한 유지한 채 출발지만 바꾼다.
// 상품 상세(/tours/[id])는 상품 자체가 출발지별로 달라 그 출발지 메인으로 보낸다.
// target 을 주지 않으면 짝 출발지(인천↔부산, 청주→인천, 대구→부산)로 바꾼다.
export function useSwitchHref(departure?: Dep, target?: Dep) {
  const pathname = usePathname();
  const searchParams = useQuery();
  if (!departure) return "/";
  const to: Dep = target ?? MAIN_OTHER[departure];
  if (pathname === "/tours" || pathname === "/notice") {
    const q = new URLSearchParams(searchParams.toString());
    q.set("departure", to);
    return `${pathname}?${q.toString()}`;
  }
  return `/${to}`;
}

// 출발지가 4곳이 되어(10/25) "○○ 출발 보기" 한 줄 대신 메뉴로 나머지 3곳 + 처음 화면 (사장님 확정 A안)
function DepartureMenu({ departure, link }: { departure: Dep; link: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const others = DEPARTURES.filter((d) => d !== departure);
  const hrefs = {
    incheon: useSwitchHref(departure, "incheon"),
    busan: useSwitchHref(departure, "busan"),
    cheongju: useSwitchHref(departure, "cheongju"),
    daegu: useSwitchHref(departure, "daegu"),
  } as Record<Dep, string>;
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  const item = "flex items-center min-h-[46px] px-3.5 rounded-lg text-base font-bold text-main-text hover:bg-soft-blue";
  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${link} font-semibold text-blue-700 hover:text-blue-800`}
      >
        <IconSwap className="w-[18px] h-[18px]" />
        출발지 바꾸기
        <IconChevron className={`w-4 h-4 rotate-90 transition-transform ${open ? "-rotate-90" : ""}`} />
      </button>
      {open && (
        <span role="menu" className="absolute left-0 md:left-auto md:right-0 top-full mt-1 z-[60] flex flex-col min-w-[210px] p-1.5 rounded-xl bg-white border border-line shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          {others.map((d) => (
            <Link key={d} role="menuitem" href={hrefs[d]} onClick={() => setOpen(false)} className={item}>
              {DEP_LABEL[d]} 출발
            </Link>
          ))}
          <span aria-hidden="true" className="h-px my-1 mx-2 bg-line" />
          <Link role="menuitem" href="/" onClick={() => setOpen(false)} className={`${item} font-semibold text-blue-700`}>
            출발공항 다시 선택
          </Link>
        </span>
      )}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="w-[18px] h-[18px] md:w-5 md:h-5 text-[#E0B800] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 9.5-4-1.8-7-5.2-7-9.5V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// 머리말 위 신뢰 영역 (UX 개편 2026-10-09)
// 사장님 지적(10/9): 테두리 박스 4개가 지저분하고, 로고 옆 SGI 배지와 "등록·보증 확인"이 중복 →
// 박스 없이 글자 링크 + 얇은 구분선으로 정리하고, 보증 확인은 여기 한 곳만 둔다.
export default function TrustBar({ departure }: { departure?: Dep }) {

  const link = "inline-flex items-center gap-1.5 min-h-11 text-[15px] whitespace-nowrap transition-colors";
  const divider = <span aria-hidden="true" className="w-px h-3.5 bg-slate-300" />;

  return (
    <div className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
        {/* 신뢰 경로: 회사 설명 + 외부 등록정보 확인 */}
        <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4 border-b border-slate-200 md:border-0">
          {/* 홈페이지의 정체성 — 로고 "여행의 파도" 만큼 크게, 흰 바탕 + 노란 테두리 (사장님 선택 C안, 2026-10-09) */}
          <Link
            href="/about#why-padotour"
            className="inline-flex items-center gap-1.5 min-h-11 my-1 md:my-1.5 px-3 md:px-4 rounded-[10px] bg-white border-2 border-[#FAE100] hover:bg-yellow-50 text-slate-800 text-base md:text-lg font-extrabold whitespace-nowrap transition-colors"
          >
            <CheckIcon />
            왜 여행의 파도인가요?
          </Link>
          {divider}
          <ExternalVerificationButton className={`${link} font-semibold text-gray-800 hover:text-blue-700`}>
            <ShieldIcon />
            <span className="md:hidden">등록·보증</span>
            <span className="hidden md:inline">SGI 서울보증보험 가입 · 등록정보 확인</span>
          </ExternalVerificationButton>
        </div>

        {/* 출발지 + 내 예약/문의 */}
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
          {departure ? (
            // Codex 검수(10/9): "부산출발로 변경"은 부산이 목적지인지 헷갈린다 → "출발지 인천" + "부산 출발 상품 보기"로 나눈다
            <span className="inline-flex items-center gap-2 md:gap-3 text-[15px] text-gray-600 whitespace-nowrap">
              {/* 지금 상태임이 보이게 '인천'만 연한 파랑 알약 (사장님 선택 P1, 2026-10-09) */}
              <span className="inline-flex items-center gap-1.5 md:gap-2">
                출발지
                <b className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-bold">
                  {DEP_LABEL[departure]}
                </b>
              </span>
              {divider}
              <DepartureMenu departure={departure} link={link} />
            </span>
          ) : (
            <Link href="/" className={`${link} font-semibold text-blue-700 hover:underline underline-offset-4`}>
              출발공항 선택하기
              <IconChevron className="w-4 h-4" />
            </Link>
          )}
          <span className="hidden md:inline-flex">{divider}</span>
          <Link href="/my-inquiries" className={`${link} font-semibold text-gray-800 hover:text-emerald-700`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="hidden sm:block w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="4" width="14" height="17" rx="2" />
              <path d="M9 9h6M9 13h6M9 17h3" />
            </svg>
            내 예약/문의
          </Link>
        </div>
      </div>
    </div>
  );
}
