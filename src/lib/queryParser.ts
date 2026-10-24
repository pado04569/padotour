import type { Tour } from "@/data/tours";
import { isIsoDate, departureMap } from "./tourSearch";

/**
 * 머리말 검색창의 글을 조건으로 바꾼다 — AI 없이 규칙만 (작업지시서 13-E, 2026-10-11)
 *  "11월5일 일본 2명" → 날짜 2026-11-05 · 일본 · 2명
 *  "11/5 일본골프"    → 날짜 · 일본
 *  "11월 5일 후쿠오카 4명" → 날짜 · 후쿠오카(일본) · 4명
 *  "12월 치앙마이"    → 12월 출발 · 치앙마이(태국)
 *  "11월 일본 2명"    → 11월 출발 · 일본 · 2명
 * 연도가 없으면 오늘 기준 가장 가까운 미래로 본다. 달력에 없는 날(2월 30일 등)은 날짜로 단정하지 않는다.
 * 나라·지역은 지금 파는 상품(tours)에 실제로 있는 이름만 알아듣는다. 나머지 글자는 상품명·골프장·호텔에서 찾는다.
 */

export type ParsedQuery = {
  date?: string; // YYYY-MM-DD
  month?: string; // YYYY-MM (날짜 없이 달만 말한 경우)
  country?: string; // countryCode
  region?: string; // 상품 데이터의 지역 이름
  people?: number;
  departure?: "incheon" | "busan" | "cheongju" | "daegu"; // "부산출발 일본"처럼 출발공항을 말한 경우
  keywords: string[]; // 위에 해당하지 않는 나머지 낱말
  understood: string[]; // 화면 안내용 "알아들은 것"
  notes: string[]; // 날짜로 볼 수 없었던 것 등
};

const COUNTRY_NAMES: Record<string, string> = {
  일본: "japan", 중국: "china", 태국: "thailand", 베트남: "vietnam", 말레이시아: "malaysia", 필리핀: "philippines",
};
// 흔히 쓰는 다른 이름 → 상품 데이터의 지역 이름
const REGION_ALIASES: Record<string, string> = {
  하문: "샤먼", 칭다오: "청도", 청다오: "청도", 옌타이: "연태", 웨이하이: "위해", 코타: "코타키나발루",
  하롱: "하롱베이", 나트랑: "나트랑", 냐짱: "나트랑", 북경: "베이징", 천진: "베이징", 인도네시아: "마나도",
  홋카이도: "북해도",
};
// 검색 뜻이 없는 말
const FILLER = /^(골프|골프여행|여행|패키지|상품|투어|출발|가고싶어요|가요|추천|찾기)$/;

const pad = (n: number) => String(n).padStart(2, "0");

function nearestFuture(month: number, day: number | null, today: string): string | null {
  const [ty, tm] = today.split("-").map(Number);
  for (const y of [ty, ty + 1]) {
    if (day === null) {
      if (y === ty && month < tm) continue;
      return `${y}-${pad(month)}`;
    }
    const iso = `${y}-${pad(month)}-${pad(day)}`;
    if (!isIsoDate(iso)) return null;
    if (iso >= today) return iso;
  }
  return null;
}

