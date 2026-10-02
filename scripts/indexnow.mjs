/**
 * IndexNow — 바뀐 페이지 주소를 Bing(및 IndexNow 참여 검색엔진)에 바로 알린다.
 *
 * 왜: ChatGPT 검색이 Bing 색인을 많이 참고한다. 요금·출발일이 자주 바뀌는데 Bing이 늦게 읽어 가면
 *     AI가 옛날 요금으로 안내한다. 바뀌자마자 알려서 그 틈을 줄인다. (2026-10-02)
 *
 * 사용:
 *   node scripts/indexnow.mjs <이전커밋> <새커밋>   바뀐 파일을 보고 주소를 골라 알림 (GitHub Actions가 실행)
 *   node scripts/indexnow.mjs --all                  사이트맵의 모든 주소를 알림 (화면 틀을 크게 바꿨을 때)
 *   --dry 를 붙이면 보내지 않고 주소 목록만 보여준다.
 *
 * 열쇠 파일: public/<KEY>.txt — 지우면 알림이 거절된다.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const KEY = "c69a70524017a3c72fec75c8dfc88253";
const HOST = "www.padotour.com";
const BASE = `https://${HOST}`;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const positional = args.filter((a) => !a.startsWith("--"));

const git = (cmd) => execSync(`git ${cmd}`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** 이전 커밋의 JSON 파일(없으면 빈 배열) */
function jsonAt(rev, path) {
  try {
    return JSON.parse(git(`show ${rev}:${path}`));
  } catch {
    return [];
  }
}

/** key 기준으로 내용이 달라졌거나 새로 생겼거나 사라진 항목 */
function changedKeys(before, after, key) {
  const a = new Map(before.map((x) => [x[key], JSON.stringify(x)]));
  const b = new Map(after.map((x) => [x[key], JSON.stringify(x)]));
  const out = new Set();
  for (const [k, v] of b) if (a.get(k) !== v) out.add(k);
  for (const k of a.keys()) if (!b.has(k)) out.add(k);
  return [...out];
}

async function allFromSitemap() {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function fromDiff(before, after) {
  const files = git(`diff --name-only ${before} ${after}`).split("\n").filter(Boolean);
  const urls = new Set();
  const lists = ["/", "/tours", "/incheon", "/busan", "/llms.txt"];

  const toursNow = JSON.parse(readFileSync("src/data/tours.json", "utf8"));
  const coursesNow = JSON.parse(readFileSync("src/data/courses.json", "utf8"));

  // 상품 화면 틀이 바뀌면 상품 페이지 전부
  const tourTemplate = files.some((f) => /^src\/(app\/tours\/\[id\]|lib\/(tripFacts|tourFaq)|components\/)/.test(f));
  // (출발일이 모두 지난 상품은 화면에 없으니 뺀다 — src/data/tours.ts isTourActive 와 같은 기준)
  const today = new Date().toISOString().slice(0, 10);
  const active = (t) => !t.departurePrices?.length || t.departurePrices.some((dp) => dp.date >= today);
  if (tourTemplate) toursNow.filter(active).forEach((t) => urls.add(`/tours/${t.id}`));

  if (files.includes("src/data/tours.json")) {
    changedKeys(jsonAt(before, "src/data/tours.json"), toursNow, "id").forEach((id) => urls.add(`/tours/${id}`));
    lists.forEach((u) => urls.add(u));
  }
  if (files.includes("src/data/courses.json")) {
    changedKeys(jsonAt(before, "src/data/courses.json"), coursesNow, "slug").forEach((s) => urls.add(`/courses/${s}`));
    ["/courses", "/llms.txt"].forEach((u) => urls.add(u));
  }
  if (files.includes("src/data/notices.json")) urls.add("/notice");
  if (files.includes("src/data/reviews.json")) urls.add("/reviews");
  for (const f of files) {
    const m = f.match(/^src\/app\/(guide|about|reviews|notice|courses|incheon|busan)\b/);
    if (m) urls.add(`/${m[1]}`);
    const g = f.match(/^src\/app\/guide\/([^/[]+)\//);
    if (g) urls.add(`/guide/${g[1]}`);
  }
  if (files.some((f) => f === "src/app/page.tsx" || f === "src/app/layout.tsx")) urls.add("/");

  return [...urls].map((u) => `${BASE}${u}`);
}

const urlList = args.includes("--all")
  ? await allFromSitemap()
  : positional.length === 2
    ? fromDiff(positional[0], positional[1])
    : (console.error("사용법: node scripts/indexnow.mjs <이전커밋> <새커밋> | --all [--dry]"), process.exit(1));

if (urlList.length === 0) {
  console.log("알릴 주소 없음 (검색에 보이는 페이지가 바뀌지 않음)");
  process.exit(0);
}
console.log(`알릴 주소 ${urlList.length}개`);
urlList.slice(0, 20).forEach((u) => console.log("  " + u));
if (urlList.length > 20) console.log(`  … 외 ${urlList.length - 20}개`);
if (dry) process.exit(0);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList }),
});
// 200·202 = 접수됨. 403 = 열쇠 파일을 못 찾음, 422 = 주소가 이 사이트 것이 아님
console.log(`IndexNow 응답: ${res.status} ${res.statusText}`);
if (res.status >= 300) process.exit(1);
