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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "clamp(420px, 82vh, 860px)" }}>
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
        <h2 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-wider mb-3 md:mb-4 drop-shadow-lg">
          {slide.regionEn}
        </h2>
        <p className="text-base md:text-2xl text-white/90 mb-6 md:mb-8 drop-shadow px-4">{slide.tagline}</p>
        <Link
          href={slide.href}
          className="bg-white hover:bg-gray-100 text-black font-bold px-8 py-3 rounded-full text-base transition-colors shadow-lg"
        >
          상품 보기
        </Link>
      </div>

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
