import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone") ?? "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) {
    return NextResponse.json({ error: "전화번호를 정확히 입력해 주세요" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "조회 기능이 아직 준비 중입니다" }, { status: 503 });
  }

  try {
    const raw = await redis.lrange(`inquiries:${digits}`, 0, -1);
    const items = raw
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("Redis lookup error:", e);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
  }
}
