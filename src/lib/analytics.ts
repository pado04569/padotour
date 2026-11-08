/**
 * 여행의파도 행동 측정 공통 모듈
 *
 * 규칙
 *  - 분석 이벤트는 반드시 이 track() 을 통해서만 보낸다.
 *    (컴포넌트에서 window.gtag 를 직접 부르지 않는다 — 중복 전송·이름 오타를 막기 위해)
 *  - 개인정보(이름·휴대폰·이메일)는 어떤 경우에도 매개변수에 넣지 않는다.
 *  - 같은 행동은 한 번만 보낸다. (중복 방지는 호출하는 쪽에서 처리)
 */

import { entryParams } from "@/lib/attribution";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4 로 보내는 이벤트 이름 — 여기 없는 이름은 쓰지 않는다 */
export type EventName =
  | "scroll_depth"      // 페이지를 어디까지 읽었나 (25/50/75/100)
  | "contact_click"     // 전화·카톡·밴드·블로그 링크 클릭
  | "contact_lead"      // 전화·카톡 문의 버튼만 (GA4 '주요 이벤트'용 — 밴드·블로그 이동은 문의가 아니라 뺌, 2026-11-07)
  | "view_item"         // 상품 상세 진입
  | "inquiry_open"      // 예약 문의 영역을 펼침
  | "inquiry_start"     // 문의 폼에 입력을 시작함
  | "generate_lead"     // 문의 제출 성공 (= 전환)
  | "inquiry_fail"      // 문의 제출 실패 (메일 전송 오류 등)
  | "share";            // 상품 공유 (지인에게 전달 — 새 유입을 만드는 행동)

type Params = Record<string, string | number | boolean | undefined>;

export function track(name: EventName, params: Params = {}) {
  if (typeof window === "undefined") return;

  // 개발 중에는 콘솔로 확인할 수 있게 한다 (배포본에서는 출력되지 않음)
  if (process.env.NODE_ENV === "development") {
    console.log("[track]", name, params);
  }

  // 문의·상품 조회에는 ChatGPT로 시작한 세션 표시를 덧붙인다 (없으면 아무것도 안 붙음)
  const withEntry = name === "generate_lead" || name === "contact_lead" || name === "view_item" ? { ...entryParams(), ...params } : params;
  window.gtag?.("event", name, withEntry);
}
