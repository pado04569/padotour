// 선택 상자 오른쪽의 아래 화살표 — 눈에 띄도록 카카오 노랑으로 (사장님 요청 2026-10-02)
// 부모에 relative 가 있어야 하고, select 는 appearance-none 으로 기본 화살표를 숨긴다.
export default function YellowArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 9"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-3"
    >
      <path d="M1.5 1.5 L7 7.5 L12.5 1.5 Z" fill="#FAE100" stroke="#D9B800" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
