// 지도 자료(/geo/world-map.json) 내려받기 — 한 번만 받아 여러 지도 부품이 나눠 쓴다 (2026-10-25)
export type GeoData = { w: number; h: number; back: string; focus: { code: string; d: string }[] };

let promise: Promise<GeoData> | null = null;
export function loadGeo(): Promise<GeoData> {
  promise ??= fetch("/geo/world-map.json").then((r) => {
    if (!r.ok) { promise = null; throw new Error(String(r.status)); }
    return r.json();
  });
  return promise;
}
