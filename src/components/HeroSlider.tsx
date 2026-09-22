"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Slide = {
  image: string;
  region: string;
  regionEn: string;
  tagline: string;
  href: string;
};

type Props = {
  slides: Slide[];
  departure?: "incheon" | "busan";
};

export default function HeroSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  // 첫 화면에는 첫 번째 사진만 받는다. 나머지는 잠시 뒤에 붙인다.
  // 숨은 슬라이드도 화면 안(opacity 0)에 있어서 loading="lazy" 로는 안 미뤄진다 — 휴대폰 첫 화면 4초의 원인(2026-09-15 클래리티)
  const [restReady, setRestReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRestReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  function goTo(dir: number) {
    setCurrent((c) => (c + dir + slides.length) % slides.length);
  }
  function onTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? 1 : -1);
    setTouchStartX(null);
  }

  return (
    <div
      className="relative w-full overflow-hidden h-[56vh] min-h-[360px] md:h-[80vh] md:max-h-[860px]"
      style={{ touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 배경 이미지 */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          {(i === 0 || i === current || restReady) && (
            <img
              src={s.image}
              alt={s.region}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              className="w-full h-full object-cover"
            />
          )}
          {/* 사진이 칙칙해 보인다는 지적(2026-09-22) — 검정 45% 오버레이를 20%로 낮춘다.
              대신 아래 글씨에 그림자를 더 줘서 가독성을 보완한다 */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* 텍스트 오버레이 */}
      <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
        <h2
          className="text-4xl md:text-7xl lg:text-8xl font-black tracking-wider mb-3 md:mb-4"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.5)" }}
        >
          {slide.regionEn}
        </h2>
        <p
          className="text-base md:text-2xl text-white mb-6 md:mb-8 px-4"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
        >
          {slide.tagline}
        </p>
        <Link
          href={slide.href}
          className="bg-white hover:bg-gray-100 text-black font-bold px-8 py-3 rounded-full text-base transition-colors shadow-lg"
        >
          상품 보기
        </Link>
      </div>

      {/* 좌우 화살표 (PC 전용 — 모바일은 스와이프) */}
      <button
        onClick={() => goTo(-1)}
        aria-label="이전"
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full items-center justify-center text-2xl transition-colors"
      >
        ‹
      </button>
      <button
        onClick={() => goTo(1)}
        aria-label="다음"
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 rounded-full items-center justify-center text-2xl transition-colors"
      >
        ›
      </button>

      {/* 하단 점 인디케이터 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
