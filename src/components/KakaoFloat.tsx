"use client";

export default function KakaoFloat() {
  return (
    <a
      href="https://pf.kakao.com/_bxoxnXxj/chat"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      aria-label="카카오톡 상담"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3C6.48 3 2 6.86 2 11.6c0 2.97 1.74 5.58 4.36 7.22L5.2 22l3.5-1.84c1.05.29 2.16.44 3.3.44 5.52 0 10-3.86 10-8.6C22 6.86 17.52 3 12 3z" />
      </svg>
      <span className="text-lg hidden sm:inline">카카오톡 상담</span>
    </a>
  );
}
