import { checkAuth, getTours, saveTour } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  await checkAuth();
  const { id } = await params;
  const tours = await getTours();
  const tour = tours.find((t: { id: string }) => t.id === id);
  if (!tour) notFound();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/tours" className="text-gray-400 hover:text-gray-600 text-sm">← 목록으로</Link>
            <h1 className="text-2xl font-black text-gray-800">상품 수정</h1>
          </div>

          <form action={saveTour} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <input type="hidden" name="id" value={tour.id} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">상품 ID</label>
                <input value={tour.id} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">뱃지</label>
                <input name="badge" defaultValue={tour.badge || ""} placeholder="예: 인기, 신규" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">국가명</label>
                <input name="country" defaultValue={tour.country} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">국가코드</label>
                <select name="countryCode" defaultValue={tour.countryCode} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="japan">japan (일본)</option>
                  <option value="china">china (중국)</option>
                  <option value="malaysia">malaysia (코타키나발루)</option>
                  <option value="philippines">philippines (필리핀)</option>
                  <option value="thailand">thailand (태국)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">지역명</label>
                <input name="region" defaultValue={tour.region} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">상품명</label>
                <input name="title" defaultValue={tour.title} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">박</label>
                <input name="nights" type="number" defaultValue={tour.nights} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">일</label>
                <input name="days" type="number" defaultValue={tour.days} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">코스</label>
                <input name="courses" type="number" defaultValue={tour.courses} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">라운드</label>
                <input name="roundsIncluded" type="number" defaultValue={tour.roundsIncluded} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">출발지</label>
                <select name="departure" defaultValue={tour.departure} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="both">인천 + 부산</option>
                  <option value="incheon">인천출발</option>
                  <option value="busan">부산출발</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">요금</label>
                <input name="price" defaultValue={tour.price} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">이미지 경로</label>
              <input name="image" defaultValue={tour.image} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">하이라이트 (한 줄씩)</label>
              <textarea name="highlights" rows={3} defaultValue={tour.highlights.join("\n")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">포함 사항</label>
                <textarea name="includes" rows={4} defaultValue={tour.includes.join("\n")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">불포함 사항</label>
                <textarea name="excludes" rows={4} defaultValue={tour.excludes.join("\n")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                저장하기
              </button>
              <Link href="/admin/tours" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
                취소
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
