"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import KakaoFloat from "./KakaoFloat";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <>
      {!isLanding && <Header />}
      <main className={isLanding ? "" : "flex-1"}>{children}</main>
      {!isLanding && <Footer />}
      {!isLanding && <KakaoFloat />}
    </>
  );
}
