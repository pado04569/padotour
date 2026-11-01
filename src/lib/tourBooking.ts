"use client";

// 상세페이지 달력(왼쪽) ↔ 문의 패널(오른쪽) 선택 날짜 동기화 (사장님 작업지시 2026-10-25)
// depSync 와 같은 방식 — 페이지 구조(서버 컴포넌트)를 건드리지 않고 창 이벤트로만 잇는다.

export type TourDateSel = {
  date: string; // "2026-11-21"
  price: number;
  nights: string | number;
  days: string | number;
} | null;

const EV = "pado:tour-date";

export function announceTourDate(sel: TourDateSel) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EV, { detail: sel }));
}

export function onTourDate(fn: (s: TourDateSel) => void) {
  const h = (e: Event) => fn(((e as CustomEvent).detail as TourDateSel) ?? null);
  window.addEventListener(EV, h);
  return () => window.removeEventListener(EV, h);
}

// 오른쪽 '선택한 여행 일정' 박스를 눌렀을 때 달력을 알려 준다 — 달력이 이미 보이면 스크롤만으로는 변화가 없어 반응 없는 클릭이 된다 (클래리티 2026-11-01)
const EV_CAL = "pado:focus-calendar";
export function requestCalendarFocus() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EV_CAL));
}
export function onCalendarFocus(fn: () => void) {
  const h = () => fn();
  window.addEventListener(EV_CAL, h);
  return () => window.removeEventListener(EV_CAL, h);
}

// 예약문의 입력 창 열기 — 달력 요약칸에서 부른다 (사장님 지시 10/25)
const EV_OPEN = "pado:open-inquiry";
export function requestInquiryOpen() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EV_OPEN));
}
export function onInquiryOpen(fn: () => void) {
  const h = () => fn();
  window.addEventListener(EV_OPEN, h);
  return () => window.removeEventListener(EV_OPEN, h);
}
