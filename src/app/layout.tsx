import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.padotour.com"),
  title: "여행의 파도 | 골프여행 전문",
  description: "여행의파도 - 일본, 태국, 코타키나발루, 필리핀, 중국 골프여행 전문 여행사. 카카오톡으로 편하게 문의하세요.",
  keywords: "골프여행, 일본골프여행, 후쿠오카골프, 홋카이도골프, 태국골프, 코타키나발루골프, 여행의파도",
  openGraph: {
    type: "website",
    siteName: "여행의 파도",
    title: "여행의 파도 | 골프전문 여행사",
    description: "일본·태국·중국·코타키나발루 골프여행 전문. 인천·부산 출발, 합리적인 견적은 카카오톡·전화(010-5301-5250)로 편하게 문의하세요.",
    url: "https://www.padotour.com",
    locale: "ko_KR",
    images: [
      {
        url: "/images/logo-original.png",
        width: 800,
        height: 800,
        alt: "여행의 파도 골프전문 여행사",
      },
    ],
  },
  other: {
    "naver-site-verification": "bb7094b829a116cc7a20ff2d149e2b139ba43e72",
  },
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
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
