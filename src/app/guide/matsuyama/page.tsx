import type { Metadata } from "next";
import Link from "next/link";
import { tours } from "@/data/tours";
import TourCard from "@/components/TourCard";

export const metadata: Metadata = {
  title: "마쓰야마 골프여행 총정리 | 인천·부산 출발 온천 골프패키지 - 여행의파도",
  description:
    "마쓰야마 골프여행의 모든 것 — 골프장 5곳 선택, 36홀 라운딩, 쥬라쿠 온천·히요리호텔 숙박, 도고온천·마쓰야마성 무료관광까지. 인천·부산 직항 출발, 골프전문 여행의파도가 안내합니다.",
  keywords: [
    "마쓰야마 골프",
    "마쓰야마 골프여행",
    "마쓰야마 골프패키지",
    "일본 온천 골프",
    "시코쿠 골프여행",
    "도고온천 골프",
    "인천출발 일본골프",
    "부산출발 일본골프",
  ],
};

const PHONE = "010-5301-5250";

const faqs = [
  {
    q: "몇 명부터 출발할 수 있나요?",
    a: "기본 4인부터 출발 가능합니다. 2~3인이시라면 다른 팀과 조인이 가능한 날짜를 안내해 드리니 전화로 문의해 주세요.",
  },
  {
    q: "라운딩을 더 늘릴 수 있나요?",
    a: "기본 36홀(18홀×2회)이며, 54홀(3회 라운딩)로 업그레이드할 수 있습니다. 예약 시 미리 말씀해 주시면 티오프까지 맞춰 준비해 드립니다.",
  },
  {
    q: "골프를 안 치는 일행이 있어도 되나요?",
    a: "네, 가능합니다. 라운딩 시간 동안 도고온천 거리·마쓰야마 시내 관광을 즐기실 수 있어 비골퍼 동반 일행도 만족도가 높은 지역입니다. 요금은 별도 안내해 드립니다.",
  },
  {
    q: "언제 가는 게 좋나요?",
    a: "상품 운영 기간은 6월~10월입니다. 여름에도 라운딩 후 온천으로 마무리하는 일정이라 인기가 좋고, 가을에는 온천×골프 조합이 가장 빛나는 시즌입니다.",
  },
];

