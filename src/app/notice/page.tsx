import { notices } from "@/data/reviews";

export default function NoticePage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-2">📢 공지 · 이벤트</h1>
          <p className="text-emerald-100 text-lg">특가 소식과 새로운 상품 안내</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {notice.isEvent ? (
                    <span className="flex-shrink-0 bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-lg">
                      이벤트
                    </span>
                  ) : (
                    <span className="flex-shrink-0 bg-gray-100 text-gray-600 text-sm font-bold px-3 py-1 rounded-lg">
                      공지
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{notice.title}</h3>
                    <p className="text-gray-500 text-base">{notice.content}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm flex-shrink-0 mt-1">{notice.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 bg-emerald-50 rounded-2xl p-10">
          <h2 className="text-2xl font-black text-gray-800 mb-3">🏌️ 특가 먼저 받아보세요</h2>
          <p className="text-gray-600 mb-6">카카오톡 채널을 추가하시면 특가 소식을 가장 먼저 받으실 수 있어요</p>
          <a
            href="https://pf.kakao.com/_bxoxnXxj/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-full text-lg transition-colors"
          >
            💬 카카오톡 채널 추가하기
          </a>
        </div>
      </section>
    </div>
  );
}
