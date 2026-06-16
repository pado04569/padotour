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
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
      >
        ?뱸 ?덉빟 臾몄쓽 쨌 留욎땄 寃ъ쟻
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>??/span>
      </button>

      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

          {/* ?꾪솕 臾몄쓽 */}
          <a
            href="tel:0264015252"
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">?뱸</div>
            <div>
              <div className="font-black text-gray-800 text-sm">?꾪솕 臾몄쓽</div>
              <div className="text-blue-600 font-bold text-base">02-6401-5252</div>
            </div>
          </a>

          {/* 移댁뭅?ㅽ넚 ID */}
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">?뮠</div>
            <div>
              <div className="font-black text-gray-800 text-sm">移댁뭅?ㅽ넚 ID</div>
              <div className="text-gray-800 font-bold text-base">pado-tour</div>
            </div>
          </div>

          {/* QR肄붾뱶濡?異붽? */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors border-b border-gray-100 text-left"
          >
            <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center text-xl flex-shrink-0">?벜</div>
            <div className="flex-1">
              <div className="font-black text-gray-800 text-sm">QR肄붾뱶濡?移쒓뎄 異붽?</div>
              <div className="text-yellow-700 font-bold text-sm">移대찓?쇰줈 ?ㅼ틪 {showQr ? "?? : "??}</div>
            </div>
          </button>

          {showQr && (
            <div className="px-5 py-4 bg-yellow-50 flex flex-col items-center gap-2">
              <Image
                src="/images/kakao-qr.png"
                alt="移댁뭅?ㅽ넚 QR肄붾뱶 - ?ы뻾???뚮룄"
                width={200}
                height={200}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">移댁뭅?ㅽ넚 ????移쒓뎄 ??QR肄붾뱶 ?ㅼ틪</p>
            </div>
          )}

          {/* 移댁뭅??梨꾨꼸 */}
          <a
            href="https://pf.kakao.com/_bxoxnXxj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl flex-shrink-0">?윞</div>
            <div>
              <div className="font-black text-gray-800 text-sm">移댁뭅??梨꾨꼸</div>
              <div className="text-yellow-700 font-bold text-sm">?ы뻾???뚮룄 梨꾨꼸 ??/div>
            </div>
          </a>

        </div>
      )}
    </div>
  );
}

