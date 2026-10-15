import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { PARTNER_MAP_KEY } from "@/lib/partnerMap";

// 상품별 거래처(랜드사·담당자·전화·컴) 표를 비공개 저장소(Redis)에 올린다 (사장님 요청 2026-10-15).
// 거래처·B2B 정보는 공개 GitHub 에 둘 수 없어서 코드·tours.json 에 넣지 않고,
// 사장님 PC 의 partner-board/sync_inquiry_partners.py 가 엑셀을 읽어 이 주소로 보낸다.
// 관리자 비밀번호가 맞을 때만 받고, 읽기(GET)는 열지 않는다.
export async function POST(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || req.headers.get("x-admin-password") !== pw) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) return NextResponse.json({ error: "저장소 없음" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const map = body?.map;
  if (!map || typeof map !== "object" || Array.isArray(map)) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  await redis.set(PARTNER_MAP_KEY, JSON.stringify(map));
  return NextResponse.json({ ok: true, count: Object.keys(map).length });
}
