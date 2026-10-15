import { getRedis } from "@/lib/redis";

// 상품ID → 거래처 정보. 내용은 Redis 에만 있다 (api/admin/partner-map 참고).
export const PARTNER_MAP_KEY = "partner-map";

export type PartnerInfo = {
  agency?: string; // 랜드사
  person?: string; // 담당자
  rank?: string; // 직위
  phone?: string; // 담당자 휴대폰
  com?: string; // 컴
};

export async function getPartnerInfo(tourId: string): Promise<PartnerInfo | null> {
  const redis = getRedis();
  if (!redis || !tourId) return null;
  try {
    const raw = await redis.get(PARTNER_MAP_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, PartnerInfo>;
    return map[tourId] ?? null;
  } catch (e) {
    console.error("partner-map read error:", e);
    return null;
  }
}

// 사장님 휴대폰으로 가는 거래처 문자 본문 — 담당자 번호는 네이트온에 있어 없으면 그냥 뺀다 (2026-10-15)
export function partnerText(v: { tourTitle: string; date: string; people: string; info: PartnerInfo | null }) {
  const i = v.info;
  const lines = [`[문의-거래처] ${v.tourTitle}`, `${v.date} · ${v.people}`];
  if (!i || !i.agency) {
    lines.push("거래처 미등록 — 업로드상품목록 엑셀 확인");
  } else {
    lines.push(`랜드사: ${i.agency}`);
    const who = [i.person, i.rank].filter(Boolean).join(" ");
    lines.push(`담당: ${who || "미등록"}${i.phone ? ` ${i.phone}` : ""}`);
    lines.push(`컴: ${i.com || "미등록"}`);
  }
  return lines.join("\n");
}
