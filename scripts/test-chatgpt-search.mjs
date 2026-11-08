// ChatGPT 유입 구분·출발일 요약 회귀 테스트 — node scripts/test-chatgpt-search.mjs (빌드 전 검사에는 넣지 않는다)
import { detectEntrySource } from "../src/lib/attribution.ts";
import { departureSummary, kstTodayIso } from "../src/lib/tripFacts.ts";

let fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log(`✗ ${name}\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`); }
  else console.log(`✓ ${name}`);
};

// ── 유입 구분: 확인된 것만 ChatGPT로 본다 ──
eq("utm_source=chatgpt.com", detectEntrySource("?utm_source=chatgpt.com", ""), "chatgpt_utm");
eq("utm 대소문자·공백 무시", detectEntrySource("?utm_source=ChatGPT.com", ""), "chatgpt_utm");
eq("리퍼러 chatgpt.com", detectEntrySource("", "https://chatgpt.com/"), "chatgpt_referrer");
eq("리퍼러 chat.openai.com", detectEntrySource("", "https://chat.openai.com/c/abc"), "chatgpt_referrer");
eq("utm 이 리퍼러보다 우선", detectEntrySource("?utm_source=chatgpt.com", "https://chatgpt.com/"), "chatgpt_utm");
eq("출처 없음 → 추정하지 않음", detectEntrySource("", ""), null);
eq("다른 utm → 아님", detectEntrySource("?utm_source=naver", ""), null);
eq("비슷한 도메인 → 아님", detectEntrySource("", "https://notchatgpt.com/"), null);
eq("엉터리 리퍼러 → 오류 없이 null", detectEntrySource("", "not a url"), null);

// ── 한국 날짜 ──
eq("UTC 14:59 = 한국 23:59 같은 날", kstTodayIso(new Date("2026-11-08T14:59:00Z")), "2026-11-08");
eq("UTC 15:00 = 한국 다음날 0시", kstTodayIso(new Date("2026-11-08T15:00:00Z")), "2026-11-09");

// ── 최저가·만료 ──
const base = { id: "t", departurePrices: [
  { date: "2026-11-10", price: 700000 },
  { date: "2026-11-20", price: 800000 },
] };
const now = new Date("2026-11-08T03:00:00Z");
eq("남은 출발일 중 최저가", departureSummary(base, now)?.lowPrice, 700000);
eq("싼 날짜가 지나면 다음 최저가", departureSummary(base, new Date("2026-11-12T03:00:00Z"))?.lowPrice, 800000);
eq("전부 지나면 요약 없음(현재 최저가로 표시 안 함)", departureSummary(base, new Date("2026-12-01T03:00:00Z")), undefined);
eq("요금표 없음 → 요약 없음(0원으로 대체 안 함)", departureSummary({ id: "x" }, now), undefined);
eq("출발 당일은 아직 남은 것으로 본다", departureSummary(base, new Date("2026-11-10T00:30:00Z"))?.cheapestDate, "2026-11-10");

console.log(fail ? `\n실패 ${fail}건` : "\n모두 통과");
process.exit(fail ? 1 : 0);
