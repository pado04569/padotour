import type { Tour } from "@/data/tours";
import { stayText } from "./stay";

/**
 * 출발일로 상품 찾기 (UX 개편 6단계, 2026-10-10 사장님 확정)
 *
 * 원칙: 실제 출발일 자료(departurePrices, holePriceTiers[].dates)만 쓴다.
 * period 같은 설명 글로 "이날 갈 수 있을 것 같다"고 추측하지 않는다.
 */

export type SortKey = "recommend" | "date" | "price";

const pad = (n: number) => String(n).padStart(2, "0");

/** 브라우저 현지 날짜 YYYY-MM-DD (toISOString 은 UTC라 새벽에 하루 밀린다) */
export function localIso(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isIsoDate(s: string | null | undefined): s is string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

const WEEK = "일월화수목금토";
/** "11월 5일 (목)" / short: "11/5" */
export function dateLabel(iso: string, style: "long" | "short" | "plain" = "long"): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (style === "short") return `${m}/${d}`;
  if (style === "plain") return `${m}월 ${d}일`;
  return `${m}월 ${d}일(${WEEK[new Date(y, m - 1, d).getDay()]})`;
}

/** 상품의 실제 출발일 → 그날 요금(같은 날 여러 요금이면 가장 낮은 값) */
export function departureMap(t: Tour): Map<string, number> {
  const m = new Map<string, number>();
  const put = (date: string, price: number) => {
    if (!isIsoDate(date) || !(price > 0)) return;
    const prev = m.get(date);
    if (prev === undefined || price < prev) m.set(date, price);
  };
  for (const dp of t.departurePrices ?? []) put(dp.date, dp.price);
  for (const tier of t.holePriceTiers ?? []) for (const d of tier.dates ?? []) put(d, tier.price);
  return m;
}

/** 최소 출발 인원 — 숫자 또는 "4인 (…)"처럼 '인'으로 시작하는 글만 인정. "24명 (선착순)" 같은 건 모집 인원이라 쓰지 않는다 */
export function minPeopleOf(t: Tour): number | null {
  const v = t.minPeople as unknown;
  if (typeof v === "number" && v > 0) return v;
  const m = String(v ?? "").trim().match(/^(\d+)\s*인/);
  return m ? Number(m[1]) : null;
}

function roundsLabel(r: unknown): string | null {
  const s = String(r ?? "").trim();
  if (!s) return null;
  if (/무제한/.test(s)) return "무제한 라운드";
  if (/홀/.test(s)) return s;
  return `${s.replace(/회$/, "")}라운드`;
}

/** 총 홀수 — 자료에 분명히 적힌 경우만. 애매하면 라운드 수로 보여준다 */
export function holesLabel(t: Tour): string | null {
  const raw = String(t.holes ?? "").trim();
  const first = raw.split("\n")[0].trim();
  const rounds = Number(t.roundsIncluded);
  let m: RegExpMatchArray | null;
  if (/^\d+$/.test(raw)) return `${raw}홀`;
  if ((m = raw.match(/총\s*(\d+)\s*홀/))) return `${m[1]}홀`;
  if ((m = first.match(/^(\d+)\s*홀\s*[x×]\s*(\d+)\s*회/))) return `${Number(m[1]) * Number(m[2])}홀`;
  if ((m = first.match(/^(\d+)\s*홀\s*\(\s*(\d+)\s*홀\s*[x×]\s*(\d+)\s*회\s*\)$/)) && Number(m[1]) === Number(m[2]) * Number(m[3])) return `${m[1]}홀`;
  if ((m = first.match(/^(\d+)\s*홀$/)) && rounds > 0 && Number(m[1]) === rounds * 18) return `${m[1]}홀`;
  return roundsLabel(t.roundsIncluded);
}

/** 카드 비교용 칩: [3박4일] [54홀] [4인부터] — 자료에서 확인되는 값만 */
export function tourFacts(t: Tour): { label: string; strong?: boolean }[] {
  const out: { label: string; strong?: boolean }[] = [];
  const stay = stayText(t.nights, t.days);
  if (stay) out.push({ label: stay });
  const holes = holesLabel(t);
  if (holes) out.push({ label: holes });
  const min = minPeopleOf(t);
  if (min) out.push({ label: `${min}인부터`, strong: min > 2 });
  return out;
}

/** 오늘 이후 가장 빠른 출발일 */
export function nextDeparture(t: Tour, today: string): string | null {
  let best: string | null = null;
  for (const d of departureMap(t).keys()) if (d >= today && (!best || d < best)) best = d;
  return best;
}

