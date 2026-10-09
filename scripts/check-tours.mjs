/**
 * 상품 데이터 자동 검사기 — 올리기 전에 tours.json 의 앞뒤 안 맞는 문구를 찾는다.
 *
 * 왜: 2026-10-09 챗GPT 감사에서 실제 오류 3건이 나왔다.
 *   - 부산출발 치앙마이 요약에 "이스타항공 인천직항" (일정은 김해 출발)
 *   - 위해 3색 요약 "인천-위해 직항" (실제 항공은 인천→연태)
 *   - 구마모토 목록 "3박4일~4박5일박4일~5일일" (박수 칸에 글이 통째로 들어감)
 * 사람이 제목·요약·특징·일정을 따로 쓰다 보니 생기는 복붙 오류라, 기계가 대조한다.
 *
 * 사용: node scripts/check-tours.mjs          (경고만, 빌드는 계속 — prebuild 에서 자동 실행)
 *       node scripts/check-tours.mjs --strict (경고가 있으면 실패)
 * 판매 중인 상품만 본다 (출발일이 전부 지난 상품은 화면에 없으므로 제외 — tours.ts 와 같은 기준).
 */
import { readFileSync } from "node:fs";

const fileArg = process.argv.slice(2).find((a) => a.endsWith(".json"));  // 시험용: 다른 tours.json 경로
const tours = JSON.parse(readFileSync(fileArg || new URL("../src/data/tours.json", import.meta.url), "utf8"));
const today = new Date().toISOString().slice(0, 10);
const active = tours.filter((t) => !t.departurePrices?.length || t.departurePrices.some((d) => d.date >= today));

