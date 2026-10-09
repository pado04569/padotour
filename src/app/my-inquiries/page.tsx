"use client";

import { useState } from "react";
import { stayText } from "@/lib/stay";

type InquiryItem = {
  tourTitle: string;
  departureDate: string;
  nights?: number;
  days?: number;
  people: number | string;
  phone: string;
  submittedAt: string;
};

export default function MyInquiriesPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [items, setItems] = useState<InquiryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 문자 인증번호를 확인한 뒤에만 내역을 보여준다 (2026-10-09 — 전화번호만으로 남의 문의가 보이던 문제)
  async function call(payload: { phone: string; code?: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inquiry/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "처리에 실패했습니다"); return null; }
      return data;
    } catch {
      setError("처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setItems(null);
    const data = await call({ phone: phone.trim() });
    if (data) { setCodeSent(true); setNotice(data.message); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const data = await call({ phone: phone.trim(), code: code.trim() });
    if (data) { setItems(data.items); setNotice(null); }
  }

  return (
    <div>
      <section className="bg-emerald-400 text-white py-10 md:py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">예약문의 내역 조회</h1>
          <p className="text-emerald-100 text-sm md:text-lg">문의하신 전화번호를 입력하시면 접수 내역을 확인하실 수 있어요</p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-10 md:py-12">
        <form onSubmit={requestCode} className="flex gap-2 mb-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setCodeSent(false); setItems(null); }}
            placeholder="010-0000-0000"
            aria-label="문의하신 휴대폰 번호"
            className="flex-1 border-2 border-gray-200 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {codeSent ? "다시 받기" : "인증번호 받기"}
          </button>
        </form>

        {codeSent && (
          <form onSubmit={verify} className="flex gap-2 mb-3">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="문자로 받은 인증번호 6자리"
              aria-label="인증번호"
              className="flex-1 border-2 border-gray-200 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              {loading ? "확인 중…" : "조회하기"}
            </button>
          </form>
        )}
        {notice && <p className="text-emerald-700 text-xs md:text-sm mb-6">{notice}</p>}
        {!codeSent && <p className="text-gray-400 text-xs mb-6">개인정보 보호를 위해, 문의하신 휴대폰으로 받은 인증번호를 확인한 뒤 내역을 보여드려요.</p>}

        {/* 문의 후 연락 흐름 안내 — 사장님 요청 2026-09-23, 더 친절한 문구로 */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 mb-8 text-xs md:text-sm text-gray-600 leading-relaxed space-y-1">
          <p>📞 담당자가 현지 확인을 마치는 대로, 문의하실 때 남겨주신 휴대폰 번호로 카카오톡을 통해 직접 연락드려요.</p>
          <p>🕐 업무시간(평일 09:00~18:00) 이후에 접수해 주신 문의는 견적서가 다음 영업일에 전달될 수 있는 점 양해 부탁드립니다.</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-6">{error}</p>
        )}

        {items && items.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-12">
            이 번호로 접수된 예약문의 내역이 없습니다.
          </p>
        )}

        {items && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 text-sm md:text-base mb-2">{item.tourTitle}</h3>
                <div className="text-xs md:text-sm text-gray-600 space-y-1">
                  <p>
                    출발일: {item.departureDate}
                    {item.nights && item.days ? ` (${stayText(item.nights, item.days, " ")})` : ""}
                  </p>
                  <p>인원: {item.people}명</p>
                  <p className="text-gray-400">
                    접수일시: {new Date(item.submittedAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
