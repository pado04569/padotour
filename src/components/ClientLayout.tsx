"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import KakaoFloat from "./KakaoFloat";
import KakaoPopup from "./KakaoPopup";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  const departure =
    pathname.startsWith("/incheon") ? "incheon" :
    pathname.startsWith("/busan") ? "busan" :
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
