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
/** 가는 편 — 이륙 (PlaneTakeoff 모양) */
export const IconPlaneTakeoff = ({ className }: P) => (
  <svg {...base(className)}><path d="M2.5 21h19" /><path d="M5.2 15.5 3 11.6l1.9-.6 2.3 1.8 3.6-1.3L7.2 5.4l2.3-.7 5.6 4.9 4.2-1.5a1.9 1.9 0 0 1 1.3 3.6L6.4 16a1 1 0 0 1-1.2-.5z" /></svg>
);
/** 오는 편 — 착륙 (PlaneLanding 모양) */
export const IconPlaneLanding = ({ className }: P) => (
  <svg {...base(className)}><path d="M2.5 21h19" /><path d="M3.6 8.6 3.8 4l1.9.5.9 2.8 3.7 1-.6-6.1 2.3.6 2.8 6.9 4.3 1.2a1.9 1.9 0 0 1-1 3.7L4.3 9.4a1 1 0 0 1-.7-.8z" /></svg>
);
/** 항공편 구간 사이 — 오른쪽 화살표 (ArrowRight 모양) */
export const IconArrowRight = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);
/** 목록으로 돌아가기 — 왼쪽 화살표 (ArrowLeft 모양) */
export const IconArrowLeft = ({ className }: P) => (
  <svg {...base(className)}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
);
/** 문의하기 — 동그란 말풍선 (MessageCircle 모양) */
export const IconMessageCircle = ({ className }: P) => (
  <svg {...base(className)}><path d="M20.5 11.5a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.6-4.5a8.4 8.4 0 1 1 15.4-4.5z" /></svg>
);
/** 연락 — 전화기 */
export const IconPhone = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
);
/** 업무시간 — 시계 */
export const IconClock = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
/** 일정 — 달 */
export const IconMoon = ({ className }: P) => (
  <svg {...base(className)}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
);
/** 최소 인원 — 사람들 */
export const IconUsers = ({ className }: P) => (
  <svg {...base(className)}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5" /><path d="M16 5a3 3 0 0 1 0 6M21 20c-.4-2.6-1.8-4.4-3.8-5.1" /></svg>
);
/** 상품 특징 — 반짝임 */
export const IconSparkles = ({ className }: P) => (
  <svg {...base(className)}><path d="M11 3.5l1.7 4.6 4.6 1.7-4.6 1.7L11 16.1l-1.7-4.6-4.6-1.7 4.6-1.7z" /><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>
);
/** 체크 */
export const IconCheck = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
/** 포함 / 접수 완료 — 동그라미 체크 */
export const IconCircleCheck = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.3l2.4 2.4 4.6-4.7" /></svg>
);
/** 불포함 — 동그라미 엑스 */
export const IconCircleX = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
);
/** 숙박 호텔 — 건물 */
export const IconBuilding = ({ className }: P) => (
  <svg {...base(className)}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" /><path d="M10.5 21v-3h3v3" /></svg>
);
/** 규정 — 압정 */
export const IconPin = ({ className }: P) => (
  <svg {...base(className)}><path d="M9 3.5h6l-1 6.5 3 3H7l3-3-1-6.5z" /><path d="M12 13v7.5" /></svg>
);
/** 예약 문의 — 클립보드 */
export const IconClipboard = ({ className }: P) => (
  <svg {...base(className)}><rect x="5.5" y="4.5" width="13" height="16.5" rx="2" /><path d="M9.5 3h5v3h-5z" /><path d="M9 11h6M9 15h4" /></svg>
);
/** QR 스캔 — 카메라 */
export const IconCamera = ({ className }: P) => (
  <svg {...base(className)}><path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
/** 공유 — 연결 고리 */
export const IconLink = ({ className }: P) => (
  <svg {...base(className)}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
