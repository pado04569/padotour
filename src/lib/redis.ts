import Redis from "ioredis";

// Vercel "Redis (Official Redis for Vercel)" 연동이 REDIS_URL 환경변수를 넣어준다.
// 없으면(로컬 개발 등) null을 반환해서 호출부가 조용히 건너뛰게 한다.
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return null;
  }
  client = new Redis(url);
  return client;
}
