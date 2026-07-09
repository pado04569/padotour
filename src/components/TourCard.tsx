import { Tour } from "@/data/tours";
import Image from "next/image";
import Link from "next/link";

export default function TourCard({ tour, featured = false }: { tour: Tour; featured?: boolean }) {
  return (
    <Link href={`/tours/${tour.id}`} className="block">
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      {/* 이미지 영역 */}
      <div className={`relative ${featured ? "h-72 md:h-96" : "h-52"} bg-emerald-100 overflow-hidden`}>
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {tour.badge && (
          <span className={`absolute top-3 left-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full z-10 ${featured ? "text-base md:text-lg" : "text-sm"}`}>
            {tour.badge}
          </span>
        )}
        <span className={`absolute top-3 right-3 bg-emerald-700 text-white font-medium px-3 py-1 rounded-full z-10 ${featured ? "text-base md:text-lg" : "text-sm"}`}>
          {tour.country}
        </span>
      </div>

      {/* 내용 */}
      <div className={featured ? "p-4 md:p-5" : "p-4"}>
        <h3 className={`font-bold text-gray-800 leading-snug line-clamp-2 ${featured ? "text-lg md:text-xl h-12 md:h-14 mb-0.5" : "text-sm h-10 mb-1"}`}>{tour.title}</h3>
        <p className={`text-gray-400 ${featured ? "text-sm md:text-base mb-0.5" : "text-xs mb-1"}`}>
          {tour.nights}박{tour.days}일 · {tour.roundsIncluded}라운드
        </p>
        <p className={`font-bold text-emerald-700 ${featured ? "text-xl md:text-2xl" : "text-base"}`}>{tour.price}</p>
      </div>
    </div>
    </Link>
  );
}
