import { checkAuth, getTours, deleteTour } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function AdminToursPage() {
  await checkAuth();
  const tours = await getTours();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800">⛳ 상품 관리</h1>
              <p className="text-gray-500 text-sm mt-1">총 {tours.length}개 상품</p>
            </div>
            <Link
              href="/admin/tours/new"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              + 새 상품 추가
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">상품명</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">국가</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">일정</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">출발</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">요금</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tours.map((tour: {
                  id: string;
                  title: string;
                  country: string;
                  badge?: string;
                  nights: number;
                  days: number;
                  roundsIncluded: number;
                  departure: string;
                  price: string;
                }) => (
                  <tr key={tour.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{tour.title}</div>
                      {tour.badge && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{tour.badge}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tour.country}</td>
                    <td className="px-4 py-3 text-gray-600">{tour.nights}박{tour.days}일 / {tour.roundsIncluded}R</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        tour.departure === "both" ? "bg-purple-100 text-purple-700" :
                        tour.departure === "incheon" ? "bg-emerald-100 text-emerald-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {tour.departure === "both" ? "인천+부산" : tour.departure === "incheon" ? "인천" : "부산"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tour.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/tours/edit/${tour.id}`}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          수정
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteTour(tour.id);
                        }}>
                          <button
                            type="submit"
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                            onClick={(e) => {
                              if (!confirm(`"${tour.title}" 상품을 삭제하시겠습니까?`)) {
                                e.preventDefault();
                              }
                            }}
                          >
                            삭제
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
