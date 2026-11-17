"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { IconArrowLeft } from "@/components/icons/MenuIcons";

/**
 * 검색 결과로 돌아가기 (사장님 지적 2026-11-17 — "1번 상품을 보고 2번을 보려면 다시 검색해야 한다")
 *
 * 상품 목록(/tours)이 마지막 검색 주소·조건을 이 탭에만(sessionStorage) 적어 두고,
 * 검색 카드로 들어온 상세(주소에 date= 또는 people=)에서만 그 주소로 돌아가는 링크를 보여 준다.
 * 공유 링크로 바로 들어온 고객에게는 보이지 않는다(fallback 그대로).
 */
export const LAST_SEARCH_KEY = "padotour_last_search";

export function saveLastSearch(v: { href: string; label: string } | null) {
  try {
    if (v) sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(v));
    else sessionStorage.removeItem(LAST_SEARCH_KEY);
  } catch {
    // 저장이 막힌 브라우저 — 링크만 안 보인다
  }
}

const noSubscribe = () => () => {};
function readLastSearch(): string {
  try {
    const q = new URLSearchParams(window.location.search);
    if (!q.get("date") && !q.get("people")) return "";
    return sessionStorage.getItem(LAST_SEARCH_KEY) || "";
  } catch {
    return ""; // 읽지 못하면 기본 링크 그대로
  }
}

export default function SearchBackLink({ variant, fallback = null }: { variant: "top" | "bottom"; fallback?: ReactNode }) {
  // 서버·첫 그림은 빈 값(기본 링크), 브라우저에서만 저장값을 읽는다
  const raw = useSyncExternalStore(noSubscribe, readLastSearch, () => "");
  const last = (() => {
    try {
      const v = raw ? JSON.parse(raw) : null;
      return v && typeof v.href === "string" && v.href.startsWith("/tours?") ? { href: v.href as string, label: String(v.label ?? "") } : null;
    } catch {
      return null;
    }
  })();

  if (!last) return <>{fallback}</>;

  if (variant === "top") {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-2">
        <a href={last.href} className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 min-h-11 py-1 text-base font-bold text-emerald-700 hover:text-emerald-800">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><IconArrowLeft className="w-[18px] h-[18px]" />검색 결과로 돌아가기</span>
          {last.label && <span className="text-sm font-semibold text-slate-500">{last.label}</span>}
        </a>
      </div>
    );
  }
  return (
    <a href={last.href} className="group inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold text-[15px]">
      <IconArrowLeft className="w-[18px] h-[18px] transition-transform md:group-hover:-translate-x-0.5" />검색 결과로 돌아가기
    </a>
  );
}
