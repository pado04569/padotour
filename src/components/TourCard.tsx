import { Tour } from "@/data/tours";
import Image from "next/image";
import Link from "next/link";
import { stayText } from "@/lib/stay";

// facts·datePrice 는 상품 목록(출발일로 상품 찾기)에서만 넘긴다 — 메인 화면 카드는 그대로 (2026-10-10)
export default function TourCard({
  tour,
  featured = false,
  bannerImage,
  facts,
  datePrice,
}: {
  tour: Tour;
  featured?: boolean;
  bannerImage?: string;
  /** 비교용 칩 [3박4일] [54홀] [4인부터] — strong 은 예약 조건(옅은 강조) */
  facts?: { label: string; strong?: boolean }[];
  /** 출발일 검색 중이면 그 날짜의 실제 요금 */
  datePrice?: { label: string; price: number };
}) {
  // 제목에 요금 숫자가 이미 포함된 경우(예: "...3박4일 549,000원부터") 그 숫자만 빨간색으로 칠하고
  // 아래 별도 요금 줄은 중복되므로 생략한다 (사장님 지적 2026-09-29: "아랫줄 빼고 제목에만 빨간색")
  const priceDigits = tour.price.match(/[\d,]+/)?.[0] ?? "";
  const titleHasPrice = featured && priceDigits.length > 0 && tour.title.includes(priceDigits);
  const titleParts = titleHasPrice ? tour.title.split(priceDigits) : null;

  return (
    <Link href={`/tours/${tour.id}`} className="block">
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      {/* 이미지 영역 — 공지 특가 이미지는 글자가 들어 있어 잘리지 않게 16:9 그대로 보여준다 (사장님 요청 2026-10-08) */}
      <div className={`relative ${bannerImage ? "aspect-video" : featured ? "h-72 md:h-96" : "h-52"} bg-emerald-100 overflow-hidden`}>
        <Image
          src={bannerImage ?? tour.image}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!bannerImage && tour.badge && (
          <span className={`absolute top-3 left-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full z-10 ${featured ? "text-base md:text-lg" : "text-sm"}`}>
            {tour.badge}
          </span>
        )}
        {!bannerImage && <span className={`absolute top-3 right-3 bg-emerald-700 text-white font-medium px-3 py-1 rounded-full z-10 ${featured ? "text-base md:text-lg" : "text-sm"}`}>
          {tour.country}
        </span>}
      </div>

      {/* 내용 */}
      <div className={featured ? "p-2.5 md:p-3" : "p-4"}>
        <h3 className={`font-bold text-gray-800 leading-snug line-clamp-2 ${featured ? "text-lg md:text-xl" : "text-sm h-10 mb-1"}`}>
          {titleParts ? (
            <>
              {titleParts[0]}
              <span className="text-red-600">{priceDigits}</span>
              {titleParts[1]}
            </>
          ) : (
            tour.title
          )}
        </h3>
        {!featured && facts && facts.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-1 mb-1.5" aria-label="상품 요약">
            {facts.map((f) => (
              <li
                key={f.label}
                className={`inline-flex items-center h-7 px-2.5 rounded-lg text-[13px] font-semibold ${f.strong ? "bg-yellow-50 text-amber-800 ring-1 ring-inset ring-amber-200" : "bg-slate-100 text-slate-600"}`}
              >
                {f.label}
              </li>
            ))}
          </ul>
        )}
        {!featured && !facts && (
          <p className="text-gray-400 text-xs mb-1">
            {stayText(tour.nights, tour.days)} · {tour.roundsIncluded}라운드
          </p>
        )}
        {datePrice ? (
          // 검색한 날짜의 요금 — 다른 날짜의 최저가를 검색 결과처럼 보이지 않게 (사장님 지시 2026-10-10)
          <p className={`font-bold text-red-600 ${featured ? "text-xl md:text-2xl" : "text-[17px]"}`}>
            <span className="text-[13px] font-semibold text-slate-500 mr-1">{datePrice.label}</span>
            {datePrice.price.toLocaleString("ko-KR")}원
          </p>
        ) : !titleHasPrice && (
          <p className={`font-bold text-red-600 ${featured ? "text-xl md:text-2xl" : facts ? "text-[17px]" : "text-base"}`}>{tour.price}</p>
        )}
      </div>
    </div>
    </Link>
  );
}