export function parseQuery(raw: string, today: string, tours: Tour[]): ParsedQuery {
  const out: ParsedQuery = { keywords: [], understood: [], notes: [] };
  let q = ` ${raw.trim()} `;
  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
    const m = q.match(re);
    if (m) { fn(m); q = q.replace(m[0], " "); }
  };

  // 날짜: 2026-11-05 / 11월5일 / 11월 5일 / 11/5 / 11.5
  take(/(20\d\d)[-./](\d{1,2})[-./](\d{1,2})/, (m) => {
    const iso = `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
    if (isIsoDate(iso)) out.date = iso; else out.notes.push(`"${m[0].trim()}"는 달력에 없는 날짜예요`);
  });
  if (!out.date) take(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/, (m) => {
    const d = nearestFuture(+m[1], +m[2], today);
    if (d) out.date = d; else out.notes.push(`"${m[0].trim()}"는 날짜로 볼 수 없어요`);
  });
  if (!out.date) take(/(?<![\d.])(\d{1,2})\s*[/.]\s*(\d{1,2})(?![\d.])/, (m) => {
    const d = +m[1] >= 1 && +m[1] <= 12 ? nearestFuture(+m[1], +m[2], today) : null;
    if (d) out.date = d; else out.notes.push(`"${m[0].trim()}"는 날짜로 볼 수 없어요`);
  });
  // 달만: 12월
  if (!out.date) take(/(\d{1,2})\s*월(?!\s*\d)/, (m) => {
    const mo = +m[1];
    const ym = mo >= 1 && mo <= 12 ? nearestFuture(mo, null, today) : null;
    if (ym) out.month = ym;
  });
  // 출발공항: 인천출발 / 부산출발 / 김해출발 / 부산공항
  take(/(인천|부산|김해|청주|대구)\s*(?:공항)?\s*(?:출발|발)/, (m) => {
    out.departure = m[1] === "인천" ? "incheon" : m[1] === "청주" ? "cheongju" : m[1] === "대구" ? "daegu" : "busan";
  });
  // 인원: 2명 / 4인
  take(/(\d{1,2})\s*(명|인)/, (m) => {
    const n = +m[1];
    if (n >= 1 && n <= 20) out.people = n;
  });

  // 지역: 지금 파는 상품에 실제로 있는 지역 이름만 (긴 이름부터 찾는다 — "하롱베이"가 "하롱"보다 먼저)
  const regionCountry = new Map<string, string>();
  for (const t of tours) for (const r of (t.region || "").split("/").map((s) => s.trim()).filter(Boolean)) if (!regionCountry.has(r)) regionCountry.set(r, t.countryCode);
  const names = [...regionCountry.keys(), ...Object.keys(REGION_ALIASES)].sort((a, b) => b.length - a.length);
  for (const name of names) {
    if (!q.includes(name)) continue;
    const region = REGION_ALIASES[name] && regionCountry.has(REGION_ALIASES[name]) ? REGION_ALIASES[name] : regionCountry.has(name) ? name : undefined;
    if (!region) continue;
    out.region = region;
    out.country = regionCountry.get(region);
    q = q.replace(name, " ");
    break;
  }
  // 나라 — 위 6개 + 상품 데이터에 있는 나라 이름(새 나라 상품이 생기면 저절로 알아듣는다). 괌·사이판처럼 'other'로 묶인 곳은 지역·낱말로 찾는다
  const countryNames: Record<string, string> = { ...COUNTRY_NAMES };
  for (const t of tours) if (t.country && t.countryCode && t.countryCode !== "other" && !countryNames[t.country]) countryNames[t.country] = t.countryCode;
  for (const [name, code] of Object.entries(countryNames).sort((a, b) => b[0].length - a[0].length)) {
    if (!q.includes(name)) continue;
    if (!out.country) out.country = code;
    q = q.replace(name, " ");
  }

  // 나머지 낱말 — "일본골프"처럼 붙은 말에서 떼어낸 "골프" 같은 군말은 버린다
  out.keywords = q
    .split(/\s+/)
    .map((w) => w.replace(/^(골프여행|골프)|(골프여행|골프|여행)$/g, "").trim())
    .filter((w) => w.length >= 2 && !FILLER.test(w));

  if (out.date) { const [, m, d] = out.date.split("-").map(Number); out.understood.push(`${m}월 ${d}일 출발`); }
  if (out.month) out.understood.push(`${+out.month.slice(5)}월 출발`);
  if (out.region) out.understood.push(out.region);
  else if (out.country) out.understood.push(Object.entries(countryNames).find(([, c]) => c === out.country)?.[0] ?? out.country);
  if (out.people) out.understood.push(`${out.people}명`);
  if (out.departure) out.understood.push(out.departure === "incheon" ? "인천출발" : "부산출발");
  for (const k of out.keywords) out.understood.push(`"${k}"`);
  return out;
}

/**
 * 검색창에 이 글을 넣으면 상품이 몇 개 나오는가 — 상품 목록(/tours?search=)과 같은 규칙.
 * 골프장 소개의 해시태그를 검색 링크로 만들 때, 0개가 나오는 낱말은 링크로 만들지 않으려고 쓴다
 * (클래리티 10/6: '#레이크우드CC'를 링크인 줄 알고 3번 누름 → 사장님 안 1 선택 2026-10-13)
 */
export function countSearchResults(raw: string, today: string, tours: Tour[]): number {
  const p = parseQuery(raw, today, tours);
  // "#골프패키지"처럼 거를 조건이 하나도 없으면 전체 목록이 나온다 — 관련 상품이 아니므로 0으로 본다
  if (!p.departure && !p.country && !p.region && !p.month && !p.date && !p.keywords.length) return 0;
  return tours.filter((t) => {
    if (p.departure && t.departure !== p.departure && !(t.departure === "both" && (p.departure === "incheon" || p.departure === "busan"))) return false;
    if (p.country && t.countryCode !== p.country) return false;
    if (p.region) {
      const parts = p.region.split("/").map((x) => x.trim()).filter(Boolean);
      if (!t.region || !(t.region.includes(p.region) || parts.some((x) => t.region!.includes(x)))) return false;
    }
    const dates = [...departureMap(t).keys()];
    if (p.month && !dates.some((d) => d >= today && d.startsWith(p.month!))) return false;
    if (p.date && !dates.includes(p.date)) return false;
    return matchesKeywords(t, p.keywords);
  }).length;
}

/** 나머지 낱말이 상품명·지역·골프장·호텔에 모두 들어 있는가 */
export function matchesKeywords(t: Tour, keywords: string[]): boolean {
  if (!keywords.length) return true;
  const hay = [t.title, t.region, t.country, t.golfCourse, t.hotel, ...(t.seoKeywords ?? [])].join(" ").replace(/\s+/g, "");
  return keywords.every((k) => hay.includes(k.replace(/\s+/g, "")));
}
