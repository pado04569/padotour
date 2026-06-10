"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/adminActions";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "대시보드" },
  { href: "/admin/tours", icon: "⛳", label: "상품 관리" },
  { href: "/admin/reviews", icon: "⭐", label: "후기 관리" },
  { href: "/admin/notices", icon: "📢", label: "공지/이벤트" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-900 text-white min-h-screen flex flex-col fixed top-0 left-0 z-50">
      {/* 로고 */}
      <div className="p-5 border-b border-gray-700">
        <div className="text-lg font-black">⛳ 여행의 파도</div>
        <div className="text-xs text-gray-400 mt-0.5">관리자 페이지</div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="p-3 border-t border-gray-700 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <span>🌐</span>
          <span>사이트 보기</span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-left"
          >
            <span>🚪</span>
            <span>로그아웃</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
