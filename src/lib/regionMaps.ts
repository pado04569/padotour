// 나라별 골프장 페이지의 "지역 위치" 보조 지도 데이터 (UX 개편 2026-10-09, 사장님 확정: 기본 M1 · 선택 시 M2)
// 정밀 지도가 아니다 — "후쿠오카·마쓰야마·도쿄가 어느 쪽인지" 감을 잡게 하는 단순 윤곽 + 지역 점.
// 좌표는 대략적인 위경도를 화면 좌표로 바꾼 것. 새 지역이 courses.json 에 생기면 여기 점을 추가해야 지도에 나온다.

export type MapLabelSide = { dx: number; dy: number; anchor: "start" | "middle" | "end" };
export type MapRegion = { x: number; y: number; area: string; label: MapLabelSide };
export type MapArea = {
  d: string; // SVG path (여러 섬은 M 으로 이어 붙인다)
  inset?: boolean; // 작은 상자 안에 그리는 영역
  noHighlight?: boolean; // 나라 본토처럼 칠하면 의미가 없는 넓은 영역 — 점만 강조
  context?: boolean; // 위치 감 잡기용 이웃 나라(예: 한국) — 흐린 회색, 누를 수 없음
};
export type CountryMap = {
  title: string;
  width: number;
  height: number;
  areas: Record<string, MapArea>;
  insets: { area: string; x: number; y: number; w: number; h: number; title: string }[];
  regions: Record<string, MapRegion>;
  contextLabels?: { x: number; y: number; text: string }[];
  displayMaxWidth?: number; // 세로로 긴 나라는 화면 폭을 줄여 너무 커지지 않게(px)
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
    // 혼슈는 너무 커서 칠하면 오사카를 골라도 도쿄까지 오사카처럼 보인다 → 점만 강조 (사장님 확정 10/9)
    honshu: { noHighlight: true, d: poly([[130.9,34.0],[131.3,34.4],[132.2,35.0],[133.0,35.5],[134.0,35.55],[135.2,35.7],[136.0,35.9],[136.7,36.8],[137.3,37.5],[138.5,37.4],[139.5,38.4],[141.0,37.9],[140.9,36.9],[140.6,36.0],[140.9,35.7],[140.0,35.0],[139.8,35.3],[139.2,35.2],[138.8,34.6],[138.2,34.6],[137.0,34.6],[136.8,34.3],[136.2,33.5],[135.8,33.45],[135.1,34.2],[135.3,34.6],[134.3,34.7],[133.0,34.4],[132.2,34.2],[131.0,33.9]], jx, jy) },
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


// ── 중국: 동부(베이징~샤먼) + 하이난 작은 상자, 위치 감을 위해 한국을 흐리게 함께
const CK = 22, CYS = 1.18, CLON0 = 107.5, CLAT0 = 41.6, CPADY = 4;
const cx = (lon: number) => (lon - CLON0) * CK;
const cy = (lat: number) => CPADY + (CLAT0 - lat) * CK * CYS;
const HB = { x: 372, y: 368, w: 120, h: 100 };
const hx = (lon: number) => HB.x + 22 + (lon - 108.5) * 26;
const hy = (lat: number) => HB.y + 28 + (20.2 - lat) * 26 * CYS;

const CHINA: CountryMap = {
  title: "중국",
  width: 500,
  height: 480,
  areas: {
    mainland: {
      noHighlight: true,
      d: poly([[107.5,41.6],[126.0,41.6],[124.3,40.0],[123.0,39.6],[121.6,38.85],[121.2,39.5],[121.9,40.7],[121.0,40.9],[119.5,39.9],[118.5,39.1],[117.7,38.9],[118.0,38.2],[118.9,37.6],[119.1,37.2],[119.9,37.25],[120.7,37.8],[121.5,37.5],[122.6,37.4],[122.4,36.9],[121.0,36.6],[120.3,36.0],[119.3,35.1],[119.4,34.5],[120.3,34.3],[120.9,33.0],[121.9,31.8],[121.9,30.9],[121.4,30.3],[122.0,29.9],[121.6,28.8],[121.2,28.0],[120.6,27.3],[119.6,26.4],[119.6,25.5],[118.6,24.6],[117.8,24.1],[116.6,23.3],[115.4,22.8],[114.2,22.3],[113.5,22.2],[112.5,21.8],[111.0,21.4],[110.3,20.4],[109.7,21.4],[109.0,21.6],[107.5,21.6]], cx, cy),
    },
    korea: {
      context: true,
      d: poly([[124.3,40.0],[126.0,41.6],[129.8,41.6],[129.7,40.8],[128.3,40.0],[127.5,39.5],[128.6,38.0],[129.4,36.5],[129.4,35.5],[129.0,35.1],[128.5,34.9],[127.5,34.6],[126.3,34.6],[126.5,35.5],[126.3,36.5],[126.6,37.5],[125.2,38.5],[124.4,39.6]], cx, cy),
    },
    hainan: { inset: true, d: poly([[108.6,19.1],[108.7,19.7],[109.5,20.1],[110.4,20.1],[111.0,19.6],[110.5,18.7],[109.6,18.2],[108.9,18.4]], hx, hy) },
  },
  insets: [{ area: "hainan", ...HB, title: "남쪽 섬" }],
  contextLabels: [{ x: cx(127.6), y: cy(36.6), text: "한국" }],
  regions: {
    베이징: { x: cx(116.4), y: cy(39.9), area: "mainland", label: T },
    위해: { x: cx(122.1), y: cy(37.45), area: "mainland", label: R },
    연태: { x: cx(121.45), y: cy(37.55), area: "mainland", label: side(-9, -6, "end") },
    청도: { x: cx(120.4), y: cy(36.1), area: "mainland", label: B },
    곡부: { x: cx(117.0), y: cy(35.6), area: "mainland", label: L },
    장가계: { x: cx(110.5), y: cy(29.1), area: "mainland", label: B },
    푸저우: { x: cx(119.3), y: cy(26.1), area: "mainland", label: R },
    샤먼: { x: cx(118.1), y: cy(24.5), area: "mainland", label: R },
    광저우: { x: cx(113.26), y: cy(23.13), area: "mainland", label: L },
    하이난: { x: hx(109.8), y: hy(19.2), area: "hainan", label: B },
  },
};


// ── 태국: 북부(치앙마이) ~ 방콕·파타야·후아힌 (남부 반도 아래쪽은 자름)
const TK = 42, TLON0 = 96.6, TLAT0 = 20.7;
const tx = (lon: number) => 10 + (lon - TLON0) * TK;
const ty = (lat: number) => 6 + (TLAT0 - lat) * TK * 1.02;
const THAILAND: CountryMap = {
  title: "태국",
  width: 400,
  height: 470,
  areas: {
    mainland: {
      noHighlight: true,
      d: poly([[99.9,20.4],[100.5,20.2],[100.6,19.5],[101.3,19.6],[101.0,17.9],[102.1,18.2],[103.0,17.9],[104.0,17.4],[104.7,17.1],[104.8,16.0],[105.6,15.7],[105.5,14.4],[103.0,14.3],[102.4,13.6],[102.3,12.2],[101.6,12.6],[100.9,12.7],[100.95,13.4],[100.6,13.5],[100.0,13.4],[99.95,12.6],[99.6,11.6],[99.2,10.3],[99.1,9.4],[98.4,9.4],[98.6,10.5],[98.8,11.6],[99.2,12.3],[99.1,13.2],[98.5,14.1],[98.2,15.1],[98.6,16.1],[97.7,17.0],[97.3,18.5],[97.8,19.4],[98.5,19.7],[99.5,20.1]], tx, ty),
    },
  },
  insets: [],
  // 남부 반도를 잘랐다는 표시 — 보이는 모양을 태국 전체로 오해하지 않게 (Codex 검수)
  contextLabels: [{ x: 312, y: 452, text: "↓ 남부 일부 생략" }],
  regions: {
    치앙마이: { x: tx(98.98), y: ty(18.79), area: "mainland", label: R },
    방콕: { x: tx(100.5), y: ty(13.75), area: "mainland", label: L },
    파타야: { x: tx(100.88), y: ty(12.93), area: "mainland", label: R },
    후아힌: { x: tx(99.96), y: ty(12.57), area: "mainland", label: L },
  },
};

// ── 베트남: 전체 S자 모양이 보이게 (세로로 길어 화면에서는 폭을 줄여 보여준다)
const VK = 24, VLON0 = 101.8, VLAT0 = 23.6;
const vx = (lon: number) => 10 + (lon - VLON0) * VK;
const vy = (lat: number) => 6 + (VLAT0 - lat) * VK * 1.03;
const VIETNAM: CountryMap = {
  title: "베트남",
  width: 260,
  height: 390,
  displayMaxWidth: 300,
  areas: {
    mainland: {
      noHighlight: true,
      d: poly([[102.1,22.4],[103.0,22.6],[104.0,22.8],[105.3,23.3],[106.7,22.9],[107.4,22.5],[108.0,21.6],[107.4,21.3],[106.8,20.8],[106.5,20.3],[106.0,19.9],[105.8,19.2],[106.4,18.3],[106.6,17.6],[107.3,16.8],[108.2,16.1],[108.8,15.3],[109.1,14.5],[109.3,13.4],[109.2,12.6],[109.2,11.8],[108.8,11.3],[108.0,10.7],[107.2,10.4],[106.7,10.0],[106.4,9.4],[105.4,8.7],[104.8,8.6],[104.8,9.3],[104.9,9.9],[104.5,10.4],[105.1,10.9],[106.2,11.0],[106.4,11.8],[107.5,12.3],[107.6,13.5],[107.5,14.7],[107.7,15.3],[107.2,15.9],[106.6,16.4],[106.2,17.3],[105.6,18.1],[105.1,18.6],[104.2,19.2],[104.5,19.6],[103.9,20.1],[103.2,20.6],[102.6,21.3],[102.2,22.0]], vx, vy),
    },
  },
  insets: [],
  regions: {
    하노이: { x: vx(105.85), y: vy(21.03), area: "mainland", label: L },
    하이퐁: { x: vx(106.68), y: vy(20.86), area: "mainland", label: R },
    다낭: { x: vx(108.2), y: vy(16.05), area: "mainland", label: R },
    하롱베이: { x: vx(107.08), y: vy(20.95), area: "mainland", label: side(10, 18, "start") },
    나트랑: { x: vx(109.19), y: vy(12.24), area: "mainland", label: L },
  },
};

// 나라 코드 → 지도. 아직 그리지 않은 나라는 지도 없이 지역 버튼만 보인다.
export const REGION_MAPS: Record<string, CountryMap> = {
  japan: JAPAN,
  china: CHINA,
  thailand: THAILAND,
  vietnam: VIETNAM,
  // 필리핀(클락·마닐라가 80km 거리)·말레이시아(1곳)·괌·사이판·기타는 지도가 도움이 안 돼 버튼만 (2026-10-09)
};
