"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Review } from "@/data/reviews";
import { splitReviewImages } from "@/lib/reviewPhotos";

// 고객 후기 목록 + 상세 보기 (사장님 확정 R2 목록형, 2026-10-10)
// - 목록은 글을 훑어보는 게 중심: 작은 썸네일 + 지역·시기 + 제목 + 본문 미리보기
// - 누르면 페이지를 떠나지 않고 상세 창(휴대폰: 아래에서 올라옴 / PC: 오른쪽)으로. 닫으면 보던 위치 그대로
// - 본문 전체는 목록 카드 안에도 들어 있어(줄임 표시만) 검색엔진이 계속 읽을 수 있다
const nationOf = (r: Review) => r.country.split(" ")[0];
// 목록에서는 모든 제목에 반복되는 "[여행의파도 이용후기]" 머리말을 빼고 보여준다 (데이터는 그대로, 상세 창은 원래 제목)
const listTitle = (t: string) =>
  t
    .replace(/^\s*\[?\s*여행의\s*파도\s*이용\s*후기\s*\]?\s*[-–:]?\s*/, "")
    .replace(/\s*[-–]?\s*여행의\s*파도\s*이용\s*후기\s*$/, "")
    .trim() || t;

// 띄어쓰기 없이 붙은 후기 제목("6월12일출발하이난골프동방목가3박5일")은 단어 중간에서 끊겼다.
// 글자는 그대로 두고, 의미 경계(출발·골프여행 뒤, 날짜·박수 덩어리 앞뒤)에서만 줄이 넘어가게 한다 (2026-10-10)
function softBreak(raw: string) {
  // 브랜드 이름 "여행의 파도"는 두 줄로 갈라지지 않게 (붙임 공백)
  const t = raw.replace(/여행의 파도/g, "여행의 파도");
  const parts = t.split(/(?<=출발|골프여행|후기\]|\d일)(?=[가-힣\d])|(?<=[가-힣])(?=\d)/);
  return parts.map((p, i) => (
    <span key={i}>
      {i > 0 && <wbr />}
      {p}
    </span>
  ));
}

export default function ReviewBrowser({ reviews }: { reviews: Review[] }) {
  const [nation, setNation] = useState("전체");
  const [openId, setOpenId] = useState<string | null>(null);
  const nations = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of reviews) m.set(nationOf(r), (m.get(nationOf(r)) ?? 0) + 1);
    return [["전체", reviews.length] as const, ...[...m.entries()].sort((a, b) => b[1] - a[1])];
  }, [reviews]);
  const shown = nation === "전체" ? reviews : reviews.filter((r) => nationOf(r) === nation);
  const open = reviews.find((r) => r.id === openId) ?? null;

  // 예전 주소(#review-20)로 들어오면 그 후기를 바로 연다
  useEffect(() => {
    const fromHash = () => {
      const m = /^#review-(.+)$/.exec(window.location.hash);
      if (m && reviews.some((r) => r.id === m[1])) setOpenId(m[1]);
    };
    const t = requestAnimationFrame(fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => { cancelAnimationFrame(t); window.removeEventListener("hashchange", fromHash); };
  }, [reviews]);

  const close = useCallback(() => setOpenId(null), []);

  return (
    <>
      {/* 국가 필터 — 실제 후기 데이터로 개수 자동 계산 */}
      <div role="tablist" aria-label="국가별 후기" className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 scrollbar-hide">
        {nations.map(([n, c]) => (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={nation === n}
            onClick={() => setNation(n)}
            className={`flex-none inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full text-[15px] font-bold transition-colors ${
              nation === n ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {n}
            <span className={nation === n ? "text-white/85" : "text-gray-500"}>{c}</span>
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {shown.map((r) => {
          const { cover, coverIsDocument, photos } = splitReviewImages(r);
          const body = r.comment.split("\n").filter(Boolean);
          const preview = (body.length > 1 ? body.slice(1) : body).join(" ");
          return (
            <li key={r.id} id={`review-${r.id}`} className="scroll-mt-28">
              <button
                type="button"
                onClick={() => setOpenId(r.id)}
                className="w-full h-full flex gap-3.5 p-3 md:p-4 text-left bg-white border border-gray-200 rounded-2xl hover:border-emerald-300 hover:shadow-sm transition"
              >
                {cover && (
                  <span className="relative flex-none w-[84px] h-[84px] md:w-[112px] md:h-[112px] rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="112px"
                      className={coverIsDocument ? "object-cover object-top opacity-80" : "object-cover"}
                    />
                    {photos.length > 1 && (
                      <span className="absolute right-1 bottom-1 bg-black/60 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                        사진 {photos.length}
                      </span>
                    )}
                  </span>
                )}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-emerald-700">{r.country} · {r.date}</span>
                  <span className="text-base md:text-[17px] font-extrabold text-gray-900 leading-snug mt-0.5 line-clamp-2 break-keep [text-wrap:balance]">{softBreak(listTitle(r.title))}</span>
                  <span className="text-[15px] text-gray-600 leading-relaxed mt-1 line-clamp-2 md:line-clamp-3">{preview}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <ReviewDrawer review={open} onClose={close} />
    </>
  );
}

function ReviewDrawer({ review, onClose }: { review: Review | null; onClose: () => void }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!review) return;
    const prev = document.activeElement as HTMLElement | null;
    const y = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.drawerOpen = "1"; // 떠 있는 카카오 버튼을 숨긴다 (globals.css)
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.drawerOpen;
      window.scrollTo(0, y); // 보던 목록 위치 그대로
      prev?.focus({ preventScroll: true });
    };
  }, [review, onClose]);

  if (!review) return null;
  const { photos, documents } = splitReviewImages(review);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-end md:items-stretch md:justify-end"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full md:max-w-[560px] max-h-[90vh] md:max-h-none md:h-full overflow-y-auto bg-white rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-5 md:px-7 pt-4 pb-3 border-b border-gray-100 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-emerald-700">{review.country} · {review.date}</div>
            <h3 id={titleId} className="text-lg md:text-xl font-black text-gray-900 leading-snug mt-0.5 break-keep [overflow-wrap:anywhere]">{softBreak(review.title)}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="flex-none w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-slate-600 hover:bg-gray-100">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div className="px-5 md:px-7 py-5 space-y-5">
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((src, i) => (
                <div key={src} className={`relative rounded-xl overflow-hidden bg-gray-100 ${i === 0 && photos.length % 2 === 1 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}>
                  <Image src={src} alt={`${review.name} 후기 사진 ${i + 1}`} fill sizes="(min-width: 768px) 280px, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <p className="text-base md:text-[17px] text-gray-800 leading-[1.8] whitespace-pre-line">{review.comment}</p>

          {review.hashtags && review.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {review.hashtags.map((t) => (
                <span key={t} className="text-[13px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">#{t}</span>
              ))}
            </div>
          )}

          {documents.length > 0 && (
            <div>
              <h4 className="text-[15px] font-extrabold text-gray-800 mb-2">관련 자료 (확정서·카카오톡 후기)</h4>
              <div className="space-y-2">
                {documents.map((src) => (
                  <div key={src} className="rounded-xl overflow-hidden border border-gray-200">
                    <Image src={src} alt={`${review.name} 후기 관련 자료`} width={800} height={600} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 border-t pt-3">{review.name}</div>
        </div>
      </div>
    </div>
  );
}
