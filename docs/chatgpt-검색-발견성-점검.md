# ChatGPT 검색 발견성 점검·개선 기록 (2026-11-08)

기준: `main` dc2256e → 작업 브랜치 `feat/chatgpt-search-discoverability` (배포·병합 안 함)
검색 노출·순위 상승은 보장하지 않는다. 이 작업은 검색 접근성·정보 정확성·문의 측정 개선이다.

## 1. 현황 점검표

| 항목 | 현재 구현·근거 | 문제 | 조치 | 확인 필요 |
|---|---|---|---|---|
| robots.txt | `src/app/robots.txt` — `*`와 OAI-SearchBot·GPTBot·ChatGPT-User 등 모두 Allow, `/admin`·`/api`만 Disallow | 없음 (OAI-SearchBot 차단 안 함) | 유지. GPTBot 정책 안 바꿈 | 이번 작업은 robots.txt를 바꾸지 않았다. (참고: OpenAI 문서는 robots.txt를 바꿨을 때 자기 시스템이 조정되는 데 약 24시간이 걸릴 수 있다고 안내한다. 이는 robots.txt 변경에 대한 설명일 뿐, 이번 배포나 검색 반영·노출 시점을 뜻하지 않는다) |
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

## 7. 미리보기 추가 검증 (2026-11-08)
- 미리보기: 브랜치 별칭 `padotour-git-feat-chatgpt-search-dis-da30cd-pado04569s-projects.vercel.app` (Vercel 로그인 보호로 외부는 302. 사장님 로그인 상태에서만 열림 — 검색 봇은 못 봄)
- 비교 대상 26개: tours.json 원본에서 따로 계산해 대조 — 모두 `departure === "busan"`(인천·부산 공용 0개), 오늘(한국시간) 이후 11~3월 출발일 있음(오키나와 1·클락 15·치앙마이 10)
- 최저가 대조: 오키나와 1,499,000(2027-03-23·3박4일) / 클락 599,000(2026-12-07·3박5일) / 치앙마이 799,000(2027-02-28·3박5일) — 원본 계산과 일치. 가격이 0 이하인 날짜 없음
- 한 상품에 3박5일·4박6일 출발일이 섞인 상품(클락 3개)은 최저가 날짜의 박수를 함께 표기. 치앙마이 최저가는 4인 이상 상품 요금이라 "2인 출발 가능 상품 중 최저가"를 따로 표시(979,000원, 2027-03-01)
- 문의 이벤트(브라우저 stub, 서버 전송 없음): 실패(500) 더블클릭 → POST 1회·inquiry_fail 1회 / 네트워크 오류 → inquiry_fail 1회 / 성공 3연타 → POST 1회·generate_lead 1회. 전화 버튼은 contact_click과 contact_lead 별개. 이벤트에 전화번호·쿼리 없음. `?q=010-…`를 붙여 열어도 entry_landing은 경로만 저장됨
- 미검증: HolePriceTierSelector·ContactOptions 문의 폼(같은 패턴이나 직접 실행 안 함)

## 8. 운영 설정 확인
GA4(속성 552153532, 로그인 상태에서 읽기만):
- 이미 chatgpt.com / ai-assistant 로 자동 분류됨(홈 카드 최근 7일: 세션 71, 첫 사용자 활성 사용자 55)
- 기존 맞춤 측정기준(이벤트 범위) 5개: item_name, percent, reason, method, first_field — **entry_source·entry_landing은 아직 없음**
- 등록 절차(사장님 또는 권한자): 관리 > 맞춤 정의 > 맞춤 측정기준 만들기 > 범위 "이벤트" > 측정기준 이름(예: 유입출처, 시작경로) > 이벤트 매개변수 `entry_source` / `entry_landing`. 등록 후 쌓인 데이터부터 보고서에 나오고 과거 데이터는 소급 안 됨. 코드 배포 전에 만들어도 무방
- 내부 트래픽: 코드에 debug_mode·traffic_type 구분 없음. GA4 데이터 필터(내부 트래픽 IP) 설정 여부는 화면을 열지 못해 **확인 불가**
Vercel(읽기만):
- 방화벽: 사용자 지정 규칙 0개, 거부된 IP 없음, 봇 보호 비활성. OpenAI 대역을 막는 규칙 없음
- 시스템 DDoS 완화는 활성(자동, 봇별 로그는 이 화면에서 구분 안 됨). 차단 로그에서 OAI-SearchBot만 골라 보는 것은 **확인 불가**
- 배포 보호(미리보기 로그인)는 운영 도메인에는 적용되지 않음 — 운영 도메인 접근은 위 curl로 200 확인
