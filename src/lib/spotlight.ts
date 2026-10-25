// 홈 여행지 추천 영역 자료 — 서버에서 상품 데이터를 간추려 클라이언트 탭 컴포넌트에 넘긴다
// (사장님 작업지시 2026-10-25: 치앙마이·코타키나발루·괌/사이판, 출발지 연동, 상품 최대 4개)
import { tours, type Tour } from "@/data/tours";

export type SpotCard = {
  id: string;
  image: string;
  country: string;
  region: string;
  title: string;
  meta: string; // "3박5일 · 총 54홀"
  price: string; // "779,000원~"
};

export type SpotRegion = {
  key: string;
  label: string; // 탭 이름
  country: string; // "태국"
  place: string; // "태국 · 치앙마이"
  photo: string;
  dateRange: string; // "2026.11 ~ 2027.2" (남은 출발일 기준, 없으면 "")
  title: string;
  desc: string;
  features: string[];
  allHref: string;
  allLabel: string;
  otherDepHref: string; // 상품이 없을 때 다른 출발지 안내
  otherDepLabel: string;
  cards: SpotCard[];
};

const TODAY = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

const nightsLabel = (t: Tour) => {
  const n = String(t.nights ?? "");
  if (n.includes("박")) return n;
  const d = String(t.days ?? "");
  return n && d ? `${n}박${d}일` : "";
};

const holesLabel = (t: Tour) => {
  const m = String(t.holes ?? "").match(/(\d+홀)/);
  return m ? `총 ${m[1]}` : "";
};

const priceNum = (t: Tour) => {
  const m = String(t.price ?? "").replace(/,/g, "").match(/\d+/);
  return m ? Number(m[0]) : Infinity;
};

function liveTours(dep: string, regions: string[]): Tour[] {
  const today = TODAY();
  return tours
    .filter((t) => regions.includes(t.region ?? ""))
    .filter((t) => t.departure === dep || t.departure === "both")
    .filter((t) => {
      const dps = t.departurePrices ?? [];
      return dps.length === 0 || dps.some((p) => p.date > today);
    });
}

function dateRange(list: Tour[]): string {
  const today = TODAY();
  const dates = list
    .flatMap((t) => (t.departurePrices ?? []).map((p) => p.date))
    .filter((d) => d > today)
    .sort();
  if (dates.length === 0) return "";
  const f = (d: string) => `${Number(d.slice(0, 4))}.${Number(d.slice(5, 7))}`;
  const a = f(dates[0]);
  const b = f(dates[dates.length - 1]);
  return a === b ? a : `${a} ~ ${b}`;
}

function toCards(list: Tour[]): SpotCard[] {
  return [...list]
    .sort((a, b) => priceNum(a) - priceNum(b))
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      image: t.image ?? t.images?.[0] ?? "/images/golf-main.jpg",
      country: t.country ?? "",
      region: t.region ?? "",
      title: t.displayTitle ?? t.title,
      meta: [nightsLabel(t), holesLabel(t)].filter(Boolean).join(" · "),
      price: String(t.price ?? "").replace(/~\s*$/, "~"),
    }));
}

// 지역 소개 — 판매 중인 상품에서 확인되는 내용만 적는다 (작업지시 4항: 확인 안 된 정보 금지)
const COPY: Record<
  string,
  { title: string; desc: string; features: Record<string, string[]> }
> = {
  치앙마이: {
    title: "가을부터 겨울까지, 골프는 계속",
    desc: "11~2월 건기의 치앙마이는 덥지 않아 라운딩하기 좋은 계절입니다. 골프장 안 골프텔부터 독채 풀빌라까지 숙소 방식이 다양합니다.",
    features: {
      incheon: [
        "골프장 안 골프텔 숙박 — 아침에 바로 라운딩",
        "시내 숙박형은 하루마다 다른 코스 라운딩",
        "로얄 치앙마이·가싼 파노라마 등 명문 코스",
      ],
      busan: [
        "부산(김해) 직항 출발",
        "골프장 안 골프텔 숙박 — 아침에 바로 라운딩",
        "독채 풀빌라 일정까지 숙소 선택 폭이 넓음",
      ],
    },
  },
  코타키나발루: {
    title: "리조트에 머무는 휴양 골프",
    desc: "잭 니클라우스 설계 보르네오CC처럼 골프장 안 리조트에 숙박하며 매일 라운딩하는 일정이 많습니다. 무제한 골프 상품도 있습니다.",
    features: {
      incheon: [
        "골프장 안 리조트 숙박형 일정",
        "매일 36홀 무제한 라운딩 상품",
        "전 일정 식사 포함 상품",
      ],
      busan: [
        "부산(김해) 직항 출발",
        "보르네오CC 매일 36홀 무제한 라운딩",
        "달릿베이·가람부나이·수트라하버 3색 일정",
      ],
    },
  },
  "괌·사이판": {
    title: "가깝고 편안한 남태평양 골프",
    desc: "바다를 보며 라운딩하는 남태평양 코스입니다. 리조트 숙박과 묶인 일정이라 동반자와 함께 쉬기에도 좋습니다.",
    features: {
      incheon: [
        "라오라오베이·코랄오션 등 바다 전망 코스",
        "PIC 리조트 숙박형 일정",
        "가을·겨울에도 라운딩하기 좋은 날씨",
      ],
      busan: [
        "괌 파인이스트 골프텔·힐튼 리조트 일정",
        "바다 전망 코스 라운딩",
        "가을·겨울에도 라운딩하기 좋은 날씨",
      ],
    },
  },
};

const DEF = [
  { key: "chiangmai", label: "치앙마이", regions: ["치앙마이"], country: "태국", photo: "/images/hero-chiangmai-2.jpg", href: (dep: string) => `/tours?country=thailand&region=${encodeURIComponent("치앙마이")}&departure=${dep}` },
  { key: "kota", label: "코타키나발루", regions: ["코타키나발루"], country: "말레이시아", photo: "/images/hero-kota.jpg", href: (dep: string) => `/tours?country=malaysia&region=${encodeURIComponent("코타키나발루")}&departure=${dep}` },
  { key: "guam", label: "괌·사이판", regions: ["괌", "사이판", "괌/사이판"], country: "미국", photo: "/images/hero-saipan-coralocean-2.jpg", href: (dep: string) => `/tours?country=other&departure=${dep}` },
];

export function buildSpotlight(dep: "incheon" | "busan"): SpotRegion[] {
  const otherDep = dep === "incheon" ? "busan" : "incheon";
  const otherName = dep === "incheon" ? "부산" : "인천";
  return DEF.map((d) => {
    const list = liveTours(dep, d.regions);
    const copy = COPY[d.label];
    return {
      key: d.key,
      label: d.label,
      country: d.country,
      place: `${d.country === "미국" ? "괌·사이판" : d.country + " · " + d.label}`,
      photo: d.photo,
      dateRange: dateRange(list),
      title: copy.title,
      desc: copy.desc,
      features: copy.features[dep] ?? [],
      allHref: d.href(dep),
      allLabel: `${d.label} 상품 전체 보기`,
      otherDepHref: d.href(otherDep),
      otherDepLabel: `${otherName} 출발 ${d.label} 상품 보기`,
      cards: toCards(list),
    };
  });
}
