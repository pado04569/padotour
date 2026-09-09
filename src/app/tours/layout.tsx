import type { Metadata } from "next";

// /tours 목록은 클라이언트 컴포넌트라 페이지에서 metadata 를 내보낼 수 없다.
// 이 layout 에서 대신 지정한다.
export const metadata: Metadata = {
  title: "해외 골프여행 상품 | 여행의 파도",
  description:
    "일본·중국·태국·베트남·말레이시아·필리핀 해외 골프여행 패키지 전체 목록. 인천·부산 출발 일정과 요금을 확인하세요.",
  alternates: { canonical: "https://www.padotour.com/tours" },
  openGraph: {
    title: "해외 골프여행 상품 | 여행의 파도",
    description:
      "일본·중국·태국·베트남·말레이시아·필리핀 해외 골프여행 패키지 전체 목록. 인천·부산 출발 일정과 요금을 확인하세요.",
    url: "https://www.padotour.com/tours",
  },
};

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