const DEP = { incheon: "인천", busan: "부산" };
const OTHER = { incheon: /(김해|부산)\s*(국제)?\s*(공항)?\s*(출발|직항)|부산출발|\[부산/, busan: /인천\s*(국제)?\s*(공항)?\s*(출발|직항)|인천출발|\[인천|인천-/ };
// 도시 이름 ↔ 공항 이름 (도시명으로 "직항"이라 써도 맞는 경우). 위해↔연태처럼 다른 도시는 넣지 않는다.
const AIRPORT = {
  방콕: ["수완나품", "돈므앙"], 파타야: ["수완나품", "우타파오"], 하이난: ["해구", "하이커우", "삼아", "싼야"], 해남: ["해구", "삼아"],
  오사카: ["간사이"], 도쿄: ["나리타", "하네다"], 삿포로: ["치토세", "신치토세"], 북해도: ["치토세", "신치토세"], 홋카이도: ["치토세", "신치토세"],
  세부: ["막탄"], 마닐라: ["니노이"], 오키나와: ["나하"], 하노이: ["노이바이"], 다낭: ["다낭"], 나트랑: ["깜라인"], 호치민: ["떤선녓"],
  코타키나발루: ["코타키나발루"], 청도: ["교동", "자오둥"], 칭다오: ["교동", "자오둥"], 상해: ["푸동", "홍차오"], 상하이: ["푸동", "홍차오"],
};
const issues = [];
const add = (t, kind, msg) => issues.push({ id: t.id, kind, msg });

// 손님에게 보이는 글 (일정 제외 — 일정은 "정답" 쪽으로 쓴다)
const shownText = (t) => [
  ["제목", t.title], ["부제", t.subtitle], ["상품 구성", t.productSummary], ["검색 소개", t.seoIntro],
  ...(t.highlights || []).map((h, i) => [`특징 ${i + 1}`, h]),
].filter(([, v]) => v);

for (const t of active) {
  const dep = t.departure;
  const day1 = t.schedule?.[0]?.desc || "";

  // 1) 제목의 [출발지] 와 출발지 칸이 같은가
  const tag = (t.title.match(/^\[(인천|부산)출발\]/) || [])[1];
  if (tag && DEP[dep] && tag !== DEP[dep]) add(t, "출발지", `제목은 [${tag}출발]인데 출발지 칸은 ${DEP[dep]}`);

  // 2) 다른 출발지 문구가 섞였나 (예: 부산출발 상품에 "인천직항")
  if (OTHER[dep]) {
    for (const [where, text] of shownText(t)) {
      const m = String(text).match(OTHER[dep]);
      if (m && !/인천[·/,]\s*부산|부산[·/,]\s*인천/.test(text)) add(t, "출발지", `${where}에 "${m[0]}" — ${DEP[dep]}출발 상품`);
    }
    // 일정 1일차 출발 공항도 대조
    if (dep === "busan" && /인천\s*(국제)?공항/.test(day1) && !/김해|부산/.test(day1)) add(t, "출발지", "1일차 일정이 인천공항 출발 — 부산출발 상품");
    if (dep === "incheon" && /김해\s*(국제)?공항/.test(day1) && !/인천/.test(day1)) add(t, "출발지", "1일차 일정이 김해공항 출발 — 인천출발 상품");
  }

  // 3) "○○-△△ 직항" 의 도착지가 1일차 일정의 도착 공항과 같은가 (예: 인천-위해 직항 ↔ 연태공항 도착)
  //    출발 공항(인천·김해)은 건너뛰고 처음 나오는 "○○공항 도착" 을 도착지로 본다
  const arrive = [...day1.matchAll(/([가-힣]{2,})\s*(?:국제)?\s*공항\s*도착/g)].map((m) => m[1]).find((n) => !/인천|김해|부산/.test(n));
  if (arrive) {
    for (const [where, text] of shownText(t)) {
      for (const m of String(text).matchAll(/(?:인천|김해|부산)\s*[-–~→]\s*([가-힣]{2,})\s*직항/g)) {
        const to = m[1];
        const names = [to, ...(AIRPORT[to] || [])];
        if (!names.some((n) => arrive.includes(n) || n.includes(arrive))) add(t, "도착 공항", `${where} "${m[0]}" ↔ 1일차 일정 "${arrive}공항 도착"`);
      }
    }
  }

  // 4) 박수 칸 형식 — 숫자("3")나 범위("3~4")여야 한다. 글이 통째로 들어가면 화면에서 "박·일"이 두 번 붙을 수 있다
  if (/박|일/.test(String(t.nights))) add(t, "박수 형식", `nights="${t.nights}" days="${t.days}" — 표시는 stayText() 가 막지만 숫자로 정리 권장`);

  // 5) 제목의 N박M일 과 박수 칸이 맞나 (숫자일 때만)
  const tn = t.title.match(/(\d)박\s?(\d)일/);
  if (tn && /^\d+$/.test(String(t.nights)) && /^\d+$/.test(String(t.days))) {
    const ok = t.title.match(/(\d)박\s?(\d)일/g).some((s) => { const [, a, b] = s.match(/(\d)박\s?(\d)일/); return +a === +t.nights && +b === +t.days; });
    if (!ok) add(t, "박수", `제목 "${tn[0]}" ↔ 박수 칸 ${t.nights}박${t.days}일`);
  }

  // 5-2) "박4일~5일일" 처럼 박·일이 겹쳐 쓰인 글 (2026-10-09 구마모토 검색 소개에서 발견)
  for (const [where, text] of shownText(t)) {
    const m = String(text).match(/\d일박\d|\d일일|박\d+박/);
    if (m) add(t, "박수 겹침", `${where}에 "${m[0]}"`);
  }

  // 6) 요금 칸
  if (t.price && !/원|문의/.test(t.price)) add(t, "요금 형식", `price="${t.price}"`);
}

const byKind = issues.reduce((m, i) => ((m[i.kind] = (m[i.kind] || 0) + 1), m), {});
console.log(`\n[상품 데이터 검사] 판매 중 ${active.length}개 확인 · 의심 ${issues.length}건 ${JSON.stringify(byKind)}`);
for (const i of issues) console.log(`  ! ${i.id} [${i.kind}] ${i.msg}`);
if (process.argv.includes("--strict") && issues.length) process.exit(1);
