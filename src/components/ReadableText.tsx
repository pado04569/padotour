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
 * 위에서 아래로 읽히므로 줄 끝 화살표는 붙이지 않는다 — 초록 "→"가 링크처럼 보였다 (사장님 지시 2026-10-10)
 *
 * 휴대폰에서 의미와 상관없이 줄이 끊기던 것 정리 (사장님 지시 2026-10-10) — 글은 한 글자도 바꾸지 않는다
 *  - 끝에 붙은 식사 안내 "[조식 호텔식 / 중식·석식 불포함]"는 따로 한 줄
 *  - "카오/위너스/포레스트낭칸" 처럼 붙은 목록은 "/" 뒤, 괄호 설명은 "(" 앞에서만 줄이 넘어가게(<wbr>)
 *  - 단어 중간은 끊지 않고(keep-all), 그래도 넘치면 마지막 수단으로만 끊는다
 */
function Breakable({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  text.split(/(\/|\()/).forEach((piece, i) => {
    if (piece === "(") out.push(<wbr key={`w${i}`} />, "(");
    else if (piece === "/") out.push("/", <wbr key={`w${i}`} />);
    else if (piece) out.push(piece);
  });
  return <>{out}</>;
}

export function Steps({
  text,
  className = "text-[13px] text-gray-600 leading-[1.65] break-keep [overflow-wrap:anywhere]",
}: {
  text: string;
  className?: string;
}) {
  const steps = text
    .split(/\s*→\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  // 마지막 단계 끝의 [식사 안내]를 떼어 따로 보여준다
  let meal = "";
  if (steps.length) {
    const m = steps[steps.length - 1].match(/^(.*?)\s*(\[[^\]]*\])\s*$/);
    if (m && /조식|중식|석식|식사/.test(m[2])) {
      meal = m[2];
      steps[steps.length - 1] = m[1];
      if (!steps[steps.length - 1]) steps.pop();
    }
  }

  if (steps.length < 2 && !meal) return <p className={className}><Breakable text={text} /></p>;

  return (
    <ol className="space-y-2.5">
      {steps.map((step, i) => (
        <li key={i} className={className}>
          <Breakable text={step} />
        </li>
      ))}
      {meal && <li className="text-[12.5px] text-slate-500 leading-[1.65] break-keep">{meal}</li>}
    </ol>
  );
}
