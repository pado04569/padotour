"use client";

import { useState } from "react";
import Image from "next/image";
import { IconChevron } from "@/components/icons/Chevron";

// 상품 상세 사진 갤러리 — 왼쪽 큰 사진 + 아래 썸네일 (사장님 작업지시 2026-10-25)
//  - 어둡게 덮는 층 없음. 썸네일을 누르면 대표 사진이 바뀐다.
//  - 큰 사진을 누르면 전체 화면으로 크게 본다(눌러도 반응 없던 클릭 방지, 클래리티 2026-09-16과 같은 취지).
export default function TourGallery({ images, alt }: { images: string[]; alt: string }) {
  const list = images.length > 0 ? images : [];
  const [idx, setIdx] = useState(0);
  const [full, setFull] = useState(false);
  if (list.length === 0) return null;
  const move = (d: number) => setIdx((i) => (i + d + list.length) % list.length);

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => setFull(true)}
        aria-label="사진 크게 보기"
        className="relative block w-full aspect-[4/3] md:aspect-[16/11] rounded-2xl overflow-hidden bg-emerald-100 group"
      >
        <Image
          src={list[idx]}
          alt={`${alt} 사진 ${idx + 1}`}
          fill
          priority={idx === 0}
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/45 text-white text-[12px] font-bold opacity-90 group-hover:opacity-100">
          {idx + 1} / {list.length} · 크게 보기
        </span>
      </button>

      {list.length > 1 && (
        <ul className="flex gap-2 mt-2.5 overflow-x-auto pb-1" aria-label="상품 사진 목록">
          {list.map((src, i) => (
            <li key={i} className="flex-none">
              <button
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`${i + 1}번째 사진 보기`}
                aria-current={i === idx ? "true" : undefined}
                className={`relative block w-[76px] h-14 rounded-lg overflow-hidden transition-shadow ${i === idx ? "ring-2 ring-brand-blue" : "ring-1 ring-black/10 hover:ring-brand-blue/50"}`}
              >
                <Image src={src} alt="" fill sizes="76px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {full && (
        <div role="dialog" aria-modal="true" aria-label="사진 크게 보기" className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center" onClick={() => setFull(false)}>
          <div className="relative w-full h-full max-w-5xl max-h-[86vh] m-4" onClick={(e) => e.stopPropagation()}>
            <Image src={list[idx]} alt={`${alt} 사진 ${idx + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
          <button type="button" onClick={() => setFull(false)} aria-label="닫기" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl font-bold">✕</button>
          {list.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="이전 사진" className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"><IconChevron dir="left" className="w-6 h-6" /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="다음 사진" className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"><IconChevron className="w-6 h-6" /></button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
