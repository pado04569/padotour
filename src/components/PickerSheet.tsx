"use client";

import { useEffect, useId, useRef } from "react";

// 고르는 창 — 휴대폰은 아래에서 올라오는 시트, PC는 가운데 창 (상품 목록 '조건 정하기'와 같은 모양, 2026-10-25)
// 화면 밖으로 잘리지 않게 세로는 92vh 안에서 스크롤. X·바깥 클릭·ESC로 닫히고, 닫히면 원래 버튼으로 초점이 돌아간다.
export default function PickerSheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // 닫기 함수는 화면을 다시 그릴 때마다 새로 만들어진다 → ref 로만 읽고, 효과는 처음 한 번만 (조건 정하기 창과 같은 이유)
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-drawer-open", "");
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.removeAttribute("data-drawer-open");
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/45" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full md:max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-t-[20px] md:rounded-2xl shadow-2xl px-4 pt-2.5 pb-5 md:p-6 break-keep"
      >
        <div className="md:hidden w-11 h-[5px] rounded-full bg-slate-300 mx-auto mb-2" aria-hidden="true" />
        <div className="flex items-center justify-between mb-3">
          <h2 id={titleId} className="text-[19px] font-black text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        {children}
        {/* 아래 버튼 — 목록이 길어도 스크롤 중 항상 보이게 붙여 둔다. 흐름상 맨 아래라 목록을 가리지 않는다 (사장님 지시 10/25) */}
        {footer && <div className="sticky bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 pt-3 pb-1 mt-4 bg-white border-t border-line">{footer}</div>}
      </div>
    </div>
  );
}
