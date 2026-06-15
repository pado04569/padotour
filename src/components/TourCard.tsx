import { Tour } from "@/data/tours";
import Image from "next/image";
import Link from "next/link";

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link href={`/tours/${tour.id}`} className="block">
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      {/* 이미지 영역 */}
      <div className="relative h-52 bg-emerald-100 overflow-hidden">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {tour.badge && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
            {tour.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-emerald-700 text-white text-sm font-medium px-3 py-1 rounded-full z-10">
          {tour.country}
        </span>
      </div>

      {/* 내용 */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-1 leading-snug line-clamp-2">{tour.title}</h3>
        <p className="text-gray-400 text-xs mb-2">
          {tour.nights}박{tour.days}일 · {tour.roundsIncluded}라운드
        </p>
        <p className="text-base font-bold text-emerald-700">{tour.price}</p>
      </div>
    </div>
    </Link>
  );
}
