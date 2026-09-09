import { MetadataRoute } from "next";

/**
 * 검색엔진·AI 크롤러 규칙
 *
 * AI 크롤러(GPTBot, ClaudeBot, PerplexityBot 등)를 명시적으로 허용한다.
 * 규칙이 없어도 기본은 허용이지만, 명시해두면 "차단된 것 아니냐"는 오해가 없고
 * ChatGPT·Perplexity 답변에 인용될 여지를 남긴다. (GEO)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        // 생성형 AI 검색/학습 크롤러 — 인용되려면 읽을 수 있어야 한다
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: "https://www.padotour.com/sitemap.xml",
    host: "https://www.padotour.com",
  };
}
