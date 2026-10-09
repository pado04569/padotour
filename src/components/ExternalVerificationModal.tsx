"use client";

import { useState } from "react";
import Modal from "./Modal";

// 관광사업 등록·보증보험 조회 페이지 (사장님 요청 2026-09-23에 연결한 주소 그대로)
export const TOURINFO_URL =
  "https://www.tourinfo.or.kr/v2/tourinfo/license_view.asp?page_no=1&pLino=184259&pLiTypeTxt=%B1%B9%B3%BB%BF%DC%BF%A9%C7%E0%BE%F7&pLiName=%BF%A9%C7%E0%C0%C7%C6%C4%B5%B5&pdtlStateNm=%BF%B5%BE%F7%C1%DF&sDateStart=&sDateEnd=&pLiLocal=&pLiSigun=&pLiType=%C0%FC%C3%BC";

// 누르면 바로 외부로 나가지 않고, 무엇을 확인하는 곳인지 먼저 알려준다 (UX 개편 2026-10-09)
// 주의: "정부가 상품을 보증" "전액 보상" 같은 실제 범위를 넘는 표현은 쓰지 않는다.
export default function ExternalVerificationButton({
  className,
  children,
  onOpen,
}: {
  className?: string;
  children: React.ReactNode;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => { setOpen(true); onOpen?.(); }}>
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="여행사 등록·보증 정보 확인">
        <div className="space-y-4 text-base leading-[1.6] text-gray-800">
          <p>
            여행의 파도가 정식 등록된 여행사인지, 관광사업 등록 정보와 보증보험 가입 정보를
            외부 관광사업정보 사이트에서 직접 확인하실 수 있습니다.
          </p>
          <dl className="bg-gray-50 rounded-xl px-4 py-3 text-[15px] grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-gray-600 whitespace-nowrap">관광사업 등록</dt>
            <dd className="text-gray-900 font-semibold whitespace-nowrap">제2022-000029호</dd>
            <dt className="text-gray-600 whitespace-nowrap">업종</dt>
            <dd className="text-gray-900 font-semibold whitespace-nowrap">국내외여행업</dd>
            <dt className="text-gray-600 whitespace-nowrap">보증보험</dt>
            <dd className="text-gray-900 font-semibold whitespace-nowrap">SGI 서울보증보험 가입</dd>
          </dl>
          <p className="text-[15px] text-gray-600">버튼을 누르면 새 창에서 외부 사이트(tourinfo.or.kr)가 열립니다.</p>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <a
            href={TOURINFO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex-1 min-h-12 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-4 transition-colors"
          >
            외부 사이트에서 확인하기
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="sm:w-28 min-h-12 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-[15px] transition-colors"
          >
            닫기
          </button>
        </div>
      </Modal>
    </>
  );
}
