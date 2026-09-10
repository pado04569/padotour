"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * 상품 공유 버튼
 *
 * 모바일: 휴대폰 기본 공유 시트를 띄운다(카카오톡·문자·메일 전부 여기서 고를 수 있다).
 * PC: 공유 시트가 없으므로 주소를 클립보드에 복사한다.
 *
 * 고객이 "이 상품 괜찮다"고 지인에게 보내는 경로 — 유입을 만드는 버튼이라 클릭을 기록한다.
 */
export default function ShareButton({
  title,
  itemId,
  className = "",
}: {
  title: string;
  itemId: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

    // 휴대폰 기본 공유 시트 (지원되는 기기에서만)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        track("share", { method: "native", item_id: itemId, item_name: title });
        return;
      } catch {
        // 사용자가 공유창을 닫은 경우 — 아무 일도 하지 않는다
        return;
      }
    }

    // PC 등 공유 시트가 없는 환경 → 주소 복사
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share", { method: "copy", item_id: itemId, item_name: title });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드가 막힌 환경(구형 브라우저 등)에서는 주소를 선택할 수 있게 보여준다
      window.prompt("아래 주소를 복사해 주세요", url);
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="이 상품 공유하기"
      className={`inline-flex items-center justify-center gap-1.5 font-bold transition-colors ${className}`}
    >
      {copied ? (
        <>
          <span aria-hidden>✅</span>
          주소 복사됨
        </>
      ) : (
        <>
          <span aria-hidden>🔗</span>
          공유하기
        </>
      )}
    </button>
  );
}
