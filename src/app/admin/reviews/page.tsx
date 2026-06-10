import { checkAuth, getReviews, deleteReview } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function AdminReviewsPage() {
  await checkAuth();
  const reviews = await getReviews();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800">⭐ 후기 관리</h1>
              <p className="text-gray-500 text-sm mt-1">총 {reviews.length}개 후기</p>
            </div>
            <Link href="/admin/reviews/new" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              + 후기 추가
            </Link>
          </div>

          <div className="space-y-3">
            {reviews.map((review: {
              id: string;
              name: string;
              country: string;
              rating: number;
              comment: string;
              date: string;
            }) => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 text-sm">{review.name}</span>
                    <span className="text-gray-400 text-xs">· {review.country} · {review.date}</span>
                    <span className="text-yellow-400 text-sm">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">"{review.comment}"</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/reviews/edit/${review.id}`} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg">수정</Link>
                  <form action={async () => {
                    "use server";
                    await deleteReview(review.id);
                  }}>
                    <button type="submit" className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">삭제</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
