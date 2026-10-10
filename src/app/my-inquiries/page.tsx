"use client";

import { useState } from "react";
import { stayText } from "@/lib/stay";
import { IconPhone, IconClock } from "@/components/icons/MenuIcons";

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
      <section className="bg-hero-info text-white py-10 md:py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">내 예약/문의 확인</h1>
          <p className="text-emerald-50 text-[15px] md:text-lg break-keep">회원가입 없이, 문의하신 휴대폰 번호로 <span className="whitespace-nowrap">확인할 수 있습니다</span></p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-10 md:py-12">
        {/* 휴대폰은 입력칸·버튼을 위아래로(버튼이 화면 밖으로 잘렸다), PC는 가로 그대로 (사장님 지시 10/10) */}
        <form onSubmit={requestCode} className="flex flex-col md:flex-row gap-2.5 md:gap-2 mb-3 w-full">
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setCodeSent(false); setItems(null); }}
            placeholder="010-0000-0000"
            aria-label="문의하신 휴대폰 번호"
            className="w-full min-w-0 md:flex-1 box-border border-2 border-gray-200 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {codeSent ? "다시 받기" : "인증번호 받기"}
          </button>
        </form>

        {codeSent && (
          <form onSubmit={verify} className="flex flex-col md:flex-row gap-2.5 md:gap-2 mb-3 w-full">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="문자로 받은 인증번호 6자리"
              aria-label="인증번호"
              className="w-full min-w-0 md:flex-1 box-border border-2 border-gray-200 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              {loading ? "확인 중…" : "조회하기"}
            </button>
          </form>
        )}
        {notice && <p className="text-emerald-700 text-xs md:text-sm mb-6">{notice}</p>}
        {/* 문구 수정(사장님 지시 10/10). 짧은 의미 덩어리는 묶어서 따로 떨어지지 않게 — 화면 맞춤 <br>은 쓰지 않는다 */}
        {!codeSent && <p className="text-gray-400 text-xs mb-6 break-keep">개인정보 보호를 위해 휴대폰 본인 인증 후 예약·문의 내역을 <span className="whitespace-nowrap">확인하실 수 있습니다.</span></p>}

        {/* 문의 후 연락 흐름 안내 — 사장님 요청 2026-09-23, 더 친절한 문구로 */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 mb-8 text-xs md:text-sm text-gray-600 leading-relaxed space-y-1">
          {/* 이모지 대신 선 아이콘 (사장님 지시 10/10) */}
          <p className="flex gap-2"><IconPhone className="w-[18px] h-[18px] mt-0.5 text-brand-blue" /><span className="break-keep">담당자가 현지 확인을 마치는 대로 카카오톡으로 <span className="whitespace-nowrap">직접 연락드립니다.</span></span></p>
          <p className="flex gap-2"><IconClock className="w-[18px] h-[18px] mt-0.5 text-brand-blue" /><span className="break-keep">업무시간(평일 09:00~18:00) 이후 접수된 문의는 견적서가 다음 영업일에 전달될 수 있는 점 <span className="whitespace-nowrap">양해 부탁드립니다.</span></span></p>
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
