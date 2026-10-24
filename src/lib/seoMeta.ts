import type { Tour } from "@/data/tours";
import { departureSummary } from "@/lib/tripFacts";

/**
 * 검색 결과(네이버·구글)에 보이는 제목·설명 — 화면의 상품 제목(h1)은 그대로 두고 <title>·description 만 만든다 (2026-10-21).
 *
 * 왜: 네이버 30일 노출 22,589 · 클릭 223(1.0%). 순위는 1~4위인데 안 눌렸다.
 *  - 상품 제목이 평균 52자라 검색 결과에서 뒤가 잘리고, 요금이 맨 끝에 있거나 아예 없었다(175개 중 50개).
 *  - 설명은 "부산 출발 ○○ 골프여행 3박5일 상품으로, …숙박하는 골프패키지입니다." 같은 틀이라 눌러 볼 이유가 안 보였다.
 * 그래서 손님이 검색한 낱말(지역·골프장)과 요금·출발일을 앞쪽에 둔다. 요금은 상품 카드에 보이는 대표 요금(price)과 같게.
 */

const DEP: Record<string, string> = { incheon: "인천출발", busan: "부산출발", cheongju: "청주출발", daegu: "대구출발", both: "인천·부산출발" };
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const priceNum = (p?: string) => Number(String(p ?? "").replace(/[^\d]/g, "")) || 0;
const md = (iso: string) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;
const tidy = (s: string) =>
  s
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s·,|&-]+|[\s·,|&-]+$/g, "")
    .trim();

// 지역칸이 "방콕/파타야"처럼 둘이면 상품 제목에 실제로 나오는 쪽을 쓴다
const titleRegion = (t: Tour) => (t.region ?? "").split(/[/·,]/).map((r) => r.trim()).find((r) => r && t.title.includes(r)) ?? "";
// 홀 칸은 "54홀 (18홀 x 3회)"·"무제한 라운딩 (…)"처럼 설명이 붙어 있다 → 앞의 "54홀" 또는 "무제한"만
const holesShort = (h?: string | number) => {
  const s = typeof h === "number" ? `${h}홀` : String(h ?? "");
  return s.match(/^\s*(\d+홀)/)?.[1] ?? (/무제한/.test(s) ? "무제한 라운딩" : "");
};
// 골프장·호텔 칸의 괄호 설명("(2인 1실)", "(또는 동급, …)")은 검색 설명에서 뺀다
const noParen = (s?: string) => tidy((s ?? "").replace(/\([^)]*\)/g, "").replace(/\s*\/\s*/g, "·").split("\n")[0]);
const hasAir = (t: Tour) => (t.includes ?? []).some((i) => i.includes("항공"));

/** 상품 페이지 <title> — "지역 골프여행 박수 요금~ | 출발 + 나머지 제목" */
export function tourSeoTitle(t: Tour): string {
  const stay = t.title.match(/\d박\d일(?:\s*[·,/]\s*\d박\d일)*/)?.[0] ?? (t.nights && t.days ? `${t.nights}박${t.days}일` : "");
  const price = priceNum(t.price);
  const region = titleRegion(t);
  // 상품 제목에 지역 이름이 없으면(예: 지역칸 '방콕'인데 제목은 '파타야') 지역을 지어 붙이지 않고 원래 제목에 요금만 더한다
  // 요금은 잘리지 않게 출발지 바로 뒤로 당긴다
  if (!region) {
    const base = tidy(
      t.title
        .replace(/^\[[^\]]*\]\s*/, "")
        .replace(/\s*\d{1,3}(?:,\d{3})+원(?:부터|~)?/g, "")
        .replace(new RegExp(`^${t.country ?? ""}\\s+`), ""),
    );
    const dep = DEP[t.departure ?? ""] ?? "";
    return `${tidy(`${dep} ${price ? `${won(price)}~` : ""}`)}${dep || price ? " · " : ""}${base} | 여행의 파도`;
  }
  const rest = tidy(
    t.title
      .replace(/^\[[^\]]*\]\s*/, "") // [부산출발]
      .replace(/\s*\d{1,3}(?:,\d{3})+원(?:부터|~)?/g, "")
      .replace(stay, "")
      .replace(new RegExp(`(?:${t.country ?? ""}\\s*)?${region}\\s*(?:골프여행|골프\\s*투어)?`), "")
      .replace(/골프여행/, ""),
  );
  const dep = DEP[t.departure ?? ""] ?? "";
  const head = tidy(`${region} 골프여행 ${stay} ${price ? `${won(price)}~` : ""}`);
  const tail = tidy(`${dep} ${rest}`);
  return `${head}${tail ? ` | ${tail}` : ""} | 여행의 파도`;
}

