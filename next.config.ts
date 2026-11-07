import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel 사진 변환 한도 초과로 /_next/image 가 402(결제 필요)를 내며 사이트 사진이 전부 안 떴다 (2026-11-03 가고시마 사츠마)
    // → 변환 없이 원본 파일을 바로 보낸다. 원본은 커밋 전 shrink_images.py 로 이미 줄여 둔다.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // 채널별 UTM 단축 링크 (화면 없는 리다이렉트 = 손님에겐 안 보이고 추적만 됨)
  async redirects() {
    return [
      // 같은 골프장 소개 2개를 하나로 합침 (사이칸 위너스CC, 2026-11-07)
      { source: "/courses/cykan-winners-gc", destination: "/courses/winners-golf-club", permanent: true },
      { source: "/kakao", destination: "/?utm_source=kakao&utm_medium=channel", permanent: false },
      { source: "/band-in", destination: "/?utm_source=band&utm_medium=sns&utm_content=incheon", permanent: false },
      { source: "/band-bs", destination: "/?utm_source=band&utm_medium=sns&utm_content=busan", permanent: false },
      { source: "/blog-in", destination: "/?utm_source=naverblog&utm_medium=post&utm_content=incheon", permanent: false },
      { source: "/blog-bs", destination: "/?utm_source=naverblog&utm_medium=post&utm_content=busan", permanent: false },
      { source: "/tistory", destination: "/?utm_source=tistory&utm_medium=post", permanent: false },
      { source: "/clip", destination: "/?utm_source=clip&utm_medium=video", permanent: false },
      { source: "/card", destination: "/?utm_source=namecard&utm_medium=offline", permanent: false },
    ];
  },
};

export default nextConfig;
