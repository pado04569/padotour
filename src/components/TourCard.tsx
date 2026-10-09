import { Tour } from "@/data/tours";
import Image from "next/image";
import Link from "next/link";
import { stayText } from "@/lib/stay";

export default function TourCard({ tour, featured = false, bannerImage }: { tour: Tour; featured?: boolean; bannerImage?: string }) {
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
        {!featured && (
          <p className="text-gray-400 text-xs mb-1">
            {stayText(tour.nights, tour.days)} · {tour.roundsIncluded}라운드
          </p>
        )}
        {!titleHasPrice && (
          <p className={`font-bold text-red-600 ${featured ? "text-xl md:text-2xl" : "text-base"}`}>{tour.price}</p>
        )}
      </div>
    </div>
    </Link>
  );
}
