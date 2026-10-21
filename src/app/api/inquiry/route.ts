import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SolapiMessageService } from "solapi";
import { getRedis } from "@/lib/redis";
import { stayText } from "@/lib/stay";
import { isValidPhone } from "@/lib/inquiryForm";
import { getPartnerInfo, partnerText } from "@/lib/partnerMap";

// 전화번호로 예약문의 내역을 조회할 수 있도록 저장한다 (사장님 요청 2026-09-23).
// 전화번호 숫자만 남긴 값을 키로 써서 사람마다 리스트로 쌓는다. Redis 연결이 없으면 조용히 건너뛴다.
async function saveInquiry(record: {
  tourTitle: string;
  departureDate: string;
  nights?: number;
  days?: number;
  people: number | string;
  phone: string;
  agreedPrivacy?: boolean;
}) {
  const redis = getRedis();
  if (!redis) return;
  const key = `inquiries:${record.phone.replace(/\D/g, "")}`;
  const entry = JSON.stringify({ ...record, submittedAt: new Date().toISOString() });
  try {
    await redis.lpush(key, entry);
    await redis.ltrim(key, 0, 49); // 사람당 최근 50건만 보관
    // 문의 폼 개인정보 안내 "문의 처리 완료 후 1년" 과 맞춘다 — 마지막 문의 후 1년이 지나면 내역이 지워진다 (2026-10-09)
    await redis.expire(key, 365 * 24 * 3600);
  } catch (e) {
    console.error("Redis save error:", e);
  }
}

// 예약문의가 들어오면 사장님 휴대폰으로 카톡 알림톡을 보낸다 (2026-09-15 사장님 요청).
// 솔라피 템플릿 "예약문의 접수" — 카테고리 업무알림 > 주문/예약(008001), 변수 4개.
// 설정값이 하나라도 없으면 조용히 건너뛴다 → 템플릿 검수 전에 배포해도 메일은 그대로 간다.
// 카톡이 실패하면 솔라피가 같은 내용을 문자로 대신 보낸다(disableSms: false, 발신번호 필요).
async function notifyKakao(v: { 상품명: string; 출발일: string; 인원: string; 연락처: string }) {
  const {
    SOLAPI_API_KEY: apiKey,
    SOLAPI_API_SECRET: apiSecret,
    SOLAPI_PF_ID: pfId,
    SOLAPI_TEMPLATE_ID: templateId,
    SOLAPI_FROM: from,
    INQUIRY_NOTIFY_TO: to,
  } = process.env;
  if (!apiKey || !apiSecret || !pfId || !templateId || !from || !to) throw new Error("솔라피 환경변수 누락");

  try {
    const solapi = new SolapiMessageService(apiKey, apiSecret);
    await solapi.send({
      to: to.replace(/\D/g, ""),
      from: from.replace(/\D/g, ""),
      kakaoOptions: {
        pfId,
        templateId,
        variables: {
          "#{상품명}": v.상품명,
          "#{출발일}": v.출발일,
          "#{인원}": v.인원,
          "#{연락처}": v.연락처,
        },
        disableSms: false,
      },
    });
    return true;
  } catch (e) {
    // 모든 접수가 실패하면 SDK 가 MessageNotReceivedError 를 던진다
    console.error("Solapi alimtalk error:", e);
    throw e;
  }
}

// 문의한 손님에게도 접수 안내 카톡을 보낸다 (2026-10-01 사장님 요청).
// 솔라피 템플릿 "고객용 -문의접수" — 변수 없는 고정 문구, 심사 승인 완료.
// 템플릿 ID 는 비밀값이 아니라 코드에 두고, 바꿔야 할 때만 환경변수로 덮어쓴다.
// 카톡이 없는 손님에게는 같은 내용이 문자로 간다(disableSms: false — 사장님 확정).
// 여기서 실패해도 문의 접수 결과에는 영향을 주지 않는다.
const CUSTOMER_TEMPLATE_ID = "KA01TP260928074550640ssN2Fg7egCE";

