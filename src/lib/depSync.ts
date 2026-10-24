// 머리말 ↔ 첫 화면 검색판의 출발공항 표시 동기화 (사장님 지시 2026-10-25)
// 검색판에서 출발공항을 바꾸면 알림을 쏘고, 머리말이 받아 표시를 바꾼다.
// 머리말에서 바꾸면 그 공항 화면으로 이동하므로(기존 라우팅) 자연히 일치한다.
import type { Dep } from "./departure";

const EVENT = "pado:dep-change";

export function announceDep(dep: Dep) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<Dep>(EVENT, { detail: dep }));
}

export function onDepChange(handler: (dep: Dep) => void): () => void {
  const fn = (e: Event) => handler((e as CustomEvent<Dep>).detail);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
