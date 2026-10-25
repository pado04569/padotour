"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import SelectChevron from "@/components/SelectChevron";
import { PEOPLE_OPTIONS, PEOPLE_MAX_LABEL, isValidPhone, phoneHint } from "@/lib/inquiryForm";
import { onTourDate, type TourDateSel } from "@/lib/tourBooking";
import { IconCalendarDays, IconClipboard, IconCircleCheck, IconPhone, IconUsers } from "@/components/icons/MenuIcons";

// 상세페이지 문의 패널 (사장님 작업지시 2026-10-25)
//  - PC: 오른쪽에 스크롤을 따라오는 패널 하나로 문의를 통합 (달력 안 입력창·하단 긴 문의 박스 대체)
//  - 휴대폰: 아래 고정 바 — 날짜 선택 전 "출발일·요금 확인", 선택 후 "예약문의"
//  - 인원 곱한 합계는 표시하지 않는다(1인 요금만). 접수는 기존 /api/inquiry 그대로 재사용.

type Props = {
  tourId: string;
  tourTitle: string;
  nights: string | number;
  days: string | number;
  minPeople?: number;
  /** 오늘 이후 가장 가까운 출발일 (패널 기본값) — 없으면 날짜 미선택 상태로 시작 */
  defaultSel: TourDateSel;
  /** 날짜별 요금 데이터가 없는 상품(요금 문의) 여부 */
  priceText: string; // "1,199,000원" 같은 시작 요금 글자 (날짜 미선택 때 "...부터"로 표시)
  hasCalendar: boolean;
};

const fmtWon = (p: number) => p.toLocaleString("ko-KR") + "원";
const fmtDate = (ds: string) => {
  const [y, m, d] = ds.split("-").map(Number);
  return `${m}월 ${d}일`;
};