async function notifyCustomer(phone: string) {
  const {
    SOLAPI_API_KEY: apiKey,
    SOLAPI_API_SECRET: apiSecret,
    SOLAPI_PF_ID: pfId,
    SOLAPI_FROM: from,
    SOLAPI_CUSTOMER_TEMPLATE_ID: templateId = CUSTOMER_TEMPLATE_ID,
  } = process.env;
  if (!apiKey || !apiSecret || !pfId || !from) return false;

  // 휴대폰 번호(010·011·016·017·018·019, 10~11자리)일 때만 보낸다. 유선번호·오타는 건너뛴다.
  const to = phone.replace(/\D/g, "");
  if (!/^01[016789]\d{7,8}$/.test(to)) return false;

  try {
    const solapi = new SolapiMessageService(apiKey, apiSecret);
    await solapi.send({
      to,
      from: from.replace(/\D/g, ""),
      kakaoOptions: { pfId, templateId, disableSms: false },
    });
    return true;
  } catch (e) {
    console.error("Solapi customer alimtalk error:", e);
    return false;
  }
}

// 알림톡과 함께 사장님 휴대폰으로 거래처 정보 문자를 한 통 더 보낸다 (사장님 요청 2026-10-15).
// 알림톡 템플릿은 심사받은 고정 문구라 칸을 늘리지 않고 일반 문자로 따로 보낸다.
// 거래처 표는 Redis 에만 있다. 실패해도 문의 접수 결과에는 영향을 주지 않는다.
async function notifyPartner(v: { tourId?: string; tourTitle: string; date: string; people: string }) {
  const { SOLAPI_API_KEY: apiKey, SOLAPI_API_SECRET: apiSecret, SOLAPI_FROM: from, INQUIRY_NOTIFY_TO: to } = process.env;
  if (!apiKey || !apiSecret || !from || !to) return false;
  try {
    const info = v.tourId ? await getPartnerInfo(v.tourId) : null;
    const solapi = new SolapiMessageService(apiKey, apiSecret);
    await solapi.send({
      to: to.replace(/\D/g, ""),
      from: from.replace(/\D/g, ""),
      text: partnerText({ ...v, info }),
    });
    return true;
  } catch (e) {
    console.error("Solapi partner sms error:", e);
    return false;
  }
}

// 문의가 접수되지 않으면 사장님 휴대폰으로 바로 문자를 보낸다 (사장님 요청 2026-10-21).
// 9/28~10/2 달력 문의 폼이 5일 동안 접수를 거절했는데 아무도 몰랐다.
// 손님 화면도 같은 검사(전화번호·동의·날짜)를 먼저 하므로, 여기서 거절됐다면 화면과 서버가 어긋난 오류다.
// 거절된 문의는 Redis 에 남기고(손님 연락처 확인용), 문자는 1시간에 1통만 보낸다(봇이 몰려도 문자 폭탄 방지).
async function notifyRejected(reason: string, v: { tourTitle?: string; departureDate?: string; people?: unknown; phone?: unknown }) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.lpush("inquiries:rejected", JSON.stringify({ reason, ...v, at: new Date().toISOString() }));
      await redis.ltrim("inquiries:rejected", 0, 199);
      await redis.expire("inquiries:rejected", 30 * 24 * 3600); // 손님 연락처가 들어 있으니 마지막 거절 후 30일만 보관
      // 이미 1시간 안에 보냈으면 이번 문자는 건너뛴다
      if (!(await redis.set("inquiries:rejected:alerted", "1", "EX", 3600, "NX"))) return false;
    } catch (e) {
      console.error("Redis rejected save error:", e);
    }
  }
  const { SOLAPI_API_KEY: apiKey, SOLAPI_API_SECRET: apiSecret, SOLAPI_FROM: from, INQUIRY_NOTIFY_TO: to } = process.env;
  if (!apiKey || !apiSecret || !from || !to) return false;
  const lines = [
    "[홈페이지 문의 오류]",
    "손님 문의가 접수되지 않았습니다.",
    `이유: ${reason}`,
    v.tourTitle ? `상품: ${String(v.tourTitle).slice(0, 60)}` : "",
    v.departureDate ? `출발일: ${v.departureDate}` : "",
    v.people ? `인원: ${v.people}명` : "",
    v.phone ? `연락처: ${String(v.phone).slice(0, 20)}` : "",
    "1시간 안에 같은 오류는 문자를 다시 보내지 않습니다.",
  ].filter(Boolean);
  try {
    const solapi = new SolapiMessageService(apiKey, apiSecret);
    await solapi.send({ to: to.replace(/\D/g, ""), from: from.replace(/\D/g, ""), text: lines.join("\n") });
    return true;
  } catch (e) {
    console.error("Solapi rejected sms error:", e);
    return false;
  }
}

