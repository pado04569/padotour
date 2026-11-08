# ChatGPT 검색 발견성 점검·개선 기록 (2026-11-08)

기준: `main` dc2256e → 작업 브랜치 `feat/chatgpt-search-discoverability` (배포·병합 안 함)
검색 노출·순위 상승은 보장하지 않는다. 이 작업은 검색 접근성·정보 정확성·문의 측정 개선이다.

## 1. 현황 점검표

| 항목 | 현재 구현·근거 | 문제 | 조치 | 확인 필요 |
|---|---|---|---|---|
| robots.txt | `src/app/robots.txt` — `*`와 OAI-SearchBot·GPTBot·ChatGPT-User 등 모두 Allow, `/admin`·`/api`만 Disallow | 없음 (OAI-SearchBot 차단 안 함) | 유지. GPTBot 정책 안 바꿈 | 변경 후 반영은 공식 문서상 약 24시간 |
| CDN·방화벽 | Vercel. 일반 UA 요청 200 확인(홈·목록·상세·sitemap·llms.txt) | UA만 바꾼 요청이라 실제 OpenAI IP 접근 성공은 **확인 불가** | 기록만 | Vercel 방화벽·봇 보호에서 openai.com/searchbot.json IP 대역 차단 여부 |
| 상품 본문 | 정적 생성(SSG), 초기 HTML에 제목·항공편·출발일·FAQ 포함, TouristTrip·FAQPage·Breadcrumb JSON-LD | 최저가 기준(날짜·객실·인원)이 글로 없었음 | 요약 박스에 "최저 요금" 줄 추가 | — |
| canonical·noindex | 상세 canonical 자기 자신, robots index,follow | 없음 | 유지 | — |
| sitemap | 상품·골프장·안내 페이지 포함 | 비교 페이지 없음. 정적 페이지 lastmod가 빌드 시각 | 비교 페이지 추가. lastmod는 기존 방식 유지 | 빌드 시각을 상품 확인일로 쓰지 않음(상품은 priceUpdatedDate 사용 중) |
| 판매 종료 상품 | `lib/endedTourRedirect.ts` — 308으로 지역>나라>목록 이동(사장님 10/13 규칙) | 지시서의 "일괄 리디렉션 금지"와 방향이 다름 | **바꾸지 않음**(기존 사장님 규칙) | 종료 안내 페이지로 바꿀지 사장님 결정 |
| 기존 FAQ | `lib/tourFaq.ts` 항공·요금·인원·라운딩·포함·숙소·식사 등 | 최저가 기준, 도착일 라운딩, 현지 비용 질문 없음 | 3개 추가(데이터 있을 때만) | 27홀 조건부 여부 질문은 근거 필드가 없어 추가 안 함 |
| 구조화 데이터 | AggregateOffer는 출발일 요금에서 생성, 별점·후기 없음 | 없음 | 유지 | — |
| 측정 | `lib/analytics.ts` track(), generate_lead는 서버 응답 ok일 때만, `submittingRef`로 중복 방지, 개인정보 미전송 | ChatGPT 유입 구분 없음 | `lib/attribution.ts` 추가 | GA4 '주요 이벤트' 지정은 이미 contact_lead 지정됨 |
| 비교 안내 | `/guide/[region]` 지역 안내만 있음 | 부산 출발 비교 없음 | `/guide/busan-winter-golf` 신규 | — |

## 2. 변경 파일
- `src/lib/tripFacts.ts` — 한국 날짜 기준(`kstTodayIso`). 서버 UTC로 하루 어긋나던 것 수정
- `src/app/tours/[id]/page.tsx` — 요약 박스에 "최저 요금 · 1인 · N인 1실 기준 · 인원 조건"
- `src/lib/tourFaq.ts` — FAQ 3개(최저가 기준·도착일 라운딩·현지 별도 비용), 데이터 없으면 생략
- `src/app/guide/busan-winter-golf/page.tsx` — 부산 출발 겨울 골프여행 비교(오키나와·클락·치앙마이), 요금·기간·인원은 tours.json에서 생성
- `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`, `src/app/busan/page.tsx` — 비교 페이지 연결
- `src/lib/attribution.ts`, `src/lib/analytics.ts`, `src/components/BehaviorTracker.tsx` — ChatGPT 유입 표시
- `scripts/test-chatgpt-search.mjs` — 회귀 테스트(16건)

## 3. 추적 방식
- `utm_source=chatgpt.com` → `entry_source=chatgpt_utm`, 리퍼러 chatgpt.com·chat.openai.com → `chatgpt_referrer`. 둘 다 아니면 값 없음(추정 안 함).
- sessionStorage에 세션당 한 번만 저장, 덮어쓰지 않음. 경로(? 뒤 제외)만 저장.
- `generate_lead`·`contact_lead`·`view_item`에만 `entry_source`·`entry_landing` 덧붙임. GA4 기본 firstUserSource(처음 획득)와 의미가 다르다 — 이 값은 "이번 세션을 연 출처".
- 신규 추적 도구·쿠키 없음.
- **예약 자동 연결은 없다.** 수동 대조: 문의 문자·`inquiries:<전화번호>`(Redis)의 상품·출발일·접수시각 ↔ 예약 장부를 고객별로 맞춰 본다. 서버에 출처 필드를 저장하는 안은 운영 문의 API를 건드려 이번에 하지 않음.

## 4. 주간 확인(같은 기간·한국시간 기준 월~일)
GA4 탐색 보고서: 세션 소스가 chatgpt.com인 **세션** → 방문 페이지(세션 첫 페이지) → `generate_lead`·`contact_lead` 이벤트 수(맞춤 측정기준 entry_source) → 사장님 장부로 확인한 예약 수. 세션·사용자·조회수를 섞지 않는다. 비교 기간은 2~4주.
- 맞춤 측정기준(entry_source, entry_landing)을 GA4 관리에서 등록해야 보고서에 보인다(운영 확인 대기).

## 5. 확인 필요 값(추정하지 않음)
- 추가 라운드(27홀 등) 확정/현지 조건부 구분 필드 없음 → 상품 글(highlights)에만 있음. 필드화하려면 사장님 확인 필요.
- 2인 단독 라운드 보장 여부 필드 없음(`minPeople` 글에 "조인" 표기만). 비교 페이지·FAQ는 원문 칩을 그대로 쓴다.
- 이동시간은 상품 글에 있는 것만 노출(긴 이동시간 생략 규칙 유지).

## 6. 검증
- tsc·eslint 통과, `npm run build`(prebuild 검사 포함) 통과
- `node scripts/test-chatgpt-search.mjs` 16/16, `test-people-condition.mjs` 통과
- 로컬 운영 빌드: 비교 페이지 200, 375px·1280px 가로 넘침 0, 상세 요약 박스·하단 요금 패널 749,000원 일치
- 브라우저에서 ?utm_source=chatgpt.com 로 열고 전화 버튼 클릭 → contact_lead에 entry_source 포함, 개인정보 없음
- **실행 안 함**: 실제 문의 제출(운영 데이터 생성 방지) — 중복 방지는 코드 확인(`submittingRef`, 성공 응답에서만 track)으로 갈음
