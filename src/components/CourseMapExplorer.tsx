"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconChevron } from "./icons/Chevron";
import { IconCheck, IconGlobe, IconPin } from "./icons/MenuIcons";
import PickerSheet from "./PickerSheet";
import courseGeo from "@/data/courseGeo.json";
import { loadGeo, type GeoData } from "@/lib/geoClient";
import {
  GEO_W, MAP_GROUPS, groupByKey, lngToX, latToY, pointFor, regionView, viewRect,
} from "@/lib/mapRegions";
import { placeLabels, type LabelPoint, type PlacedLabel, type Rect } from "@/lib/labelLayout";

// 골프장 둘러보기 — 지도 탐색 (사장님 시안 3안 '지역 가이드형', 2026-10-25)
//  - 왼쪽 탐색 목록(PC) · 오른쪽 실제 지리 지도(Natural Earth, 퍼블릭 도메인) · 아래 골프장 카드
//  - 세계 → 나라(왼쪽 목록이 지역으로 바뀜) → 지역(지도 확대) 순서. 선택은 클릭으로만 바뀐다(드래그·확대는 보기만).
//  - 지도 자료는 /geo/world-map.json 을 지도 모드에서만 내려받는다. 실패해도 목록·선택창으로 둘러볼 수 있다.
//  - 골프장 핀은 courseGeo.json 에 확인된 좌표가 있는 골프장만. 좌표가 없으면 핀 없이 카드 목록으로 안내한다.
//  - 주소(view=map&country=&region=)와 뒤로가기에 상태를 반영한다.

export type ExplorerCourse = { slug: string; name: string; region: string; countryCode: string; image: string; summary: string };
export type ExplorerRegion = { value: string; label: string; count: number; image: string };
export type ExplorerGroup = { key: string; label: string; count: number; image: string; regions: ExplorerRegion[] };

type Sel = { g: string | null; r: string | null };
type View = { x: number; y: number; w: number; h: number };

const WORLD: [number, number, number, number] = [88, -13, 153, 47]; // 처음은 취급 여행지가 벌어져 보이는 아시아·태평양 — 이름이 점 옆에 다 들어간다. 축소(−)하면 세계 전체
const GEO_BY_SLUG = courseGeo as Record<string, [number, number]>;
const matchesRegion = (courseRegion: string, r: string) =>
  courseRegion === r || courseRegion.split("/").map((t) => t.trim()).includes(r);
const codeToGroup = (code: string) => MAP_GROUPS.find((g) => g.codes.includes(code));

