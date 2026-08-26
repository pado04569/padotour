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

          <h3 className="text-2xl md:text-3xl font-black text-gray-800 text-center mb-8">
            왜 &apos;여행의파도&apos;일까요?
          </h3>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-xl mx-auto">
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              <p>{`여행의파도 는

홀인원컵을 받으실 정도로 골프를
사랑하셨던 아버지의 성함 이 판동 중
이름 '판동' 에서 받침을뺀 '파도' 에서
비롯 되었습니다.`}</p>
              <p>{`홀인원 당시 받으신 황금 골프공은
IMF 외환위기 때 금 모으기 운동에
보태 지금은 남아있지 않지만,
홀인원의 기쁨과 아버지의 마음은
이 트로피에 고스란히 남아있습니다.`}</p>
            </div>
            <div className="my-6 flex justify-center">
              <img src="/images/about/holeinone-trophy.png" alt="아버지의 홀인원 기념 트로피" className="max-w-[220px] w-full h-auto" />
            </div>
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              <p>{`골프를 사랑한다는건 골프채를
정성껏 닦는 일이기도 하고,
꾸준히 퍼팅을 연습하는 일이기도 하며,
어느새 연습 스윙이 몸에 밸 만큼 한결같은
마음이라는 걸 아버지를 통해 배웠습니다.`}</p>
              <p>{`골프여행을 앞두고, 골프화의
먼지를 털어내고,
골프백에 골프채를 정돈하시던
아버지의 설레임이 담긴 손길과
입가에 머물던 미소를 저는 아직도
선명하게 기억하고 있습니다.`}</p>
              <p>{`그러하기에,
출발 전 고객님들이 품으셨던 설레임과
미소가 골프 여정이 끝나는 날까지
이어질 수 있도록 세심하게 준비하고
정성을 다해 모시는
여행의파도가 되겠습니다.`}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-200 text-right">
              <p className="font-black text-gray-700 text-sm">여행의파도 대표 <span className="text-gray-800">이지안</span> 올림</p>
            </div>
          </div>

          <div className="flex flex-col items-center mt-8">
            <div className="w-40 h-48 rounded-2xl overflow-hidden border border-gray-100">
              <img src="/images/about/ceo.jpg" alt="이지안 대표" className="w-full h-full object-cover" />
            </div>
            <p className="text-center mt-3 font-black text-gray-800">이지안 대표</p>
            <p className="text-center text-xs text-gray-500">여행의 파도</p>
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
