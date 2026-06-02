# 여행의 파도 - 골프여행 홈페이지

## 로컬에서 실행

```bash
cd padotour
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

---

## ✅ 필수 수정 사항

### 1. 카카오톡 채널 ID 교체
`pf.kakao.com/_your_channel_id` → 실제 카카오채널 주소로 교체

수정 파일: Header.tsx / Footer.tsx / KakaoFloat.tsx / TourCard.tsx / page.tsx / tours/page.tsx / reviews/page.tsx / notice/page.tsx

### 2. 사업자 정보 (`src/components/Footer.tsx`)
- 대표자 이름
- 사업자번호
- 관광사업등록번호
- 전화번호

### 3. 전화번호 (`src/components/Footer.tsx`, `src/app/page.tsx`)
`010-0000-0000` → 실제 번호

---

## 📝 상품 추가/수정

`src/data/tours.ts` 파일 직접 수정:

```typescript
{
  id: "japan-okinawa",
  country: "일본",
  countryCode: "japan",       // japan / china / malaysia / philippines / thailand
  region: "오키나와",
  title: "오키나와 골프여행",
  nights: 3,
  days: 4,
  courses: 2,
  roundsIncluded: 2,
  highlights: ["바다 전망 코스", "따뜻한 날씨"],
  includes: ["항공", "숙박", "골프 2라운드", "조식"],
  excludes: ["중식/석식", "캐디피", "카트피"],
  price: "문의",
  image: "/images/okinawa.jpg",
  badge: "신규",               // 선택사항
},
```

---

## ⭐ 후기 추가

`src/data/reviews.ts`의 `reviews` 배열에 추가:

```typescript
{
  id: "5",
  name: "홍○○ 님",
  country: "일본 후쿠오카",
  countryCode: "japan",
  rating: 5,
  comment: "정말 좋았어요!",
  date: "2025.11",
},
```

---

## 📢 공지/이벤트 추가

`src/data/reviews.ts`의 `notices` 배열에 추가:

```typescript
{
  id: "4",
  title: "겨울 골프여행 특가",
  content: "12~1월 태국·필리핀 특가 진행 중.",
  date: "2025.11.01",
  isEvent: true,   // 이벤트: true, 일반공지: false
},
```

---

## 🚀 Vercel 무료 배포 방법

### Step 1. GitHub에 올리기

```bash
# padotour 폴더 안에서
git add .
git commit -m "여행의 파도 홈페이지 첫 배포"

# GitHub에서 새 저장소 만들고 (이름: padotour)
git remote add origin https://github.com/[내아이디]/padotour.git
git push -u origin main
```

### Step 2. Vercel 연결

1. https://vercel.com 접속 → GitHub 로그인
2. "New Project" → padotour 저장소 선택
3. "Deploy" 클릭 → 2분 후 자동 배포
4. `padotour.vercel.app` 주소로 바로 접속 가능

### Step 3. 도메인 연결 (padotour.com 구매 후)

1. 가비아에서 `padotour.com` 재구매 (연 1~2만원)
2. Vercel → Settings → Domains → `padotour.com` 입력
3. 가비아 DNS에서 Vercel 네임서버 입력
4. 1~24시간 후 적용

---

## 📁 폴더 구조

```
src/
├── app/
│   ├── page.tsx           # 메인 홈페이지
│   ├── tours/page.tsx     # 상품 목록
│   ├── reviews/page.tsx   # 고객 후기
│   └── notice/page.tsx    # 공지/이벤트
├── components/
│   ├── Header.tsx         # 상단 메뉴
│   ├── Footer.tsx         # 하단 정보
│   ├── KakaoFloat.tsx     # 카카오톡 플로팅 버튼
│   └── TourCard.tsx       # 상품 카드
└── data/
    ├── tours.ts           # 상품 데이터 ← 여기서 수정
    └── reviews.ts         # 후기·공지 데이터 ← 여기서 수정
```
