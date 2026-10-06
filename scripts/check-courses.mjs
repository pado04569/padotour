// 빌드 전 점검: 골프장 소개(courses.json)에 하나도 연결되지 않은 상품을 알려 준다.
// 연결 규칙은 src/data/courses.ts와 같다(relatedTourIds + 골프장 이름이 상품 golfCourse/golfCourseDesc/title에 들어감).
// 빌드는 막지 않는다 — 상품 등록이 골프장 페이지 때문에 멈추면 안 되므로 경고만 띄운다.
import fs from "node:fs";

const tours = JSON.parse(fs.readFileSync("src/data/tours.json", "utf8"));
const courses = JSON.parse(fs.readFileSync("src/data/courses.json", "utf8"));
const norm = (s) => (s ?? "").replace(/[\s.·()\-]/g, "").toLowerCase();

const linked = new Set(courses.flatMap((c) => c.relatedTourIds));
const keys = courses.flatMap((c) => [c.name, ...(c.aliases ?? [])]).map(norm).filter((k) => k.length >= 3);
const missing = tours.filter((t) => {
  if (linked.has(t.id)) return false;
  const text = [t.golfCourse, t.golfCourseDesc, t.title].map(norm).join("|");
  return !keys.some((k) => text.includes(k));
});

if (missing.length) {
  console.warn(`\n[골프장 소개 점검] 골프장 페이지가 없는 상품 ${missing.length}개 — courses.json에 골프장을 추가하세요`);
  for (const t of missing) console.warn(`  - ${t.id} (${t.departure ?? "-"}) : ${t.golfCourse ?? ""}`);
  console.warn("");
}
