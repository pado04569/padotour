"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { track } from "@/lib/analytics";
import SelectChevron from "@/components/SelectChevron";
import { PEOPLE_OPTIONS, PEOPLE_MAX_LABEL, isValidPhone, phoneHint, todayKST } from "@/lib/inquiryForm";
import { IconChevron } from "@/components/icons/Chevron";

/**
 * 입력칸 공통 서식.
 * select 와 input 은 기기(특히 iOS)마다 기본 높이가 달라 나란히 두면 어긋난다.
 * h-11 로 높이를 못박고 세로 padding 을 쓰지 않는다.
 */
const FIELD =
  "w-full h-11 border border-gray-300 rounded-lg px-3 text-sm bg-white text-gray-800 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function ContactOptions({
  tourTitle,
  nights,
  days,
  minPeople,
  dates,
}: {
  tourTitle?: string;
  nights?: string | number;
  days?: string | number;
  /** 4인 이상 출발 상품이면 4 — 그보다 적은 인원은 "예약불가"로 막는다 */
  minPeople?: number;
  /** 정해진 출발일이 있는 상품의 출발일 목록(YYYY-MM-DD). 있으면 그중에서 고르게 한다 — 없는 날짜 문의 방지 (2026-10-09) */
  dates?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // 예약 문의 폼
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(minPeople ?? 2);
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const today = todayKST();
  const upcoming = (dates ?? []).filter((d) => d >= today).sort();
  // "다른 날짜 문의" 를 고르면 달력 입력을 연다 — 출발일 밖 날짜도 상담은 받는다
  const [otherDate, setOtherDate] = useState(upcoming.length === 0);
  const canSubmit = date !== "" && isValidPhone(phone) && agreed && !sending;

  // 문의 영역 펼침 / 입력 시작은 각각 1회만 기록한다 (중복 전송 방지)
  const openedOnce = useRef(false);
  const startedOnce = useRef(false);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !openedOnce.current) {
      openedOnce.current = true;
      track("inquiry_open", { item_name: tourTitle });
    }
  }


  /** 폼에 처음 손을 댄 순간 1회 — 어디까지 왔다가 그만두는지 보기 위함 */
  function markStart(field: "date" | "people" | "phone") {
    if (startedOnce.current) return;
    startedOnce.current = true;
    track("inquiry_start", { item_name: tourTitle, first_field: field });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourTitle: tourTitle ?? "골프여행 상품",
          departureDate: date,
          nights,
          days,
          people,
          phone: phone.trim(),
          agreedPrivacy: true,
        }),
      });
      if (res.ok) {
        setSent(true);
        // 전환 — 개인정보(연락처)는 보내지 않는다. 인원수는 규모 파악용.
        track("generate_lead", { item_name: tourTitle, people });
      } else {
        track("inquiry_fail", { item_name: tourTitle, reason: `status_${res.status}` });
        alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
      }
    } catch {
      track("inquiry_fail", { item_name: tourTitle, reason: "network" });
      alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 font-black px-8 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
      >
        📞 예약 문의 · 맞춤 견적
        <IconChevron dir={open ? "up" : "down"} className="w-5 h-5" />
      </button>

      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

          {/* 전화 문의 */}
          <a
            href="tel:01053015250"
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">📞</div>
            <div>
              <div className="font-black text-gray-800 text-sm">전화 문의</div>
              <div className="text-blue-600 font-bold text-base">010-5301-5250</div>
            </div>
          </a>

          {/* 예약 문의 접수 (출발희망일·인원·연락처) */}
          <div className="px-5 py-4 border-b border-gray-100 bg-blue-50/40">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">📋</div>
              <div>
                <div className="font-black text-gray-800 text-sm">예약 문의 접수</div>
                <div className="text-blue-600 font-bold text-sm">남겨주시면 견적을 보내드려요</div>
              </div>
            </div>

            {sent ? (
              <div className="bg-white border border-blue-200 rounded-xl px-4 py-4 text-center">
                <p className="font-black text-blue-700 text-sm">문의가 접수되었습니다 ✅</p>
                <p className="text-xs text-gray-600 mt-1">담당자가 카카오톡으로 견적서를 보내드립니다.</p>
                {/* 문의 후 연락 흐름 안내 — /my-inquiries 와 동일한 문구 (사장님 요청 2026-09-28) */}
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 leading-relaxed space-y-1">
                  <p>📞 담당자가 현지 확인을 마치는 대로, 문의하실 때 남겨주신 휴대폰 번호로 카카오톡을 통해 직접 연락드려요.</p>
                  <p>🕐 업무시간(평일 09:00~18:00) 이후에 접수해 주신 문의는 견적서가 다음 영업일에 전달될 수 있는 점 양해 부탁드립니다.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">출발 희망일</label>
                  {upcoming.length > 0 && (
                    <div className="relative mb-2">
                      <select
                        value={otherDate ? "other" : date}
                        onChange={(e) => {
                          markStart("date");
                          if (e.target.value === "other") { setOtherDate(true); setDate(""); }
                          else { setOtherDate(false); setDate(e.target.value); }
                        }}
                        className={`${FIELD} appearance-none pr-9`}
                        required
                      >
                        <option value="" disabled>출발일을 골라 주세요</option>
                        {upcoming.map((d) => (
                          <option key={d} value={d}>
                            {Number(d.slice(5, 7))}월 {Number(d.slice(8, 10))}일 ({"일월화수목금토"[new Date(d + "T00:00:00").getDay()]})
                          </option>
                        ))}
                        <option value="other">다른 날짜 문의</option>
                      </select>
                      <SelectChevron />
                    </div>
                  )}
                  {otherDate && (
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => { markStart("date"); setDate(e.target.value); }}
                      className={FIELD}
                      required
                    />
                  )}
                </div>
                {/* 인원수는 좁게(2), 휴대폰 번호는 넓게(3) — 번호가 잘리지 않게 */}
                <div className="grid grid-cols-5 gap-2.5">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">인원수</label>
                    <div className="relative">
                      <select
                        value={people}
                        onChange={(e) => { markStart("people"); setPeople(Number(e.target.value)); }}
                        className={`${FIELD} appearance-none pr-9`}
                      >
                        {PEOPLE_OPTIONS.map((n) => (
                          <option key={n} value={n} disabled={minPeople != null && n < minPeople}>
                            {PEOPLE_MAX_LABEL(n)}{minPeople != null && n < minPeople ? " · 예약불가" : ""}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-gray-500 mb-1 block">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { markStart("phone"); setPhone(e.target.value); }}
                      placeholder="010-0000-0000"
                      className={FIELD}
                      required
                    />
                    {phoneHint(phone) && <p className="text-[11px] text-red-600 mt-1">{phoneHint(phone)}</p>}
                  </div>
                </div>
                {/* 개인정보 수집·이용 동의 — 전화번호를 받는 순간부터 필요하다 (사장님 요청 2026-09-28) */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 flex-shrink-0"
                      required
                    />
                    <span>
                      개인정보 수집·이용에 동의합니다.{" "}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setShowPrivacy(!showPrivacy); }}
                        className="underline text-blue-500"
                      >
                        {showPrivacy ? "내용 접기" : "내용 보기"}
                      </button>
                    </span>
                  </label>
                  {showPrivacy && (
                    <div className="mt-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[10px] text-gray-500 leading-relaxed space-y-0.5">
                      <p>· 수집 항목: 휴대폰 번호, 출발 희망일, 인원수</p>
                      <p>· 수집 목적: 예약 문의 상담 및 맞춤 견적 안내</p>
                      <p>· 보유 기간: 문의 처리 완료 후 1년 (예약문의 내역 조회 서비스 제공을 위해 보관)</p>
                      <p>· 동의를 거부하실 수 있으며, 이 경우 문의 접수가 제한됩니다.</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3 rounded-lg text-sm transition-colors"
                >
                  {sending ? "접수 중..." : "문의 접수하기"}
                </button>
                <p className="text-[11px] text-gray-400 text-center">담당자가 카카오톡으로 견적서를 발송해 드립니다</p>
              </form>
            )}
          </div>

          {/* QR코드로 추가 */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors border-b border-gray-100 text-left"
          >
            <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center text-xl flex-shrink-0">📷</div>
            <div className="flex-1">
              <div className="font-black text-gray-800 text-sm">QR코드로 친구 추가</div>
              <div className="text-yellow-700 font-bold text-sm"><span className="inline-flex items-center gap-1">카메라로 스캔 <IconChevron dir={showQr ? "up" : "down"} className="w-4 h-4" /></span></div>
            </div>
          </button>

          {showQr && (
            <div className="px-5 py-4 bg-yellow-50 flex flex-col items-center gap-2">
              <Image
                src="/images/kakao-qr.png"
                alt="카카오톡 QR코드 - 여행의 파도"
                width={200}
                height={200}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">카카오톡 앱 → 친구 → QR코드 스캔</p>
            </div>
          )}

          {/* 카카오 채널 */}
          <a
            href="https://pf.kakao.com/_bxoxnXxj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-yellow-50 transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl flex-shrink-0">🟡</div>
            <div>
              <div className="font-black text-gray-800 text-sm">카카오 채널</div>
              <div className="inline-flex items-center gap-1 text-yellow-700 font-bold text-sm">여행의 파도 채널<IconChevron className="w-4 h-4" /></div>
            </div>
          </a>

        </div>
      )}
    </div>
  );
}
