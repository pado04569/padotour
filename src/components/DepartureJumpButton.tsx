"use client";

import { useRef, type ReactNode } from "react";

// "출발일별 요금 보기" — #departure 로 스크롤만 하던 링크라 달력이 이미 보이면 눌러도 화면이 안 변해
// 배달못한클릭으로 잡힘(클래리티 11/5 삼공리 청주). 눌렀을 때 달력 칸을 잠깐 강조해 반응이 보이게 한다.
// (Codex 검수 11/7: 스크롤 시간까지 감안해 1.8초 유지, 다시 누르면 시간 다시 시작, 동작 줄이기 설정이면 즉시 이동)
export default function DepartureJumpButton({ className, children }: { className?: string; children: ReactNode }) {
  const timer = useRef<number | undefined>(undefined);
  return (
    <a
      href="#departure"
      className={className}
      onClick={(e) => {
        const el = document.getElementById("departure");
        if (!el) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        el.classList.add("ring-4", "ring-brand-blue/40", "rounded-2xl", "transition-shadow");
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => el.classList.remove("ring-4", "ring-brand-blue/40"), 1800);
      }}
    >
      {children}
    </a>
  );
}
