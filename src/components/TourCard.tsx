import { Tour } from "@/data/tours";
import Image from "next/image";

export default function TourCard({ tour }: { tour: Tour }) {
  return (
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
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{tour.title}</h3>
        <p className="text-gray-500 text-sm mb-3">
          {tour.nights}박{tour.days}일 · {tour.roundsIncluded}라운드
        </p>

        {/* 하이라이트 */}
        <ul className="space-y-1 mb-4">
          {tour.highlights.map((h, i) => (
            <li key={i} className="text-gray-600 text-sm flex items-start gap-1.5">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
              {h}
            </li>
          ))}
        </ul>

        {/* 포함 사항 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 font-medium mb-1">포함</p>
          <p className="text-sm text-gray-700">{tour.includes.join(" · ")}</p>
        </div>

        {/* 가격 & 문의 버튼 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">요금</span>
            <p className="text-lg font-bold text-emerald-700">{tour.price}</p>
          </div>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2.5 rounded-full text-base transition-colors"
          >
            💬 문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
