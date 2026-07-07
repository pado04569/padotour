import Image from "next/image";
import { reviews } from "@/data/reviews";

export default function ReviewsPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">⭐ 고객 후기</h1>
          <p className="text-emerald-100 text-sm md:text-lg">여행의 파도와 함께 다녀오신 분들의 이야기</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 md:mb-6">
          여행의 파도 이용후기 {reviews.length}개의 글
        </h2>

        {/* 네이버 블로그 스타일 목록 */}
        <div className="border-t-2 border-gray-800 mb-8 md:mb-10">
          {reviews.map((review) => (
            <a
              key={review.id}
              href={`#review-${review.id}`}
              className="flex items-center gap-2 py-3 md:py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="flex-1 text-gray-800 text-sm md:text-base truncate">{review.title}</span>
              <span className="text-xs md:text-sm text-gray-400 flex-shrink-0">{review.country}</span>
            </a>
          ))}
        </div>

        {/* 썸네일 갤러리 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-14">
          {reviews.map((review) => (
            <a
              key={review.id}
              href={`#review-${review.id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-emerald-50">
                {review.images && review.images.length > 0 ? (
                  <Image
                    src={review.images[0]}
                    alt={review.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">⛳</div>
                )}
              </div>
              <p className="mt-1.5 text-xs md:text-sm text-gray-700 line-clamp-2 leading-snug">{review.title}</p>
            </a>
          ))}
        </div>

        {/* 상세 후기 카드 */}
        <div className="space-y-5 md:space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              id={`review-${review.id}`}
              className="bg-white rounded-2xl shadow-md p-5 md:p-8 border border-gray-100 scroll-mt-24"
            >
              <h3 className="font-bold text-gray-900 text-base md:text-lg mb-3">{review.title}</h3>
              {review.kakaoImage && (
                <div className="relative w-full mb-4 md:mb-6 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={review.kakaoImage} alt={`${review.name} 카카오톡 후기`} width={800} height={400} className="w-full h-auto" />
                </div>
              )}
              <p className="text-gray-700 leading-relaxed mb-4 md:mb-6 text-sm md:text-lg whitespace-pre-line">"{review.comment}"</p>
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4 md:mb-6">
                  {review.images.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <Image src={src} alt={`${review.name} 후기 사진 ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {review.hashtags && review.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                  {review.hashtags.map((tag) => (
                    <span key={tag} className="text-xs md:text-sm text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs md:text-sm text-gray-400 border-t pt-3 md:pt-4">
                <span className="font-bold text-gray-700 text-sm md:text-base">{review.name}</span>
                <span>{review.country} · {review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 md:mt-12 bg-emerald-50 rounded-2xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2 md:mb-3">후기를 남겨주세요</h2>
          <p className="text-gray-600 mb-5 md:mb-6 text-sm md:text-base">여행을 다녀오셨다면 카카오톡으로 후기를 보내주세요 😊</p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg transition-colors"
          >
            💬 카카오톡으로 후기 보내기
          </a>
        </div>
      </section>
    </div>
  );
}
