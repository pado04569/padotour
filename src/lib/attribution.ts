/**
 * ChatGPT 유입 구분 (2026-11-08 작업지시서)
 *
 * - utm_source=chatgpt.com  → "chatgpt_utm"      (ChatGPT가 링크에 직접 붙이는 표시)
 * - 리퍼러가 chatgpt.com / chat.openai.com → "chatgpt_referrer"
 * - 둘 다 없으면 아무것도 저장하지 않는다 (출처를 추정으로 ChatGPT에 넣지 않는다)
 *
 * 이 값은 "이 방문(세션)을 시작한 출처"다. GA4가 기본으로 저장하는 '처음 획득한 출처'
 * (firstUserSource)와 섞지 않으려고 sessionStorage 에만 두고, 한 번 정해지면 덮어쓰지 않는다.
 * 개인정보는 없다 — 출처 이름과 처음 열린 주소의 경로(? 뒤는 버림)만 쓴다.
 */

const KEY = "pado_entry";

export type EntrySource = "chatgpt_utm" | "chatgpt_referrer";
type Entry = { source: EntrySource; landing: string };

const CHATGPT_HOSTS = new Set(["chatgpt.com", "www.chatgpt.com", "chat.openai.com"]);

/** 순수 함수 — 테스트하기 쉽게 분리 */
export function detectEntrySource(search: string, referrer: string): EntrySource | null {
  const utm = new URLSearchParams(search).get("utm_source")?.trim().toLowerCase();
  if (utm === "chatgpt.com") return "chatgpt_utm";
  if (referrer) {
    try {
      if (CHATGPT_HOSTS.has(new URL(referrer).hostname.toLowerCase())) return "chatgpt_referrer";
    } catch {
      /* 잘못된 리퍼러는 무시 */
    }
  }
  return null;
}

/** 페이지가 처음 열릴 때 한 번 부른다. 이미 정해진 세션이면 아무것도 바꾸지 않는다 */
export function captureEntry(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return;
    const source = detectEntrySource(window.location.search, document.referrer);
    if (!source) return;
    sessionStorage.setItem(KEY, JSON.stringify({ source, landing: window.location.pathname } satisfies Entry));
  } catch {
    /* 저장소가 막힌 브라우저에서는 조용히 건너뛴다 */
  }
}

/** 이벤트에 덧붙일 값 — ChatGPT로 시작한 세션일 때만 있다 */
export function entryParams(): { entry_source?: string; entry_landing?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    const e = JSON.parse(raw) as Entry;
    return { entry_source: e.source, entry_landing: e.landing };
  } catch {
    return {};
  }
}