export default function InquiryDock({ tourId, tourTitle, nights, days, minPeople, defaultSel, priceText, hasCalendar }: Props) {
  const [sel, setSel] = useState<TourDateSel>(defaultSel);
  const [people, setPeople] = useState(String(minPeople ?? 2));
  const [modal, setModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => onTourDate((s) => { setSel(s); setSent(false); }), []);

  // 휴대폰 고정 바가 카카오 채팅 버튼을 가리지 않게 — 바 높이만큼 올린다 (지시서 6)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      document.querySelectorAll<HTMLElement>("[data-kakao-float]").forEach((el) => {
        if (mq.matches) el.style.setProperty("bottom", "88px", "important");
        else el.style.removeProperty("bottom");
      });
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.querySelectorAll<HTMLElement>("[data-kakao-float]").forEach((el) => el.style.removeProperty("bottom"));
    };
  }, []);

  const selNights = sel?.nights ?? nights;
  const selDays = sel?.days ?? days;
  const daysNum = Number(selDays);
  const returnDate = sel && Number.isFinite(daysNum) && daysNum > 0 ? (() => {
    const d = new Date(sel.date);
    d.setDate(d.getDate() + daysNum - 1);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  })() : null;

  const openedOnce = useRef(false);
  const startedOnce = useRef(false);
  const submittingRef = useRef(false);
  const openModal = () => {
    setModal(true);
    if (!openedOnce.current) {
      openedOnce.current = true;
      track("inquiry_open", { item_name: tourTitle, method: "panel" });
    }
  };
  const markStart = (field: "people" | "phone") => {
    if (startedOnce.current) return;
    startedOnce.current = true;
    track("inquiry_start", { item_name: tourTitle, first_field: field, method: "panel" });
  };
  const scrollToCalendar = () => document.getElementById("departure")?.scrollIntoView({ behavior: "smooth", block: "start" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone) || !agreed || submittingRef.current) return;
    submittingRef.current = true;
    setSending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId,
          tourTitle,
          departureDate: sel?.date ?? "미정",
          nights: selNights,
          days: selDays,
          people,
          phone: phone.trim(),
          agreedPrivacy: true,
        }),
      });
      if (res.ok) {
        setSent(true);
        track("generate_lead", { item_name: tourTitle, people: Number(people), method: "panel" });
      } else {
        track("inquiry_fail", { item_name: tourTitle, reason: `status_${res.status}`, method: "panel" });
        alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
      }
    } catch {
      track("inquiry_fail", { item_name: tourTitle, reason: "network", method: "panel" });
      alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
    } finally {
      submittingRef.current = false;
      setSending(false);
    }
  }

  const hasPrice = /원/.test(priceText); // "문의"뿐인 상품(요금 데이터 없음)은 요금 문의로
  const priceBlock = sel ? (
    <>
      <p className="leading-none text-slate-900"><b className="text-[28px] font-black text-red-600">{fmtWon(sel.price)}</b> <span className="text-[14px] font-semibold">(1인요금)</span></p>
      <p className="text-[12px] text-slate-600 mt-1.5">성인 · 2인 1실 기준 · 유류할증료 포함</p>
    </>
  ) : (
    <>
      {hasPrice ? (
        <p className="leading-none text-slate-900"><b className="text-[24px] font-black text-red-600">{priceText}</b><span className="text-[15px] font-bold">부터</span> <span className="text-[14px] font-semibold">(1인요금)</span></p>
      ) : (
        <p className="text-[22px] leading-none font-black text-red-600">요금 문의</p>
      )}
      <p className="text-[12px] text-slate-600 mt-1.5">성인 · 2인 1실 기준{hasCalendar ? " · 출발일을 선택하면 정확한 요금이 보여요" : " · 정확한 요금은 문의해 주세요"}</p>
    </>
  );

  const peopleSelect = (
    <div className="relative">
      <select
        value={people}
        onChange={(e) => { markStart("people"); setPeople(e.target.value); }}
        aria-label="문의 인원"
        className="w-full appearance-none border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-[15px] font-bold bg-white focus:outline-none focus:border-brand-blue"
      >
        {PEOPLE_OPTIONS.map((n) => (
          <option key={n} value={n} disabled={minPeople != null && n < minPeople}>
            성인 {PEOPLE_MAX_LABEL(n)}{minPeople != null && n < minPeople ? " · 예약불가" : ""}
          </option>
        ))}
      </select>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><IconUsers className="w-[18px] h-[18px]" /></span>
      <SelectChevron />
    </div>
  );

  return (
    <div className="lg:h-full">
      {/* PC 오른쪽 패널 — 머리말(sticky top-0)과 겹치지 않게 아래로 띄운다 */}
      <aside className="hidden lg:block sticky top-32 rounded-2xl border border-slate-200 bg-white shadow-sm p-5" aria-label="예약 문의 패널">
        <h2 className="text-[17px] font-black text-slate-900 mb-3">선택한 여행 일정</h2>
        <div className="rounded-xl bg-soft-blue px-3.5 py-3 text-[14px] font-bold text-slate-800 space-y-1">
          {sel ? (
            <>
              <p className="flex items-center gap-2"><IconCalendarDays className="w-[18px] h-[18px] text-brand-blue" />{fmtDate(sel.date)} 출발 · {selNights}박 {selDays}일</p>
              {returnDate && <p className="pl-[26px] text-slate-600 font-semibold">{returnDate} 귀국</p>}
            </>
          ) : (
            <p className="flex items-center gap-2 text-slate-600"><IconCalendarDays className="w-[18px] h-[18px] text-brand-blue" />{hasCalendar ? "왼쪽 달력에서 출발일을 선택해 주세요" : "출발일은 문의 시 함께 안내드려요"}</p>
          )}
        </div>

        <p className="text-[13px] font-bold text-slate-600 mt-4 mb-1.5">문의 인원</p>
        {peopleSelect}

        <div className="mt-4">{priceBlock}</div>
        <button type="button" onClick={() => document.getElementById("extra-costs")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-brand-blue underline underline-offset-2 hover:text-blue-800">
          현지 별도 비용 보기
        </button>

        <button type="button" onClick={openModal} className="mt-4 w-full min-h-12 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-[16px] font-black transition-colors">
          이 일정으로 예약문의
        </button>
        <p className="text-[12px] text-slate-600 text-center mt-2 break-keep">문의 접수 후 가능 여부와 최종 요금을 안내드립니다.</p>
        <a href="tel:010-5301-5250" className="mt-2 w-full min-h-11 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-[14px] font-bold flex items-center justify-center gap-1.5">
          <IconPhone className="w-4 h-4 text-brand-blue" />전화문의 010-5301-5250
        </a>
      </aside>

      {/* 휴대폰 아래 고정 바 */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 px-4 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 leading-none mb-1">1인 요금{sel ? ` · ${fmtDate(sel.date)} 출발` : ""}</p>
            <p className="text-[18px] leading-none font-black text-red-600 whitespace-nowrap">{sel ? fmtWon(sel.price) : hasPrice ? `${priceText}부터` : "요금 문의"}</p>
          </div>
          {sel || !hasCalendar ? (
            <button type="button" onClick={openModal} className="flex-1 min-h-12 rounded-xl bg-brand-blue text-white text-[16px] font-black">예약문의</button>
          ) : (
            <button type="button" onClick={scrollToCalendar} className="flex-1 min-h-12 rounded-xl bg-emerald-600 text-white text-[16px] font-black">출발일·요금 확인</button>
          )}
        </div>
      </div>

      {/* 문의 입력 창 — 닫아도 선택 조건은 그대로 남는다 */}
      {modal && (
        <div role="dialog" aria-modal="true" aria-label="예약 문의" className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setModal(false)}>
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-[18px] font-black text-slate-900">예약 문의</h3>
              <button type="button" onClick={() => setModal(false)} aria-label="닫기" className="w-9 h-9 -mr-1.5 -mt-1.5 rounded-full hover:bg-slate-100 text-slate-500 text-lg font-bold">✕</button>
            </div>
            {sent ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                <div className="flex justify-center mb-2 text-emerald-600"><IconCircleCheck className="w-8 h-8" /></div>
                <p className="font-black text-blue-800 text-base">문의 접수 완료!</p>
                <p className="text-sm text-gray-600 mt-1">담당자가 카카오톡으로 견적서를 보내드립니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3 text-[13px] text-slate-700 space-y-1 break-keep">
                  <p className="font-bold text-slate-900 line-clamp-2">{tourTitle}</p>
                  <p>{sel ? `${fmtDate(sel.date)} 출발 · ${selNights}박 ${selDays}일${returnDate ? ` · ${returnDate} 귀국` : ""}` : "출발일 미정 (상담 때 함께 정해요)"}</p>
                  {sel && <p className="font-bold text-slate-700">선택일 1인 요금 <b className="text-red-600">{fmtWon(sel.price)}</b></p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">인원수</label>
                  {peopleSelect}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">휴대폰 번호</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { markStart("phone"); setPhone(e.target.value); }}
                    placeholder="010-0000-0000"
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  {phoneHint(phone) && <p className="text-[11px] text-red-600 mt-1">{phoneHint(phone)}</p>}
                </div>
                <div>
                  <label className="flex items-start gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" required />
                    <span>
                      개인정보 수집·이용에 동의합니다.{" "}
                      <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacy(!showPrivacy); }} className="underline text-emerald-700">
                        {showPrivacy ? "내용 접기" : "내용 보기"}
                      </button>
                    </span>
                  </label>
                  {showPrivacy && (
                    <div className="mt-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-[10px] text-gray-500 leading-relaxed space-y-0.5">
                      <p>· 수집 항목: 휴대폰 번호, 출발 희망일, 인원수</p>
                      <p>· 수집 목적: 예약 문의 상담 및 맞춤 견적 안내</p>
                      <p>· 보유 기간: 문의 처리 완료 후 1년 (예약문의 내역 조회 서비스 제공을 위해 보관)</p>
                      <p>· 동의를 거부하실 수 있으며, 이 경우 문의 접수가 제한됩니다.</p>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={sending || !isValidPhone(phone) || !agreed}
                  className="w-full min-h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-black rounded-xl text-[15px] transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5"><IconClipboard className="w-5 h-5" />{sending ? "전송 중..." : "문의 접수하기"}</span>
                </button>
                <p className="text-[12px] text-slate-600 text-center">문의 접수 후 가능 여부와 최종 요금을 안내드립니다.</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 휴대폰 고정 바가 본문 끝(뒤로가기)을 가리지 않게 여백 */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
