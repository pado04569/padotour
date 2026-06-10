import { notices } from "@/data/reviews";

export default function NoticePage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-10 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">📢 공지 · 이벤트</h1>
          <p className="text-emerald-100 text-sm md:text-lg">특가 소식과 새로운 상품 안내</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10 md:py-12">
        <div className="space-y-3 md:space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-start gap-2 md:gap-3 flex-1">
                  {notice.isEvent ? (
                    <span className="flex-shrink-0 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                      이벤트
                    </span>
                  ) : (
                    <span className="flex-shrink-0 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                      공지
                    </span>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm md:text-lg mb-1">{notice.title}</h3>
                    <p className="text-gray-500 text-xs md:text-base">{notice.content}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0 mt-1">{notice.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 md:mt-12 bg-emerald-50 rounded-2xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2 md:mb-3">🏌️ 특가 먼저 받아보세요</h2>
          <p className="text-gray-600 mb-5 md:mb-6 text-sm md:text-base">카카오톡 채널을 추가하시면 특가 소식을 가장 먼저 받으실 수 있어요</p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-7 py-3.5 md:px-8 md:py-4 rounded-full text-base md:text-lg transition-colors"
          >
            💬 카카오톡 채널 추가하기
          </a>
        </div>
      </section>
    </div>
  );
}
