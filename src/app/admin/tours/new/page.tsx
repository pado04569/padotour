import { checkAuth, saveTour } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function NewTourPage() {
  await checkAuth();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/tours" className="text-gray-400 hover:text-gray-600 text-sm">← 목록으로</Link>
            <h1 className="text-2xl font-black text-gray-800">새 상품 추가</h1>
          </div>

          <form action={saveTour} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">상품 ID <span className="text-red-500">*</span></label>
                <input name="id" required placeholder="예: japan-osaka" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-gray-400 mt-1">영문+하이픈, 중복 불가</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">뱃지</label>
                <input name="badge" placeholder="예: 인기, 신규, 여름 추천" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">국가명 <span className="text-red-500">*</span></label>
                <input name="country" required placeholder="예: 일본" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">국가코드 <span className="text-red-500">*</span></label>
                <select name="countryCode" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">지역명 <span className="text-red-500">*</span></label>
                <input name="region" required placeholder="예: 오사카" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">상품명 <span className="text-red-500">*</span></label>
                <input name="title" required placeholder="예: 오사카 골프여행" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">박 수</label>
                <input name="nights" type="number" min="1" defaultValue="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">일 수</label>
                <input name="days" type="number" min="1" defaultValue="4" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">코스 수</label>
                <input name="courses" type="number" min="1" defaultValue="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">라운드</label>
                <input name="roundsIncluded" type="number" min="1" defaultValue="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">출발지</label>
                <select name="departure" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="both">인천 + 부산</option>
                  <option value="incheon">인천출발</option>
                  <option value="busan">부산출발</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">요금</label>
                <input name="price" defaultValue="문의" placeholder="예: 문의, 1,200,000원~" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">이미지 경로</label>
              <input name="image" placeholder="/images/japan-osaka.jpg" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <p className="text-xs text-gray-400 mt-1">public/images/ 폴더에 이미지 파일을 먼저 넣어주세요</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">하이라이트 <span className="text-gray-400 font-normal">(한 줄에 하나씩)</span></label>
              <textarea name="highlights" rows={3} placeholder={"하카타 시내 접근성 최고\n규슈 명문 코스 2라운드\n온천 포함"} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">포함 사항 <span className="text-gray-400 font-normal">(한 줄씩)</span></label>
                <textarea name="includes" rows={4} placeholder={"항공\n숙박\n골프 2라운드\n조식"} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">불포함 사항 <span className="text-gray-400 font-normal">(한 줄씩)</span></label>
                <textarea name="excludes" rows={4} placeholder={"중식/석식\n캐디피\n카트피\n개인 경비"} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
