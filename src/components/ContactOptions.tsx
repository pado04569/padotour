"use client";

import { useState } from "react";
import Image from "next/image";

export default function ContactOptions({
  tourTitle,
  nights,
  days,
}: {
  tourTitle?: string;
  nights?: string | number;
  days?: string | number;
}) {
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // 예약 문의 폼
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(2);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = date !== "" && phone.trim() !== "" && !sending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourTitle: tourTitle ?? "골프여행 상품",
          departureDate: date,
          nights,
          days,
          people,
          phone: phone.trim(),
        }),
      });
      if (res.ok) setSent(true);
      else alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
    } catch {
      alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 font-black px-8 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
      >
        📞 예약 문의 · 맞춤 견적
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

          {/* 전화 문의 */}
          <a
            href="tel:01053015250"
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">📞</div>
            <div>
              <div className="font-black text-gray-800 text-sm">전화 문의</div>
              <div className="text-blue-600 font-bold text-base">010-5301-5250</div>
            </div>
          </a>

          {/* 예약 문의 접수 (출발희망일·인원·연락처) */}
          <div className="px-5 py-4 border-b border-gray-100 bg-blue-50/40">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">📋</div>
              <div>
                <div className="font-black text-gray-800 text-sm">예약 문의 접수</div>
                <div className="text-blue-600 font-bold text-sm">남겨주시면 견적을 보내드려요</div>
              </div>
            </div>

            {sent ? (
              <div className="bg-white border border-blue-200 rounded-xl px-4 py-4 text-center">
                <p className="font-black text-blue-700 text-sm">문의가 접수되었습니다 ✅</p>
                <p className="text-xs text-gray-600 mt-1">담당자가 카카오톡으로 견적서를 보내드립니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">출발 희망일</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">인원수</label>
                    <select
                      value={people}
                      onChange={(e) => setPeople(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n}명</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3 rounded-lg text-sm transition-colors"
                >
                  {sending ? "접수 중..." : "문의 접수하기"}
                </button>
                <p className="text-[11px] text-gray-400 text-center">담당자가 카카오톡으로 견적서를 발송해 드립니다</p>
              </form>
            )}
          </div>

          {/* QR코드로 추가 */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors border-b border-gray-100 text-left"
          >
            <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center text-xl flex-shrink-0">📷</div>
            <div className="flex-1">
              <div className="font-black text-gray-800 text-sm">QR코드로 친구 추가</div>
              <div className="text-yellow-700 font-bold text-sm">카메라로 스캔 {showQr ? "▲" : "▼"}</div>
            </div>
          </button>

          {showQr && (
            <div className="px-5 py-4 bg-yellow-50 flex flex-col items-center gap-2">
              <Image
                src="/images/kakao-qr.png"
                alt="카카오톡 QR코드 - 여행의 파도"
                width={200}
                height={200}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">카카오톡 앱 → 친구 → QR코드 스캔</p>
            </div>
          )}

          {/* 카카오 채널 */}
          <a
            href="https://pf.kakao.com/_bxoxnXxj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl flex-shrink-0">🟡</div>
            <div>
              <div className="font-black text-gray-800 text-sm">카카오 채널</div>
              <div className="text-yellow-700 font-bold text-sm">여행의 파도 채널 →</div>
            </div>
          </a>

        </div>
      )}
    </div>
  );
}
