/**
 * 박수·일수 표시 — "3박4일".
 *
 * nights 에 "3박4일~4박5일"·"3박5일·4박6일" 처럼 이미 완성된 글이 들어 있는 상품이 있다.
 * 그대로 "박"·"일"을 또 붙이면 "3박4일~4박5일박4일~5일일" 이 된다 (2026-10-09 챗GPT 감사에서 발견).
 * 이미 "박"이 들어 있으면 그대로 쓴다.
 */
export function stayText(nights: unknown, days: unknown, sep = ""): string {
  const n = String(nights ?? "").trim();
  if (!n) return "";
  if (n.includes("박")) return n;
  const d = String(days ?? "").trim();
  return d ? `${n}박${sep}${d}일` : `${n}박`;
}
