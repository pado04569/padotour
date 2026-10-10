import type { CountryMap } from "@/lib/regionMaps";

// 나라별 골프장 페이지의 지역 위치 보조 지도 (사장님 확정 2026-10-09)
// 처음(지역 미선택): 모든 지역 점 + 이름 (M1) → 위치 관계를 한눈에.
// 지역 선택 후: 그 지역만 에메랄드로 강조, 나머지는 흐리게 (M2).
// 지도 이름·점을 누르면 그 지역으로 걸러진다. 서버에서 그리므로 자바스크립트 없이 동작한다.
// 사장님 지적(10/9 휴대폰 실측): 선택 지역이 한눈에 안 들어온다 → 선택은 더 진하게, 나머지는 한 단계 약하게
const C = {
  bg: "#F1F5F9", frame: "#CBD5E1", land: "#E2EAE5", landDim: "#ECF0EE", stroke: "#B7C9BF", hi: "#A7E3C6",
  dot: "#64748B", dotDim: "#CBD5E1", sel: "#059669", selStroke: "#047857", text: "#334155", textDim: "#94A3B8", selText: "#064E3B",
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

export function MapSvg({ map, regions, selected, hrefFor, idSuffix }: { map: CountryMap; regions: string[]; selected?: string; hrefFor: (r: string) => string; idSuffix: string }) {
  const area0 = selected ? map.regions[selected]?.area : undefined;
  const selArea = area0 && !map.areas[area0]?.noHighlight ? area0 : undefined;
  const shown = Object.entries(map.regions).filter(([name]) => regions.includes(name));
  const shadowId = `pin-shadow-${idSuffix}`;
  const landFill = (k: string) => (selArea === k ? C.hi : selected ? C.landDim : C.land);
  return (
    <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={`${map.title} 골프 지역 위치 지도`} className="w-full h-auto block mx-auto" style={map.displayMaxWidth ? { maxWidth: map.displayMaxWidth } : undefined}>
      <defs>
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#0F172A" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect x={0.5} y={0.5} width={map.width - 1} height={map.height - 1} rx={12} fill={C.bg} stroke={C.frame} />
      {Object.entries(map.areas).filter(([, a]) => !a.inset).map(([k, a]) =>
        a.context ? (
          <path key={k} d={a.d} fill="#EEF0F2" stroke="#D5DAE0" strokeWidth={1} strokeLinejoin="round" />
        ) : (
          <path key={k} d={a.d} fill={landFill(k)} stroke={selArea === k ? C.selStroke : C.stroke} strokeWidth={selArea === k ? 2.5 : 1.2} strokeLinejoin="round" />
        ),
      )}
      {map.contextLabels?.map((t) => (
        <text key={t.text} x={t.x} y={t.y} textAnchor="middle" fontSize={15} fill="#94A3B8">{t.text}</text>
      ))}
      {map.insets.map((b) => (
        <g key={b.area}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10} fill="#fff" stroke={selArea === b.area ? C.selStroke : "#94A3B8"} strokeWidth={selArea === b.area ? 2 : 1} strokeDasharray={selArea === b.area ? undefined : "4 3"} />
          <text x={b.x + 8} y={b.y + 17} fontSize={13} fill="#64748B">{b.title}</text>
          <path d={map.areas[b.area].d} fill={landFill(b.area)} stroke={selArea === b.area ? C.selStroke : C.stroke} strokeLinejoin="round" />
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
            {on && <circle cx={r.x} cy={r.y} r={18} fill={C.sel} opacity={0.22} />}
            <circle cx={r.x} cy={r.y} r={on ? 10 : 5} fill={on ? C.sel : dim ? C.dotDim : C.dot} stroke="#fff" strokeWidth={on ? 3.5 : 2} filter={on ? `url(#${shadowId})` : undefined} />
            <text
              x={placeLabel(map, r.x, r.y, r.label, name, on ? 25 : 18).x}
              y={placeLabel(map, r.x, r.y, r.label, name, on ? 25 : 18).y}
              textAnchor={placeLabel(map, r.x, r.y, r.label, name, on ? 25 : 18).anchor}
              fontSize={on ? 25 : 18}
              fontWeight={on ? 900 : dim ? 500 : 600}
              fill={on ? C.selText : dim ? C.textDim : C.text}
              paintOrder="stroke"
              stroke="#fff"
              strokeWidth={on ? 5 : 4}
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

// 접힌 버튼 안의 작은 지도 그림 — 무엇을 여는 버튼인지 한눈에 (글자·링크 없이 윤곽과 점만)
function MapThumb({ map, regions, selected }: { map: CountryMap; regions: string[]; selected?: string }) {
  return (
    <svg viewBox={`0 0 ${map.width} ${map.height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="w-full h-full block">
      <rect width={map.width} height={map.height} fill="#F1F5F9" />
      {Object.entries(map.areas).filter(([, a]) => !a.inset && !a.context).map(([k, a]) => (
        <path key={k} d={a.d} fill="#D7E9DF" stroke="#9FC3B0" strokeWidth={3} strokeLinejoin="round" />
      ))}
      {Object.entries(map.regions).filter(([n, r]) => regions.includes(n) && !map.areas[r.area]?.inset).map(([n, r]) => (
        <circle key={n} cx={r.x} cy={r.y} r={n === selected ? 16 : 9} fill={n === selected ? "#059669" : "#64748B"} stroke="#fff" strokeWidth={4} />
      ))}
    </svg>
  );
}

export default function CourseRegionMap({ openOnMobile, ...props }: { map: CountryMap; regions: string[]; selected?: string; hrefFor: (r: string) => string; openOnMobile?: boolean }) {
  // 안내는 두 줄로, 조금 크게 (사장님 요청 10/9)
  const caption = (
    <p className="text-sm md:text-[15px] text-gray-600 mt-2.5 leading-relaxed break-keep">
      대략적인 위치입니다.
      <br />
      지역 이름을 누르면 그 지역 골프장만 보여드려요.
    </p>
  );
  // 지금 어느 지역이 선택됐는지 지도 위에 표시
  const status = (
    <div className="flex items-center gap-2 mb-2 px-1 text-[15px]">
      <span className="text-gray-600">현재 선택</span>
      {props.selected ? (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-emerald-600 text-white font-bold">{props.selected}</span>
      ) : (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">{props.map.title} 전체</span>
      )}
    </div>
  );
  return (
    <>
      {/* 휴대폰: 기본 접힘 — 지도에서 지역을 고르고 온 경우(map=1)만 펼친 채로 */}
      {/* 휴대폰: 기본 접힘. 지역 버튼들 위에 두어 묻히지 않게, 흰 바탕 + 초록 테두리 + 작은 지도 그림 (사장님 선택 T2, 2026-10-09)
          지도에서 지역을 고르고 온 경우(map=1)만 펼친 채로 */}
      <details className="md:hidden group mb-3" open={openOnMobile}>
        <summary className="list-none flex items-center gap-3 min-h-[72px] px-3 py-2.5 rounded-2xl border-2 border-emerald-500 bg-white cursor-pointer [&::-webkit-details-marker]:hidden">
          <span className="flex-none w-16 h-12 rounded-lg overflow-hidden border border-emerald-200">
            <MapThumb map={props.map} regions={props.regions} selected={props.selected} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[17px] font-extrabold text-emerald-800 leading-snug">{props.map.title} 지역 위치 보기</span>
            <span className="block text-sm text-emerald-700 mt-0.5 group-open:hidden">누르면 위치 지도가 열려요</span>
            <span className="hidden text-sm text-emerald-700 mt-0.5 group-open:block">다시 누르면 지도가 닫혀요</span>
          </span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="flex-none w-6 h-6 text-emerald-700 transition-transform group-open:-rotate-180" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.5 9 12 15.5 18.5 9" />
          </svg>
        </summary>
        <div className="mt-2 p-3 border border-gray-300 rounded-2xl bg-white shadow-sm">
          {status}
          <MapSvg {...props} idSuffix="m" />
          {caption}
        </div>
      </details>
      {/* PC: 지역 버튼 옆에 작게 항상 표시 */}
      <div className="hidden md:block p-3 border border-gray-300 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[15px] font-bold text-gray-700 mb-2 px-1">{props.map.title} 지역 위치</div>
          {status}
        </div>
        <MapSvg {...props} idSuffix="d" />
        {caption}
      </div>
    </>
  );
}
