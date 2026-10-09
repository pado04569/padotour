import { IconChevron } from "./icons/Chevron";

// 선택 상자 오른쪽의 아래 화살표 — 예전 노란 삼각형(2026-10-02) 대신 공통 화살표로 단정하게 (사장님 요청 2026-10-09: 노란색 없이 세련되게)
// 부모에 relative 가 있어야 하고, select 는 appearance-none 으로 기본 화살표를 숨긴다.
export default function SelectChevron() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500">
      <IconChevron dir="down" className="w-[18px] h-[18px]" />
    </span>
  );
}
