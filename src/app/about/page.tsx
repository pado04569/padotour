export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* 히어로 */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 text-white py-16 px-4 text-center">
        <p className="text-emerald-200 text-sm font-semibold mb-2 tracking-widest">ABOUT US</p>
        <h1 className="text-3xl md:text-4xl font-black mb-3">여행의 파도를 소개합니다</h1>
        <p className="text-emerald-100 text-base">골프를 사랑하는 모든 분들의 최고의 여행 파트너</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* 대표자의 말 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            대표자의 말
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* 사진 자리 */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-40 h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">👤</span>
                <span className="text-xs text-center leading-relaxed">사진<br/>준비 중</span>
              </div>
              <p className="text-center mt-3 font-black text-gray-800">이지안 대표</p>
              <p className="text-center text-xs text-gray-500">여행의 파도</p>
            </div>

            {/* 인사말 자리 */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-gray-300 text-5xl font-serif mb-3">"</div>
              <div className="space-y-3 text-gray-400 text-sm leading-relaxed italic">
                <p>대표자의 인사말이 이 곳에 들어갑니다.</p>
                <p>글을 보내주시면 바로 업데이트해 드릴게요.</p>
              </div>
              <div className="text-gray-300 text-5xl font-serif text-right mt-3">"</div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                <p className="font-black text-gray-500 text-sm">여행의 파도 대표 <span className="text-gray-700">이지안</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* 회사 소개 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            회사 소개
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center text-gray-400 text-sm py-16">
            <div className="text-4xl mb-3">🏢</div>
            <p>회사 소개 내용이 이 곳에 들어갑니다.</p>
            <p className="mt-1">글을 보내주시면 바로 업데이트해 드릴게요.</p>
          </div>
        </section>

        {/* 핵심 가치 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            여행의 파도가 약속하는 것
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "⛳", title: "골프 전문성", desc: "골프 여행만을 위한\n특화된 노하우" },
              { icon: "🤝", title: "신뢰와 안전", desc: "서울보증보험 가입\n여행사 보증" },
              { icon: "✈️", title: "합리적인 가격", desc: "직접 계약으로\n투명한 가격 제공" },
            ].map((item) => (
              <div key={item.title} className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-black text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 문의 */}
        <section className="bg-blue-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-black mb-1">궁금한 점이 있으신가요?</h3>
          <p className="text-blue-200 text-sm mb-4">카카오톡 또는 전화로 편하게 문의해 주세요</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-6 py-3 rounded-full text-sm transition-colors"
            >
              💬 카카오톡 문의
            </a>
            <a
              href="tel:02-6401-5252"
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
            >
              📞 02-6401-5252
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
