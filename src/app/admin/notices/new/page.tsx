import { checkAuth, saveNotice } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function NewNoticePage() {
  await checkAuth();
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
