import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
