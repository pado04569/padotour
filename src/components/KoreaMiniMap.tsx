// 출발지 설명용 아주 작은 대한민국 지도 (사장님 확정 2026-10-10)
// 정밀 지도가 아니다 — "인천 쪽(위) / 부산 쪽(아래)"만 감 잡게 하는 단순 윤곽 + 점 1~2개.
// 카드 아이콘(variant="icon")과 확인창(variant="modal")에서 같이 쓴다.

type Dep = "incheon" | "busan";

const K = 100;
const X = (lon: number) => (lon - 125.9) * K;
const Y = (lat: number) => (38.7 - lat) * K * 1.22;
const OUTLINE =
  "M" +
  [
    [126.15, 37.7], [126.6, 37.78], [126.7, 37.95], [127.1, 38.3], [127.8, 38.3], [128.35, 38.62], [128.6, 38.15],
    [128.95, 37.75], [129.35, 37.2], [129.42, 36.75], [129.4, 36.3], [129.55, 36.05], [129.4, 35.55], [129.25, 35.3],
    [129.05, 35.1], [128.75, 35.0], [128.45, 34.85], [128.1, 34.9], [127.75, 34.75], [127.6, 34.6], [127.35, 34.48],
    [127.0, 34.5], [126.75, 34.3], [126.45, 34.35], [126.3, 34.6], [126.4, 34.9], [126.3, 35.15], [126.45, 35.5],
    [126.65, 35.85], [126.7, 36.05], [126.5, 36.3], [126.35, 36.6], [126.15, 36.75], [126.35, 36.9], [126.55, 37.05],
    [126.75, 37.2], [126.6, 37.45],
  ]
    .map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`)
    .join(" L") +
  " Z";
// 점 위치는 서울·부산 기준 (사용자에게 보이는 이름은 인천공항·부산·김해공항)
const POINT: Record<Dep, [number, number]> = {
  incheon: [X(126.98), Y(37.57)],
  busan: [X(129.07), Y(35.18)],
};

export default function KoreaMiniMap({ selected, variant }: { selected: Dep; variant: "icon" | "modal" }) {
  if (variant === "icon") {
    const [x, y] = POINT[selected];
    return (
      <svg viewBox="-10 -10 420 560" className="w-full h-full" aria-hidden="true">
        <path d={OUTLINE} fill="#EFF6FF" stroke="#93C5FD" strokeWidth={14} strokeLinejoin="round" />
        <circle cx={x} cy={y} r={52} fill="#1D4ED8" stroke="#fff" strokeWidth={16} />
      </svg>
    );
  }
  // 확인창: 고른 쪽 점만 진하게, 다른 쪽은 연한 점 (글자 라벨은 지도 밖에 따로)
  const other: Dep = selected === "incheon" ? "busan" : "incheon";
  return (
    <svg viewBox="-20 -20 440 580" className="w-full h-full" aria-hidden="true">
      <path d={OUTLINE} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={6} strokeLinejoin="round" />
      <circle cx={POINT[other][0]} cy={POINT[other][1]} r={20} fill="#fff" stroke="#CBD5E1" strokeWidth={8} />
      <circle cx={POINT[selected][0]} cy={POINT[selected][1]} r={56} fill="#1D4ED8" opacity={0.15} />
      <circle cx={POINT[selected][0]} cy={POINT[selected][1]} r={30} fill="#1D4ED8" stroke="#fff" strokeWidth={10} />
    </svg>
  );
}
