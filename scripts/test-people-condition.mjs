// 인원 조건 해석 회귀 테스트 — node scripts/test-people-condition.mjs (빌드 전 검사에는 넣지 않는다)
import { readFileSync } from "node:fs";
import { parsePeopleCondition as P, peopleAllowed, selectionNotes, shortPeopleNotice, peopleOptionsFor, localPeopleLines, withLocalCosts, LOCAL_TAIL } from "../src/lib/peopleCondition.ts";

let fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log(`✗ ${name}\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`); }
  else console.log(`✓ ${name}`);
};
const sum = (c) => ({ min: c.minDeparture, basis: c.priceBasis, room: c.roomBasis, air: c.airfareBasis, cap: c.capacity, extra: c.extra });

// 사장님 표(챗GPT 감사 10/27)
for (const [v, min] of [[2, 2], ["2인", 2], [3, 3], ["3인", 3], [4, 4], ["4인", 4], ["4인 이상", 4]]) eq(`${JSON.stringify(v)} → 최소 ${min}`, P(v).minDeparture, min);
eq("3명이면 2명 선택 불가", peopleAllowed(P("3인"), 2), false);
eq("4인 (2~3인은 차량 추가요금)", sum(P("4인 (2~3인은 차량 추가요금)")), { min: 2, basis: 4, room: null, air: null, cap: null, extra: "surcharge" });
eq("4인 기준 요금 → 최소 출발 단정 안 함", sum(P("4인 기준 요금")), { min: null, basis: 4, room: null, air: null, cap: null, extra: "none" });
eq("2인 (추가요금 없음) → 경고 없음", P("2인 (추가요금 없음)").extra, "none");
eq("2인 (추가요금 없이 2인 출발 확정) → 경고 없음", P("2인 (추가요금 없이 2인 출발 확정)").extra, "none");
{
  const c = P("2인 1실 기준 (출발 인원은 예약 시 확인)");
  eq("2인 1실 기준 → 객실 기준·출발 인원 확인 분리", { min: c.minDeparture, room: c.roomBasis, confirm: c.needsConfirm, chip: c.chip }, { min: null, room: 2, confirm: true, chip: "출발 인원은 예약 시 확인" });
}
{
  const c = P("항공 4인 그룹 운임 기준 (인원이 적으면 운임 인상 가능)");
  eq("항공 4인 그룹 운임 → 최소 출발 추정 금지", { min: c.minDeparture, air: c.airfareBasis, basis: c.priceBasis, text: c.airfareText }, { min: null, air: 4, basis: null, text: "항공 운임은 4인 그룹 기준 · 소인원은 운임 확인 필요" });
}
{
  const c = P("2인 (3·4인 기준 요금 상이)");
  eq("2인 (3·4인 기준 요금 상이) → 인원별 요금 확인, 추가금 단정 금지", { min: c.minDeparture, extra: c.extra, chip: c.chip, basis: c.priceBasis }, { min: 2, extra: "varies", chip: "2인 출발 가능 · 인원별 요금 확인", basis: null });
}
eq("4인부터 출발 확정 (2인 플레이 추가) → 최소 4 유지", sum(P("4인부터 출발 확정 (2인 플레이 1인 1일 30,000원 추가)")).min, 4);
eq("24명 (선착순 한정) → 정원은 최소 인원 아님", sum(P("24명 (선착순 한정)")), { min: null, basis: null, room: null, air: null, cap: 24, extra: "none" });

// ChatGPT 지적 상품
for (const v of ["4인 이상 (4베드룸 독채 풀빌라)", "4인부터 출발 확정", "4인 (홀수 인원은 싱글카트 추가)", "4인 이상"]) eq(`4인 출발 상품 ${v}`, [P(v).minDeparture, peopleAllowed(P(v), 2), peopleAllowed(P(v), 3), peopleAllowed(P(v), 4)], [4, false, false, true]);
{
  const c = P("2인 (4인 기준 요금, 3인 +60,000원 · 2인 +100,000원)");
  eq("세부: 기준 4인 · 2명 선택 시 2인 +100,000원만", { basis: c.priceBasis, n2: selectionNotes(c, 2), n3: selectionNotes(c, 3), n4: selectionNotes(c, 4) }, { basis: 4, n2: ["2인 +100,000원"], n3: ["3인 +60,000원"], n4: [] });
}
{
  const c = P("4인 (8인 출발 기준 요금, 4인 출발 시 1인 70,000원 추가)");
  eq("오키나와 토리피토: 최소 4 · 표시 요금 8인 기준 · 4명 선택 시만 추가", { min: c.minDeparture, basis: c.priceBasis, n4: selectionNotes(c, 4), n8: selectionNotes(c, 8) }, { min: 4, basis: 8, n4: ["4인 출발 시 1인 70,000원 추가"], n8: [] });
}
{
  const c = P("2인 (송영 추가 없음, 3인 싱글룸 추가)");
  eq("없음이 있어도 다른 항목 추가금 유지", { extra: c.extra, n3: selectionNotes(c, 3), n2: selectionNotes(c, 2) }, { extra: "surcharge", n3: ["3인 싱글룸 추가"], n2: [] });
}
{
  const c = P("2인부터 (항공 4인 그룹 운임 기준, 인원이 적으면 운임 인상 가능)");
  eq("진안 궈커: 2인 출발 + 항공 기준 분리", { min: c.minDeparture, air: c.airfareBasis, chip: c.chip, text: c.airfareText }, { min: 2, air: 4, chip: "2인 출발 가능 · 인원별 요금 확인", text: "항공 운임은 4인 그룹 기준 · 소인원은 운임 확인 필요" });
}
{
  const c = P("1인부터 출발");
  eq("1인 출발: 1명 선택 가능", { min: c.minDeparture, opts: peopleOptionsFor(c, [2, 3]).slice(0, 3) }, { min: 1, opts: [1, 2, 3] });
}
{
  const c = P("2인 1실 기준 요금 (1인 출발은 싱글룸 추가)");
  eq("리장: 객실 기준 + 1인 출발 + 싱글룸 추가", { min: c.minDeparture, room: c.roomBasis, extra: c.extra, n1: selectionNotes(c, 1) }, { min: 1, room: 2, extra: "surcharge", n1: ["1인 출발은 싱글룸 추가"] });
}
{
  const c = P("2인 (4인 기준 요금)");
  eq("2인 (4인 기준 요금) → 요금 기준 4인", sum(c), { min: 2, basis: 4, room: null, air: null, cap: null, extra: "none" });
}
eq("2인부터 출발 (송영 추가 비용 없음) → 경고 없음", P("2인부터 출발 (송영 추가 비용 없음)").extra, "none");
eq("조인 조건 보존", P("2인부터 (2인은 조인 라운드)").conditionLines, ["2인은 조인 라운드"]);
eq("시즌 제한 보존", P("2인 (2인 플레이는 비수기 한정, 주중 5인 플레이 가능)").conditionLines.length, 2);
eq("검색 인원이 적을 때 안내", shortPeopleNotice(P("4인"), 2), "검색하신 2명은 이 상품의 최소 출발 인원(4명) 미만이라 4명으로 맞췄어요.");
eq("미정 인원은 제한 없음", peopleAllowed(P(null), 1), true);

