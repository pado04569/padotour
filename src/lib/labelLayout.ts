// 지도 이름표 자동 배치 (사장님 지시 2026-10-25)
//  - 점은 실제 좌표에 그대로 두고, 이름은 주변 바다·빈 공간으로 밀어낸다(점 무리의 중심 반대 방향 우선 = 열도 바깥 바다).
//  - 이름끼리·연결선·지도 버튼과 겹치지 않게 차례로 자리를 찾고, 자리가 없으면 숨긴다(점만 표시).
//    숨겨진 지역도 지역 선택창·목록에서는 고를 수 있고, 확대하면 간격이 벌어져 자동으로 다시 나타난다.
//  - 확대·축소·이동·화면 크기가 바뀔 때마다 다시 계산한다(고정 픽셀 배치 없음).

export type LabelPoint = {
  id: string;
  x: number; // 화면 px (상자 기준)
  y: number;
  text: string;
  priority: number; // 클수록 먼저 자리를 잡는다 (선택된 지역이 최우선)
  selected?: boolean;
};
export type Rect = { x: number; y: number; w: number; h: number };
export type PlacedLabel = {
  id: string;
  dx: number; // 점 → 이름표 중심 (px)
  dy: number;
  w: number;
  h: number;
  hidden: boolean;
  leader: boolean; // 연결선 필요 여부
  ex: number; // 연결선 끝(이름표 가장자리, 점 기준 px)
  ey: number;
};

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** 선택지 방향 — 바깥(중심 반대) 방향과 가까운 순서로 8방향을 정렬 */
function directionOrder(angle: number): [number, number][] {
  const dirs: [number, number][] = [
    [1, 0], [-1, 0], [1, -0.7], [-1, -0.7], [1, 0.7], [-1, 0.7], [0, -1], [0, 1],
  ];
  return dirs
    .map((d) => ({ d, diff: Math.abs(Math.atan2(d[1], d[0]) - angle) }))
    .map((o) => ({ ...o, diff: Math.min(o.diff, Math.PI * 2 - o.diff) }))
    .sort((a, b) => a.diff - b.diff)
    .map((o) => o.d);
}

export type PlaceOptions = {
  dists?: number[]; // 점에서 이름까지 시도할 거리(px) — 짧은 것부터
  noLeader?: boolean; // true면 연결선을 쓰지 않는다(이름을 점 바로 옆에만)
  order?: "priority" | "edge"; // edge: 가장자리(자리 잡기 어려운) 점부터 — 전부 보여야 하는 국가 지도용
};

export function placeLabels(
  points: LabelPoint[],
  boxW: number,
  boxH: number,
  avoid: Rect[],
  fontPx = 13,
  opts: PlaceOptions = {},
): PlacedLabel[] {
  // 점이 화면 가장자리에 걸치면 이름·선을 붙이지 않는다(점만) — 잘린 선이 생기지 않게 (Codex 10/25)
  const inView = points.filter((p) => p.x > 6 && p.x < boxW - 6 && p.y > 6 && p.y < boxH - 6);
  if (!inView.length) return [];
  const cx = inView.reduce((s, p) => s + p.x, 0) / inView.length;
  const cy = inView.reduce((s, p) => s + p.y, 0) / inView.length;

  // 점 자체도 가리면 안 된다 — 다른 점의 작은 금지 상자 (자기 점은 제외: 바로 옆 배치를 막지 않게)
  const taken: Rect[] = [...avoid];
  const dotBoxes = inView.map((p) => ({ id: p.id, r: { x: p.x - 6, y: p.y - 6, w: 12, h: 12 } }));
  const result: PlacedLabel[] = [];
  const edgeRoom = (p: LabelPoint) => Math.min(p.x, boxW - p.x, p.y, boxH - p.y);
  const sorted = [...inView].sort((a, b) =>
    opts.order === "edge"
      ? (b.selected ? -1e6 : 0) - (a.selected ? -1e6 : 0) + edgeRoom(a) - edgeRoom(b)
      : (b.selected ? 1e6 : 0) + b.priority - ((a.selected ? 1e6 : 0) + a.priority));

  for (const p of sorted) {
    const w = Math.round(p.text.length * fontPx * 1.02) + 16;
    const h = fontPx + 17; // 터치 여유 포함
    const away = Math.atan2(p.y - cy, p.x - cx); // 무리 바깥(바다) 방향
    let placed: PlacedLabel | null = null;
    outer: for (const dist of opts.dists ?? [22, 40, 56]) { // 연결선이 길어 혼동되지 않게 기본 최대 56px (Codex 10/25)
      for (const [ux0, uy0] of directionOrder(away)) {
        const len = Math.hypot(ux0, uy0);
        const ux = ux0 / len, uy = uy0 / len;
        // 가로 방향이면 이름표를 점 옆에 끝맞춤(시안처럼 "이름 ─ 점")
        const dx = ux * dist + (Math.abs(ux) > 0.5 ? Math.sign(ux) * (w / 2 - 4) : 0);
        const dy = uy * dist;
        const box: Rect = { x: p.x + dx - w / 2 - 4, y: p.y + dy - h / 2 - 4, w: w + 8, h: h + 8 }; // 이름 사이 8px 확보
        if (box.x < 2 || box.y < 2 || box.x + box.w > boxW - 2 || box.y + box.h > boxH - 2) continue;
        if (taken.some((t) => overlaps(box, t))) continue;
        if (dotBoxes.some((d) => d.id !== p.id && overlaps(box, d.r))) continue;
        // 연결선 끝 = 이름표 가장자리 (점 방향)
        const dl = Math.hypot(dx, dy);
        const vx = dx / dl, vy = dy / dl;
        const edge = Math.min((w / 2) / Math.max(Math.abs(vx), 0.0001), (h / 2) / Math.max(Math.abs(vy), 0.0001));
        placed = { id: p.id, dx, dy, w, h, hidden: false, leader: !opts.noLeader && dl - edge > 14, ex: dx - vx * edge, ey: dy - vy * edge };
        taken.push(box);
        break outer;
      }
    }
    result.push(placed ?? { id: p.id, dx: 0, dy: 0, w, h, hidden: true, leader: false, ex: 0, ey: 0 });
  }
  return result;
}
