import type { Tour } from "@/data/tours";
import { regionGuides } from "@/lib/regionGuides";

/**
 * 출발일이 모두 끝난 상품 주소를 어디로 보낼지 정한다 (사장님 결정 2026-10-13 — 404로 두지 않는다)
 *  ① 그 지역 안내 페이지(/guide/<slug>)가 있으면 그곳
 *  ② 없으면 같은 지역의 지금 파는 상품 목록 (/tours?country=…&region=…)
 *     그 지역에 파는 상품이 하나도 없으면 같은 나라 목록 — 관련 없는 나라로는 보내지 않는다
 *  ③ 지역·나라를 모를 때만 전체 상품 목록
 * 지역별 예외를 두지 않는다. 안내 페이지가 새로 생기면(regionGuides) 저절로 ①을 탄다.
 */
export function endedTourTarget(ended: Tour, active: Tour[]): string {
  const regionParts = (ended.region || "").split("/").map((s) => s.trim()).filter(Boolean);

  const guide = regionGuides.find((g) => regionParts.some((r) => r.includes(g.regionKey)));
  if (guide) return `/guide/${guide.slug}`;

  if (regionParts.length && ended.countryCode) {
    const sameRegion = active.filter(
      (t) => t.countryCode === ended.countryCode && t.region && regionParts.some((r) => t.region!.includes(r)),
    );
    if (sameRegion.length) {
      const q = new URLSearchParams({ country: ended.countryCode, region: ended.region! });
      // 같은 출발공항 상품이 그 지역에 있으면 출발지도 이어 준다.
      // 지역 이름이 똑같은 상품을 먼저 본다 — 괌(인천)이 끝났을 때 '괌/사이판' 인천 상품만 남아 정작 괌 상품이 걸러지지 않게
      const exact = sameRegion.filter((t) => t.region === ended.region);
      const pool = exact.length ? exact : sameRegion;
      const dep = ended.departure;
      if (dep !== "both" && pool.some((t) => t.departure === dep || (t.departure === "both" && (dep === "incheon" || dep === "busan")))) q.set("departure", dep);
      return `/tours?${q.toString()}`;
    }
  }

  if (ended.countryCode && active.some((t) => t.countryCode === ended.countryCode)) return `/tours?country=${ended.countryCode}`;
  return "/tours";
}
