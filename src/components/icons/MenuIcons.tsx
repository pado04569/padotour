// 메뉴용 선 아이콘 — 이모지 대신 한 가지 모양·굵기로 통일 (사장님 지시 2026-10-10)
// 꼬리말 상담 카드 아이콘과 같은 규칙: 24 격자, 둥근 끝, 선 굵기 1.8, 색은 부모 글자색(currentColor)
type P = { className?: string };
const base = (className = "w-5 h-5") => ({
  viewBox: "0 0 24 24",
  className: `flex-none ${className}`,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

/** 골프장 소개 — 깃발 */
export const IconFlag = ({ className }: P) => (
  <svg {...base(className)}><path d="M6 21V4" /><path d="M6 4.5c2.2-1.2 4.4-1.2 6.6 0s4.4 1.2 5.4.6v7.4c-1 .6-3.2.6-5.4-.6s-4.4-1.2-6.6 0" /><path d="M3.5 21h6" /></svg>
);
/** 여행후기 — 별 */
export const IconStar = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.5l-5.1 2.7 1-5.6-4.1-4 5.7-.8L12 3.6z" /></svg>
);
/** 공지/이벤트 — 확성기 */
export const IconMegaphone = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z" /><path d="M16.5 9a4 4 0 0 1 0 6" /><path d="M7.5 15l1.2 4.5" /></svg>
);
/** 대표자의 말 — 따옴표 말풍선 (MessageSquareQuote 모양). 따옴표만 있으면 숫자 "66"처럼 보였다 */
export const IconQuote = ({ className }: P) => (
  <svg {...base(className)}><path d="M20.5 15a2 2 0 0 1-2 2H8l-4.5 3.5V5.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" /><path d="M8.5 12a2 2 0 0 0 2-2V8h-2" /><path d="M14 12a2 2 0 0 0 2-2V8h-2" /></svg>
);
/** 카카오톡 상담 — 말풍선 */
export const IconChat = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 4C6.9 4 3 7.1 3 10.9c0 2.5 1.7 4.6 4.2 5.8L6.4 20l3.9-2.5c.6.1 1.1.1 1.7.1 5.1 0 9-3.1 9-6.9S17.1 4 12 4z" /></svg>
);
/** 등록·보증 — 체크 방패 */
export const IconShieldCheck = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 9.5-4-1.8-7-5.2-7-9.5V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
);
/** 일정표 — 달력 (CalendarDays 모양) */
export const IconCalendarDays = ({ className }: P) => (
  <svg {...base(className)}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" /></svg>
);
/** 자주 묻는 질문 — 동그라미 물음표 (CircleHelp 모양) */
export const IconCircleHelp = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7" /><path d="M12 17.2h.01" /></svg>
);
