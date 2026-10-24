// 골프장·상품 지도 — 나라 보기 범위·지역 대표점 좌표 (2026-10-25)
// 좌표는 도시(지역)의 실제 위경도다. "지역 대표점"으로만 쓰며 골프장 위치처럼 보여주지 않는다.
// 골프장 개별 핀은 src/data/courseGeo.json 에 확인된 좌표가 있는 골프장만 찍는다(없으면 핀 없이 목록만).
// /courses(골프장 둘러보기)와 /tours(지역 선택 '지도로 위치 보기')가 함께 쓴다.

// 투영(메르카토르) — scripts/build_geo.mjs 와 반드시 같은 값
export const GEO_W = 2000;
export const GEO_LAT_MAX = 72;
export const GEO_LAT_MIN = -55;
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const Y0 = mercY(GEO_LAT_MAX);
const Y1 = mercY(GEO_LAT_MIN);
export const GEO_H = Math.round(((Y0 - Y1) / (2 * Math.PI)) * GEO_W);
export const lngToX = (lng: number) => ((lng + 180) / 360) * GEO_W;
export const latToY = (lat: number) =>
  ((Y0 - mercY(Math.max(GEO_LAT_MIN, Math.min(GEO_LAT_MAX, lat)))) / (Y0 - Y1)) * GEO_H;
/** [서쪽 경도, 남쪽 위도, 동쪽 경도, 북쪽 위도] → 투영 좌표 {x, y, w, h} */
export const viewRect = (v: [number, number, number, number]) => {
  const x = lngToX(v[0]);
  const y = latToY(v[3]);
  return { x, y, w: lngToX(v[2]) - x, h: latToY(v[1]) - y };
};

export type MapGroup = {
  key: string; // buildCourseGroups 의 key 와 같다
  label: string;
  codes: string[]; // /courses?country= 값
  marker: [number, number]; // 세계지도에서 이름표를 둘 [경도, 위도]
  markerOff?: [number, number]; // 세계지도 이름표 밀기(px) — 이웃 나라와 겹치지 않게
  view: [number, number, number, number]; // 나라 확대 범위 [서, 남, 동, 북]
};

// 순서 = 왼쪽 목록 순서 (기존 buildCourseGroups ORDER 와 같게)
export const MAP_GROUPS: MapGroup[] = [
  { key: "japan", label: "일본", codes: ["japan"], marker: [138.2, 37.6], markerOff: [26, -8], view: [126.5, 25.5, 147.5, 46.5] },
  { key: "china", label: "중국", codes: ["china"], marker: [104, 34.5], markerOff: [-22, -10], view: [96, 16.5, 127.5, 42.5] },
  { key: "thailand", label: "태국", codes: ["thailand"], marker: [101, 15.5], markerOff: [-36, -6], view: [96.5, 5, 107, 21.5] },
  { key: "vietnam", label: "베트남", codes: ["vietnam"], marker: [105.8, 17.2], markerOff: [30, -10], view: [100.5, 7.5, 112.5, 24] },
  { key: "philippines", label: "필리핀", codes: ["philippines"], marker: [121.8, 12.8], markerOff: [30, 4], view: [115.5, 4, 128, 20] },
  { key: "malaysia", label: "말레이시아", codes: ["malaysia"], marker: [102, 3.8], markerOff: [-46, 6], view: [97.5, -0.5, 120.5, 9] },
  { key: "guam-saipan", label: "괌·사이판", codes: ["guam", "saipan"], marker: [144.9, 13.8], markerOff: [40, 0], view: [143, 11.9, 147.5, 16.6] },
  { key: "other", label: "인도네시아", codes: ["other"], marker: [124.8, 1.5], markerOff: [36, 12], view: [121.5, -2.5, 128.5, 4.5] },
];
export const groupByKey = (k: string | null) => MAP_GROUPS.find((g) => g.key === k);

