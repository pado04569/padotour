<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 여행의파도 블로그 글 작성 규칙

블로그/밴드 글 초안을 요청받으면, 먼저 아래 규칙 파일을 읽고 그 규칙을 따를 것:
`C:\Users\Lenovo\Desktop\jianne\여행의파도-컨설팅\분석\SERP분석\블로그_글쓰기_규칙_요약_핸드오프.md`

핵심 요약(전체는 위 파일):
- 글 종류를 먼저 2트랙으로 구분 — (A) 간판 SEO 글(가격 노출) vs (B) 감성글(가격 금지·전화유도).
- 첫 문단 인사말 금지, 검색 질문의 완결형 답변(직항시간·이동·가격·출발조건)을 즉시 배치.
- 한 문장=한 사실, 숫자·고유명사(편명·홀·파·야드·분수) 밀도 최대. 감성 문장은 이미지 캡션으로.
- (A)의 가격: 텍스트(매번 변주) + 유니크 요금표 이미지 병행. 이미지에만 넣기 금지, 같은 이미지 재사용 금지(유사문서).
- 상품·골프장 데이터는 `src/data/tours.json`, `src/data/courses.json` 참조. 전화 010-5301-5250(부산은 "여행의파도 부산").

# 상품 등록 시 골프장 페이지 함께 만들기 (기본 동작)

`src/data/tours.json`에 새 상품을 추가하면, **요청이 없어도 골프장 처리까지 함께 한다.**
이유: 골프장 페이지는 상품과 별개로 "골프장 이름" 검색을 잡는 유입구이고, 상품이 끝나도 남는 자산이다.

## 절차
1. 새 상품의 `golfCourse` / `courses` 필드에서 골프장을 확인한다.
2. `src/data/courses.json`에 **이미 있는 골프장**이면 → 그 항목의 `relatedTourIds`에 새 상품 `id`만 추가한다. (새로 만들지 않음)
3. **없는 골프장**이면 → `courses.json`에 새 항목을 추가한다.

## 새 항목 형식
```
{ slug, name, region, country, countryCode, description, images, relatedTourIds }
```
- `slug`: 영문 소문자+하이픈 (예: `kedoin-cc`). 기존 slug와 중복 금지.
- `name`: 한글 골프장명 (예: `케도인CC`)
- `region` / `country` / `countryCode`: 상품 값 그대로 사용
- `description`: 상품의 `golfCourseDesc`·`hotelDesc`·`highlights`에 **실제로 적힌 사실만** 재구성해 3문단 내외. 홀 구성·코스 특징·이동 방식·부대시설(온천 등) 중심. **없는 정보는 절대 지어내지 않는다.** 문단 구분은 `\n\n`.
- `images`: 그 상품의 이미지 폴더에서 **코스 사진(`course-*.jpg`) 우선**, 부족하면 호텔·온천 사진으로 보충해 4~6장.
- `relatedTourIds`: 그 골프장이 포함된 상품 `id` 전부.

## 확인
- 상세 페이지(`/courses/{slug}`)와 사이트맵은 `courses.json` 기준으로 자동 생성되므로 추가 작업 불필요.
- 빌드 성공 확인 후 **상품 작업과 같은 커밋**에 포함한다.
