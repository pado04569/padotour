// 나라별 골프장 페이지의 "지역 위치" 보조 지도 데이터 (UX 개편 2026-10-09, 사장님 확정: 기본 M1 · 선택 시 M2)
// 정밀 지도가 아니다 — "후쿠오카·마쓰야마·도쿄가 어느 쪽인지" 감을 잡게 하는 단순 윤곽 + 지역 점.
// 좌표는 대략적인 위경도를 화면 좌표로 바꾼 것. 새 지역이 courses.json 에 생기면 여기 점을 추가해야 지도에 나온다.

export type MapLabelSide = { dx: number; dy: number; anchor: "start" | "middle" | "end" };
export type MapRegion = { x: number; y: number; area: string; label: MapLabelSide };
export type MapArea = { d: string; inset?: boolean }; // SVG path (여러 섬은 M 으로 이어 붙인다)
export type CountryMap = {
  title: string;
  width: number;
  height: number;
  areas: Record<string, MapArea>;
  insets: { area: string; x: number; y: number; w: number; h: number; title: string }[];
  regions: Record<string, MapRegion>;
};

// ── 일본: 서일본(규슈~도쿄) 확대 + 북쪽(북해도·아오모리)·남쪽 섬(오키나와) 작은 상자
const JK = 40, JYS = 1.22, JLON0 = 128.0, JLAT0 = 36.7, JPADY = 6;
const jx = (lon: number) => (lon - JLON0) * JK;
const jy = (lat: number) => JPADY + (JLAT0 - lat) * JK * JYS;
const NB = { x: 6, y: 6, w: 140, h: 100 }, NK = 9;
const nx = (lon: number) => NB.x + 30 + (lon - 139.6) * NK;
const ny = (lat: number) => NB.y + 22 + (45.6 - lat) * NK * JYS;
const OB = { x: 374, y: 196, w: 118, h: 96 };
const poly = (arr: number[][], fx: (n: number) => number, fy: (n: number) => number) =>
  "M" + arr.map(([lo, la]) => `${fx(lo).toFixed(1)},${fy(la).toFixed(1)}`).join(" L") + " Z";
const side = (dx: number, dy: number, anchor: MapLabelSide["anchor"]): MapLabelSide => ({ dx, dy, anchor });
const R = side(10, 6, "start"), L = side(-10, 6, "end"), T = side(0, -12, "middle"), B = side(0, 25, "middle");

const JAPAN: CountryMap = {
  title: "일본",
  width: 500,
  height: 300,
  areas: {
    kyushu: { d: poly([[129.8,33.5],[130.4,33.9],[131.0,33.95],[131.5,33.6],[131.7,33.2],[132.0,32.8],[131.7,32.4],[131.45,31.5],[131.1,31.3],[130.7,31.0],[130.2,31.2],[130.3,31.7],[130.1,32.2],[130.6,32.6],[130.2,32.8],[129.8,32.7],[129.6,33.1]], jx, jy) },
    shikoku: { d: poly([[132.4,33.0],[132.7,33.4],[132.9,34.0],[133.5,34.4],[134.3,34.35],[134.7,34.2],[134.7,33.8],[134.2,33.3],[133.6,33.5],[133.0,32.75],[132.6,32.75]], jx, jy) },
    honshu: { d: poly([[130.9,34.0],[131.3,34.4],[132.2,35.0],[133.0,35.5],[134.0,35.55],[135.2,35.7],[136.0,35.9],[136.7,36.8],[137.3,37.5],[138.5,37.4],[139.5,38.4],[141.0,37.9],[140.9,36.9],[140.6,36.0],[140.9,35.7],[140.0,35.0],[139.8,35.3],[139.2,35.2],[138.8,34.6],[138.2,34.6],[137.0,34.6],[136.8,34.3],[136.2,33.5],[135.8,33.45],[135.1,34.2],[135.3,34.6],[134.3,34.7],[133.0,34.4],[132.2,34.2],[131.0,33.9]], jx, jy) },
    north: { inset: true, d: poly([[140.0,41.5],[140.5,41.8],[140.2,42.3],[139.8,42.6],[140.4,43.3],[141.3,43.2],[141.6,43.9],[141.7,45.3],[142.0,45.5],[143.0,44.6],[144.4,44.0],[145.3,44.3],[145.6,43.3],[144.8,43.0],[143.3,42.0],[142.0,42.4],[141.0,42.3],[140.9,41.8]], nx, ny) + " " + poly([[139.9,40.6],[140.3,41.2],[141.4,41.4],[141.5,40.5],[141.9,39.8],[140.2,39.8]], nx, ny) },
    okinawa: { inset: true, d: `M${OB.x + 46},${OB.y + 76} L${OB.x + 58},${OB.y + 64} L${OB.x + 68},${OB.y + 48} L${OB.x + 74},${OB.y + 52} L${OB.x + 64},${OB.y + 68} L${OB.x + 52},${OB.y + 80} Z` },
  },
  insets: [
    { area: "north", ...NB, title: "북쪽 (축소)" },
    { area: "okinawa", ...OB, title: "남쪽 섬" },
  ],
  regions: {
    후쿠오카: { x: jx(130.4), y: jy(33.6), area: "kyushu", label: L },
    야마구치: { x: jx(131.5), y: jy(34.25), area: "honshu", label: side(-9, 4, "end") },
    벳부: { x: jx(131.38), y: jy(33.45), area: "kyushu", label: side(9, -3, "start") },
    오이타: { x: jx(131.78), y: jy(33.18), area: "kyushu", label: side(9, 16, "start") },
    구마모토: { x: jx(130.7), y: jy(32.8), area: "kyushu", label: L },
    미야자키: { x: jx(131.4), y: jy(31.9), area: "kyushu", label: R },
    가고시마: { x: jx(130.6), y: jy(31.6), area: "kyushu", label: L },
    마쓰야마: { x: jx(132.8), y: jy(33.8), area: "shikoku", label: side(10, 7, "start") },
    다카마쓰: { x: jx(134.0), y: jy(34.3), area: "shikoku", label: T },
    오사카: { x: jx(135.5), y: jy(34.7), area: "honshu", label: T },
    나고야: { x: jx(136.9), y: jy(35.2), area: "honshu", label: T },
    시즈오카: { x: jx(138.4), y: jy(35.0), area: "honshu", label: B },
    도쿄: { x: jx(139.7), y: jy(35.7), area: "honshu", label: T },
    북해도: { x: nx(141.4), y: ny(43.0), area: "north", label: side(10, 0, "start") },
    아오모리: { x: nx(140.7), y: ny(40.8), area: "north", label: side(10, 12, "start") },
    오키나와: { x: OB.x + 60, y: OB.y + 62, area: "okinawa", label: B },
  },
};

// 나라 코드 → 지도. 아직 그리지 않은 나라는 지도 없이 지역 버튼만 보인다.
export const REGION_MAPS: Record<string, CountryMap> = {
  japan: JAPAN,
};
