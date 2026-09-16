"use client";

import { useEffect, useState } from "react";

type Props = {
  images: string[];
  altBase: string;
  objectTop?: boolean;
  /** hero — 상품 맨 위 큰 사진 한 장. 자리를 꽉 채우고 먼저 받는다. */
  variant?: "grid" | "hero";
};

// 상품 상세의 호텔·골프장 사진 묶음. 누르면 크게 본다.
// 예전엔 사진이 커지는 효과만 있고 눌러도 아무 일이 없어서
// 클래리티 "반응 없는 클릭" 1위로 잡혔다 (골프장 사진 3회, 2026-09-15).
// 맨 위 큰 사진도 같은 이유로 여기에 붙였다 (가고시마 9회, 2026-09-16).
export default function PhotoGrid({ images, altBase, objectTop, variant = "grid" }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, images.length]);

  function go(dir: number) {
    setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length));
  }

  return (
    <>
      {variant === "hero" ? (
        <button
          type="button"
          onClick={() => setOpen(0)}
          aria-label={`${altBase} 사진 크게 보기`}
          className="absolute inset-0 w-full h-full cursor-zoom-in"
        >
          <img
            src={images[0]}
            alt={altBase}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </button>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`${altBase} 사진 ${i + 1} 크게 보기`}
            className="relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-100 cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <img
              src={img}
              alt={`${altBase} ${i + 1}`}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover ${objectTop ? "object-top" : ""} hover:scale-105 transition-transform duration-300`}
            />
          </button>
        ))}
      </div>
      )}

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${altBase} 사진 크게 보기`}
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setOpen(null)}
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            setTouchStartX(null);
          }}
        >
          <img
            src={images[open]}
            alt={`${altBase} ${open + 1}`}
            className="max-w-[94vw] max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            aria-label="닫기"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl leading-none"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="이전 사진"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="다음 사진"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl"
              >
                ›
              </button>
              <div className="absolute bottom-5 left-0 right-0 text-center text-white/80 text-sm">
                {open + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
