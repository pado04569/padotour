"use client";

// 홀수별 요금 카드 — 누르면 스크롤 이동뿐 아니라 하단 "예약 문의·맞춤 견적" 노란 박스를 바로 펼쳐준다
// (사장님 지적 2026-09-29: "파란색 문의접수로 스크롤이 내려가게 해달라는 말이 아니야" — 클릭하면 바로 문의 폼이 열려야 함)
export default function PriceTierCard({
  holes,
  pattern,
  price,
}: {
  holes: number;
  pattern?: string;
  price: number;
}) {
  function handleClick() {
    document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new Event("padotour-open-inquiry"));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="block w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl p-3 md:p-5 text-center transition-colors"
    >
      <p className="text-sm md:text-base font-black text-gray-800 mb-1">{holes}홀</p>
      {pattern && <p className="text-[11px] md:text-xs text-gray-400 mb-2">({pattern})</p>}
      <p className="text-lg md:text-2xl font-black text-red-600">{price.toLocaleString()}원</p>
    </button>
  );
}
