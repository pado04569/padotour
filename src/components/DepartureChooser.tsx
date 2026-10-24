"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "./Modal";
import KoreaMiniMap, { type Dep } from "./KoreaMiniMap";

// 첫 화면 출발공항 카드 + 확인창 (사장님 확정 L1, 2026-10-10)
// 인천/부산을 잘못 누르는 실수를 줄이려고 바로 이동하지 않고 한 번 확인한다. 확인창은 이 첫 선택에서만 쓴다.
// 카드는 실제 링크라서 스크립트가 늦게 떠도(또는 검색로봇도) 그대로 이동할 수 있다.
// 카드 모양 G안(사장님 확정 10/25): 큰 지도 + "인천출발" 한 줄, 꺽쇠 없음, 지도 4개 같은 크기.
// 휴대폰은 칸 높이 3/4(92→68px)·글자 21px — 버튼이 브랜드명(24px)보다 튀지 않게 (사장님 확정 10/25)
// 청주·대구는 판매 중인 상품이 있을 때만 셋째 칸에 [청주 | 대구]로 나온다(없으면 지금처럼 2칸).
const INFO: Record<Dep, { title: string; airport: string; ask: string; yes: string }> = {
  incheon: { title: "인천출발", airport: "인천공항", ask: "인천공항 출발 상품을 보시겠어요?", yes: "네, 인천출발 상품 보기" },
  busan: { title: "부산출발", airport: "부산·김해공항", ask: "부산·김해공항 출발 상품을 보시겠어요?", yes: "네, 부산출발 상품 보기" },
  cheongju: { title: "청주", airport: "청주공항", ask: "청주공항 출발 상품을 보시겠어요?", yes: "네, 청주출발 상품 보기" },
  daegu: { title: "대구", airport: "대구공항", ask: "대구공항 출발 상품을 보시겠어요?", yes: "네, 대구출발 상품 보기" },
};
// 확인창 아래 버튼 — 다른 공항으로 보기 (청주 손님은 인천, 대구 손님은 부산을 함께 본다)
const OTHER: Record<Dep, Dep> = { incheon: "busan", busan: "incheon", cheongju: "incheon", daegu: "busan" };
const OTHER_LABEL: Record<Dep, string> = { incheon: "인천출발로 보기", busan: "부산출발로 보기", cheongju: "청주출발로 보기", daegu: "대구출발로 보기" };

const CARD = "flex items-center min-h-[68px] md:min-h-[108px] rounded-2xl bg-white/95 hover:bg-white text-main-text shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-colors";

export default function DepartureChooser({ extra = [] }: { extra?: ("cheongju" | "daegu")[] }) {
  const [asking, setAsking] = useState<Dep | null>(null);

  const item = (d: Dep, className: string) => (
    <a
      key={d}
      href={`/${d}`}
      onClick={(e) => { e.preventDefault(); setAsking(d); }}
      className={`flex items-center gap-3 md:gap-3.5 min-w-0 ${className}`}
    >
      <span className="flex-none w-[44px] h-[58px] md:w-[62px] md:h-[82px]">
        <KoreaMiniMap selected={d} variant="icon" />
      </span>
      <span className="min-w-0 text-[21px] md:text-[26px] font-black tracking-tight whitespace-nowrap">{INFO[d].title}</span>
    </a>
  );

  return (
    <>
      <div className={`grid grid-cols-1 gap-2.5 md:gap-3 ${extra.length ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {(["incheon", "busan"] as Dep[]).map((d) => item(d, `${CARD} px-[18px] md:px-[22px]`))}
        {extra.length === 1 && item(extra[0], `${CARD} px-[18px] md:px-[22px]`)}
        {extra.length === 2 && (
          // 한 칸 안에 청주 | 대구 — 각각 따로 누르는 링크, 가운데 구분선
          <div className={`${CARD} hover:bg-white/95 overflow-hidden`}>
            {item("cheongju", "flex-1 self-stretch px-[18px] md:px-5 hover:bg-white transition-colors")}
            <span aria-hidden="true" className="flex-none w-[2px] rounded-full self-stretch my-4 bg-slate-300" />
            {item("daegu", "flex-1 self-stretch px-[18px] md:px-5 hover:bg-white transition-colors")}
          </div>
        )}
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
            {/* 버튼(router.push) 대신 링크 — 휴대폰 크기 시험에서 router.push 이동이 가끔 멈췄다(10/21, 11회 중 2회). 나라 버튼과 같은 방식 */}
            <Link
              href={`/${asking}`}
              className="w-full min-h-[52px] flex items-center justify-center rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[17px] font-extrabold transition-colors"
            >
              {INFO[asking].yes}
            </Link>
            <Link
              href={`/${OTHER[asking]}`}
              className="w-full min-h-12 mt-2 flex items-center justify-center rounded-xl border border-slate-300 text-slate-700 text-base font-bold hover:bg-slate-50 transition-colors"
            >
              {OTHER_LABEL[OTHER[asking]]}
            </Link>
          </>
        )}
      </Modal>
    </>
  );
}
