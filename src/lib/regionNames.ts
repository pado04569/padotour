// 지역 이름 표기·합치기 — 상품 데이터를 싣지 않는 작은 모듈.
// 머리말 메뉴(navRegions)와 첫 화면 검색(HomeSearch, 브라우저)이 같이 쓴다 (2026-10-25)

// 메뉴에 보일 이름 (데이터 지역 이름 → 메뉴 이름). 없으면 지역 이름 그대로
export const REGION_LABELS: Record<string, string> = {
  샤먼: "샤먼(하문)",
  청도: "청도(칭다오)",
  하이난: "하이난(해남도)",
  마나도: "마나도(인도네시아)",
};

// 메뉴에서 한 칸으로 합칠 지역 (데이터 지역 이름 → 메뉴 칸). 칸 주소의 "방콕/파타야" 는 /tours 에서 둘 중 하나만 맞아도 보여 준다
export const REGION_MERGE: Record<string, string> = {
  방콕: "방콕/파타야",
  파타야: "방콕/파타야",
}; // 사장님 지시 2026-10-13

/** 상품의 region("방콕/파타야"·"후쿠오카")을 검색 칸 이름들로 — 한 상품은 한 칸에 한 번만 */
export function regionKeys(region: string | undefined): string[] {
  const out = new Set<string>();
  for (const part of (region ?? "").split("/").map((x) => x.trim()).filter(Boolean)) out.add(REGION_MERGE[part] ?? part);
  return [...out];
}

export const regionLabel = (key: string) => REGION_LABELS[key] ?? key;
