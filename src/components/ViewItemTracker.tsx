"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * 상품 상세 페이지 진입을 1회 기록한다.
 * 상세 페이지는 서버 컴포넌트라 이 작은 클라이언트 컴포넌트로 대신 보낸다.
 * 개인정보는 보내지 않는다 — 상품 정보만.
 */
export default function ViewItemTracker({
  itemId,
  itemName,
  country,
  region,
}: {
  itemId: string;
  itemName: string;
  country?: string;
  region?: string;
}) {
  useEffect(() => {
    track("view_item", {
      item_id: itemId,
      item_name: itemName,
      country,
      region,
    });
    // itemId 가 바뀔 때(= 다른 상품으로 이동)만 다시 보낸다
  }, [itemId, itemName, country, region]);

  return null;
}
