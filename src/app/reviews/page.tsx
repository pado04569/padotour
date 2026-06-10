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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-md p-5 md:p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl md:text-2xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-4 md:mb-6 text-sm md:text-lg">"{review.comment}"</p>
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
