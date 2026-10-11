"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

/**
 * 주소 뒤 조건(?departure=…)을 머리말·꼬리말에서 읽기 위한 작은 저장소.
 *
 * 예전에는 ClientLayout 이 useSearchParams 를 직접 쓰고 화면 전체를 <Suspense> 로 감쌌다.
 * 그러면 미리 만들어 두는 페이지(상품 상세·골프장 소개 등)가 서버 HTML 에 본문 없이
 * "브라우저에서 그리기(BAILOUT_TO_CLIENT_SIDE_RENDERING)" 로 나가 검색·AI 로봇이 본문을 못 읽었다 (SEO 감사 2026-10-11).
 *
 * 이제 useSearchParams 는 아무것도 그리지 않는 <QuerySync /> 하나만 쓰고(그것만 Suspense 안),
 * 나머지는 이 저장소에서 읽는다. 서버와 첫 화면은 빈 조건으로 같게 그린 뒤, 브라우저에서 바로 채운다.
 */
let current = "";
const subs = new Set<() => void>();

function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function QuerySync() {
  const sp = useSearchParams();
  const s = sp.toString();
  useEffect(() => {
    if (s !== current) {
      current = s;
      subs.forEach((f) => f());
    }
  }, [s]);
  return null;
}

export function useQuery(): URLSearchParams {
  const s = useSyncExternalStore(subscribe, () => current, () => "");
  return useMemo(() => new URLSearchParams(s), [s]);
}
