import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import BehaviorTracker from "@/components/BehaviorTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.padotour.com"),
  title: "여행의파도 | 골프여행 전문 여행사",
  description: "여행의파도는 일본·태국·중국·필리핀 해외골프여행 전문 여행사입니다. 인천·부산 출발 상품을 안내합니다.",
  keywords: "골프여행, 일본골프여행, 후쿠오카골프, 홋카이도골프, 태국골프, 중국골프, 필리핀골프, 여행의파도",
  openGraph: {
    type: "website",
    siteName: "여행의 파도",
    title: "여행의파도 | 골프여행 전문 여행사",
    description: "여행의파도 | 일본·태국·중국·필리핀 골프여행 전문. 인천·부산 출발 상품과 일정·요금을 확인하세요.",
    url: "https://www.padotour.com",
    locale: "ko_KR",
    images: [
      {
        url: "/images/og-logo.png",
        width: 1200,
        height: 630,
        alt: "여행의 파도 골프전문 여행사",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "naver-site-verification": "bb7094b829a116cc7a20ff2d149e2b139ba43e72",
  },
};

const travelAgencyJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "여행의 파도",
  url: "https://www.padotour.com",
  logo: "https://www.padotour.com/images/logo.png",
  image: "https://www.padotour.com/images/og-logo.png",
  telephone: "+82-10-5301-5250",
  email: "pado-tour-@naver.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "토정로35길 11, 5층 5427호(용강동, 인우빌딩)",
    addressLocality: "마포구",
    addressRegion: "서울특별시",
    addressCountry: "KR",
  },
  description: "일본·태국·중국·베트남·말레이시아·필리핀 등 해외 골프여행 전문 여행사. 인천·부산 출발 골프 패키지 상품을 안내합니다.",
  sameAs: [
    "https://blog.naver.com/pado-tour-",
    "https://band.us/@padotour",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f5fa6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="여행의 파도" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencyJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
        <BehaviorTracker />
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-DG24CY8YLS" />
    </html>
  );
}
