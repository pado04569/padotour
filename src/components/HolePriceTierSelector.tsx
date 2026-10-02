"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

const FIELD =
  "w-full h-11 border border-gray-300 rounded-lg px-3 text-sm bg-white text-gray-800 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500";

type Tier = { holes: number; pattern?: string; price: number; label?: string; nights?: number; days?: number; dates?: string[] };

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 카드 제목 — 박수별 요금 상품(오이타 등)은 "3박4일", 홀수별 요금 상품(위해 등)은 "54홀"
function tierName(tier: Tier) {
  return tier.label ?? `${tier.holes}홀`;
}

// 홀수(54/72/90홀)를 고르면 그 자리에서 바로 초록/노랑 예약문의 박스가 열린다.
// 하단 파란 "예약 문의" 아코디언까지 스크롤시키지 말아달라는 사장님 요청(2026-09-29)에 따라
// DeparturePriceCalendar의 "선택한 출발일" 박스와 같은 자리형 UX로 만든다.
// 단계에 nights가 있으면(박수별 요금) departurePrices에서 그 박수의 남은 출발일을 골라 문의한다.
export default function HolePriceTierSelector({
  tourTitle,
  departureDate,
  nights,
  days,
  tiers,
  departurePrices,
}: {
  tourTitle: string;
  departureDate: string;
  nights?: string | number;
  days?: string | number;
  tiers: Tier[];
  departurePrices?: { date: string; price: number; nights?: number; days?: number }[];
}) {
  const [selected, setSelected] = useState<Tier | null>(null);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(2);
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const byNights = tiers.some((t) => t.nights != null);
  const todayStr = new Date().toLocaleDateString("sv-SE");
  // 단계에 dates가 있으면 그 날짜만(같은 박수인데 요일별로 요금이 다른 상품), 없으면 같은 박수의 모든 출발일
  const dateOptions =
    selected && byNights && departurePrices
      ? departurePrices
          .filter(
            (dp) =>
              dp.nights === selected.nights &&
              (!selected.dates || selected.dates.includes(dp.date)) &&
              dp.date > todayStr
          )
          .sort((a, b) => a.date.localeCompare(b.date))
      : [];
  const chosenDate = byNights ? date : departureDate;

  const canSubmit = phone.trim() !== "" && agreed && !sending && chosenDate !== "";

  function pick(tier: Tier) {
    const next = selected && tierName(selected) === tierName(tier) ? null : tier;
    setSelected(next);
    setDate("");
    setSent(false);
    if (next) track("inquiry_open", { item_name: `${tourTitle} ${tierName(tier)}` });
  }

  function formatDate(d: string) {
    const [y, m, dd] = d.split("-").map(Number);
    return `${m}/${dd}(${WEEKDAYS[new Date(y, m - 1, dd).getDay()]})`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !selected) return;
    setSending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourTitle: `${tourTitle} (${tierName(selected)} ${selected.price.toLocaleString()}원)`,
          departureDate: chosenDate,
          nights: selected.nights ?? nights,
          days: selected.days ?? days,
          people,
          phone: phone.trim(),
          agreedPrivacy: true,
        }),
      });
      if (res.ok) {
        setSent(true);
        track("generate_lead", { item_name: tourTitle, people });
      } else {
        alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
      }
    } catch {
      alert("전송 중 오류가 발생했습니다. 전화(010-5301-5250)로 문의해 주세요.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className={`grid gap-3 ${tiers.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {tiers.map((tier) => {
          const isSelected = selected != null && tierName(selected) === tierName(tier);
          return (
            <button
              key={tierName(tier)}
              type="button"
              onClick={() => pick(tier)}
              className={`rounded-2xl px-1.5 py-3 md:p-5 text-center border transition-colors ${
                isSelected
                  ? "bg-emerald-600 border-emerald-600"
                  : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
              }`}
            >
              <p className={`text-sm md:text-base font-black mb-1 ${isSelected ? "text-white" : "text-gray-800"}`}>{tierName(tier)}</p>
              {tier.pattern && (
                <p className={`text-[11px] md:text-xs mb-2 ${isSelected ? "text-emerald-100" : "text-gray-400"}`}>({tier.pattern})</p>
              )}
              {/* 휴대폰 3칸에서 "원"이 다음 줄로 떨어지지 않게 한 줄 고정 + 글자 축소 (사장님 요청 2026-09-29) */}
              <p className={`text-[15px] md:text-2xl font-black whitespace-nowrap tracking-tight ${isSelected ? "text-white" : "text-red-600"}`}>
                {tier.price.toLocaleString()}<span className="text-xs md:text-2xl">원</span>
              </p>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {byNights
          ? "※ 일정에 따라 요금이 달라집니다 · 일정을 누르면 예약 문의 창이 바로 열립니다"
          : "※ 선택한 홀 수에 따라 요금이 달라집니다 · 홀 수를 누르면 예약 문의 창이 바로 열립니다"}
      </p>

      {selected && (
        <div className="mt-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">{byNights ? "선택한 일정" : "선택한 홀 수"}</p>
              <p className="text-xl font-black text-gray-800">{tierName(selected)}{selected.pattern ? ` (${selected.pattern})` : ""}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">1인 요금</p>
              <p className="text-3xl font-black text-red-600">{selected.price.toLocaleString()}원</p>
            </div>
          </div>

          {sent ? (
            <div className="bg-white border border-emerald-200 rounded-xl px-4 py-4 text-center">
              <p className="font-black text-emerald-700 text-sm">문의가 접수되었습니다 ✅</p>
              <p className="text-xs text-gray-600 mt-1">담당자가 카카오톡으로 견적서를 보내드립니다.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5 pt-3 border-t border-emerald-200">
              {byNights && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">출발일</label>
                  {dateOptions.length > 0 ? (
                    <div className="relative">
                      <select
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`${FIELD} appearance-none pr-7`}
                        required
                      >
                        <option value="">출발일을 선택해 주세요</option>
                        {dateOptions.map((dp) => (
                          <option key={dp.date} value={dp.date}>
                            {formatDate(dp.date)} 출발{dp.price !== selected.price ? ` · ${dp.price.toLocaleString()}원` : ""}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">남은 출발일이 없습니다. 전화(010-5301-5250)로 문의해 주세요.</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-5 gap-2.5">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">인원수</label>
                  <div className="relative">
                    <select
                      value={people}
                      onChange={(e) => setPeople(Number(e.target.value))}
                      className={`${FIELD} appearance-none pr-7`}
                    >
                      {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n}명</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-gray-500 mb-1 block">휴대폰 번호</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className={FIELD}
                    required
                  />
                </div>
              </div>

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
                      className="underline text-emerald-700"
                    >
                      {showPrivacy ? "내용 접기" : "내용 보기"}
                    </button>
                  </span>
                </label>
                {showPrivacy && (
                  <div className="mt-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-[10px] text-gray-500 leading-relaxed space-y-0.5">
                    <p>· 수집 항목: 휴대폰 번호, 인원수, {byNights ? "선택 일정·출발일" : "선택 홀 수"}</p>
                    <p>· 수집 목적: 예약 문의 상담 및 맞춤 견적 안내</p>
                    <p>· 보유 기간: 문의 처리 완료 후 1년 (예약문의 내역 조회 서비스 제공을 위해 보관)</p>
                    <p>· 동의를 거부하실 수 있으며, 이 경우 문의 접수가 제한됩니다.</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-black py-3 rounded-lg text-sm transition-colors"
              >
                {sending ? "접수 중..." : `📋 ${tierName(selected)} 예약 문의`}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
