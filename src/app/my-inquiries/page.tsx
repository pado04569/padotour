"use client";

import { useState } from "react";

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
  const [items, setItems] = useState<InquiryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    setItems(null);
    try {
      const res = await fetch(`/api/inquiry/lookup?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "조회에 실패했습니다");
        return;
      }
      setItems(data.items);
    } catch {
      setError("조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="flex-1 border-2 border-gray-200 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {loading ? "조회 중…" : "조회하기"}
          </button>
        </form>

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
                    {item.nights && item.days ? ` (${item.nights}박 ${item.days}일)` : ""}
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
