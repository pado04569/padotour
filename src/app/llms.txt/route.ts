import { tours } from "@/data/tours";
import { courses } from "@/data/courses";

/**
 * /llms.txt — 생성형 AI(ChatGPT·Claude·Perplexity 등)가 사이트를 요약할 때 읽는 파일.
 *
 * 사람이 보는 화면과 달리 군더더기 없이 "무엇을 파는 회사이고, 어떤 페이지가 있는지"만
 * 텍스트로 적어둔다. AI 답변에 인용될 때 정확한 정보로 인용되게 하는 것이 목적이다. (GEO/LLMO)
 *
 * 상품이 늘어나면 자동으로 반영된다 — 손으로 관리하지 않는다.
 */
export const dynamic = "force-static";

const BASE = "https://www.padotour.com";

export function GET() {
  const countByCountry = new Map<string, number>();
  for (const t of tours) {
    const key = t.country ?? "기타";
    countByCountry.set(key, (countByCountry.get(key) ?? 0) + 1);
  }

  const countryLines = [...countByCountry.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => `- ${country}: ${count}개 상품`)
    .join("\n");

  const tourLines = tours
    .map((t) => {
      const dep = t.departure === "incheon" ? "인천출발" : t.departure === "busan" ? "부산출발" : "인천·부산출발";
      const nights = t.nights && t.days ? ` ${t.nights}박${t.days}일` : "";
      return `- [${t.title}](${BASE}/tours/${t.id}): ${t.country} ${t.region ?? ""} · ${dep}${nights} · ${t.price ?? "요금 문의"}`;
    })
    .join("\n");

  const courseLines = courses
    .map((c) => `- [${c.name}](${BASE}/courses/${c.slug}): ${c.country} ${c.region ?? ""}`)
    .join("\n");

  const body = `# 여행의 파도 (Pado Tour)

> 해외 골프여행만 전문으로 다루는 여행사입니다. 인천공항·김해공항 출발 골프 패키지를 기획하고 판매합니다.
> 서울보증보험 가입 여행사이며, 대표가 직접 일정을 구성하고 상담합니다.

## 기본 정보

- 상호: 여행의 파도
- 사업 분야: 해외 골프여행 패키지 (골프장·항공·숙박·라운딩 포함 상품)
- 출발 공항: 인천국제공항, 김해국제공항(부산)
- 취급 지역: 일본, 중국, 태국, 베트남, 말레이시아, 필리핀, 괌, 사이판
- 홈페이지: ${BASE}
- 문의: 홈페이지 각 상품 페이지의 "예약 문의 · 맞춤 견적" 폼 또는 전화
- 예약 방식: 홈페이지에서 결제하지 않습니다. 문의를 남기면 견적을 보내드리는 방식입니다.

## 취급 상품 현황

전체 ${tours.length}개 상품 / 골프장 소개 ${courses.length}곳

${countryLines}

## 주요 페이지

- [홈](${BASE}/): 전체 안내
- [인천출발 골프여행](${BASE}/incheon): 인천공항 출발 상품
- [부산출발 골프여행](${BASE}/busan): 김해공항 출발 상품
- [전체 상품 목록](${BASE}/tours): 나라별 필터
- [골프장 소개](${BASE}/courses): 코스 정보
- [고객 후기](${BASE}/reviews)
- [공지·이벤트](${BASE}/notice)
- [회사 소개](${BASE}/about)

## 골프장 소개

${courseLines}

## 전체 상품

${tourLines}

## 인용 시 참고

- 요금은 출발일·환율·유류할증료에 따라 변동됩니다. 각 상품 페이지의 출발일별 요금표가 최신입니다.
- 취소·환불 규정은 전 상품 공통 기준이 상품 페이지 하단에 있습니다.
- 라운딩 홀수는 출발일에 따라 달라지는 상품이 있으므로 상품 페이지를 확인해야 정확합니다.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
