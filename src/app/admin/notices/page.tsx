import { checkAuth, getNotices, deleteNotice } from "@/lib/adminActions";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default async function AdminNoticesPage() {
  await checkAuth();
  const notices = await getNotices();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800">📢 공지/이벤트 관리</h1>
              <p className="text-gray-500 text-sm mt-1">총 {notices.length}개</p>
            </div>
            <Link href="/admin/notices/new" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              + 공지 추가
            </Link>
          </div>

          <div className="space-y-3">
            {notices.map((notice: {
              id: string;
              title: string;
              content: string;
              date: string;
              isEvent: boolean;
            }) => (
              <div key={notice.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${notice.isEvent ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                      {notice.isEvent ? "이벤트" : "공지"}
                    </span>
                    <span className="text-gray-400 text-xs">{notice.date}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{notice.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{notice.content}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/notices/edit/${notice.id}`} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg">수정</Link>
                  <form action={async () => {
                    "use server";
                    await deleteNotice(notice.id);
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
