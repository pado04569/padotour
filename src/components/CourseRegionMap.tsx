import type { CountryMap } from "@/lib/regionMaps";

// 나라별 골프장 페이지의 지역 위치 보조 지도 (사장님 확정 2026-10-09)
// 처음(지역 미선택): 모든 지역 점 + 이름 (M1) → 위치 관계를 한눈에.
// 지역 선택 후: 그 지역만 에메랄드로 강조, 나머지는 흐리게 (M2).
// 지도 이름·점을 누르면 그 지역으로 걸러진다. 서버에서 그리므로 자바스크립트 없이 동작한다.
const C = {
  bg: "#F8FAFC", land: "#E8F0EC", stroke: "#B7C9BF", hi: "#C9EBDB",
  dot: "#64748B", dotDim: "#CBD5E1", sel: "#059669", text: "#334155", selText: "#065F46",
};

// 이름이 지도 밖으로 잘리지 않게 — 넘치면 점의 반대쪽으로 옮긴다 (한글 1자 ≈ 글자 크기)
function placeLabel(map: CountryMap, x: number, y: number, label: { dx: number; dy: number; anchor: "start" | "middle" | "end" }, text: string, size: number) {
  const w = text.length * size;
  let { dx, anchor } = label;
  if (anchor === "end" && x + dx - w < 4) { dx = Math.abs(dx) || 10; anchor = "start"; }
  else if (anchor === "start" && x + dx + w > map.width - 4) { dx = -(Math.abs(dx) || 10); anchor = "end"; }
  let lx = x + dx;
  if (anchor === "middle") lx = Math.min(Math.max(lx, w / 2 + 4), map.width - w / 2 - 4);
  return { x: lx, y: y + label.dy, anchor };
}

function MapSvg({ map, regions, selected, hrefFor }: { map: CountryMap; regions: string[]; selected?: string; hrefFor: (r: string) => string }) {
  const selArea = selected ? map.regions[selected]?.area : undefined;
  const shown = Object.entries(map.regions).filter(([name]) => regions.includes(name));
  return (
    <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={`${map.title} 골프 지역 위치 지도`} className="w-full h-auto block">
      <rect width={map.width} height={map.height} rx={12} fill={C.bg} />
      {Object.entries(map.areas).filter(([, a]) => !a.inset).map(([k, a]) => (
        <path key={k} d={a.d} fill={selArea === k ? C.hi : C.land} stroke={selArea === k ? C.sel : C.stroke} strokeWidth={selArea === k ? 2 : 1.2} strokeLinejoin="round" />
      ))}
      {map.insets.map((b) => (
        <g key={b.area}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10} fill="#fff" stroke={selArea === b.area ? C.sel : "#CBD5E1"} strokeDasharray="4 3" />
          <text x={b.x + 8} y={b.y + 17} fontSize={13} fill="#64748B">{b.title}</text>
          <path d={map.areas[b.area].d} fill={selArea === b.area ? C.hi : C.land} stroke={C.stroke} strokeLinejoin="round" />
        </g>
      ))}
      {/* 선택 지역은 맨 위에 오도록 마지막에 그린다 */}
      {[...shown.filter(([n]) => n !== selected), ...shown.filter(([n]) => n === selected)].map(([name, r]) => {
        const on = name === selected;
        const dim = Boolean(selected) && !on;
        return (
          <a key={name} href={hrefFor(name)} aria-label={`${name} 골프장 보기`} aria-current={on ? "true" : undefined}>
            {/* 누르기 쉽게 보이지 않는 넓은 영역 */}
            <circle cx={r.x} cy={r.y} r={18} fill="transparent" stroke="transparent" strokeWidth={3} />
            {on && <circle cx={r.x} cy={r.y} r={16} fill={C.sel} opacity={0.18} />}
            <circle cx={r.x} cy={r.y} r={on ? 8 : 5} fill={on ? C.sel : dim ? C.dotDim : C.dot} stroke="#fff" strokeWidth={on ? 3 : 2} />
            <text
              x={placeLabel(map, r.x, r.y, r.label, name, on ? 22 : 18).x}
              y={placeLabel(map, r.x, r.y, r.label, name, on ? 22 : 18).y}
              textAnchor={placeLabel(map, r.x, r.y, r.label, name, on ? 22 : 18).anchor}
              fontSize={on ? 22 : 18}
              fontWeight={on ? 800 : 600}
              fill={on ? C.selText : C.text}
              opacity={dim ? 0.55 : 1}
              paintOrder="stroke"
              stroke="#fff"
              strokeWidth={4}
              strokeLinejoin="round"
            >
              {name}
            </text>
          </a>
        );
      })}
    </svg>
  );
}

export default function CourseRegionMap({ openOnMobile, ...props }: { map: CountryMap; regions: string[]; selected?: string; hrefFor: (r: string) => string; openOnMobile?: boolean }) {
  const caption = (
    <p className="text-[13px] md:text-sm text-gray-500 mt-2 break-keep">
      대략적인 위치입니다 · 지역 이름을 누르면 그 지역 골프장만 보여드려요
    </p>
  );
  return (
    <>
      {/* 휴대폰: 기본 접힘 — 지도에서 지역을 고르고 온 경우(map=1)만 펼친 채로 */}
      <details className="md:hidden group mt-3" open={openOnMobile}>
        <summary className="list-none flex items-center justify-between min-h-12 px-4 rounded-xl border border-gray-300 bg-white text-base font-bold text-emerald-800 cursor-pointer [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z" /><path d="M9 4v14M15 6v14" />
            </svg>
            {props.map.title} 지역 위치 보기
          </span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 transition-transform group-open:-rotate-180" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.5 9 12 15.5 18.5 9" />
          </svg>
        </summary>
        <div className="mt-2 p-3 border border-gray-200 rounded-2xl bg-white">
          <MapSvg {...props} />
          {caption}
        </div>
      </details>
      {/* PC: 지역 버튼 옆에 작게 항상 표시 */}
      <div className="hidden md:block p-3 border border-gray-200 rounded-2xl bg-white">
        <div className="text-[15px] font-bold text-gray-700 mb-2 px-1">{props.map.title} 지역 위치</div>
        <MapSvg {...props} />
        {caption}
      </div>
    </>
  );
}