export default function CourseMapExplorer({ groups, courses, initialG, initialR }: {
  groups: ExplorerGroup[]; courses: ExplorerCourse[]; initialG: string | null; initialR: string | null;
}) {
  const [sel, setSel] = useState<Sel>({ g: initialG, r: initialR });
  const [geo, setGeo] = useState<GeoData | "loading" | "error">("loading");
  const [sheet, setSheet] = useState<null | "country" | "region">(null);
  const [pcPick, setPcPick] = useState(false); // PC 왼쪽 '일본 ▾' → 국가 목록으로 잠시 전환
  const [focusSlug, setFocusSlug] = useState<string | null>(null); // 핀·카드 강조
  const group = groupByKey(sel.g);
  const groupData = groups.find((x) => x.key === sel.g);
  const stage: "world" | "country" | "region" = !group ? "world" : sel.r ? "region" : "country";

  // ── 지도 자료 (지도 모드에서만 받는다)
  useEffect(() => {
    let dead = false;
    loadGeo().then((j) => { if (!dead) setGeo(j); }).catch(() => { if (!dead) setGeo("error"); });
    return () => { dead = true; };
  }, []);


  // ── 화면 크기에 맞춘 보기 범위 + 부드러운 이동
  const boxRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1.6);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { if (el.clientHeight) setAspect(el.clientWidth / el.clientHeight); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fit = (r: View): View => {
    // 목표 범위를 화면 비율에 맞춰 넓힌다 (여백 띠가 생기지 않게)
    let { x, y, w, h } = r;
    if (w / h < aspect) { const nw = h * aspect; x -= (nw - w) / 2; w = nw; }
    else { const nh = w / aspect; y -= (nh - h) / 2; h = nh; }
    return { x, y, w, h };
  };
  const targetFor = (s: Sel): View => {
    const g = groupByKey(s.g);
    if (!g) return fit(viewRect(WORLD));
    const pt = s.r ? pointFor(g.codes, s.r) : undefined;
    if (pt) return fit(viewRect(regionView(pt, g.key === "guam-saipan" ? 0.9 : 2.8)));
    return fit(viewRect(g.view));
  };
  // ── 이름표 자동 배치 (사장님 지시 10/25) — 점은 실제 좌표, 이름은 바다·빈 공간으로. 자리 없으면 숨기고 확대하면 자동으로 더 보인다.
  const [labels, setLabels] = useState<{ stage: string; items: Record<string, PlacedLabel> } | null>(null);
  const selRef = useRef(sel);
  useEffect(() => { selRef.current = sel; }, [sel]);
  const recomputeLabels = (v: View) => {
    const el = boxRef.current;
    if (!el || !el.clientWidth || !el.clientHeight) return;
    const bw = el.clientWidth, bh = el.clientHeight;
    const s = selRef.current;
    const g = groupByKey(s.g);
    const gd = groups.find((x) => x.key === s.g);
    const st = !g ? "world" : s.r ? "region" : "country";
    const toPx = (lng: number, lat: number): [number, number] =>
      [((lngToX(lng) - v.x) / v.w) * bw, ((latToY(lat) - v.y) / v.h) * bh];
    let pts: LabelPoint[] = [];
    if (st === "world") {
      pts = MAP_GROUPS.map((mg) => {
        const [x, y] = toPx(mg.marker[0], mg.marker[1]);
        return { id: mg.key, x, y, text: mg.label, priority: groups.find((x2) => x2.key === mg.key)?.count ?? 0 };
      });
    } else if (g && gd) {
      pts = gd.regions.flatMap((r) => {
        const pt = pointFor(g.codes, r.value);
        if (!pt) return [];
        const [x, y] = toPx(pt[0], pt[1]);
        return [{ id: r.value, x, y, text: r.label, priority: r.count, selected: s.r === r.value }];
      });
    }
    const avoid: Rect[] = [{ x: bw - 58, y: 4, w: 54, h: 108 }]; // 오른쪽 위 확대·축소 묶음
    if (st !== "world") avoid.push({ x: 4, y: 4, w: 214, h: 52 }); // 왼쪽 위 '이전 단계'
    // 국가 지도(세계)는 점 바로 옆 이름·연결선 없음, 지역 지도는 짧은 연결선 허용 — 화면별 규칙 분리 (사장님 지시 10/25)
    const placed = st === "world"
      ? placeLabels(pts, bw, bh, avoid, bw < 560 ? 14 : 15, { dists: [13, 24, 40, 56, 72], order: "edge", minH: 44 })
      : placeLabels(pts, bw, bh, avoid, bw < 560 ? 13 : 14);
    setLabels({ stage: st, items: Object.fromEntries(placed.map((x) => [x.id, x])) });
  };

  const [view, setView] = useState<View>(() => targetFor({ g: initialG, r: initialR }));
  const animRef = useRef(0);
  const flyTo = (t: View) => {
    cancelAnimationFrame(animRef.current);
    const from = { ...viewRef.current };
    let t0 = -1; // 첫 프레임의 시각을 기준으로 (rAF 가 주는 시각만 사용 — React 순수성 규칙)
    const D = 450;
    const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
    const stepFn = (now: number) => {
      if (t0 < 0) t0 = now;
      const p = Math.min(1, (now - t0) / D);
      const e = ease(p);
      setView({ x: from.x + (t.x - from.x) * e, y: from.y + (t.y - from.y) * e, w: from.w + (t.w - from.w) * e, h: from.h + (t.h - from.h) * e });
      if (p < 1) animRef.current = requestAnimationFrame(stepFn);
      else recomputeLabels(t); // 이동이 끝난 화면 기준으로 이름표 자리를 다시 잡는다
    };
    animRef.current = requestAnimationFrame(stepFn);
  };
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);
  const aspectRef = useRef(aspect);
  useEffect(() => { if (Math.abs(aspectRef.current - aspect) > 0.01) { aspectRef.current = aspect; const t = targetFor(sel); setView(t); recomputeLabels(t); } }, [aspect]); // eslint-disable-line react-hooks/exhaustive-deps

  // 처음 열릴 때(지도 자료 도착 후) 이름표 배치
  useEffect(() => { if (typeof geo === "object") recomputeLabels(viewRef.current); }, [geo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 선택 바꾸기 (주소·뒤로가기 반영)
  const urlFor = (s: Sel) => {
    const g = groupByKey(s.g);
    const gd = groups.find((x) => x.key === s.g);
    const q = new URLSearchParams({ view: "map" });
    if (g && gd) q.set("country", g.codes.join(","));
    if (s.r) q.set("region", s.r);
    return `/courses?${q.toString()}`;
  };
  const apply = (s: Sel, push = true) => {
    setSel(s);
    setFocusSlug(null);
    setPcPick(false);
    setSheet(null);
    flyTo(targetFor(s));
    if (push && typeof window !== "undefined") window.history.pushState({ mapSel: s }, "", urlFor(s));
  };
  useEffect(() => {
    const onPop = () => {
      const q = new URLSearchParams(window.location.search);
      const codes = (q.get("country") ?? "").split(",").filter(Boolean);
      const g = codes.length ? MAP_GROUPS.find((x) => codes.every((c) => x.codes.includes(c))) : undefined;
      const s = { g: g?.key ?? null, r: q.get("region") };
      setSel(s);
      flyTo(targetFor(s));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [aspect]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 확대·축소·끌기 — 보기만 바꾼다(선택·필터는 그대로)
  const zoom = (f: number) => {
    const v = viewRef.current;
    const w = Math.min(GEO_W * 1.05, Math.max(40, v.w * f));
    const h = w / aspect;
    flyTo({ x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h });
  };
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // 휴대폰은 페이지 스크롤과 겹치지 않게 끌기 없음(선택창·버튼으로 탐색)
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const el = boxRef.current;
    if (!el) return;
    const v = viewRef.current;
    const dx = ((e.clientX - d.x) / el.clientWidth) * v.w;
    const dy = ((e.clientY - d.y) / el.clientHeight) * v.h;
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) d.moved = true;
    if (d.moved) { cancelAnimationFrame(animRef.current); setView({ ...v, x: v.x - dx, y: v.y - dy }); drag.current = { x: e.clientX, y: e.clientY, moved: true }; }
  };
  const endDrag = () => { if (drag.current?.moved) recomputeLabels(viewRef.current); setTimeout(() => { drag.current = null; }, 0); };
  const dragMoved = () => Boolean(drag.current?.moved);

  // ── 지도 위 표식 위치 (HTML 올림표 — 확대해도 글자 크기 일정)
  const pos = (lng: number, lat: number) => {
    const x = ((lngToX(lng) - view.x) / view.w) * 100;
    const y = ((latToY(lat) - view.y) / view.h) * 100;
    return { left: `${x}%`, top: `${y}%`, hidden: x < -8 || x > 108 || y < -8 || y > 108 };
  };
  const halo = { textShadow: "0 1px 2px #fff, 0 -1px 2px #fff, 1px 0 2px #fff, -1px 0 2px #fff, 0 0 6px #fff" };
  const haloThin = { textShadow: "0 0 3px #fff, 0 1px 2px #fff" }; // 국가 지도용 — 외곽선 과하지 않게
  const dotCls = "absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow pointer-events-none";
  const L = labels && labels.stage === stage ? labels.items : null;
  const hiddenLabels = L ? Object.values(L).filter((x) => x.hidden).length : 0;
  // 점 가장자리 → 이름표 가장자리 연결선 (이름이 점과 떨어져 있을 때만)
  const leaderSvg = (p: { left: string; top: string }, pl: PlacedLabel) => {
    if (!pl.leader) return null;
    const dl = Math.hypot(pl.dx, pl.dy) || 1;
    return (
      <svg className="absolute overflow-visible pointer-events-none" style={{ left: p.left, top: p.top }} width="1" height="1" aria-hidden="true">
        <line x1={(pl.dx / dl) * 7} y1={(pl.dy / dl) * 7} x2={pl.ex} y2={pl.ey} stroke="#73899A" strokeWidth="1.2" />
      </svg>
    );
  };
  const labelPos = (p: { left: string; top: string }, pl: PlacedLabel) =>
    ({ left: `calc(${p.left} + ${pl.dx}px)`, top: `calc(${p.top} + ${pl.dy}px)` });

  // ── 아래 카드 목록
  const listed = useMemo(() => {
    if (!group) return [];
    let list = courses.filter((c) => group.codes.includes(c.countryCode));
    if (sel.r) list = list.filter((c) => matchesRegion(c.region, sel.r!));
    return list;
  }, [courses, group, sel.r]);
  const pinned = listed.filter((c) => GEO_BY_SLUG[c.slug]);

  // ── 공용 UI 조각
  const rowCls = (on: boolean) =>
    `w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${on ? "bg-emerald-50 text-emerald-900" : "hover:bg-slate-50 text-main-text"}`;
  const thumb = (src: string, alt: string) => (
    <span className="relative flex-none w-11 h-11 rounded-lg overflow-hidden bg-emerald-100">
      <Image src={src} alt={alt} fill sizes="44px" className="object-cover" />
    </span>
  );
  const crumbBtn = "hover:underline underline-offset-2";

  const regionRows = groupData?.regions ?? [];
  const countryList = (onPickDone?: () => void) => (
    <div className="flex flex-col gap-1">
      {groups.map((g) => {
        const on = sel.g === g.key;
        return (
          <button key={g.key} type="button" onClick={() => { apply({ g: g.key, r: null }); onPickDone?.(); }} className={rowCls(on)} aria-pressed={on}>
            {thumb(g.image, `${g.label} 골프장`)}
            <span className="flex-1 min-w-0 font-bold text-[16px] break-keep">{g.label}</span>
            <span className="text-[13px] text-slate-500 font-semibold">{g.count}곳</span>
            {on ? <IconCheck className="w-4 h-4 text-emerald-700" /> : <IconChevron className="w-4 h-4 text-slate-400" />}
          </button>
        );
      })}
    </div>
  );
  const regionList = (onPickDone?: () => void) => (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={() => { apply({ g: sel.g, r: null }); onPickDone?.(); }} className={rowCls(!sel.r)} aria-pressed={!sel.r}>
        {groupData && thumb(groupData.image, `${groupData.label} 골프장`)}
        <span className="flex-1 min-w-0 font-bold text-[16px]">{group?.label} 전체</span>
        <span className="text-[13px] text-slate-500 font-semibold">{groupData?.count}곳</span>
        {!sel.r && <IconCheck className="w-4 h-4 text-emerald-700" />}
      </button>
      {regionRows.map((r) => {
        const on = sel.r === r.value;
        return (
          <button key={r.value} type="button" onClick={() => { apply({ g: sel.g, r: r.value }); onPickDone?.(); }} className={rowCls(on)} aria-pressed={on}>
            {thumb(r.image, `${r.label} 골프장`)}
            <span className="flex-1 min-w-0 font-bold text-[16px] break-keep">{r.label}</span>
            <span className="text-[13px] text-slate-500 font-semibold">{r.count}곳</span>
            {on ? <IconCheck className="w-4 h-4 text-emerald-700" /> : <IconChevron className="w-4 h-4 text-slate-400" />}
          </button>
        );
      })}
    </div>
  );

  // 목록 모드로 전환해도 지금 고른 나라·지역이 유지되게 — 서버가 아니라 지금 상태로 주소를 만든다 (지시 10)
  const listHref = (() => {
    const q = new URLSearchParams();
    if (group) q.set("country", group.codes.join(","));
    if (sel.r) q.set("region", sel.r);
    const qs = q.toString();
    return `/courses${qs ? `?${qs}` : ""}`;
  })();

  return (
    <section className="max-w-6xl mx-auto px-4 pb-10 break-keep pt-4">
      {/* 보기 전환 — 지금 고른 조건을 그대로 들고 간다 */}
      <div className="flex justify-end gap-2 mb-3">
        <a href={listHref} className="inline-flex items-center min-h-11 px-4 rounded-full border-[1.5px] border-slate-300 bg-white text-[15px] font-bold text-main-text hover:bg-slate-50">목록으로 보기</a>
        <span aria-current="page" className="inline-flex items-center min-h-11 px-4 rounded-full border-[1.5px] border-emerald-600 bg-emerald-600 text-[15px] font-bold text-white">지도로 보기</span>
      </div>
      {/* 탐색 경로 */}
      <nav aria-label="탐색 경로" className="flex flex-wrap items-center gap-1 text-[14px] text-slate-600 mb-2.5">
        <button type="button" onClick={() => apply({ g: null, r: null })} className={`${crumbBtn} ${stage === "world" ? "font-bold text-main-text" : ""}`}>전체 여행지</button>
        {group && (
          <>
            <IconChevron className="w-3.5 h-3.5 text-slate-400" />
            <button type="button" onClick={() => apply({ g: sel.g, r: null })} className={`${crumbBtn} ${stage === "country" ? "font-bold text-brand-blue" : ""}`}>{group.label}</button>
          </>
        )}
        {sel.r && (
          <>
            <IconChevron className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-brand-blue">{sel.r}</span>
          </>
        )}
      </nav>

      {/* 휴대폰: 지도 위 선택창 2개 */}
      <div className="md:hidden grid grid-cols-2 gap-2 mb-2.5">
        <button type="button" onClick={() => setSheet("country")} aria-haspopup="dialog" className="flex items-center gap-2 min-h-12 px-3 rounded-xl border-[1.5px] border-slate-300 bg-white text-left">
          <IconGlobe className="w-5 h-5 text-brand-blue flex-none" />
          <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold text-slate-900">{group ? group.label : "국가·여행지"}</span>
          <IconChevron dir="down" className="w-4 h-4 text-slate-600 flex-none" />
        </button>
        <button type="button" onClick={() => group && setSheet("region")} disabled={!group} aria-haspopup="dialog" className="flex items-center gap-2 min-h-12 px-3 rounded-xl border-[1.5px] border-slate-300 bg-white text-left disabled:opacity-45">
          <IconPin className="w-5 h-5 text-brand-blue flex-none" />
          <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold text-slate-900">{sel.r ?? (group ? `${group.label} 전체` : "지역")}</span>
          <IconChevron dir="down" className="w-4 h-4 text-slate-600 flex-none" />
        </button>
      </div>

      <div className="md:grid md:grid-cols-[260px_1fr] md:gap-4 md:items-start">
        {/* PC 왼쪽 탐색 목록 */}
        <div className="hidden md:flex flex-col rounded-2xl border border-line bg-white p-2 h-[540px]">
          {stage !== "world" && !pcPick && (
            <button type="button" onClick={() => setPcPick(true)} aria-expanded={pcPick} className="flex items-center gap-2.5 min-h-12 px-3 mb-1.5 rounded-xl border-[1.5px] border-slate-300 bg-white text-left hover:border-emerald-500">
              <IconGlobe className="w-5 h-5 text-brand-blue" />
              <span className="flex-1 text-[16px] font-extrabold text-slate-900">{group?.label}</span>
              <IconChevron dir="down" className="w-4 h-4 text-slate-600" />
            </button>
          )}
          {pcPick && (
            <button type="button" onClick={() => setPcPick(false)} className="flex items-center gap-1.5 min-h-10 px-2 mb-1 rounded-lg text-[14px] font-bold text-slate-600 hover:bg-slate-50 text-left">
              <IconChevron dir="left" className="w-4 h-4" />다시 {group?.label} 지역 보기
            </button>
          )}
          <div className="flex-1 overflow-y-auto pr-0.5">
            {stage === "world" || pcPick ? (
              <>
                <p className="px-2 pt-1 pb-1.5 text-[13px] font-bold text-slate-500">국가·여행지</p>
                {countryList()}
              </>
            ) : (
              regionList()
            )}
          </div>
        </div>

        {/* 지도 */}
        <div>
          {/* 지도 도구줄 — 제목 + 세계 전체 (사장님 시안 10/25) */}
          <div className="flex items-center justify-between gap-2 min-h-11 px-3 mb-2 rounded-xl bg-white border border-line">
            <span className="text-[15px] md:text-[16px] font-extrabold text-main-text">여행지 지도</span>
            <button type="button" onClick={() => apply({ g: null, r: null })} disabled={stage === "world"} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-full text-[14px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
              <IconGlobe className="w-[18px] h-[18px] text-brand-blue" />전체 여행지
            </button>
          </div>
          <div
            ref={boxRef}
            className="relative h-[340px] md:h-[540px] rounded-2xl overflow-hidden border border-line bg-[#DCEDFA] select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            {geo === "loading" && <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-[15px] font-semibold">지도를 불러오는 중…</div>}
            {geo === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-[15px] font-bold text-slate-800">지도를 불러오지 못했습니다.</p>
                <p className="text-[14px] text-slate-600">왼쪽 목록과 위 선택창으로 똑같이 둘러보실 수 있어요.</p>
              </div>
            )}
            {typeof geo === "object" && (
              <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" role="img" aria-label="골프 여행지 지도">
                <path d={geo.back} fill="#EDF1F4" stroke="#D5DDE4" strokeWidth={view.w / 1600} strokeLinejoin="round" />
                {geo.focus.map((f) => {
                  const g = codeToGroup(f.code);
                  const on = g && g.key === sel.g;
                  return (
                    <path
                      key={f.code}
                      d={f.d}
                      fill={on ? "#FDFEFD" : "#E9EFF3"}
                      stroke={on ? "#9DB4C6" : "#CBD6DF"}
                      strokeWidth={view.w / (on ? 1100 : 1500)}
                      strokeLinejoin="round"
                      className="cursor-pointer"
                      onClick={() => { if (!dragMoved() && g) apply(stage === "world" || g.key !== sel.g ? { g: g.key, r: null } : { g: g.key, r: sel.r }); }}
                    />
                  );
                })}
              </svg>
            )}

            {/* 나라 이름표 (세계 화면) */}
            {typeof geo === "object" && stage === "world" && MAP_GROUPS.map((g) => {
              const p = pos(g.marker[0], g.marker[1]);
              if (p.hidden) return null;
              const pl = L?.[g.key];
              return (
                <span key={g.key}>
                  <button type="button" onClick={() => apply({ g: g.key, r: null })} aria-label={`${g.label} 보기`} style={{ left: p.left, top: p.top }} className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-brand-blue ring-2 ring-white shadow" aria-hidden="true" />
                  </button>
                  {pl && !pl.hidden && (
                    <>
                      {leaderSvg(p, pl)}
                      <button type="button" onClick={() => apply({ g: g.key, r: null })} style={{ ...labelPos(p, pl), ...haloThin }} className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center min-h-11 px-1.5 text-[14px] md:text-[15px] font-semibold text-slate-800 hover:text-brand-blue whitespace-nowrap">
                        {g.label}
                      </button>
                    </>
                  )}
                </span>
              );
            })}
            {/* 지역 점 (나라·지역 화면) — 지역 대표점이며 골프장 위치가 아니다 */}
            {typeof geo === "object" && group && stage !== "world" && regionRows.map((r) => {
              const pt = pointFor(group.codes, r.value);
              if (!pt) return null;
              const p = pos(pt[0], pt[1]);
              if (p.hidden) return null;
              const on = sel.r === r.value;
              const pl = L?.[r.value];
              return (
                <span key={r.value}>
                  <span className={`${dotCls} bg-emerald-600 ${on ? "!w-3.5 !h-3.5" : ""}`} style={{ left: p.left, top: p.top }} aria-hidden="true" />
                  {pl && !pl.hidden && (
                    <>
                      {leaderSvg(p, pl)}
                      {on ? (
                        <button type="button" onClick={() => apply({ g: sel.g, r: null })} style={labelPos(p, pl)} className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center min-h-8 px-2.5 rounded-full bg-emerald-600 border border-emerald-700 text-white text-[13px] md:text-[14px] font-bold shadow whitespace-nowrap">
                          {r.label}
                        </button>
                      ) : (
                        <button type="button" onClick={() => apply({ g: sel.g, r: r.value })} style={{ ...labelPos(p, pl), ...halo }} className="absolute -translate-x-1/2 -translate-y-1/2 px-1 py-2 text-[13px] md:text-[14px] font-extrabold text-slate-800 hover:text-emerald-700 whitespace-nowrap">
                          {r.label}
                        </button>
                      )}
                    </>
                  )}
                </span>
              );
            })}
            {/* 골프장 핀 — 확인된 좌표만 */}
            {typeof geo === "object" && stage === "region" && pinned.map((c) => {
              const [lng, lat] = GEO_BY_SLUG[c.slug];
              const p = pos(lng, lat);
              if (p.hidden) return null;
              const on = focusSlug === c.slug;
              return (
                <button key={c.slug} type="button" onClick={() => { setFocusSlug(c.slug); document.getElementById(`mapcard-${c.slug}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }} style={{ left: p.left, top: p.top }} className={`absolute -translate-x-1/2 -translate-y-full flex items-center gap-1 px-2 py-1 rounded-lg border text-[13px] font-bold shadow ${on ? "bg-brand-blue border-blue-800 text-white z-20" : "bg-white border-slate-300 text-slate-800 hover:border-brand-blue z-10"}`}>
                  <IconPin className="w-3.5 h-3.5" />{c.name}
                </button>
              );
            })}

            {/* 확대·축소 — 세로로 묶은 컨트롤 하나 (세계 전체는 지도 위 도구줄로, 사장님 지시 10/25) */}
            <div className="absolute top-3 right-3 flex flex-col rounded-xl bg-white border border-slate-300 shadow-sm overflow-hidden">
              <button type="button" aria-label="지도 확대" onClick={() => zoom(1 / 1.6)} className="w-11 h-11 flex items-center justify-center text-xl font-bold text-slate-700 hover:bg-slate-50">＋</button>
              <span aria-hidden="true" className="h-px mx-2 bg-line" />
              <button type="button" aria-label="지도 축소" onClick={() => zoom(1.6)} className="w-11 h-11 flex items-center justify-center text-xl font-bold text-slate-700 hover:bg-slate-50">−</button>
            </div>
            {stage !== "world" && (
              <button type="button" onClick={() => apply(stage === "region" ? { g: sel.g, r: null } : { g: null, r: null })} className="absolute top-3 left-3 flex items-center gap-1 min-h-10 px-3 rounded-xl bg-white border border-slate-300 shadow-sm text-[14px] font-bold text-slate-700 hover:bg-slate-50">
                <IconChevron dir="left" className="w-4 h-4" />
                {stage === "region" ? `${group?.label} 전체로` : "전체 여행지로"}
              </button>
            )}
          </div>

          {/* 지도 아래 안내 줄 */}
          <div className="mt-2.5 px-4 py-3 rounded-2xl bg-soft-blue flex items-start gap-2.5">
            <IconPin className="w-5 h-5 text-brand-blue flex-none mt-0.5" />
            {stage === "world" ? (
              <p className="text-[14px] md:text-[15px] text-slate-700"><b className="text-brand-blue">국가를 선택해 주세요.</b> 원하는 국가를 선택하면 해당 지역 지도가 표시됩니다.</p>
            ) : (
              <span className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-[14px] md:text-[15px] text-slate-700">
                  {stage === "country" ? (
                    <><b className="text-brand-blue">지역을 선택하면 골프장을 볼 수 있어요.</b>{hiddenLabels > 0 && <> 확대(＋)하면 더 많은 지역 이름이 보여요.</>}</>
                  ) : pinned.length > 0 ? (
                    <><b className="text-brand-blue">{sel.r} 골프장 {listed.length}곳.</b> 지도 핀이나 아래 카드를 눌러 확인해 보세요.</>
                  ) : (
                    <><b className="text-brand-blue">{sel.r} 골프장 {listed.length}곳.</b> 아래 목록에서 확인해 주세요. (지도 위 골프장 핀은 준비 중)</>
                  )}
                </p>
                <button type="button" onClick={() => document.getElementById("map-course-list")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex items-center gap-1 min-h-11 px-3.5 rounded-full border-[1.5px] border-emerald-600 bg-white text-emerald-800 text-[14px] font-bold hover:bg-emerald-50">
                  골프장 {listed.length}곳 보기 ↓
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 아래 골프장 카드 — 기존 카드 모양 재사용 */}
      {group && (
        <div id="map-course-list" className="mt-6 scroll-mt-4">
          <div className="flex flex-wrap items-baseline gap-x-2 mb-4">
            <h2 className="text-lg md:text-xl font-black text-gray-800">{sel.r ? `${group.label} ${sel.r}` : group.label} 골프장</h2>
            <p className="text-gray-500 text-base font-bold">총 {listed.length}곳</p>
          </div>
          {listed.length === 0 && <p className="text-gray-500 text-sm py-8 text-center">해당 지역에 등록된 골프장이 아직 없습니다.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {listed.map((c) => (
              <div key={c.slug} id={`mapcard-${c.slug}`} className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden ${focusSlug === c.slug ? "ring-2 ring-brand-blue" : ""}`}>
                <Link href={`/courses/${c.slug}`} className="block group">
                  <div className="relative h-44 bg-emerald-100 overflow-hidden">
                    <Image src={c.image} alt={`${c.region} ${c.name}`} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-3 right-3 bg-emerald-700 text-white text-sm font-medium px-3 py-1 rounded-full z-10">{c.region}</span>
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{c.name}</h3>
                  {c.summary && <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{c.summary}</p>}
                  <div className="flex gap-2 mt-3">
                    {GEO_BY_SLUG[c.slug] && (
                      <button type="button" onClick={() => { setFocusSlug(c.slug); if (!sel.r) apply({ g: sel.g, r: splitFirst(c.region) }); boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className="inline-flex items-center gap-1 min-h-10 px-3 rounded-full border-[1.5px] border-slate-300 text-[14px] font-bold text-slate-700 hover:border-brand-blue hover:text-brand-blue">
                        <IconPin className="w-4 h-4" />위치 보기
                      </button>
                    )}
                    <Link href={`/courses/${c.slug}`} className="inline-flex items-center gap-0.5 min-h-10 px-3 rounded-full text-[14px] font-bold text-brand-blue hover:bg-blue-50">
                      상세 보기<IconChevron className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 휴대폰 선택창 */}
      {sheet === "country" && (
        <PickerSheet title="국가·여행지" onClose={() => setSheet(null)}>
          {countryList(() => setSheet(null))}
        </PickerSheet>
      )}
      {sheet === "region" && group && (
        <PickerSheet title={`${group.label} 지역`} onClose={() => setSheet(null)}>
          {regionList(() => setSheet(null))}
        </PickerSheet>
      )}
    </section>
  );
}

const splitFirst = (region: string) => region.split("/").map((t) => t.trim())[0];
