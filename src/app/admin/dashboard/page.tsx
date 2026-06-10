import { checkAuth, getTours, getReviews, getNotices } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function DashboardPage() {
  await checkAuth();
  const tours = await getTours();
  const reviews = await getReviews();
  const notices = await getNotices();

  const stats = [
    { icon: "⛳", label: "등록 상품", value: tours.length, href: "/admin/tours", color: "bg-emerald-50 text-emerald-700" },
    { icon: "⭐", label: "고객 후기", value: reviews.length, href: "/admin/reviews", color: "bg-yellow-50 text-yellow-700" },
    { icon: "📢", label: "공지/이벤트", value: notices.length, href: "/admin/notices", color: "bg-blue-50 text-blue-700" },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-black text-gray-800 mb-2">대시보드</h1>
          <p className="text-gray-500 mb-8">콘텐츠를 관리하고 사이트를 업데이트하세요.</p>

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`${s.color} rounded-2xl p-6 hover:shadow-md transition-shadow`}
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black">{s.value}</div>
                <div className="text-sm font-medium mt-1">{s.label}</div>
              </Link>
            ))}
          </div>

          {/* 빠른 작업 */}
          <h2 className="text-lg font-bold text-gray-700 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-2 gap-3 mb-10">
            <Link
              href="/admin/tours/new"
              className="flex items-center gap-3 bg-white border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <span className="font-semibold text-gray-700">새 상품 추가</span>
            </Link>
            <Link
              href="/admin/reviews/new"
              className="flex items-center gap-3 bg-white border-2 border-dashed border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <span className="font-semibold text-gray-700">후기 추가</span>
            </Link>
            <Link
              href="/admin/notices/new"
              className="flex items-center gap-3 bg-white border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <span className="font-semibold text-gray-700">공지/이벤트 추가</span>
            </Link>
            <a
              href="https://github.com/pado04569/padotour"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">🚀</span>
              <span className="font-semibold text-gray-700">GitHub에서 배포</span>
            </a>
          </div>

          {/* 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">💡 저장 및 배포 방법</p>
            <p>① 관리자 페이지에서 내용 수정 및 저장</p>
            <p>② VS Code 터미널에서 <code className="bg-amber-100 px-1 rounded">git add . && git commit -m "내용 업데이트" && git push</code></p>
            <p>③ Vercel이 자동으로 사이트를 업데이트합니다 🎉</p>
          </div>
        </div>
      </main>
    </div>
  );
}
