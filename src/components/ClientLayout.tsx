"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import KakaoFloat from "./KakaoFloat";
// 카카오 팝업은 화면을 가려 제거(2026-09-10). 플로팅 버튼은 작은 아이콘으로 다시 붙임(2026-10-08).

const DEP_KEY = "padotour_departure";
function readSavedDeparture(): "incheon" | "busan" | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = localStorage.getItem(DEP_KEY);
    return v === "incheon" || v === "busan" ? v : undefined;
  } catch {
    return undefined;
  }
}

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLanding = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  const queryDeparture = searchParams.get("departure");

  const fromUrl =
    pathname.startsWith("/incheon") ? "incheon" :
    pathname.startsWith("/busan") ? "busan" :
    queryDeparture === "incheon" ? "incheon" :
    queryDeparture === "busan" ? "busan" :
    undefined;
  // 주소에 출발지가 없는 화면(상품 상세·후기·골프장·예약조회)에서도 마지막으로 고른 출발지를 이어 쓴다.
  // 부산으로 들어온 손님에게 인천 블로그·번호가 보이던 문제 (사장님 지적 2026-10-10)
  // 이 레이아웃은 브라우저에서만 그려져(useSearchParams) 저장값을 바로 읽어도 화면이 어긋나지 않는다.
  const departure = fromUrl ?? readSavedDeparture();
  useEffect(() => {
    if (fromUrl) try { localStorage.setItem(DEP_KEY, fromUrl); } catch {}
  }, [fromUrl]);

  if (isAdmin) {
    return <>{children}</>;
  }

  // 첫 출발지 선택 화면은 헤더·푸터 없이, 카카오 문의 버튼만 붙인다 (사장님 요청 2026-10-08)
  if (isLanding) {
    return (
      <>
        {children}
        <KakaoFloat />
      </>
    );
  }

  return (
    <>
      <Header departure={departure} />
      <main className="flex-1">{children}</main>
      <Footer departure={departure} />
      <KakaoFloat />
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
