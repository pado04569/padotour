"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
// 카카오 팝업·플로팅 버튼은 화면을 가려 제거함 (사장님 확정 2026-09-10).
// 컴포넌트 파일은 남겨뒀으니 되살리려면 여기서 다시 불러오면 된다.

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
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
      <Header departure={departure} />
      <main className="flex-1">{children}</main>
      <Footer departure={departure} />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </Suspense>
  );
}
