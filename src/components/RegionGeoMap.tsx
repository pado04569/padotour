"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadGeo, type GeoData } from "@/lib/geoClient";
import { COUNTRY_VIEWS, REGION_POINTS, latToY, lngToX, viewRect } from "@/lib/mapRegions";
import { placeLabels, type PlacedLabel } from "@/lib/labelLayout";

// 실제 지리 지도 한 나라 보기 — /tours '지도로 위치 보기'가 쓴다 (사장님 지시 2026-10-25, 손그림 지도 대체)
// 지역 이름표(대표점)를 누르면 hrefFor 주소로 이동해 기존 필터가 그대로 동작한다.
// 지도 자료를 못 받아도 위 지역 버튼으로 똑같이 고를 수 있다.
export default function RegionGeoMap({
  countryCode,
  regions,
  selected,
  hrefFor,
}: {
  countryCode: string;
  regions: string[];
  selected?: string;
  hrefFor: (region: string) => string;
}) {
  const [geo, setGeo] = useState<GeoData | "loading" | "error">("loading");
  useEffect(() => {
    let dead = false;
    loadGeo().then((j) => { if (!dead) setGeo(j); }).catch(() => { if (!dead) setGeo("error"); });
    return () => { dead = true; };
  }, []);

  const boxRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1.45);
  const [size, setSize] = useState<[number, number]>([520, 300]);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { if (el.clientHeight) { setAspect(el.clientWidth / el.clientHeight); setSize([el.clientWidth, el.clientHeight]); } });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bounds = COUNTRY_VIEWS[countryCode];
  const pts = REGION_POINTS[countryCode] ?? {};
  if (!bounds) return null;
  let { x, y, w, h } = viewRect(bounds);
  if (w / h < aspect) { const nw = h * aspect; x -= (nw - w) / 2; w = nw; }
  else { const nh = w / aspect; y -= (nh - h) / 2; h = nh; }
  // 이름표 자동 배치 — 점은 실제 좌표, 이름은 빈 공간으로. 자리가 없으면 숨긴다(위 버튼으로 선택 가능)
  const [bw, bh] = size;
  const placedList = placeLabels(
    regions.flatMap((r) => {
      const pt = pts[r];
      if (!pt) return [];
      return [{ id: r, x: ((lngToX(pt[0]) - x) / w) * bw, y: ((latToY(pt[1]) - y) / h) * bh, text: r, priority: r === selected ? 1 : 0, selected: r === selected }];
    }),
    bw, bh, [], 13,
  );
  const placedMap = new Map(placedList.map((p) => [p.id, p]));

  return (
    <div ref={boxRef} className="relative h-[300px] md:h-[360px] rounded-xl overflow-hidden border border-line bg-[#DCEDFA]">
      {geo === "loading" && <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-[14px] font-semibold">지도를 불러오는 중…</div>}
      {geo === "error" && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[14px] text-slate-700 font-semibold">
          지도를 불러오지 못했습니다. 위 지역 버튼으로 골라 주세요.
        </div>
      )}
      {typeof geo === "object" && (
        <svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" role="img" aria-label="지역 위치 지도">
          <path d={geo.back} fill="#EDF1F4" stroke="#D5DDE4" strokeWidth={w / 1500} strokeLinejoin="round" />
          {geo.focus.map((f) => (
            <path key={f.code} d={f.d} fill={f.code === countryCode || (countryCode === "other" && (f.code === "guam" || f.code === "saipan" || f.code === "other")) ? "#FDFEFD" : "#E9EFF3"} stroke="#C7D3DD" strokeWidth={w / 1300} strokeLinejoin="round" />
          ))}
        </svg>
      )}
      {typeof geo === "object" && regions.map((r) => {
        const pt = pts[r];
        if (!pt) return null; // 좌표가 확인 안 된 지역은 점을 찍지 않는다 (버튼으로만)
        const px = ((lngToX(pt[0]) - x) / w) * 100;
        const py = ((latToY(pt[1]) - y) / h) * 100;
        if (px < -5 || px > 105 || py < -5 || py > 105) return null;
        const on = selected === r;
        const pl: PlacedLabel | undefined = placedMap.get(r);
        const lp = pl ? { left: `calc(${px}% + ${pl.dx}px)`, top: `calc(${py}% + ${pl.dy}px)` } : undefined;
        const halo = { textShadow: "0 1px 2px #fff, 0 -1px 2px #fff, 1px 0 2px #fff, -1px 0 2px #fff, 0 0 6px #fff" };
        const dl = pl ? Math.hypot(pl.dx, pl.dy) || 1 : 1;
        return (
          <span key={r}>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-white shadow pointer-events-none" style={{ left: `${px}%`, top: `${py}%` }} aria-hidden="true" />
            {pl && !pl.hidden && (
              <>
                {pl.leader && (
                  <svg className="absolute overflow-visible pointer-events-none" style={{ left: `${px}%`, top: `${py}%` }} width="1" height="1" aria-hidden="true">
                    <line x1={(pl.dx / dl) * 7} y1={(pl.dy / dl) * 7} x2={pl.ex} y2={pl.ey} stroke="#73899A" strokeWidth="1.2" />
                  </svg>
                )}
                <Link
                  href={hrefFor(r)}
                  aria-current={on ? "page" : undefined}
                  style={on ? lp : { ...lp, ...halo }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${on ? "z-10 flex items-center min-h-8 px-2.5 rounded-full bg-emerald-600 border border-emerald-700 text-white text-[13px] font-bold shadow" : "px-1 py-2 text-[13px] font-extrabold text-slate-800 hover:text-emerald-700"}`}
                >
                  {r}
                </Link>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
