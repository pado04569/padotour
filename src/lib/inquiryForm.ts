/**
 * 예약문의 폼 3곳(아래 문의 칸 · 출발일 달력 · 홀수/일정 선택)이 함께 쓰는 규칙.
 * 2026-10-09 챗GPT 감사: ①번호 오타도 "접수 완료"가 됐고 ②9명 이상 단체는 인원을 고를 수 없었다.
 */

/** 인원 선택지 — 2~20명. 그 이상은 "20명 이상"으로 받고 상담에서 확인한다. */
export const PEOPLE_OPTIONS = Array.from({ length: 19 }, (_, i) => i + 2);
export const PEOPLE_MAX_LABEL = (n: number) => (n === 20 ? "20명 이상" : `${n}명`);

/**
 * 연락 가능한 번호인가 — 휴대폰(010·011·016~019) 또는 지역번호 일반전화.
 * 하이픈·공백은 무시한다. 견적은 카카오톡으로 보내지만, 일반전화도 전화 상담은 되므로 막지 않는다.
 */
export function isValidPhone(raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  return /^01[016789]\d{7,8}$/.test(d) || /^0[2-6]\d{7,9}$/.test(d);
}

/** 입력 중 안내 문구 — 비었거나 맞으면 빈 문자열 */
export function phoneHint(raw: string): string {
  if (!raw.trim()) return "";
  return isValidPhone(raw) ? "" : "번호를 다시 확인해 주세요 (예: 010-1234-5678)";
}

/** 오늘 날짜 (한국 기준) YYYY-MM-DD — 지난 날짜를 고르지 못하게 할 때 */
export function todayKST(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
