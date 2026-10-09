// 홈페이지 공통 화살표 — 글자 화살표(← → ▼ ‹ ›)와 제각각이던 SVG를 하나로 통일 (UX 개편 2026-10-09)
// 둥근 끝·얇은 선(1.8). 색은 부모 글자색(currentColor)을 따라가므로 text-gray/blue/emerald 로 맞춘다.

type Dir = "left" | "right" | "up" | "down";

const ROTATE: Record<Dir, string> = {
  right: "",
  down: "rotate-90",
  left: "rotate-180",
  up: "-rotate-90",
};

export function IconChevron({ dir = "right", className = "w-4 h-4" }: { dir?: Dir; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block flex-shrink-0 align-middle transition-transform ${ROTATE[dir]} ${className}`}
    >
      <path d="M9 5.5 15.5 12 9 18.5" />
    </svg>
  );
}

// 출발지 바꾸기처럼 "서로 바꾼다"는 뜻의 아이콘
export function IconSwap({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block flex-shrink-0 align-middle ${className}`}
    >
      <path d="M4 8h14.5M15 4.5 18.5 8 15 11.5" />
      <path d="M20 16H5.5M9 12.5 5.5 16 9 19.5" />
    </svg>
  );
}
