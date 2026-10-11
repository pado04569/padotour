import type { Metadata } from "next";

// 관리자 화면은 검색에 나오면 안 된다 — robots.txt 의 Disallow 만으로는 주소가 색인될 수 있어 noindex 도 단다 (SEO 감사 2026-10-11)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