async function sendMail(p: {
  tourTitle: string;
  formattedDate: string;
  nights?: number;
  days?: number;
  people: number | string;
  phone: string;
}) {
  // 키가 없을 때 파일 맨 위에서 new Resend() 를 하면 빌드가 통째로 멈춘다(Missing API key).
  // 문의가 실제로 들어올 때만 만든다.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY 가 설정되어 있지 않습니다");
    throw new Error("RESEND_API_KEY 누락");
  }
  const resend = new Resend(apiKey);
  const { tourTitle, formattedDate, nights, days, people, phone } = p;

  const { error } = await resend.emails.send({
    from: "여행의 파도 예약문의 <onboarding@resend.dev>",
    to: "pado-tour-@naver.com",
    subject: `[예약문의] ${tourTitle} - ${formattedDate} 출발`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #2563eb; color: white; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 18px;">⛳ 골프여행 예약 문의</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">여행의 파도 홈페이지 접수</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; width: 100px;">상품명</td>
              <td style="padding: 10px 0; font-weight: bold; color: #111827;">${tourTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280;">출발일</td>
              <td style="padding: 10px 0; font-weight: bold; color: #2563eb;">${formattedDate}${nights && days ? ` (${stayText(nights, days, " ")})` : ""}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280;">인원수</td>
              <td style="padding: 10px 0; font-weight: bold;">${people}명</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">연락처</td>
              <td style="padding: 10px 0; font-weight: bold; color: #059669; font-size: 16px;">${phone}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #166534;">
            📱 카카오톡으로 견적서를 발송해 주세요!
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`${error.name}: ${error.message}`);
  }
  return true;
}

export async function POST(req: NextRequest) {
  // 본문이 비었거나 깨진 요청은 서버 오류(500)가 아니라 400 으로 돌려보낸다
  const body = await req.json().catch(() => null);
  if (!body) {
    await notifyRejected("요청 내용이 비었거나 깨짐", {});
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const { tourId, tourTitle, departureDate, nights, days, people, phone, agreedPrivacy } = body;
  const rejected = { tourTitle, departureDate, people, phone };

  if (!phone || !people || !departureDate) {
    await notifyRejected("필수 항목 누락(출발일·인원·연락처)", rejected);
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }
  // 연락할 수 없는 번호는 접수하지 않는다 — 오타 번호로 "접수 완료"가 뜨면 손님도 우리도 모른 채 문의가 사라진다 (2026-10-09)
  if (!isValidPhone(String(phone))) {
    await notifyRejected("휴대폰 번호 형식", rejected);
    return NextResponse.json({ error: "휴대폰 번호를 확인해 주세요" }, { status: 400 });
  }
  // 개인정보 수집·이용 동의 없이는 접수하지 않는다 (분쟁 대비, 사장님 요청 2026-09-28)
  if (!agreedPrivacy) {
    await notifyRejected("개인정보 동의 값이 안 넘어옴", rejected);
    return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요" }, { status: 400 });
  }

  const formattedDate = departureDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1년 $2월 $3일");

  // 메일과 카톡을 함께 보낸다. 둘 중 하나라도 사장님께 닿으면 고객에게는 접수 성공으로 알린다.
  // 손님 안내 카톡도 같이 보내지만, 그 결과는 접수 성공 여부에 넣지 않는다.
  // 어느 쪽이 왜 실패했는지 남긴다 (예외가 나도 500 으로 터지지 않고 아래에서 판단)
  const why: { mail?: string; kakao?: string } = {};
  const errText = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 300);
  const [mailOk, kakaoOk] = await Promise.all([
    sendMail({ tourTitle, formattedDate, nights, days, people, phone }).then(
      () => true,
      (e) => { why.mail = errText(e); return false; }
    ),
    notifyKakao({
      상품명: tourTitle || "상품명 없음",
      출발일: `${formattedDate}${nights && days ? ` (${stayText(nights, days, " ")})` : ""}`,
      인원: `${people}명`,
      연락처: phone,
    }).then(
      () => true,
      (e) => { why.kakao = errText(e); return false; }
    ),
    saveInquiry({ tourTitle, departureDate, nights, days, people, phone, agreedPrivacy: true }),
    notifyCustomer(String(phone)),
    notifyPartner({
      tourId: typeof tourId === "string" ? tourId : undefined,
      tourTitle: tourTitle || "상품명 없음",
      date: formattedDate,
      people: `${people}명`,
    }),
  ]);

  if (!mailOk && !kakaoOk) {
    console.error("문의 전달 실패", why);
    await notifyRejected(`메일·카톡 모두 실패 (메일: ${why.mail ?? "-"} / 카톡: ${why.kakao ?? "-"})`.slice(0, 200), rejected);
    return NextResponse.json({ error: "문의 전달 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
