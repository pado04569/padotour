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

export default function HeroSlider({ slides, departure }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  function prev() {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }
  function next() {
    setCurrent((c) => (c + 1) % slides.length);
  }

  const slide = slides[current];
  const accentBg = departure === "busan" ? "bg-blue-500" : "bg-emerald-500";

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "clamp(260px, 55vw, 460px)" }}>
      {/* 배경 이미지 */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={s.image} alt={s.region} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      ))}

      {/* 텍스트 오버레이 */}
      <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
        {/* 좌우 화살표 + 지역 배지 */}
        <div className="flex items-center gap-6 mb-4">
          <div className="w-16 md:w-24 h-px bg-white/50" />
          <div className="flex items-center gap-3">
            <button onClick={prev} className="text-white/70 hover:text-white text-xl transition-colors">←</button>
            <span className={`${accentBg} text-white text-sm font-bold px-4 py-1.5 rounded`}>
              {slide.region}
            </span>
            <button onClick={next} className="text-white/70 hover:text-white text-xl transition-colors">→</button>
          </div>
          <div className="w-16 md:w-24 h-px bg-white/50" />
        </div>

        <h2 className="text-3xl md:text-6xl font-black tracking-wider mb-2 md:mb-3 drop-shadow-lg">
          {slide.regionEn}
        </h2>
        <p className="text-sm md:text-xl text-white/90 mb-5 md:mb-6 drop-shadow px-4">{slide.tagline}</p>
        <Link
          href={slide.href}
          className={`${accentBg} hover:opacity-90 text-white font-bold px-8 py-3 rounded-full text-base transition-opacity shadow-lg`}
        >
          ⛳ 상품 보기
        </Link>
      </div>

      {/* 좌우 화살표 버튼 */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl transition-colors"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl transition-colors"
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
