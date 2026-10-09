"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import { IconChevron } from "./icons/Chevron";
import KoreaMiniMap from "./KoreaMiniMap";

// 첫 화면 출발공항 카드 + 확인창 (사장님 확정 L1, 2026-10-10)
// 인천/부산을 잘못 누르는 실수를 줄이려고 바로 이동하지 않고 한 번 확인한다. 확인창은 이 첫 선택에서만 쓴다.
// 카드는 실제 링크라서 스크립트가 늦게 떠도(또는 검색로봇도) 그대로 이동할 수 있다.
type Dep = "incheon" | "busan";
const INFO: Record<Dep, { title: string; sub: string; airport: string; ask: string; yes: string; other: string }> = {
  incheon: {
    title: "인천공항 출발",
    sub: "인천공항에서 출발하는 상품",
    airport: "인천공항",
    ask: "인천공항 출발 상품을 보시겠어요?",
    yes: "네, 인천출발 상품 보기",
    other: "부산출발로 보기",
  },
  busan: {
    title: "부산·김해공항 출발",
    sub: "김해공항에서 출발하는 상품",
    airport: "부산·김해공항",
    ask: "부산·김해공항 출발 상품을 보시겠어요?",
    yes: "네, 부산출발 상품 보기",
    other: "인천출발로 보기",
  },
};

export default function DepartureChooser() {
  const [asking, setAsking] = useState<Dep | null>(null);
  const router = useRouter();
  const other = (d: Dep): Dep => (d === "incheon" ? "busan" : "incheon");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(["incheon", "busan"] as Dep[]).map((d) => (
          <a
            key={d}
            href={`/${d}`}
            onClick={(e) => { e.preventDefault(); setAsking(d); }}
            className="flex items-center gap-3.5 min-h-[76px] md:min-h-24 px-4 md:px-5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-colors"
          >
            {/* 비행기 대신 작은 대한민국 지도 — 인천은 위쪽, 부산은 아래쪽 점 (보조 정보, 사장님 확정 B안 10/10) */}
            <span className="flex-none w-12 h-14 rounded-xl bg-blue-50/70 p-1.5">
              <KoreaMiniMap selected={d} variant="icon" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[19px] md:text-[22px] font-black leading-tight">{INFO[d].title}</span>
              <span className="block text-[15px] text-slate-600 mt-0.5">{INFO[d].sub}</span>
            </span>
            <IconChevron className="w-6 h-6 text-blue-700" />
          </a>
        ))}
      </div>

      <Modal open={asking !== null} onClose={() => setAsking(null)} title={asking ? INFO[asking].ask : ""}>
        {asking && (
          <>
            {/* 제목 다음에 작은 지도 + 고른 공항 이름만 (설명용 보조, 사장님 확정 A안 10/10) */}
            <div className="flex items-center gap-3 mb-5">
              <span className="flex-none w-14 h-[74px]">
                <KoreaMiniMap selected={asking} variant="modal" />
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[15px] font-bold">
                {INFO[asking].airport} 출발
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/${asking}`)}
              className="w-full min-h-[52px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[17px] font-extrabold transition-colors"
            >
              {INFO[asking].yes}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${other(asking)}`)}
              className="w-full min-h-12 mt-2 rounded-xl border border-slate-300 text-slate-700 text-base font-bold hover:bg-slate-50 transition-colors"
            >
              {INFO[asking].other}
            </button>
          </>
        )}
      </Modal>
    </>
  );
}
