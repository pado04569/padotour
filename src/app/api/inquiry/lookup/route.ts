import { NextRequest, NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";
import { getRedis } from "@/lib/redis";

/**
 * 예약문의 내역 조회 — 휴대폰 문자 인증번호를 확인한 뒤에만 보여준다.
 *
 * 왜: 예전엔 전화번호만 넣으면 그 번호의 문의(상품·출발일·인원)를 누구나 볼 수 있었다
 *     (2026-10-09 챗GPT 감사 8번, 사장님 결정 (가) 문자 인증).
 *
 *   POST { phone }        → 인증번호 문자 발송 (문의 내역이 있는 번호에만 실제로 보낸다 — 비용·남용 방지)
 *   POST { phone, code }  → 맞으면 내역을 돌려준다
 *
 * 남용 방지: 같은 번호 60초에 1번·하루 5번, 같은 접속(IP) 1시간 10번, 인증번호 5분 유효·5번 틀리면 폐기.
 */
const CODE_TTL = 300;
const MSG_SENT = "문의하신 번호가 맞으면 인증번호 문자가 발송됩니다. 5분 안에 입력해 주세요.";

const isMobile = (d: string) => /^01[016789]\d{7,8}$/.test(d);

async function tooMany(redis: NonNullable<ReturnType<typeof getRedis>>, key: string, limit: number, ttl: number) {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, ttl);
  return n > limit;
}

async function sendSms(to: string, code: string) {
  const { SOLAPI_API_KEY: k, SOLAPI_API_SECRET: s, SOLAPI_FROM: from } = process.env;
  if (!k || !s || !from) throw new Error("솔라피 환경변수 누락");
  const solapi = new SolapiMessageService(k, s);
  await solapi.send({ to, from: from.replace(/\D/g, ""), text: `[여행의파도] 예약문의 내역 조회 인증번호 ${code} (5분 안에 입력해 주세요)` });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const digits = String(body?.phone ?? "").replace(/\D/g, "");
  const code = String(body?.code ?? "").replace(/\D/g, "");
  if (!isMobile(digits)) {
    return NextResponse.json({ error: "문의하실 때 남기신 휴대폰 번호를 정확히 입력해 주세요" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) return NextResponse.json({ error: "조회 기능이 아직 준비 중입니다" }, { status: 503 });

  const listKey = `inquiries:${digits}`;
  const codeKey = `lookup:code:${digits}`;

  try {
    // ① 인증번호 요청
    if (!code) {
      const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
      if (await tooMany(redis, `lookup:ip:${ip}`, 10, 3600)) {
        return NextResponse.json({ error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
      }
      if (await redis.get(`lookup:wait:${digits}`)) {
        return NextResponse.json({ error: "인증번호는 1분에 한 번만 받을 수 있어요. 잠시 후 다시 시도해 주세요." }, { status: 429 });
      }
      if (await tooMany(redis, `lookup:day:${digits}`, 5, 86400)) {
        return NextResponse.json({ error: "오늘 인증 요청 횟수를 넘었습니다. 내일 다시 시도하시거나 전화(010-5301-5250)로 문의해 주세요." }, { status: 429 });
      }
      await redis.set(`lookup:wait:${digits}`, "1", "EX", 60);

      // 내역이 없는 번호에는 문자를 보내지 않는다. 응답은 같게 해서 "어느 번호가 문의했는지" 드러내지 않는다.
      if ((await redis.llen(listKey)) > 0) {
        const newCode = String(Math.floor(100000 + Math.random() * 900000));
        await redis.set(codeKey, JSON.stringify({ code: newCode, tries: 0 }), "EX", CODE_TTL);
        await sendSms(digits, newCode);
      }
      return NextResponse.json({ sent: true, message: MSG_SENT });
    }

    // ② 인증번호 확인
    const saved = await redis.get(codeKey);
    if (!saved) return NextResponse.json({ error: "인증번호가 만료되었거나 없습니다. 다시 받아 주세요." }, { status: 400 });
    const { code: right, tries } = JSON.parse(saved) as { code: string; tries: number };
    if (code !== right) {
      if (tries + 1 >= 5) {
        await redis.del(codeKey);
        return NextResponse.json({ error: "인증번호를 5번 틀렸습니다. 다시 받아 주세요." }, { status: 400 });
      }
      const ttl = await redis.ttl(codeKey);
      await redis.set(codeKey, JSON.stringify({ code: right, tries: tries + 1 }), "EX", Math.max(ttl, 1));
      return NextResponse.json({ error: `인증번호가 맞지 않습니다 (${tries + 1}/5)` }, { status: 400 });
    }
    await redis.del(codeKey);

    const raw = await redis.lrange(listKey, 0, -1);
    const items = raw.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("lookup error:", e);
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요." }, { status: 500 });
  }
}
