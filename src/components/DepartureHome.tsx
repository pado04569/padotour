import Link from "next/link";
import TourCard from "@/components/TourCard";
import { tours } from "@/data/tours";
import { DEP_AIRPORT, DEP_HOME, DEP_NAME, type Dep } from "@/lib/departure";

// 청주·대구 출발 목록 화면 (사장님 확정 10/24: 버튼 3개·출발지 4개)
// 판매 중인 상품만 나온다(tours 는 출발일이 남은 상품). 0개면 첫 화면 칸은 숨기지만 주소는 살려 두고 준비 중 안내를 보여 준다.
// 인천·부산 겸용(both) 상품은 청주·대구 출발이 아니므로 섞지 않는다.
const PAIR: Record<"cheongju" | "daegu", { dep: Dep; label: string }> = {
  cheongju: { dep: "incheon", label: "인천출발 상품 보기" },
  daegu: { dep: "busan", label: "부산출발 상품 보기" },
};

export default function DepartureHome({ dep }: { dep: "cheongju" | "daegu" }) {
  const list = tours.filter((t) => t.departure === dep);
  const pair = PAIR[dep];
  return (
    <div>
      <section className="bg-hero-commerce text-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-black">{DEP_NAME[dep]} 골프여행</h1>
          <p className="mt-2 text-[15px] md:text-base text-white/90 break-keep">{DEP_AIRPORT[dep]}에서 출발하는 해외 골프여행 패키지</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {list.length > 0 ? (
          <>
            <p className="text-gray-500 text-[15px] md:text-base mb-4 md:mb-5">{DEP_NAME[dep]} 상품 {list.length}개</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {list.map((t) => <TourCard key={t.id} tour={t} />)}
            </div>
            <div className="text-center mt-8">
              <Link
                href={`/tours?departure=${dep}`}
                className="inline-flex items-center justify-center w-full max-w-[340px] min-h-[52px] px-8 rounded-full border-2 font-bold text-base transition-colors border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                전체 상품 보기 ({list.length}개)
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white border border-line p-6 md:p-8 text-center">
            <p className="text-lg md:text-xl font-bold text-main-text break-keep">현재 판매 중인 {DEP_NAME[dep]} 상품을 준비하고 있습니다</p>
            <p className="mt-2 text-[15px] text-body-text break-keep">가까운 공항 출발 상품은 아래에서 확인하실 수 있습니다.</p>
            <Link
              href={DEP_HOME[pair.dep]}
              className="mt-5 inline-flex items-center justify-center w-full max-w-[340px] min-h-[52px] px-8 rounded-full border-2 font-bold text-base border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              {pair.label}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