// /tours 쪽 나라 보기 범위 — countryCode 기준 (상품의 'other'는 괌·사이판·마나도가 섞여 넓게 본다)
export const COUNTRY_VIEWS: Record<string, [number, number, number, number]> = {
  japan: [126.5, 25.5, 147.5, 46.5],
  china: [96, 16.5, 127.5, 42.5],
  thailand: [96.5, 5, 107, 21.5],
  vietnam: [100.5, 7.5, 112.5, 24],
  philippines: [115.5, 4, 128, 20],
  malaysia: [97.5, -0.5, 120.5, 9],
  guam: [143, 11.9, 147.5, 16.6],
  saipan: [143, 11.9, 147.5, 16.6],
  other: [118, -4.5, 149, 18],
  indonesia: [100, -3.5, 108.5, 4.5],
};

// 지역 대표점 — countryCode → 지역 이름(자료의 표기 그대로, 합친 표기 포함) → [경도, 위도]
// 도시·지역 공인 좌표(위키백과 기준 반올림). 자료에 없는 지역이면 점을 찍지 않는다(가짜 위치 금지).
export const REGION_POINTS: Record<string, Record<string, [number, number]>> = {
  japan: {
    "북해도": [141.35, 43.06], "아오모리": [140.74, 40.82], "도쿄": [139.69, 35.68], "시즈오카": [138.38, 34.98],
    "나고야": [136.91, 35.18], "오사카": [135.5, 34.69], "다카마쓰": [134.05, 34.34], "마쓰야마": [132.77, 33.84],
    "히로시마": [132.46, 34.39], "야마구치": [131.47, 34.18], "기타큐슈": [130.87, 33.88], "후쿠오카": [130.4, 33.59],
    "오이타": [131.61, 33.24], "벳부": [131.49, 33.28], "구마모토": [130.71, 32.8], "미야자키": [131.42, 31.91],
    "가고시마": [130.56, 31.6], "오키나와": [127.68, 26.21],
  },
  china: {
    "베이징": [116.41, 39.9], "천진": [117.19, 39.13], "연태": [121.45, 37.46], "위해": [122.12, 37.51],
    "제남": [117.12, 36.65], "청도": [120.38, 36.07], "곡부": [116.99, 35.6], "난징": [118.8, 32.06],
    "장가계": [110.48, 29.12], "리장": [100.23, 26.86], "푸저우": [119.3, 26.07], "샤먼": [118.09, 24.48],
    "광저우": [113.26, 23.13], "심천": [114.06, 22.54], "하이난": [109.9, 19.6],
  },
  thailand: {
    "치앙마이": [98.98, 18.79], "방콕": [100.5, 13.76], "파타야": [100.88, 12.93],
    "방콕/파타야": [100.7, 13.35], "후아힌": [99.96, 12.57],
  },
  vietnam: {
    "하노이": [105.85, 21.03], "하이퐁": [106.68, 20.86], "하노이/하이퐁": [106.3, 20.95],
    "하롱·하이퐁": [107.18, 20.91], "하롱베이": [107.08, 20.95], "다낭": [108.21, 16.05], "나트랑": [109.19, 12.24],
  },
  philippines: { "클락": [120.56, 15.18], "마닐라": [120.98, 14.6], "세부": [123.9, 10.32] },
  malaysia: { "쿠알라룸푸르": [101.69, 3.14], "코타키나발루": [116.07, 5.98] },
  guam: { "괌": [144.79, 13.44] },
  saipan: { "사이판": [145.75, 15.18] },
  other: { "마나도": [124.84, 1.49], "괌": [144.79, 13.44], "괌/사이판": [145.2, 14.3], "사이판": [145.75, 15.18] },
  indonesia: { "바탐": [104.03, 1.08] },
};

/** 여러 나라 코드에서 지역 대표점 찾기 (괌·사이판처럼 묶인 나라용) */
export function pointFor(codes: string[], region: string): [number, number] | undefined {
  for (const c of codes) {
    const p = REGION_POINTS[c]?.[region];
    if (p) return p;
  }
  return undefined;
}

/** 지역 확대 범위 — 대표점 주위로 경도 폭 degW 만큼 */
export function regionView(point: [number, number], degW = 3.2): [number, number, number, number] {
  const [lng, lat] = point;
  const half = degW / 2;
  // 메르카토르에서 위도 폭은 경도 폭보다 조금 좁게 잡아야 비슷한 화면 비율이 된다
  const vh = degW * 0.42;
  return [lng - half, lat - vh, lng + half, lat + vh];
}
