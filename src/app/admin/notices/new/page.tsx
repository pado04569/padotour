import { checkAuth, saveNotice } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function NewNoticePage() {
  await checkAuth();
  // 새 글 번호는 요청 때 서버에서 한 번 만드는 값 — 의도된 시간 호출
  // eslint-disable-next-line react-hooks/purity
  const newId = Date.now().toString();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/notices" className="text-gray-400 hover:text-gray-600 text-sm">← 목록으로</Link>
            <h1 className="text-2xl font-black text-gray-800">공지/이벤트 추가</h1>
          </div>

          <form action={saveNotice} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <input type="hidden" name="id" value={newId} />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">제목</label>
              <input name="title" required placeholder="공지 제목 입력" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">내용</label>
              <textarea name="content" rows={3} required placeholder="공지 내용 입력" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">날짜</label>
                <input name="date" required defaultValue={today} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">구분</label>
                <select name="isEvent" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="false">📌 공지</option>
                  <option value="true">🎉 이벤트/특가</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">종료일 (선택)</label>
              <input type="date" name="expiresAt" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <p className="text-xs text-gray-400 mt-1">지정하면 이 날짜가 지난 뒤 홈페이지 공지·이벤트 목록에서 자동으로 사라집니다. 특정 출발일 한정 특가는 출발일 당일이 아니라 <b>출발 2일 전</b>으로 넣어주세요 (임박 예약은 거의 없음).</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">저장하기</button>
              <Link href="/admin/notices" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">취소</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
