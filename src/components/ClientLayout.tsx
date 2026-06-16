"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import KakaoFloat from "./KakaoFloat";
import KakaoPopup from "./KakaoPopup";

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
      <KakaoFloat />
      {departure && <KakaoPopup departure={departure} />}
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
