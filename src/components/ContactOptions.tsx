"use client";

import { useState } from "react";
import Image from "next/image";

export default function ContactOptions() {
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-black px-8 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
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

          {/* 카카오톡 1:1 채팅 */}
          <a
            href="https://open.kakao.com/me/pado-tour"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">💬</div>
            <div>
              <div className="font-black text-gray-800 text-sm">카카오톡 1:1 채팅</div>
              <div className="text-yellow-600 font-bold text-sm">ID: pado-tour &nbsp;→</div>
            </div>
          </a>

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
