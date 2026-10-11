"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import KakaoFloat from "./KakaoFloat";
// 카카오 팝업은 화면을 가려 제거(2026-09-10). 플로팅 버튼은 작은 아이콘으로 다시 붙임(2026-10-08).

const DEP_KEY = "padotour_departure";
function readSavedDeparture(): "incheon" | "busan" | null {
  try {
    const v = localStorage.getItem(DEP_KEY);
    return v === "incheon" || v === "busan" ? v : null;
  } catch {
    return null;
  }
}
// 저장값이 바뀌면(다른 탭 등) 다시 읽는다
function subscribeSaved(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
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
  // 서버가 미리 만든 화면(저장값 없음)과 첫 화면을 똑같이 맞춘 뒤, 저장값으로 바꿔 그린다.
  // 처음엔 render 중에 바로 읽었는데, 미리 만들어 두는 페이지(골프장 소개·공지 등)에서 화면이 어긋나
  // React가 페이지 전체를 다시 그리는 오류(#418)가 났다 (최종 QA 2026-10-11)
  const saved = useSyncExternalStore(subscribeSaved, readSavedDeparture, () => null);
  const departure = fromUrl ?? saved ?? undefined;
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
