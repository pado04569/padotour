"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header, { type CourseNavItem } from "./Header";
import Footer from "./Footer";
import KakaoFloat from "./KakaoFloat";
// 카카오 팝업은 화면을 가려 제거(2026-09-10). 플로팅 버튼은 작은 아이콘으로 다시 붙임(2026-10-08).

function ClientLayoutInner({ children, courseNavItems }: { children: React.ReactNode; courseNavItems: CourseNavItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLanding = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  const queryDeparture = searchParams.get("departure");

  const departure =
    pathname.startsWith("/incheon") ? "incheon" :
    pathname.startsWith("/busan") ? "busan" :
    queryDeparture === "incheon" ? "incheon" :
    queryDeparture === "busan" ? "busan" :
    undefined;

  if (isLanding || isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header departure={departure} courseNavItems={courseNavItems} />
      <main className="flex-1">{children}</main>
      <Footer departure={departure} />
      <KakaoFloat />
    </>
  );
}

export default function ClientLayout({ children, courseNavItems }: { children: React.ReactNode; courseNavItems: CourseNavItem[] }) {
  return (
    <Suspense>
      <ClientLayoutInner courseNavItems={courseNavItems}>{children}</ClientLayoutInner>
    </Suspense>
  );
}
