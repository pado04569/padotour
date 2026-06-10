import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* 로고 & 출발지 선택 한 블록으로 */}
      <div className="text-center mb-5">
        <div className="flex justify-center mb-2">
          <Image
            src="/images/logo.png"
            alt="여행의 파도"
            width={130}
            height={130}
            className="rounded-full"
          />
        </div>
        <p className="text-gray-400 text-xs tracking-widest mb-3">골프여행 전문 여행사</p>
        <p className="text-gray-600 text-lg font-semibold">출발지를 선택해주세요 ✈️</p>
      </div>

      {/* 출발지 선택 카드 */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-lg">
        {/* 인천출발 */}
        <Link
          href="/incheon"
          className="flex-1 group bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-5 text-center shadow-md hover:shadow-xl transition-all duration-200"
        >
          <div className="text-3xl mb-2">✈️</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">인천공항</div>
          <div className="text-xl font-black text-gray-800 group-hover:text-emerald-600 transition-colors">
            인천 출발
          </div>
          <div className="mt-3 inline-block bg-emerald-500 group-hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors">
            상품 보기 →
          </div>
        </Link>

        {/* 부산출발 */}
        <Link
          href="/busan"
          className="flex-1 group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-5 text-center shadow-md hover:shadow-xl transition-all duration-200"
        >
          <div className="text-3xl mb-2">✈️</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">김해공항</div>
          <div className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">
            부산 출발
          </div>
          <div className="mt-3 inline-block bg-blue-500 group-hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors">
            상품 보기 →
          </div>
        </Link>
      </div>
    </div>
  );
}
