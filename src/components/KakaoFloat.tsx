"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// 화면 오른쪽 아래에 따라다니는 카카오톡 채널 문의 버튼.
// 예전 "카카오톡 상담" 큰 노란 버튼은 화면을 가려 내렸고(2026-09-10), 작은 아이콘으로 다시 붙임(사장님 요청 2026-10-08).
//
// 휴대폰에서 본문을 가리지 않게 (사장님 확정 A+C안, 2026-10-11) — 크기·모양·색은 그대로
//  C) 실제 상담 버튼(카카오 링크·견적 문의 상자·꼬리말 상담 카드)이 화면에 보이면 늘 숨긴다 — A보다 먼저
//  A) 아래로 내리는 동안 숨기고, 멈춘 뒤 0.7초 지나면 다시 보인다. 위로 올리면 바로 보인다
//  PC는 예전처럼 늘 보인다.
const SHOW_DELAY = 700; // 멈춘 뒤 다시 보이기까지
const JITTER = 8; // 이만큼 이하로 살짝 움직인 것은 무시 — 깜빡임 방지
const CTA_SELECTOR = [
  'a[href*="pf.kakao.com"]:not([data-kakao-float])', // 카카오톡 상담·견적 문의 버튼들
  "#inquiry", // 상품 상세 예약 문의·견적
  "footer > div:first-child", // 꼬리말 상담 카드 4개
].join(",");

export default function KakaoFloat() {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const lastY = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 휴대폰 폭인가 (md 미만)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // A) 스크롤 방향 — 한 화면에 한 번만 계산(requestAnimationFrame), 같은 값이면 화면을 다시 그리지 않는다
  useEffect(() => {
    if (!mobile) return;
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const dy = y - lastY.current;
        if (Math.abs(dy) < JITTER) return;
        lastY.current = y;
        if (timer.current) clearTimeout(timer.current);
        if (dy > 0) {
          setScrollHidden(true);
          timer.current = setTimeout(() => setScrollHidden(false), SHOW_DELAY);
        } else {
          setScrollHidden(false);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [mobile]);

  // C) 상담 버튼이 화면에 보이는가 — 페이지가 바뀌거나 내용이 새로 그려지면 다시 찾는다
  useEffect(() => {
    if (!mobile) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target);
        else seen.delete(e.target);
      }
      setCtaVisible(seen.size > 0);
    });
    const watched = new Set<Element>();
    const scan = () => {
      for (const el of document.querySelectorAll(CTA_SELECTOR)) {
        if (!watched.has(el)) { watched.add(el); io.observe(el); }
      }
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); setCtaVisible(false); };
  }, [mobile, pathname]);

  const hidden = mobile && (ctaVisible || scrollHidden);

  return (
    <a
      href="https://pf.kakao.com/_bxoxnXxj/chat"
      target="_blank"
      rel="noopener noreferrer"
      data-kakao-float
      aria-label="카카오톡 채널로 문의하기"
      title="카카오톡 채널로 문의하기"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#011C41] shadow-lg flex items-center justify-center transition-[opacity,translate,scale] duration-200 hover:scale-105 active:scale-95 ${
        hidden ? "opacity-0 translate-y-3 pointer-events-none" : "opacity-100 translate-y-0"
      }`}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 md:w-8 md:h-8" aria-hidden="true">
        <path
          d="M16 4C9.37 4 4 8.7 4 14.5c0 3.3 1.74 6.25 4.47 8.17L7.3 27.4c-.12.48.4.86.82.6l5.1-3.2c.9.13 1.83.2 2.78.2 6.63 0 12-4.7 12-10.5S22.63 4 16 4z"
          fill="#fff"
        />
        <path d="M11.2 15.6c1.2 1.9 2.9 2.9 4.8 2.9s3.6-1 4.8-2.9" fill="none" stroke="#011C41" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </a>
  );
}