/** 상품 페이지 description — 요금·출발일·홀수·숙소·포함 + 문의 */
export function tourSeoDescription(t: Tour): string {
  const dep = (DEP[t.departure ?? ""] ?? "").replace("출발", " 출발");
  const stay = t.title.match(/\d박\d일(?:\s*[·,/]\s*\d박\d일)*/)?.[0] ?? (t.nights && t.days ? `${t.nights}박${t.days}일` : "");
  const price = priceNum(t.price);
  const ds = departureSummary(t);
  // 홀 수는 상품 제목("3색 54홀")이 더 정확하다 — 홀 칸에는 하루 18홀만 적힌 상품이 있다
  const holes = t.title.match(/(\d+)홀/)?.[0] ?? holesShort(t.holes);
  const course = noParen(t.golfCourse);
  const hotel = noParen(t.hotel);
  const parts = [
    tidy(`${dep} ${titleRegion(t) || t.region || ""} 골프여행 ${stay}${price ? `, ${hasAir(t) ? "항공 포함 " : ""}${won(price)}부터` : ""}.`),
    ds ? `${md(ds.first)}~${md(ds.last)} 출발, 날짜별 요금 확인.` : "",
    tidy(`${holes ? `${holes} ` : ""}${course}${hotel ? ` · ${hotel} 숙박` : ""}`) ? tidy(`${holes ? `${holes} ` : ""}${course}${hotel ? ` · ${hotel} 숙박` : ""}`) + "." : "",
    "일정·포함사항 보고 카톡으로 견적 문의하세요.",
  ];
  return parts.filter((p) => p && p !== ".").join(" ").replace(/\s+/g, " ");
}

type CourseLike = { name: string; nameEn?: string; region: string; country: string; summary?: string; specs?: { label: string; value: string }[] };

const spec = (c: CourseLike, label: string) => c.specs?.find((s) => s.label === label)?.value ?? "";

/** 골프장 소개 <title> — 손님이 검색한 골프장 이름을 맨 앞에, 홀 수·파·전장 같은 사실을 바로 뒤에 */
export function courseSeoTitle(c: CourseLike): string {
  const holes = spec(c, "코스 구성").match(/\d+홀/)?.[0] ?? "";
  const parYard = spec(c, "파 / 전장").match(/파\s?\d+\s*·\s*약?\s*[\d,]+야드/)?.[0]?.replace(/\s*·\s*약?\s*/, " ") ?? "";
  const facts = tidy([holes && !parYard.includes("홀") ? holes : "", parYard].filter(Boolean).join(" "));
  return `${c.name}${facts ? ` ${facts}` : ""} | ${c.region} 골프장 정보·골프여행 - 여행의 파도`;
}

/** 골프장 소개 description — 영어 이름(구글 영어 검색), 요약, 포함 상품 수·최저 요금 */
export function courseSeoDescription(c: CourseLike, related: Tour[]): string {
  const en = (c.nameEn ?? "").replace(/\s*\(.*\)\s*$/, "");
  const prices = related.map((t) => priceNum(t.price)).filter((n) => n > 0);
  const deps = [...new Set(related.flatMap((t) => (t.departure === "both" ? ["인천", "부산"] : t.departure === "incheon" ? ["인천"] : t.departure === "busan" ? ["부산"] : t.departure === "cheongju" ? ["청주"] : t.departure === "daegu" ? ["대구"] : [])))];
  // "사이판 사이판", "마쓰야마 마쓰야마 씨사이드CC"처럼 같은 말이 겹치지 않게
  const place = [c.country, c.region].filter((p, i, a) => p && a.indexOf(p) === i && !c.name.startsWith(p)).join(" ");
  return [
    `${place ? `${place} ` : ""}${c.name}${en ? `(${en})` : ""}.`,
    c.summary ? `${c.summary}.` : "",
    related.length > 0
      ? `${c.name} 포함 ${deps.length ? `${deps.join("·")} 출발 ` : ""}골프여행 ${related.length}개${prices.length ? `, ${related.every(hasAir) ? "항공 포함 " : ""}${won(Math.min(...prices))}부터(출발일별 상이)` : ""}.`
      : `${c.name} 라운딩 골프여행은 카톡으로 견적 문의하세요.`,
    "코스 사진·홀 정보 안내.",
  ]
    .filter(Boolean)
    .join(" ");
}
