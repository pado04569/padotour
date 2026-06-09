import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "여행의 파도 | 골프여행 전문",
  description: "일본, 태국, 코타키나발루, 필리핀, 중국 골프여행 전문 여행사. 카카오톡으로 편하게 문의하세요.",
  keywords: "골프여행, 일본골프여행, 후쿠오카골프, 홋카이도골프, 태국골프, 코타키나발루골프, 여행의파도",
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
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
