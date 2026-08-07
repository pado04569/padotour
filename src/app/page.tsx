import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      {/* 로고 & 출발지 선택 한 블록으로 */}
      <div className="text-center mb-5">
        <div className="flex justify-center mb-2">
          <Image
            src="/images/logo.png"
            alt="여행의 파도"
            width={155}
            height={155}
            className="rounded-full"
          />
        </div>
        <p className="text-gray-400 text-xs tracking-widest mb-1">골프전문 여행사</p>
        <p className="text-gray-600 text-lg font-semibold">출발지를 선택해주세요</p>
      </div>

      {/* 출발지 선택 카드 */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md sm:max-w-2xl">
        {/* 인천출발 */}
        <Link
          href="/incheon"
          className="flex-1 group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-8 md:p-10 text-center shadow-md hover:shadow-xl transition-all duration-200"
        >
          <div className="text-2xl mb-3">✈️</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">인천공항</div>
          <div className="text-2xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">
            인천 출발
          </div>
          <div className="mt-3 inline-block border-2 border-blue-600 bg-white group-hover:bg-blue-50 text-blue-600 font-bold px-5 py-2 rounded-full text-sm transition-colors">
            상품 보기 →
          </div>
        </Link>

        {/* 부산출발 */}
        <Link
          href="/busan"
          className="flex-1 group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-8 md:p-10 text-center shadow-md hover:shadow-xl transition-all duration-200"
        >
          <div className="text-2xl mb-3">✈️</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">김해공항</div>
          <div className="text-2xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">
            부산 출발
          </div>
          <div className="mt-3 inline-block bg-blue-500 group-hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors">
            상품 보기 →
          </div>
        </Link>
      </div>

      {/* 공식 채널 & 사업자 정보 */}
      <div className="mt-10 text-center">
        <div className="flex items-center justify-center gap-5 text-sm">
          <a
            href="https://blog.naver.com/pado-tour-"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 font-semibold transition-colors"
          >
            네이버 블로그
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="https://band.us/@padotour"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 font-semibold transition-colors"
          >
            네이버 밴드
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 font-semibold transition-colors"
          >
            카카오톡 상담
          </a>
        </div>
        <div className="mt-4 text-xs text-gray-400 leading-relaxed">
          <p>여행의 파도 · 대표 이지안 · 사업자번호 372-57-00613</p>
          <p>관광사업등록번호 제2022-000029호 · 서울 마포구 토정로35길 11 인우빌딩</p>
        </div>
      </div>
    </div>
  );
}
