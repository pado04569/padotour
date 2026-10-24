"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { DEP_HOME, DEP_NAME, isDep, type Dep } from "@/lib/departure";
import { IconArrowLeft } from "./icons/MenuIcons";

// 첫 화면 오른쪽 위 "‹ 청주출발로 돌아가기" — 출발지가 4곳이 되어(10/25) 다시 고르러 왔다가
// 원래 보던 출발지로 바로 돌아갈 길 (사장님 요청). 처음 온 손님(저장된 출발지 없음)에게는 안 보인다.
// 휴대폰은 출발공항 카드 위(문구 위)·PC는 오른쪽 위 — 사진(구름) 위에서도 보이게 반투명 남색 바탕 (Codex 검수 10/25)
// 저장 키는 ClientLayout 과 같다. 서버 화면에는 없고(null) 브라우저에서만 그린다 — 화면 어긋남(#418) 방지.
const DEP_KEY = "padotour_departure";
function read(): Dep | null {
  try {
    const v = localStorage.getItem(DEP_KEY);
    return isDep(v) ? v : null;
  } catch {
    return null;
  }
}
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function LandingBack({ className = "" }: { className?: string }) {
  const saved = useSyncExternalStore(subscribe, read, () => null);
  if (!saved) return null;
  return (
    <Link
      href={DEP_HOME[saved]}
      className={`items-center gap-1.5 min-h-11 px-4 rounded-full bg-[rgba(8,30,50,0.5)] hover:bg-[rgba(8,30,50,0.65)] border border-white/50 text-white text-base md:text-lg font-bold whitespace-nowrap transition-colors ${className}`}
    >
      <IconArrowLeft className="w-[18px] h-[18px]" />
      {DEP_NAME[saved]}로 돌아가기
    </Link>
  );
}
