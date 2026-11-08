import type { Metadata } from "next";
import Link from "next/link";
import { tours, type Tour } from "@/data/tours";
import { departureSummary, kstTodayIso } from "@/lib/tripFacts";
import { parsePeopleCondition, roomBasisOf, withLocalCosts } from "@/lib/peopleCondition";
import { stayText } from "@/lib/stay";

/**
 * 부산 출발 겨울 골프여행 비교 (ChatGPT 검색 발견성 작업지시서 2026-11-08, 비교 페이지 1개)
 *
 * 원칙
 *  - 가격·기간·인원·포함 내역은 tours.json 에서 그때그때 만든다. 본문에 금액을 복사해 두지 않는다.
 *  - 지역 전체의 특성이 아니라 "아래 상품에 적힌 조건"만 말한다.
 *  - 남은 출발일이 없는 상품(판매 종료)은 자동으로 빠진다. 값이 없는 칸은 "확인 필요"로 둔다.
 *  - 후보 지역: 오키나와·클락·치앙마이 (판매 데이터가 있는 지역만 표시)
 */
const SITE = "https://www.padotour.com";
const PATH = "/guide/busan-winter-golf";
const REGIONS = [
  { key: "오키나와", name: "오키나와", countryCode: "japan" },
  { key: "클락", name: "클락", countryCode: "philippines" },
  { key: "치앙마이", name: "치앙마이", countryCode: "thailand" },
] as const;
const PER_REGION = 4; // 지역별 대표 상품 수(낮은 요금 순) — 나머지는 지역 목록 링크

const fmtWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const ymd = (iso: string) => `${Number(iso.slice(0, 4))}년 ${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일`;
const ym = (iso: string) => `${Number(iso.slice(0, 4))}년 ${Number(iso.slice(5, 7))}월`;

type Row = {
  tour: Tour;
  first: string;
  last: string;
  low: number;
  lowDate: string;
  stay: string;
  people: string;
  minPeople: number | null;
  room: number;
  rounds: string;
  inc: string[];
  localOut: string[];
};

const winterMonth = (iso: string) => /^\d{4}-(11|12|01|02|03)-/.test(iso);

function build(): { region: (typeof REGIONS)[number]; rows: Row[] }[] {
  const today = kstTodayIso();
  return REGIONS.map((region) => {
    const rows: Row[] = [];
    for (const t of tours) {
      if (!(t.departure === "busan" || t.departure === "both")) continue;
      if (!(t.region ?? "").includes(region.key)) continue;
      // 남은 출발일 가운데 겨울(11~3월) 출발만 비교 대상 — 지난 날짜·여름 출발은 뺀다
      const winter = (t.departurePrices ?? []).filter((d) => d.date >= today && winterMonth(d.date) && d.price > 0);
      if (winter.length === 0) continue;
      const sum = departureSummary({ ...t, departurePrices: winter });
      if (!sum) continue;
      const pc = withLocalCosts(parsePeopleCondition(t.minPeople), t.excludes);
      const people = pc.minDeparture != null ? (pc.chip || `${pc.minDeparture}인부터`) : "확인 필요";
      const holes = t.holes != null ? String(t.holes).split("\n")[0].trim() : "";
      const rounds =
        [typeof t.roundsIncluded === "number" && t.roundsIncluded > 0 ? `${t.roundsIncluded}라운드` : "", /^\d+$/.test(holes) ? `${holes}홀` : holes]
          .filter(Boolean)
          .join(" ") || "확인 필요";
      rows.push({
        tour: t,
        first: sum.first,
        last: sum.last,
        low: sum.lowPrice,
        lowDate: sum.cheapestDate,
        stay: t.nights && t.days ? stayText(t.nights, t.days) : "확인 필요",
        people,
        minPeople: pc.minDeparture,
        room: roomBasisOf(t),
        rounds,
        inc: ["항공", "그린피", "카트", "캐디"].filter((k) => t.includes.some((i) => i.includes(k))),
        localOut: t.excludes.filter((x) => /캐디|카트|싱글|팁|샌딩|송영/.test(x)).slice(0, 3),
      });
    }
    rows.sort((a, b) => a.low - b.low);
    return { region, rows };
  }).filter((g) => g.rows.length > 0);
}

function span(groups: ReturnType<typeof build>) {
  const all = groups.flatMap((g) => g.rows);
  const firsts = all.map((r) => r.first).sort();
  const lasts = all.map((r) => r.last).sort();
  return { first: firsts[0], last: lasts[lasts.length - 1], count: all.length };
}

export function generateMetadata(): Metadata {
  const groups = build();
  const s = groups.length ? span(groups) : null;
  const range = s ? `${ym(s.first)}~${ym(s.last)} 출발` : "";
  const names = groups.map((g) => g.region.name).join("·");
  const title = `부산 출발 겨울 골프여행 비교 ${names}${range ? ` (${range})` : ""} - 여행의파도`;
  const description = `김해공항 출발 겨울 골프여행 ${names} 판매 상품을 기간·라운드·인원 조건·요금 기준으로 비교합니다. 조건은 아래 각 상품에 적힌 내용 기준입니다.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}${PATH}` },
    openGraph: { title, description, url: `${SITE}${PATH}` },
  };
}