/** 오늘 이후 최저 요금 (출발일 자료가 없으면 표시 요금 글에서 숫자) */
export function lowestPrice(t: Tour, today: string): number | null {
  let low: number | null = null;
  for (const [d, p] of departureMap(t)) if (d >= today && (low === null || p < low)) low = p;
  if (low !== null) return low;
  const n = Number((t.price.match(/[\d,]+/)?.[0] ?? "").replace(/,/g, ""));
  return n > 0 ? n : null;
}

/** 이 상품들 중 출발 가능한 날짜(오늘 이후) 전체 */
export function availableDates(list: Tour[], today: string): Set<string> {
  const s = new Set<string>();
  for (const t of list) for (const d of departureMap(t).keys()) if (d >= today) s.add(d);
  return s;
}

/** 두 날짜(YYYY-MM-DD) 사이의 날수 — b가 a보다 뒤면 +, 앞이면 − (현지 자정 기준, 서머타임 영향 없게 반올림) */
export function dayDiff(a: string, b: string): number {
  const t = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d).getTime(); };
  return Math.round((t(b) - t(a)) / 86400000);
}

export type NearDate = { date: string; diff: number };

/**
 * 가까운 출발일 — 선택 날짜 전후 days일(기본 7일) 안의 "실제 출발일"만 (사장님 지시 2026-10-10)
 * 목적: 하이난 "수·금 3박4일 / 토·월 4박5일"처럼 정해진 항공 요일을 고객이 자연스럽게 알아보게 한다.
 * - 범위 밖 날짜는 억지로 보여주지 않는다(빈 배열이면 화면에서 "전후 7일에는 없습니다" + 카카오 상담).
 * - 순서: 선택일과 가까운 순, 같은 거리면 미래(이후) 날짜 먼저. 예) 11/5 → 11/6, 11/3, 11/8, 11/10
 * - diff(+는 이후, −는 이전)와 count(그날 출발 가능 상품 수)는 버튼 글자와 같은 값.
 */
export function datesWithin(list: Tour[], target: string, today: string, days = 7): (NearDate & { count: number })[] {
  const count = new Map<string, number>();
  for (const t of list) {
    for (const d of departureMap(t).keys()) {
      if (d < today || d === target || Math.abs(dayDiff(target, d)) > days) continue;
      count.set(d, (count.get(d) ?? 0) + 1);
    }
  }
  return [...count.entries()]
    .map(([date, c]) => ({ date, diff: dayDiff(target, date), count: c }))
    .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff) || b.diff - a.diff);
}

/**
 * 화면에 보여줄 가까운 출발일 최대 n개(기본 4) — 전후가 한쪽으로 치우치지 않게 (사장님 지시 10/10)
 * 이후·이전을 각각 가까운 순으로 n/2개씩 고르고, 한쪽이 모자라면 다른 쪽에서 채운다.
 * 결과는 다시 "가까운 순, 같은 거리면 이후 먼저". 예) 11/10 → 11/11(+1) 11/9(−1) 11/13(+3) 11/7(−3)
 * 실제 출발일만 쓰고, 모자라도 가짜 날짜로 채우지 않는다.
 */
export function pickBalanced<T extends NearDate>(dates: T[], n = 4): T[] {
  const byDist = (a: T, b: T) => Math.abs(a.diff) - Math.abs(b.diff) || b.diff - a.diff;
  const after = dates.filter((d) => d.diff > 0).sort(byDist);
  const before = dates.filter((d) => d.diff < 0).sort(byDist);
  const half = Math.floor(n / 2);
  let a = Math.min(after.length, half);
  let b = Math.min(before.length, n - a);
  a = Math.min(after.length, n - b);
  b = Math.min(before.length, n - a);
  return [...after.slice(0, a), ...before.slice(0, b)].sort(byDist);
}

export function sortTours(list: Tour[], sort: SortKey, today: string, date?: string): Tour[] {
  if (sort === "recommend") return list;
  const key = (t: Tour): string | number | null =>
    sort === "date" ? nextDeparture(t, date ?? today) : (date ? departureMap(t).get(date) ?? null : lowestPrice(t, today));
  // 값이 없는 상품은 뒤로, 같으면 원래(추천) 순서
  return list
    .map((t, i) => ({ t, i, k: key(t) }))
    .sort((a, b) => {
      if (a.k === null && b.k === null) return a.i - b.i;
      if (a.k === null) return 1;
      if (b.k === null) return -1;
      return a.k < b.k ? -1 : a.k > b.k ? 1 : a.i - b.i;
    })
    .map((x) => x.t);
}
