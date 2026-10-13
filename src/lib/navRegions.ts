import { tours } from "@/data/tours";

// 상단 메뉴의 나라별 지역 목록 — 상품 데이터에서 자동으로 만든다 (사장님 지시 2026-10-13).
// 예전에는 손으로 적어 광저우·파타야처럼 상품이 있는데 메뉴에 없는 지역이 생겼다.
// 서버(layout)에서 계산해 작은 목록만 넘긴다 — 상품 데이터(1.4MB)를 매 화면 머리말에 싣지 않게.
// 출발일이 모두 지난 상품은 세지 않는다(출발일 정보가 없는 상품은 센다). 계산 시점은 배포할 때다.

export type NavRegion = { region: string; label: string; incheon: number; busan: number };
export type NavRegions = Record<string, NavRegion[]>;

// 메뉴에 보일 이름 (데이터 지역 이름 → 메뉴 이름). 없으면 지역 이름 그대로
const LABELS: Record<string, string> = {
  샤먼: "샤먼(하문)",
  청도: "청도(칭다오)",
  하이난: "하이난(해남도)",
  마나도: "마나도(인도네시아)",
};

// 메뉴에서 한 칸으로 합칠 지역 (데이터 지역 이름 → 메뉴 칸). 칸 주소의 "방콕/파타야" 는 /tours 에서 둘 중 하나만 맞아도 보여 준다
export const REGION_MERGE: Record<string, string> = {
  방콕: "방콕/파타야",
  파타야: "방콕/파타야",
}; // 사장님 지시 2026-10-13

export function buildNavRegions(): NavRegions {
  const today = new Date().toISOString().slice(0, 10);
  const map = new Map<string, Map<string, NavRegion>>();
  for (const t of tours) {
    if (!t.region || !t.countryCode) continue;
    const ds = (t.departurePrices ?? []).map((d) => d.date);
    if (ds.length > 0 && !ds.some((d) => d >= today)) continue;
    const byCountry = map.get(t.countryCode) ?? new Map<string, NavRegion>();
    const key = REGION_MERGE[t.region] ?? t.region;
    const r = byCountry.get(key) ?? { region: key, label: LABELS[key] ?? key, incheon: 0, busan: 0 };
    if (t.departure === "incheon" || t.departure === "both") r.incheon++;
    if (t.departure === "busan" || t.departure === "both") r.busan++;
    byCountry.set(key, r);
    map.set(t.countryCode, byCountry);
  }
  const out: NavRegions = {};
  for (const [code, regions] of map) {
    // 상품이 많은 지역부터
    out[code] = [...regions.values()].sort((a, b) => b.incheon + b.busan - (a.incheon + a.busan) || a.label.localeCompare(b.label, "ko"));
  }
  return out;
}
