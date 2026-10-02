import type { Tour } from "@/data/tours";

/**
 * 상품의 "항공편·출발일" 핵심 사실을 일정 문장에서 뽑아 한 줄로 정리한다.
 *
 * 왜: ChatGPT 검색으로 들어온 손님이 비행 시간·출발 날짜를 전혀 모르고 전화했다(2026-10 사장님 확인).
 * 항공편이 일정 문장 속에 섞여 있어 AI가 요약할 때 빠진다 → 화면·llms.txt·구조화 데이터에 따로 적는다.
 *
 * 원칙: 시각이 확인되지 않으면 지어내지 않고 비워둔다.
 */

const AIR = /(공항|[A-Z][A-Z0-9]\s?\d{3,4}|항공)/;
const MOVE = /(출발|도착|탑승|향발)/;
const LEAVE = /(출발|탑승|향발)/;
const SKIP = /(미팅|수속|이동|체크|샌딩|송영)/;
const TIME = /\d{1,2}:\d{2}/;

function flightSegments(desc: string): string[] {
  return desc
    .split("→")
    .map((s) =>
      s
        .replace(/\[[^\]]*\]/g, "") // [조식 호텔식] 같은 식사 표기
        .replace(/※.*$/, "") // 뒤에 붙은 참고 문구
        .replace(/\s*(\/|후)\s*(개별\s*)?(귀가|해산)/, "")
        .replace(/[.\s]+$/, "")
        .trim(),
    )
    .filter((s) => s && AIR.test(s) && MOVE.test(s) && !SKIP.test(s));
}

/** 출발 공항에서 떠나는 구간이 있고 시각이 있어야 한 줄로 인정한다 */
function toLine(segs: string[]): string | undefined {
  if (segs.length === 0 || !LEAVE.test(segs[0]) || !segs.some((s) => TIME.test(s))) return undefined;
  return segs.join(" → ");
}

export function flightInfo(tour: Tour): { outbound?: string; inbound?: string } {
  const sched = tour.schedule ?? [];
  if (sched.length < 2) return {};
  const go = flightSegments(sched[0].desc).slice(0, 2);
  const back = sched
    .slice(-2)
    .flatMap((d) => flightSegments(d.desc))
    .filter((s) => !go.includes(s))
    .slice(-2);
  return { outbound: toLine(go), inbound: toLine(back) };
}

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
};

/** 지금 이후의 출발일 요약: 기간·횟수·최저가 */
export function departureSummary(tour: Tour, today = new Date()) {
  const todayIso = today.toISOString().slice(0, 10);
  const upcoming = (tour.departurePrices ?? [])
    .filter((dp) => dp.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length === 0) return undefined;
  const cheapest = upcoming.reduce((a, b) => (b.price < a.price ? b : a));
  const prices = upcoming.map((dp) => dp.price);
  return {
    first: upcoming[0].date,
    last: upcoming[upcoming.length - 1].date,
    count: upcoming.length,
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    cheapestDate: cheapest.date,
    rangeText: `${fmtDate(upcoming[0].date)} ~ ${fmtDate(upcoming[upcoming.length - 1].date)} 중 ${upcoming.length}일 출발`,
    lowPriceText: `${cheapest.price.toLocaleString("ko-KR")}원`,
    cheapestDateText: fmtDate(cheapest.date),
    text: `${fmtDate(upcoming[0].date)} ~ ${fmtDate(upcoming[upcoming.length - 1].date)} 중 ${upcoming.length}일 출발 · 최저 ${cheapest.price.toLocaleString("ko-KR")}원(${fmtDate(cheapest.date)} 출발)`,
  };
}
