import { courses, type Course } from "@/data/courses";

// 나라별 골프장 묶음 — 메인 "나라별 골프장 소개"(G1 타일)와 /courses 탐색(G3)이 같이 쓴다 (UX 개편 2026-10-09)
// courses.json 만 보고 만든다: 새 골프장을 넣으면 곳 수·지역이 자동으로 바뀐다.

export type CourseGroup = {
  key: string;
  label: string;
  codes: string[]; // /courses?country= 에 넣을 나라 코드 (괌·사이판처럼 여럿일 수 있다)
  count: number;
  regions: { label: string; value: string }[]; // 많이 등록된 지역 순 (value 는 /courses?region= 값)
  image: string;
  href: string;
};

// 나라 대표 사진 — 밝은 코스 컷으로 직접 고른 골프장 (없으면 그 나라 첫 골프장 사진)
const REPRESENTATIVE: Record<string, string> = {
  japan: "beppu-golf-club",
  china: "yeonghae-cc",
  thailand: "kansong-cc",
  vietnam: "dragon-golf-links",
  philippines: "lakewood-cc-cabanatuan",
  malaysia: "karambunai-cc",
  "guam-saipan": "coral-ocean-cc",
  other: "paradise-golf-club-manado",
};

const ORDER = ["japan", "china", "thailand", "vietnam", "philippines", "malaysia", "guam-saipan", "other"];
const MERGE: Record<string, { key: string; label: string }> = {
  guam: { key: "guam-saipan", label: "괌·사이판" },
  saipan: { key: "guam-saipan", label: "괌·사이판" },
};

/** "방콕/파타야"처럼 묶어 적은 지역을 낱개로 나눈다 — 같은 지역이 두 번 보이지 않게 */
export function splitRegion(region: string): string[] {
  return region.split("/").map((r) => r.trim()).filter(Boolean);
}

/** /courses?region= 필터: "파타야"를 고르면 "방콕/파타야" 골프장도 함께 보여준다 */
export function matchesRegion(course: Course, region: string): boolean {
  return course.region === region || splitRegion(course.region).includes(region);
}

export function buildCourseGroups(list: Course[] = courses): CourseGroup[] {
  const perCountry = new Map<string, Course[]>();
  for (const c of list) perCountry.set(c.countryCode, [...(perCountry.get(c.countryCode) ?? []), c]);

  const groups = new Map<string, { label: string; codes: string[]; items: Course[] }>();
  for (const [code, items] of perCountry) {
    // 1곳뿐인 나라(괌·사이판 제외)는 '기타'로 모은다
    const merged = MERGE[code] ?? (items.length === 1 || code === "other" ? { key: "other", label: "기타" } : { key: code, label: items[0].country });
    const g = groups.get(merged.key) ?? { label: merged.label, codes: [], items: [] };
    g.codes.push(code);
    g.items.push(...items);
    groups.set(merged.key, g);
  }

  return [...groups.entries()]
    .map(([key, g]) => {
      const regionCount = new Map<string, number>();
      for (const c of g.items) for (const r of splitRegion(c.region)) regionCount.set(r, (regionCount.get(r) ?? 0) + 1);
      // '기타'는 나라 이름이 더 알아보기 쉽다 (예: 인도네시아 마나도)
      const regions = key === "other"
        ? [...new Map(g.items.map((c) => [c.region, { label: `${c.country} ${c.region}`, value: c.region }])).values()]
        : [...regionCount.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => ({ label: r, value: r }));
      const rep = g.items.find((c) => c.slug === REPRESENTATIVE[key]) ?? g.items[0];
      return {
        key,
        label: g.label,
        codes: g.codes,
        count: g.items.length,
        regions,
        image: rep.images[0],
        href: `/courses?country=${g.codes.join(",")}`,
      };
    })
    .sort((a, b) => (ORDER.indexOf(a.key) + 99) % 99 - (ORDER.indexOf(b.key) + 99) % 99 || b.count - a.count);
}
