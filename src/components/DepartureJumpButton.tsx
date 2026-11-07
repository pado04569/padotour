"use client";

import type { ReactNode } from "react";

// "출발일별 요금 보기" — #departure 로 스크롤만 하던 링크라 달력이 이미 보이면 눌러도 화면이 안 변해
// 배달못한클릭으로 잡힘(클래리티 11/5 삼공리 청주). 눌렀을 때 달력 칸을 잠깐 강조해 반응이 보이게 한다.
export default function DepartureJumpButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      href="#departure"
      className={className}
      onClick={(e) => {
        const el = document.getElementById("departure");
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        const ring = ["ring-4", "ring-brand-blue/40", "rounded-2xl", "transition-shadow"];
        el.classList.add(...ring);
        window.setTimeout(() => el.classList.remove("ring-4", "ring-brand-blue/40"), 1400);
      }}
    >
      {children}
    </a>
  );
}
