// 골프장 둘러보기 지도용 지리 데이터 생성 (2026-10-25)
// 출처: Natural Earth (퍼블릭 도메인) — world-atlas@2 TopoJSON을 내려받아
// 메르카토르 투영 SVG 경로로 변환해 public/geo/world-map.json 으로 저장한다.
// 취급 나라(일본·중국·태국·베트남·말레이시아·필리핀·괌·사이판·인도네시아·대만)는 50m(상세),
// 나머지 배경 나라는 110m(간략)로 — 파일을 작게 유지한다. API 키·비용 없음.
// 실행: node scripts/build_geo.mjs  (출력이 이미 있으면 덮어씀)
import { feature } from "topojson-client";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";

const FOCUS = { 392: "japan", 156: "china", 764: "thailand", 704: "vietnam", 458: "malaysia", 608: "philippines", 316: "guam", 580: "saipan", 360: "other", 158: "taiwan" };
const W = 2000; // 투영 공간 너비 (세로는 메르카토르 계산값)
const LAT_MAX = 72, LAT_MIN = -55; // 극지방은 잘라낸다 (화면에 안 쓰임)

const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const Y0 = mercY(LAT_MAX), Y1 = mercY(LAT_MIN);
const H = Math.round(((Y0 - Y1) / (2 * Math.PI)) * W);
const px = (lng) => ((lng + 180) / 360) * W;
const py = (lat) => ((Y0 - mercY(Math.max(LAT_MIN, Math.min(LAT_MAX, lat)))) / (Y0 - Y1)) * H;

async function load(name) {
  const cache = new URL(`./.geo-cache/${name}`, import.meta.url);
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf-8"));
  const res = await fetch(`https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/${name}`);
  if (!res.ok) throw new Error(`${name} ${res.status}`);
  const json = await res.json();
  mkdirSync(new URL("./.geo-cache/", import.meta.url), { recursive: true });
  writeFileSync(cache, JSON.stringify(json));
  return json;
}

// 다각형 → SVG 경로 (소수 1자리). 아주 작은 조각은 생략하되, 취급 나라는 남긴다(괌·사이판은 섬 자체가 작다)
function toPath(geom, keepTiny) {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  let d = "";
  const bb = [Infinity, Infinity, -Infinity, -Infinity];
  for (const poly of polys) {
    for (const ring of poly) {
      const pts = ring.map(([lng, lat]) => [px(lng), py(lat)]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
      if (!keepTiny && w < 1.2 && h < 1.2) continue; // 배경용 미세 섬 생략
      bb[0] = Math.min(bb[0], ...xs); bb[1] = Math.min(bb[1], ...ys);
      bb[2] = Math.max(bb[2], ...xs); bb[3] = Math.max(bb[3], ...ys);
      let prev = null;
      let seg = "";
      for (const [x, y] of pts) {
        const X = x.toFixed(1), Y = y.toFixed(1);
        if (prev && prev[0] === X && prev[1] === Y) continue; // 반올림 중복점 제거
        seg += (prev ? "L" : "M") + X + " " + Y;
        prev = [X, Y];
      }
      if (seg) d += seg + "Z";
    }
  }
  return { d, bb };
}

const world110 = await load("countries-110m.json");
const world50 = await load("countries-50m.json");
const f110 = feature(world110, world110.objects.countries).features;
const f50 = feature(world50, world50.objects.countries).features;

const back = []; // 배경 나라 (110m)
const focus = []; // 취급 나라 (50m)
for (const f of f110) {
  const id = Number(f.id);
  if (FOCUS[id] != null) continue;
  const { d } = toPath(f.geometry, false);
  if (d) back.push(d);
}
for (const f of f50) {
  const id = Number(f.id);
  const code = FOCUS[id];
  if (code == null) continue;
  const { d, bb } = toPath(f.geometry, true);
  focus.push({ code, d, bbox: bb.map((v) => Math.round(v * 10) / 10) });
}
// 러시아가 경도 180도를 넘어가며 가로지르는 줄이 생기는 문제는 110m 자료에선 분할돼 있어 없음.

const out = {
  src: "Natural Earth (world-atlas@2.0.2, public domain)",
  w: W, h: H, latMax: LAT_MAX, latMin: LAT_MIN,
  back: back.join(""), // 배경 전체를 한 경로로
  focus,
};
mkdirSync(new URL("../public/geo/", import.meta.url), { recursive: true });
const dest = new URL("../public/geo/world-map.json", import.meta.url);
writeFileSync(dest, JSON.stringify(out));
const size = JSON.stringify(out).length;
console.log("saved public/geo/world-map.json", (size / 1024).toFixed(0) + "KB", "H=" + H, "focus:", focus.map((f) => f.code).join(","));
