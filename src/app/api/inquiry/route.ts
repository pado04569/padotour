import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SolapiMessageService } from "solapi";

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
  if (!apiKey || !apiSecret || !pfId || !templateId || !from || !to) return false;

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
    return false;
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
              <td style="padding: 10px 0; font-weight: bold; color: #2563eb;">${formattedDate}${nights && days ? ` (${nights}박 ${days}일)` : ""}</td>
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
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  // 본문이 비었거나 깨진 요청은 서버 오류(500)가 아니라 400 으로 돌려보낸다
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const { tourTitle, departureDate, nights, days, people, phone } = body;

  if (!phone || !people || !departureDate) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  const formattedDate = departureDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1년 $2월 $3일");

  // 메일과 카톡을 함께 보낸다. 둘 중 하나라도 사장님께 닿으면 고객에게는 접수 성공으로 알린다.
  const [mailOk, kakaoOk] = await Promise.all([
    sendMail({ tourTitle, formattedDate, nights, days, people, phone }),
    notifyKakao({
      상품명: tourTitle || "상품명 없음",
      출발일: `${formattedDate}${nights && days ? ` (${nights}박 ${days}일)` : ""}`,
      인원: `${people}명`,
      연락처: phone,
    }),
  ]);

  if (!mailOk && !kakaoOk) {
    return NextResponse.json({ error: "문의 전달 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