export default function MatsuyamaGuidePage() {
  const matsuyamaTours = tours.filter((t) => t.id.includes("matsuyama"));

  return (
    <div className="bg-white min-h-screen">
      {/* 히어로 */}
      <div className="relative">
        <img
          src="/images/matsuyama-juraku-hiyori/course-6.jpg"
          alt="마쓰야마 골프장 전경"
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <p className="text-emerald-300 text-sm font-semibold mb-2 tracking-widest">
            MATSUYAMA GOLF GUIDE
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            마쓰야마 골프여행 총정리
          </h1>
          <p className="text-white/90 text-base md:text-lg">
            골프 36홀 + 온천 + 시내관광을 한 번에 — 인천·부산 직항 출발
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* 왜 마쓰야마인가 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            왜 마쓰야마인가요?
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              마쓰야마는 저희 여행의파도 손님들이 가장 많이 다녀오시고, 또 가장
              많이 다시 찾으시는 지역입니다. 이유는 단순해요 — 골프,
              온천, 시내 관광이 한 도시 안에 모여 있어서 짧은 일정에도 알차게
              다녀올 수 있기 때문입니다.
            </p>
            <p>
              낮에는 골프장 5곳 중 원하는 코스에서 라운딩하고, 저녁에는 노천
              온천에 몸을 담그고, 마지막 날에는 마쓰야마성과 도고온천 거리를
              걷는 일정. 100년 된 노면전차가 달리는 시내와 애니메이션 &lsquo;센과
              치히로의 행방불명&rsquo;의 배경이 된 도고온천까지 — 골프만 치고
              돌아오는 여행이 아니라서 동반자 만족도가 특히 높습니다.
            </p>
          </div>
        </section>

        {/* 골프장 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            골프장 — 5곳 중 선택, 기본 36홀
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <img src="/images/matsuyama-juraku-hiyori/course-1.jpg" alt="마쓰야마 골프 코스" className="rounded-xl w-full h-40 object-cover" />
            <img src="/images/matsuyama-juraku-hiyori/course-3.jpg" alt="마쓰야마 골프 코스 그린" className="rounded-xl w-full h-40 object-cover" />
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              마쓰야마 · 국제 · 치산호조 · 로얄 · 씨사이드 다섯 곳 중에서
              선택해 라운딩합니다. 기본 18홀×2회(36홀)이고, 원하시면
              54홀(3회)로 늘릴 수 있어요. 그린피와 카트비가 모두 포함이며
              호텔-골프장 간 셔틀로 이동하니 현지에서 따로 신경 쓸 일이
              없습니다.
            </p>
            <p className="text-sm text-gray-500">
              어느 코스가 우리 팀에 맞을지 고민되시면 전화 주세요 — 구력과
              취향에 맞춰 골라드립니다.
            </p>
          </div>
        </section>

        {/* 숙소와 온천 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            숙소 — 온천 리조트 1박 + 시내 호텔 2박
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <img src="/images/matsuyama-juraku-hiyori/juraku-1.jpg" alt="쥬라쿠 스파리조트" className="rounded-xl w-full h-40 object-cover" />
            <img src="/images/matsuyama-juraku-hiyori/hiyori-1.jpg" alt="히요리호텔 객실" className="rounded-xl w-full h-40 object-cover" />
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              첫날은 <strong>쥬라쿠 스파리조트</strong>에서 노천 온천 8탕을
              밤 11시까지 자유롭게 이용하며 여독을 풀고, 이후 이틀은 시내
              중심가 오카이도에서 도보 0분인 <strong>히요리호텔</strong>에
              묵습니다. 히요리는 웰컴드링크·해피아워(생맥주/니혼슈)·야식
              오차즈케·모닝커피가 전부 무료라, 라운딩 후 저녁 시간이
              풍성해지는 숙소예요.
            </p>
            <p>
              여기에 도고온천 별관 아스카노유 입욕까지 포함되어 있어, 3박
              내내 &ldquo;골프 → 온천&rdquo;의 리듬으로 다녀오실 수 있습니다.
            </p>
          </div>
        </section>

        {/* 관광 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            골프 말고도 즐길 거리
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-emerald-600 font-black">✓</span>
              마쓰야마성 로프웨이 탑승 + 천수각 입장 (무료 포함)
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600 font-black">✓</span>
              도고온천 거리 산책 — 일본 정취가 그대로 남아있는 온천 마을
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600 font-black">✓</span>
              100년 역사의 노면전차로 다니는 시내 — 밤거리 맛집 탐방
            </li>
          </ul>
        </section>

        {/* 포함/불포함 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            포함되는 것 / 따로 드는 것
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <p className="font-black text-emerald-800 mb-3">포함</p>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li>왕복 항공권 (공항세·유류세 포함)</li>
                <li>숙박 3박 (온천리조트 1박 + 시내호텔 2박)</li>
                <li>전일정 조식</li>
                <li>36홀 그린피 + 카트비</li>
                <li>호텔-골프장 셔틀 · 온천세</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <p className="font-black text-gray-700 mb-3">불포함</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>중식·석식</li>
                <li>현지 케어비 (사전 안내)</li>
                <li>선택관광 비용</li>
                <li>여행자보험 · 개인 경비</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 상품 카드 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            출발지별 상품 보기
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {matsuyamaTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 group">
                <summary className="font-bold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-3xl text-center text-white p-10">
          <h2 className="text-2xl font-black mb-2">마쓰야마, 언제 출발하시겠어요?</h2>
          <p className="text-emerald-100 mb-6 text-sm">
            출발일·인원에 따라 합리적으로 견적 도와드립니다.
            <br />
            4년간 마쓰야마를 가장 많이 안내해 온 골프전문 여행사입니다.
          </p>
          <a
            href={`tel:${PHONE}`}
            className="inline-block bg-white text-emerald-800 font-black px-8 py-3 rounded-full text-lg hover:bg-emerald-50 transition-colors"
          >
            📞 {PHONE}
          </a>
          <p className="text-emerald-200 text-xs mt-4">
            <Link href="/tours?country=japan" className="underline">
              다른 일본 골프여행 상품 보기 →
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
