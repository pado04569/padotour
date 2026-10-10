import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "여행의 파도 소개 | 골프전문 여행사",
  description: "여행의 파도는 해외 골프여행만 다루는 전문 여행사입니다. 서울보증보험 가입 여행사로 대표가 직접 상담합니다.",
  alternates: { canonical: "https://www.padotour.com/about" },
  openGraph: {
    title: "여행의 파도 소개 | 골프전문 여행사",
    description: "여행의 파도는 해외 골프여행만 다루는 전문 여행사입니다. 서울보증보험 가입 여행사로 대표가 직접 상담합니다.",
    url: "https://www.padotour.com/about",
  },
};

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
        <section>
          {/* 제목 사이 40px, 본문 전 24px — 섹션 제목보다 조금 크게, 히어로만큼은 크지 않게 (사장님 지시 10/10) */}
          <h2 className="text-xl font-black text-gray-800 mb-10 pb-2 border-b-2 border-emerald-500 inline-block">
            대표자의 말
          </h2>

          <h3 id="why-padotour" className="text-[22px] md:text-3xl font-black text-gray-800 text-center mb-6 scroll-mt-24">
            왜 ‘여행의 파도’일까요?
          </h3>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-2xl mx-auto">
            <div className="space-y-4 text-gray-700 text-base leading-relaxed whitespace-pre-line">
              <p><span className="font-bold">여행의파도</span>{` 는

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
              {/* 받침의 '이 판 동' 이름이 보이게 — 양옆 흰 여백을 잘라낸 사진으로 크게 (사장님 요청 2026-10-10, 원본 png는 보존) */}
              <img src="/images/about/holeinone-trophy-wide.jpg" alt="아버지 이판동 님의 홀인원 기념 트로피" className="w-full max-w-[340px] md:max-w-[420px] h-auto" />
            </div>
            <div className="space-y-4 text-gray-700 text-base leading-relaxed whitespace-pre-line">
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
          </div>

          <div className="flex flex-col items-center mt-8 max-w-2xl mx-auto">
            <div className="w-56 h-64 rounded-2xl overflow-hidden border border-gray-100">
              <img src="/images/about/ceo.jpg" alt="이지안 대표" className="w-full h-full object-cover" />
            </div>
            {/* 서명 — 기존 사진 아래 문구를 서명처럼 정리 */}
            <p className="text-center mt-3 text-[15px] leading-snug text-gray-800">
              여행의 파도
              <br />
              <span className="font-bold">대표 이지안</span>
            </p>
          </div>
        </section>

        {/* "여행의 파도가 약속하는 것" 카드와 파란 문의 상자는 없앴다 — 대표자의 말로 신뢰를 드리고,
            문의는 바로 아래 공통 상담 카드(전화·카카오)가 맡는다 (사장님 결정 2026-10-10) */}
      </div>
    </div>
  );
}
