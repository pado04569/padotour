import type { Metadata } from "next";

// 손님 개인 문의내역(전화번호로 조회) — 검색에 나오지 않게 한다 (SEO 감사 2026-10-11)
export const metadata: Metadata = {
  title: "내 문의내역 | 여행의 파도",
  robots: { index: false, follow: false },
};

export default function MyInquiriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
