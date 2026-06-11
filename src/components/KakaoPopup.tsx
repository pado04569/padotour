"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  departure: "incheon" | "busan";
};

const STORAGE_KEY = "kakao_popup_dismissed";

export default function KakaoPopup({ departure }: Props) {
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  function close() {
    if (dontShow) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setVisible(false);
  }

  if (!visible) return null;

  const isIncheon = departure === "incheon";
  const accentBg = isIncheon ? "bg-emerald-600" : "bg-blue-600";
  const accentHover = isIncheon ? "hover:bg-emerald-700" : "hover:bg-blue-700";
  const channelUrl = "https://pf.kakao.com/_bxoxnXxj/chat";
  const departureLabel = isIncheon ? "인천출발" : "부산출발";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={close} />

      {/* 팝업 카드 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* 닫기 버튼 */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors"
          aria-label="닫기"
        >
          ×
        </button>

        {/* 상단 컬러 배너 */}
        <div className={`${accentBg} text-white px-6 pt-8 pb-6 text-center`}>
          <div className="text-4xl mb-2">⛳</div>
          <div className="text-xs font-bold tracking-widest opacity-80 mb-1">{departureLabel} · 골프여행 전문</div>
          <h2 className="text-xl font-black leading-tight">
            여행의 파도<br />카카오 채널 추가하고<br />
            <span className="text-yellow-300">특가 소식</span> 받아보세요!
          </h2>
        </div>

        {/* 혜택 목록 */}
        <div className="px-6 py-5">
          <ul className="space-y-2 text-sm text-gray-700 mb-5">
            {[
              "🎁 채널 추가 고객 우선 특가 안내",
              "📢 신규 상품 및 얼리버드 소식",
              "💬 카카오톡으로 간편하게 문의",
              "📅 출발 임박 특가 실시간 공지",
            ].map((text) => (
              <li key={text} className="flex items-center gap-2">
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* 카카오 채널 추가 버튼 */}
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-3 rounded-xl text-base transition-colors shadow-md"
          >
            <span className="text-xl">💬</span>
            카카오 채널 추가하기
          </a>

          {/* 다시 보지 않기 */}
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="w-4 h-4 accent-gray-500"
              />
              다시 보지 않기
            </label>
            <button onClick={close} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
