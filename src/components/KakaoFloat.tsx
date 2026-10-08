"use client";

// 화면 오른쪽 아래에 따라다니는 카카오톡 채널 문의 버튼.
// 예전 "카카오톡 상담" 큰 노란 버튼은 화면을 가려 내렸고(2026-09-10), 작은 아이콘으로 다시 붙임(사장님 요청 2026-10-08).
export default function KakaoFloat() {
  return (
    <a
      href="https://pf.kakao.com/_bxoxnXxj/chat"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오톡 채널로 문의하기"
      title="카카오톡 채널로 문의하기"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#011C41] shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 md:w-8 md:h-8" aria-hidden="true">
        <path
          d="M16 4C9.37 4 4 8.7 4 14.5c0 3.3 1.74 6.25 4.47 8.17L7.3 27.4c-.12.48.4.86.82.6l5.1-3.2c.9.13 1.83.2 2.78.2 6.63 0 12-4.7 12-10.5S22.63 4 16 4z"
          fill="#fff"
        />
        <path d="M11.2 15.6c1.2 1.9 2.9 2.9 4.8 2.9s3.6-1 4.8-2.9" fill="none" stroke="#011C41" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </a>
  );
}
