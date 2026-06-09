import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* 로고 & 타이틀 */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo.png"
            alt="여행의 파도"
            width={90}
            height={90}
            className="rounded-full"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">여행의 파도</h1>
        <p className="text-gray-500 text-lg">골프여행 전문 여행사</p>
      </div>

      {/* 안내 문구 */}
      <p className="text-gray-600 text-xl font-semibold mb-8 text-center">
        출발지를 선택해주세요 ✈️
      </p>

      {/* 출발지 선택 카드 */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
        {/* 인천출발 */}
        <Link
          href="/incheon"
          className="flex-1 group bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
        >
          <div className="text-5xl mb-4">✈️</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">인천공항</div>
          <div className="text-2xl font-black text-gray-800 group-hover:text-emerald-600 transition-colors">
            인천 출발
          </div>
          <div className="mt-4 text-sm text-gray-400">수도권·전국 골프여행</div>
          <div className="mt-5 inline-block bg-emerald-500 group-hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
            인천출발 상품 보기 →
          </div>
        </Link>

        {/* 부산출발 */}
        <Link
          href="/busan"
          className="flex-1 group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
        >
          <div className="text-5xl mb-4">✈️</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">김해공항</div>
          <div className="text-2xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">
            부산 출발
          </div>
          <div className="mt-4 text-sm text-gray-400">부산·경남 지역 골프여행</div>
          <div className="mt-5 inline-block bg-blue-500 group-hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
            부산출발 상품 보기 →
          </div>
        </Link>
      </div>

      {/* 하단 공통 문의 */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm mb-3">출발지 무관하게 바로 문의하기</p>
        <a
          href="https://pf.kakao.com/_bxoxnXxj/chat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black px-8 py-3.5 rounded-full text-lg transition-colors shadow"
        >
          💬 카카오톡으로 바로 문의
        </a>
      </div>
    </div>
  );
}
