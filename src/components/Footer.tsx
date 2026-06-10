type FooterProps = {
  departure?: "incheon" | "busan";
};

const info = {
  incheon: {
    phones: [
      { href: "tel:01053015250", label: "010-5301-5250" },
      { href: "tel:0264015252", label: "02-6401-5252 (인천)" },
    ],
    blog: "https://blog.naver.com/pado-tour-",
    band: "https://band.us/@padotour",
  },
  busan: {
    phones: [
      { href: "tel:01053015250", label: "010-5301-5250" },
      { href: "tel:07047985252", label: "070-4798-5252 (부산)" },
    ],
    blog: "https://blog.naver.com/padoro-52so",
    band: "https://band.us/@padoro52so",
  },
  default: {
    phones: [
      { href: "tel:01053015250", label: "010-5301-5250" },
      { href: "tel:0264015252", label: "02-6401-5252 (인천)" },
      { href: "tel:07047985252", label: "070-4798-5252 (부산)" },
    ],
    blog: "https://blog.naver.com/pado-tour-",
    band: "https://band.us/@padotour",
  },
};

export default function Footer({ departure }: FooterProps) {
  const d = departure ? info[departure] : info.default;

  return (
    <footer className="bg-gray-800 text-gray-300 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* 여행사 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⛳</span>
              <span className="text-white text-xl font-bold">여행의 파도</span>
              {departure && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  departure === "incheon"
                    ? "bg-emerald-700 text-emerald-200"
                    : "bg-blue-700 text-blue-200"
                }`}>
                  {departure === "incheon" ? "인천출발" : "부산출발"}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-4">골프여행 전문 여행사</p>
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
            <div className="space-y-3">
              {d.phones.map((p) => (
                <a key={p.href} href={p.href} className="flex items-center gap-2 group">
                  <span className="text-yellow-400 text-lg">📞</span>
                  <span className="text-yellow-300 group-hover:text-yellow-200 font-bold text-lg transition-colors">
                    {p.label}
                  </span>
                </a>
              ))}
              <a
                href="https://pf.kakao.com/_bxoxnXxj/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors text-sm text-gray-400 mt-1"
              >
                <span>💬</span> 카카오톡 채널 상담
              </a>
              <a href={d.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors text-sm text-gray-400">
                <span>📝</span> 네이버 블로그
              </a>
              <a href={d.band} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors text-sm text-gray-400">
                <span>📣</span> 네이버 밴드
              </a>
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
