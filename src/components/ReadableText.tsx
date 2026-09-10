/**
 * 긴 설명글을 읽기 쉽게 끊어주는 컴포넌트.
 *
 * 상품 페이지의 숙소·골프장 설명, 일정표는 한 덩어리로 붙어 있어
 * 모바일에서 벽처럼 보였다. 고객이 직접 읽는 화면이므로 가독성을 우선한다.
 * (사장님 확정 2026-09-10)
 */

/** 마침표를 기준으로 문장마다 줄을 나눈다. */
export function Sentences({
  text,
  className = "text-sm text-gray-600 leading-relaxed break-keep",
}: {
  text: string;
  className?: string;
}) {
  const lines = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line, i) => (
        <p key={i} className={className}>
          {line}
        </p>
      ))}
    </div>
  );
}

/**
 * 일정처럼 "A → B → C" 로 이어지는 글을 단계마다 줄을 나눈다.
 * 화살표는 줄 끝에 남겨 이어진다는 것을 보여준다.
 */
export function Steps({
  text,
  className = "text-[13px] text-gray-600 leading-relaxed break-keep",
}: {
  text: string;
  className?: string;
}) {
  const steps = text
    .split(/\s*→\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (steps.length < 2) return <p className={className}>{text}</p>;

  return (
    <ol className="space-y-1.5">
      {steps.map((step, i) => (
        <li key={i} className={className}>
          {step}
          {i < steps.length - 1 && <span className="text-emerald-500 font-bold"> →</span>}
        </li>
      ))}
    </ol>
  );
}
