"use client";

import { useState } from "react";

export default function ContactOptions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-black px-8 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
      >
        📞 예약 문의 · 맞춤 견적
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
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
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">💬</div>
            <div>
              <div className="font-black text-gray-800 text-sm">카카오톡 1:1 채팅</div>
              <div className="text-yellow-600 font-bold text-sm">바로 연결 →</div>
            </div>
          </a>
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
