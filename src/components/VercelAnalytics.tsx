"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

const KEY = "va-disabled";

/**
 * Vercel Web Analytics 래퍼.
 * 내 PC를 집계에서 빼기 위한 스위치를 제공한다.
 *  - https://www.padotour.com/?va-off=1  → 이 브라우저를 집계 제외
 *  - https://www.padotour.com/?va-on=1   → 다시 집계 포함
 * 설정은 이 브라우저에만 저장되며(localStorage), 방문자에게는 아무 영향이 없다.
 */
export default function VercelAnalytics() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("va-off") === "1") {
        localStorage.setItem(KEY, "1");
        setToast("이 브라우저는 Vercel 집계에서 제외됩니다");
      } else if (p.get("va-on") === "1") {
        localStorage.removeItem(KEY);
        setToast("이 브라우저를 다시 집계에 포함합니다");
      }
    } catch {
      // 시크릿 모드 등 localStorage 사용 불가 — 무시
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <Analytics
        beforeSend={(event) => {
          try {
            if (localStorage.getItem(KEY) === "1") return null;
          } catch {
            // 접근 불가 시 정상 전송
          }
          return event;
        }}
      />
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg">
          ✓ {toast}
        </div>
      )}
    </>
  );
}
