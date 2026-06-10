import { checkAuth, saveReview } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function NewReviewPage() {
  await checkAuth();
  const newId = Date.now().toString();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/reviews" className="text-gray-400 hover:text-gray-600 text-sm">← 목록으로</Link>
            <h1 className="text-2xl font-black text-gray-800">후기 추가</h1>
          </div>

          <form action={saveReview} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <input type="hidden" name="id" value={newId} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">고객명</label>
                <input name="name" required placeholder="예: 홍○○ 님" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">여행지</label>
                <input name="country" required placeholder="예: 일본 후쿠오카" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">국가코드</label>
                <select name="countryCode" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="japan">japan</option>
                  <option value="china">china</option>
                  <option value="malaysia">malaysia</option>
                  <option value="philippines">philippines</option>
                  <option value="thailand">thailand</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">평점</label>
                <select name="rating" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                  <option value="4">⭐⭐⭐⭐ (4점)</option>
                  <option value="3">⭐⭐⭐ (3점)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">후기 내용</label>
              <textarea name="comment" rows={4} required placeholder="고객 후기 내용을 입력하세요" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">날짜</label>
              <input name="date" required placeholder="예: 2025.11" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">저장하기</button>
              <Link href="/admin/reviews" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">취소</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
