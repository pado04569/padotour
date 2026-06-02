export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* 여행사 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⛳</span>
              <span className="text-white text-xl font-bold">여행의 파도</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">1인 골프여행 전문 여행사</p>
            <div className="space-y-1 text-sm">
              <p>상호명: 여행의 파도</p>
              <p>대표: 이지안</p>
              <p>사업자번호: 372-57-00613</p>
              <p>관광사업등록번호: (등록번호 입력)</p>
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">연락처</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span>📞</span>
                <span className="text-gray-300">
                  <a href="tel:01053015250" className="hover:text-white transition-colors text-lg font-medium block">010-5301-5250</a>
                  <a href="tel:0264015252" className="hover:text-white transition-colors block">02-6401-5252 (인천)</a>
                  <a href="tel:07047985252" className="hover:text-white transition-colors block">070-4798-5252 (부산)</a>
                </span>
              </p>
              <p className="flex items-center gap-2 mt-2">
                <span>💬</span>
                <a
                  href="https://pf.kakao.com/_bxoxnXxj/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  카카오톡 채널 상담
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span>📝</span>
                <a
                  href="https://blog.naver.com/pado-tour-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  네이버 블로그
                </a>
              </p>
            </div>
          </div>

          {/* 상담 시간 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">상담 시간</h3>
            <div className="space-y-1 text-sm">
              <p>평일: 오전 9시 ~ 오후 6시</p>
              <p>토요일: 오전 9시 ~ 오후 2시</p>
              <p>일요일·공휴일: 카톡 문의</p>
            </div>
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2.5 rounded-full text-sm transition-colors"
            >
              💬 카카오톡 상담하기
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-xs text-gray-500 text-center">
          <p>© 2025 여행의 파도. All rights reserved.</p>
          <p className="mt-1">골프여행 예약은 항공·숙박·골프장 상황에 따라 요금이 변동될 수 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}
