/**
 * /api/version — 지금 배포된 커밋 번호.
 * GitHub Actions(IndexNow 알림)가 "새 버전이 실제로 올라갔는지" 확인한 뒤에 Bing에 알리려고 쓴다.
 * 빌드할 때 값이 박힌다(Vercel 시스템 환경변수).
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(process.env.VERCEL_GIT_COMMIT_SHA ?? "local", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