export default function BusanWinterGolfPage() {
  const groups = build();
  const s = groups.length ? span(groups) : null;
  const items = groups.flatMap((g) => g.rows.slice(0, PER_REGION));

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: SITE },
          { "@type": "ListItem", position: 2, name: "부산 출발", item: `${SITE}/busan` },
          { "@type": "ListItem", position: 3, name: "겨울 골프여행 비교", item: `${SITE}${PATH}` },
        ],
      },
      {
        "@type": "ItemList",
        name: "부산 출발 겨울 골프여행 비교 상품",
        itemListElement: items.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.tour.title, url: `${SITE}/tours/${r.tour.id}` })),
      },
    ],
  };

  const regionSummary = (rows: Row[]) => ({
    stays: [...new Set(rows.map((r) => r.stay))].join(" / "),
    // 상품마다 인원 조건이 달라 한 줄로 합치지 않고 최소 인원별 상품 수로 센다 (추가·조인 조건은 상품 카드에서 확인)
    people: (() => {
      const n = new Map<number, number>();
      let unknown = 0;
      for (const r of rows) {
        if (r.minPeople == null) unknown++;
        else n.set(r.minPeople, (n.get(r.minPeople) ?? 0) + 1);
      }
      const parts = [...n.entries()].sort((a, b) => a[0] - b[0]).map(([k, c]) => `${k}인부터 ${c}개`);
      if (unknown) parts.push(`확인 필요 ${unknown}개`);
      return parts.join(" · ");
    })(),
    first: rows.map((r) => r.first).sort()[0],
    last: rows.map((r) => r.last).sort().slice(-1)[0],
    lowest: rows[0],
  });

  return (
    <div className="bg-page-bg min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <p className="text-sm font-semibold mb-2 text-white/80">부산(김해) 출발 · 겨울 골프여행</p>
          <h1 className="text-2xl md:text-4xl font-black break-keep">부산 출발 겨울 골프여행 비교</h1>
          {s && <p className="mt-3 text-white/90 break-keep">{ymd(s.first)} ~ {ymd(s.last)} 사이 출발하는 상품 {s.count}개 기준</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
        {groups.length === 0 ? (
          <p className="text-body-text">
            지금은 비교할 수 있는 부산 출발 겨울 상품이 없습니다. 전체 상품은 <Link href="/tours?departure=busan" className="text-brand-blue underline">부산 출발 목록</Link>에서 확인해 주세요.
          </p>
        ) : (
          <>
            <section>
              <h2 className="text-xl font-black text-main-text mb-3">고르기 전에 알아둘 점</h2>
              <ul className="space-y-2 text-body-text leading-relaxed break-keep list-disc pl-5">
                <li>최소 출발 인원은 상품마다 다릅니다. 2인으로 갈 수 있는지는 아래 &lsquo;인원&rsquo; 칸과 상품 상세에서 확인해 주세요.</li>
                <li>표의 숫자는 지역 전체가 아니라 <b>이 페이지에 올라온 상품</b>에 적힌 조건입니다.</li>
                <li>요금은 1인 기준이고 출발일마다 달라집니다. 남은 출발일 중 가장 낮은 요금과 그 날짜를 적었습니다.</li>
              </ul>
            </section>

            <section aria-labelledby="cmp">
              <h2 id="cmp" className="text-xl font-black text-main-text mb-3">지역별 비교</h2>
              <div className="hidden md:block overflow-hidden rounded-xl border border-line bg-white">
                <table className="w-full text-sm text-left">
                  <caption className="sr-only">부산 출발 겨울 골프여행 지역별 비교표</caption>
                  <thead className="bg-soft-blue text-main-text">
                    <tr>
                      <th scope="col" className="p-3">지역</th>
                      <th scope="col" className="p-3">출발 공항</th>
                      <th scope="col" className="p-3">기간(상품별)</th>
                      <th scope="col" className="p-3">출발 가능 기간</th>
                      <th scope="col" className="p-3">인원 조건</th>
                      <th scope="col" className="p-3">낮은 요금(1인)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(({ region, rows }) => {
                      const r = regionSummary(rows);
                      return (
                        <tr key={region.key} className="border-t border-line align-top">
                          <th scope="row" className="p-3 font-bold text-main-text">{region.name}<span className="block text-xs font-normal text-slate-ink">{rows.length}개 상품</span></th>
                          <td className="p-3">부산(김해)</td>
                          <td className="p-3 break-keep">{r.stays}</td>
                          <td className="p-3 break-keep">{ymd(r.first)} ~ {ymd(r.last)}</td>
                          <td className="p-3 break-keep">{r.people}</td>
                          <td className="p-3"><b className="text-red-600">{fmtWon(r.lowest.low)}</b><span className="block text-xs text-slate-ink">{ymd(r.lowest.lowDate)} 출발 · {r.lowest.room}인 1실 기준</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-3">
                {groups.map(({ region, rows }) => {
                  const r = regionSummary(rows);
                  return (
                    <dl key={region.key} className="bg-white border border-line rounded-xl p-4 text-sm space-y-1.5 break-keep">
                      <dt className="text-lg font-black text-main-text">{region.name} <span className="text-xs font-normal text-slate-ink">{rows.length}개 상품</span></dt>
                      <dd><span className="text-slate-ink">출발 공항 </span>부산(김해)</dd>
                      <dd><span className="text-slate-ink">기간 </span>{r.stays}</dd>
                      <dd><span className="text-slate-ink">출발 가능 기간 </span>{ymd(r.first)} ~ {ymd(r.last)}</dd>
                      <dd><span className="text-slate-ink">인원 조건 </span>{r.people}</dd>
                      <dd><span className="text-slate-ink">낮은 요금(1인) </span><b className="text-red-600">{fmtWon(r.lowest.low)}</b> ({ymd(r.lowest.lowDate)} 출발 · {r.lowest.room}인 1실 기준)</dd>
                    </dl>
                  );
                })}
              </div>
            </section>

            {groups.map(({ region, rows }) => (
              <section key={region.key} aria-labelledby={`r-${region.key}`}>
                <h2 id={`r-${region.key}`} className="text-xl font-black text-main-text mb-1">{region.name} 골프여행 상품</h2>
                <p className="text-sm text-slate-ink mb-4">낮은 요금 순 {Math.min(PER_REGION, rows.length)}개 · 조건은 각 상품 상세 기준</p>
                <ul className="space-y-3">
                  {rows.slice(0, PER_REGION).map((r) => (
                    <li key={r.tour.id}>
                      <Link href={`/tours/${r.tour.id}`} className="block bg-white border border-line rounded-xl p-4 hover:bg-soft-blue transition-colors">
                        <p className="font-bold text-main-text break-keep">{r.tour.title}</p>
                        <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-body-text break-keep">
                          <div><dt className="inline text-slate-ink">기간 </dt><dd className="inline">{r.stay}</dd></div>
                          <div><dt className="inline text-slate-ink">라운드 </dt><dd className="inline">{r.rounds}{r.tour.golfCourse ? ` · ${r.tour.golfCourse}` : ""}</dd></div>
                          <div><dt className="inline text-slate-ink">숙소 </dt><dd className="inline">{r.tour.hotel ?? "확인 필요"}</dd></div>
                          <div><dt className="inline text-slate-ink">인원 </dt><dd className="inline">{r.people}</dd></div>
                          <div><dt className="inline text-slate-ink">출발 </dt><dd className="inline">{ymd(r.first)} ~ {ymd(r.last)}</dd></div>
                          <div><dt className="inline text-slate-ink">포함 </dt><dd className="inline">{r.inc.length ? r.inc.join("·") : "상품 상세에서 확인"}</dd></div>
                          {r.localOut.length > 0 && <div className="sm:col-span-2"><dt className="inline text-slate-ink">현지 별도 </dt><dd className="inline">{r.localOut.join(", ")}</dd></div>}
                        </dl>
                        <p className="mt-2 text-sm"><b className="text-red-600">{fmtWon(r.low)}</b> <span className="text-slate-ink">(1인 · {r.room}인 1실 · {ymd(r.lowDate)} 출발 기준)</span></p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-center">
                  <Link
                    href={`/tours?country=${region.countryCode}&region=${encodeURIComponent(region.key)}&departure=busan`}
                    className="inline-flex items-center justify-center min-h-11 px-6 rounded-full border-2 border-brand-blue text-brand-blue font-bold hover:bg-soft-blue"
                  >
                    {region.name} 부산 출발 상품 전체 보기{rows.length > PER_REGION ? ` (${rows.length}개)` : ""}
                  </Link>
                </div>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-black text-main-text mb-3">예약 전에 확인할 조건</h2>
              <ul className="space-y-2 text-body-text leading-relaxed break-keep list-disc pl-5">
                <li>최소 출발 인원에 못 미치면 예약이 확정되지 않을 수 있습니다.</li>
                <li>표의 최저 요금은 해당 날짜·객실 기준이며, 다른 출발일은 상품 상세의 출발일 달력에서 날짜별로 확인하셔야 합니다.</li>
                <li>캐디·카트 등 현지에서 따로 내는 비용은 상품마다 다릅니다. 각 상품의 불포함 내역을 확인해 주세요.</li>
                <li>항공 시간과 비운항일은 항공사 사정으로 바뀔 수 있습니다.</li>
              </ul>
              <p className="mt-4 text-body-text">상담: 010-5301-5250 (여행의파도)</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
