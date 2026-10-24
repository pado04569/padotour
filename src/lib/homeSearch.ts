import type { Tour } from "@/data/tours";
import type { Dep } from "./departure";
import { regionKeys, regionLabel } from "./regionNames";
import { departureMap } from "./tourSearch";

/**
 * 첫 화면 검색용 작은 자료 (2026-10-25)
 * 상품 데이터(1.4MB)를 공항 홈 화면에 싣지 않으려고, 서버에서 "출발공항·나라·지역별 상품 수와 출발 가능 날짜"만 추려 보낸다.
 * 날짜는 공통 날짜 목록의 몇 번째인지를 비트로 적어(16진수 글자) 전체 몇 KB 안에 든다.
 * 실제 검색·걸러내기는 /tours 가 하고, 여기 자료는 달력의 초록 점과 고를 수 있는 나라·지역 목록에만 쓴다.
 */
export type SearchMeta = {
  today: string;
  /** 오늘 이후 출발일 전체(정렬) */
  dates: string[];
  /** "인천" / "인천|japan" / "인천|japan|후쿠오카" → 상품 수(n), 출발일 비트(16진수, d) */
  groups: Record<string, { n: number; d: string }>;
  countries: { code: string; label: string }[];
};

export const metaKey = (dep: Dep, country?: string, region?: string) => [dep, country, region].filter(Boolean).join("|");

function depsOf(t: Tour): Dep[] {
  if (t.departure === "both") return ["incheon", "busan"];
  return [t.departure];
}

export function buildSearchMeta(tours: Tour[], countries: { code: string; label: string }[], today: string): SearchMeta {
  const dateSet = new Set<string>();
  for (const t of tours) for (const d of departureMap(t).keys()) if (d >= today) dateSet.add(d);
  const dates = [...dateSet].sort();
  const index = new Map(dates.map((d, i) => [d, i]));
  const bits = new Map<string, { n: number; b: Uint8Array }>();
  const touch = (key: string, tourDates: number[]) => {
    const g = bits.get(key) ?? { n: 0, b: new Uint8Array(Math.ceil(dates.length / 4) || 1) };
    g.n += 1;
    for (const i of tourDates) g.b[i >> 2] |= 1 << (i & 3);
    bits.set(key, g);
  };
  for (const t of tours) {
    const ds = [...departureMap(t).keys()].filter((d) => d >= today).map((d) => index.get(d)!);
    for (const dep of depsOf(t)) {
      touch(metaKey(dep), ds);
      touch(metaKey(dep, t.countryCode), ds);
      for (const r of regionKeys(t.region)) touch(metaKey(dep, t.countryCode, r), ds);
    }
  }
  const groups: SearchMeta["groups"] = {};
  for (const [k, g] of bits) groups[k] = { n: g.n, d: [...g.b].map((x) => x.toString(16)).join("") };
  return { today, dates, groups, countries: countries.filter((c) => c.code !== "all") };
}

/** 그 출발공항·나라·지역에서 출발 가능한 날짜 */
export function availFor(meta: SearchMeta, dep: Dep, country: string, region: string): Set<string> {
  const key = country === "all" ? metaKey(dep) : region ? metaKey(dep, country, region) : metaKey(dep, country);
  const g = meta.groups[key];
  const out = new Set<string>();
  if (!g) return out;
  for (let i = 0; i < g.d.length; i++) {
    const nib = parseInt(g.d[i], 16);
    for (let b = 0; b < 4; b++) if (nib & (1 << b)) { const d = meta.dates[i * 4 + b]; if (d) out.add(d); }
  }
  return out;
}

export function groupCount(meta: SearchMeta, dep: Dep, country?: string, region?: string): number {
  return meta.groups[country && country !== "all" ? metaKey(dep, country, region) : metaKey(dep)]?.n ?? 0;
}

/** 그 출발공항·나라의 지역 칸 목록 — 상품 많은 순 */
export function regionOptionsFor(meta: SearchMeta, dep: Dep, country: string): { key: string; label: string; n: number }[] {
  if (country === "all") return [];
  const prefix = `${metaKey(dep, country)}|`;
  return Object.entries(meta.groups)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, g]) => ({ key: k.slice(prefix.length), label: regionLabel(k.slice(prefix.length)), n: g.n }))
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "ko"));
}
