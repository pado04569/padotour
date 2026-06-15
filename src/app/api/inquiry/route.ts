import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { tourTitle, departureDate, nights, days, people, phone } = await req.json();

  if (!phone || !people || !departureDate) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.naver.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NAVER_EMAIL,
      pass: process.env.NAVER_PASSWORD,
    },
  });

  const formattedDate = departureDate.replace(/-/g, ".").replace(/(\d{4})\.(\d{2})\.(\d{2})/, "$1년 $2월 $3일");

  await transporter.sendMail({
    from: `"여행의 파도 예약문의" <${process.env.NAVER_EMAIL}>`,
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
              <td style="padding: 10px 0; font-weight: bold; color: #2563eb;">${formattedDate} (${nights}박 ${days}일)</td>
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

  return NextResponse.json({ ok: true });
}
