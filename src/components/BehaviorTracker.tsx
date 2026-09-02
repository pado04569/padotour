"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * 여행의파도 자체 행동 데이터 수집기 (GA4 커스텀 이벤트)
 * - scroll_depth: 페이지를 25/50/75/100% 까지 읽었는지 (어디까지 읽고 이탈했나)
 * - contact_click: 전화·카톡·밴드·블로그 링크 클릭 (전환 신호)
 * 모든 페이지(유입 페이지 포함)에서 자동 작동. window.gtag(GA4)로 전송.
 */
export default function BehaviorTracker() {
  const pathname = usePathname();

  // 스크롤 깊이 (페이지 이동 시 초기화)
  useEffect(() => {
    const fired = new Set<number>();
    const marks = [25, 50, 75, 100];
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.round((doc.scrollTop / total) * 100));
      for (const m of marks) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          window.gtag?.("event", "scroll_depth", {
            percent: m,
            page_path: pathname,
          });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // 연락/전환 클릭 (전화·카톡·밴드·블로그)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      let method = "";
      if (href.startsWith("tel:")) method = "phone";
      else if (href.includes("kakao")) method = "kakao";
      else if (href.includes("band")) method = "band";
      else if (href.includes("blog.naver")) method = "blog";
      if (!method) return;
      window.gtag?.("event", "contact_click", {
        method,
        page_path: window.location.pathname,
        link_url: href,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