// 불포함 줄의 인원별 현지 비용 (작업지시서 2026-11-07) — 잡을 것 4 · 잡지 말 것 3
{
  const catchLines = [
    "미팅·샌딩 1인 $50 (4인 이상 기준, 2~3인 출발 시 총 $200)", // thailand-chiangmai-royal-golftel
    "미팅·샌딩 1인 $50 (4인 기준 / 2인 $100)", // thailand-pattaya-onepatio-busan
    "차량 송영비 1인 $70 (4인 기준 / 2인 $140)", // vietnam-halong-flc-busan
    "공항 미팅·샌딩비 (4인 기준 1인 $50 / 3인 팀당 $200 / 2인 단독차량 1인 $100)", // thailand-bangkok-lotusvalley-busan
  ];
  for (const l of catchLines) eq(`인원별 현지비용 잡음: ${l}`, localPeopleLines([l], 2), [l]);
  const skipLines = [
    "캐디피 (18홀 1인 30,000원, 2인 1캐디 기준)", // 캐디 배정 기준
    "싱글룸 사용료 (2인 1실 기준, 1실 1박 170,000원)", // 객실 기준
    "미팅 & 샌딩비 (400위안/1인, 2인부터 출발 확정 시 추가요금 없음)", // 금액 차이 없음
  ];
  for (const l of skipLines) eq(`잡지 않음: ${l}`, localPeopleLines([l], 2), []);
  eq("최소 인원 자체만 적힌 줄은 잡지 않음", localPeopleLines(["미팅·샌딩비 1인 $50 (2인 기준)"], 2), []);
  eq("인원 무관은 잡지 않음", localPeopleLines(["미팅·샌딩비 (인원 상관없이 1인 400위안)"], 2), []);
  const c = withLocalCosts(P("2인"), ["캐디팁 (18홀 1인 50만동)", "미팅 & 샌딩비 (1인당 70불, 4인 기준 / 3인 90불 / 2인 140불, 인원별 상이)"]);
  eq("2인 + 불포함 인원별 샌딩비 → 칩 꼬리 '현지비용 인원별 상이', 원문 그대로 보존", { chip: c.chip, lines: c.localLines, extra: c.extra }, { chip: `2인 출발 가능${LOCAL_TAIL}`, lines: ["미팅 & 샌딩비 (1인당 70불, 4인 기준 / 3인 90불 / 2인 140불, 인원별 상이)"], extra: "none" });
  const s = withLocalCosts(P("4인 (2~3인은 차량 추가요금)"), ["미팅·샌딩 1인 $50 (4인 기준 / 2인 $100)"]);
  eq("minPeople 에 추가요금이 있으면 기존 칩 유지", s.chip, "2인 출발 가능 · 추가비용 별도");
  eq("불포함 없으면 그대로", withLocalCosts(P("2인"), []).chip, "2인 출발 가능");
}

// 실제 상품 전체 점검 (참고용 출력)
const tours = JSON.parse(readFileSync(new URL("../src/data/tours.json", import.meta.url), "utf8"));
const seen = new Map();
for (const t of tours) {
  const v = t.minPeople ?? null;
  const key = JSON.stringify(v);
  if (!seen.has(key)) seen.set(key, { v, ids: [] });
  seen.get(key).ids.push(t.id);
}
console.log(`\n=== 실제 인원 문구 ${seen.size}종 / 상품 ${tours.length}개 ===`);
for (const { v, ids } of seen.values()) {
  const c = P(v);
  console.log(`${String(v).padEnd(52)} → min ${c.minDeparture ?? "-"} | 요금기준 ${c.priceBasis ?? "-"} | 객실 ${c.roomBasis ?? "-"} | 항공 ${c.airfareBasis ?? "-"} | ${c.extra} | 칩 "${c.chip}"  (${ids.length})`);
}
console.log(fail ? `\n실패 ${fail}건` : "\n회귀 테스트 모두 통과");
process.exit(fail ? 1 : 0);
