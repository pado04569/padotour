import DepartureHome from "@/components/DepartureHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "청주출발 골프여행 | 여행의 파도",
  description: "청주공항 출발 해외 골프여행 패키지. 골프투어 일정과 요금을 확인하세요.",
  alternates: { canonical: "https://www.padotour.com/cheongju" },
  openGraph: {
    title: "청주출발 골프여행 | 여행의 파도",
    description: "청주공항 출발 해외 골프여행 패키지. 골프투어 일정과 요금을 확인하세요.",
    url: "https://www.padotour.com/cheongju",
  },
};

export default function Page() {
  return <DepartureHome dep="cheongju" />;
}
