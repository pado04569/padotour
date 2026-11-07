/**
 * 상품의 인원 조건(tours.json minPeople) 해석 — 칩·문의 기본값·인원 선택 제한·?people= 검증·목록 필터가 모두 이 결과 하나를 쓴다.
 * (챗GPT 감사 10/27: peopleInfo 와 strictMinPeople 이 서로 다르게 해석해 4인 출발 상품에서 2·3명 문의가 가능했다)
 *
 * 원칙
 *  - 글에서 처음 나온 숫자 하나로 모든 뜻을 정하지 않는다. 최소 출발 인원 · 표시 요금 기준 · 객실 기준 · 항공 운임 기준 · 추가금 여부를 따로 읽는다.
 *  - 원문에 없는 출발 가능 인원·요금 기준·추가금 액수는 만들지 않는다. 확실하지 않으면 null 로 두고 '확인 필요'로 보여 준다.
 *  - 인원을 곱한 합계는 만들지 않는다.
 *  - 순수 TypeScript(import 없음) — scripts/test-people-condition.mjs 가 그대로 불러 검증한다.
 */

export type ExtraKind = "none" | "surcharge" | "varies";

export type PeopleClause = {
  /** 원문 한 덩어리 (괄호 안을 , · — 로 나눈 것) */
  text: string;
  kind: "surcharge" | "varies" | "condition";
  /** 이 덩어리가 적용되는 인원 (예: "2~3인은 추가요금" → [2, 3]). 알 수 없으면 null */
  counts: number[] | null;
};

export type PeopleCondition = {
  raw: string;
  /** 최소 출발 인원. 원문으로 알 수 없으면 null (인원 제한을 걸지 않는다) */
  minDeparture: number | null;
  /** 표시 요금이 어느 인원 기준인지 */
  priceBasis: number | null;
  /** 객실 사용 기준 ("2인 1실 기준") — 출발 인원이 아니다 */
  roomBasis: number | null;
  /** 항공 운임 기준 인원 (항공 4인 그룹 운임) — 최소 출발 인원이 아니다 */
  airfareBasis: number | null;
  /** 모집 정원 ("24명 (선착순 한정)") — 최소 출발 인원이 아니다 */
  capacity: number | null;
  extra: ExtraKind;
  clauses: PeopleClause[];
  /** 출발 인원을 예약 때 확인해야 하는 상품 */
  needsConfirm: boolean;
  /** 화면에 보일 짧은 칩. 없으면 "" */
  chip: string;
  /** "표시 요금은 4인 출발 기준" */
  basisText: string;
  /** 항공 운임 안내 */
  airfareText: string;
  /** 추가금·인원별 요금이 아닌 출발 조건(조인·시즌 등) — 인원 조건 목록에 보존 */
  conditionLines: string[];
  /** 추가금·인원별 요금 확인 원문 */
  extraLines: string[];
  /** 불포함 내역 가운데 인원 수에 따라 금액이 달라지는 현지 비용(샌딩·송영비 등) 원문 — withLocalCosts 가 채운다 */
  localLines: string[];
};

// 호출마다 새 객체 — 배열을 공유하면 앞 상품의 덩어리가 뒤 상품에 섞인다
const empty = (): PeopleCondition => ({
  raw: "", minDeparture: null, priceBasis: null, roomBasis: null, airfareBasis: null, capacity: null,
  extra: "none", clauses: [], needsConfirm: false, chip: "", basisText: "", airfareText: "", conditionLines: [], extraLines: [], localLines: [],
});

/** 칩 꼬리 — 현지에서 내는 비용이 인원별로 다를 때 (상품 요금에 더해지는 '추가비용 별도'와 구분, 2026-11-07 작업지시서) */
export const LOCAL_TAIL = " · 2~3인은 현지비용 추가"; // 사장님 B안 선택 2026-11-08 (Codex A 6.5 / B 8)

const MONEY_RE = /\$\s*\d|\d[\d,]*\s*(?:원|위안|바트|불|달러|엔|링깃|페소|만\s*원)|[¥€£]\s*\d|RM\s*\d|HKD\s*\d/;
const LOCAL_NONE_RE = /추가\s*(?:요금|비용)?\s*없|인원\s*(?:상관없이|무관)/;
/** 객실·캐디·카트 배정 기준("2인 1실"·"2인 1캐디"·"1인 1카트")은 출발 인원이 아니다 */
const UNIT_BASIS_RE = /\d\s*(?:인|명)\s*1\s*(?:실|캐디|카트|카|룸|대)/g;
const LOCAL_MARK_WORDS = "이상|미만|이하|기준|출발|라운딩|플레이|팀당|단독|부터";

/**
 * 불포함 줄 가운데 '인원 수에 따라 금액이 달라지는' 줄만 고른다 (작업지시서 2026-11-07).
 *  - 잡는 것: 금액이 있고 ①서로 다른 인원 수가 둘 이상("4인 $50 / 3인 $70 / 2인 $100") 또는 ②최소 출발 인원보다 큰 인원에 기준·이상·미만 같은 말("1인 $60 (4인 기준)", "4인 미만 시 …")
 *  - 안 잡는 것: "2인 1실"·"2인 1캐디" 같은 배정 기준, "추가요금 없음"·"인원 무관", 최소 출발 인원 자체만 적힌 줄("(2인 기준)")
 */
export function localPeopleLines(excludes: readonly string[] | undefined, minDeparture: number | null): string[] {
  const min = minDeparture ?? 2;
  const out: string[] = [];
  for (const line of excludes ?? []) {
    if (LOCAL_NONE_RE.test(line)) continue;
    const l = line.replace(UNIT_BASIS_RE, " ");
    if (!MONEY_RE.test(l)) continue;
    const counts = Array.from(l.matchAll(/(\d)\s*(?:인|명)/g), (m) => Number(m[1])).filter((n) => n >= 2);
    const distinct = Array.from(new Set(counts));
    // 모든 인원이 최소 출발 인원보다 적으면(4인 출발 상품의 "2인·3인 플레이 추가") 출발 인원별 차이가 아니다
    if (!distinct.some((n) => n >= min)) continue;
    if (distinct.length >= 2) { out.push(line); continue; }
    if (distinct.length === 1 && distinct[0] > min && new RegExp(`${distinct[0]}\\s*(?:인|명)\\s*(?:${LOCAL_MARK_WORDS})`).test(l)) out.push(line);
  }
  return out;
}

/** 불포함 줄의 인원별 현지 비용을 인원 조건에 얹는다. 금액은 합산하지 않고 원문 줄을 그대로 보존한다 */
export function withLocalCosts(c: PeopleCondition, excludes: readonly string[] | undefined): PeopleCondition {
  const localLines = localPeopleLines(excludes, c.minDeparture);
  if (!localLines.length) return c;
  const next: PeopleCondition = { ...c, localLines };
  if (next.minDeparture && next.extra === "none") next.chip = `${next.minDeparture}인 출발 가능${LOCAL_TAIL}`;
  return next;
}

const NONE_RE = /(?:추가\s*(?:비용|요금)?|비용|요금|싱글카트비)\s*(?:은\s*)?(?:없|불필요)|추가\s*없|없이|없음/;
const SURCHARGE_RE = /추가|별도|\$\s*\d|\+\s*\d|\d[\d,]*\s*원|\d+\s*만\s*원?|합계|\d+\s*위안|\d+\s*바트/;
const VARIES_RE = /차등|상이|인원별|인원에\s*따라|문의/;
const AIRFARE_RE = /운임/;
const BASIS_RE = /(\d+)\s*인\s*(?:출발\s*|셀프\s*플레이\s*)?기준(?!\s*요금\s*상이)(?:\s*요금)?/;
/** 출발 조건으로 보존할 말 — 조인·시즌·확정·독채처럼 인원 안내에 필요한 것만 */
const KEEP_CONDITION_RE = /조인|시즌|비수기|성수기|연휴|주말|주중|확정|충족|독채|팀\s*단위|단독|플레이|싱글|보장|현장|현지/;

const num = (v: string | undefined) => (v ? Number(v) : NaN);

/** 덩어리가 말하는 인원 — "2~3인은" [2,3], "2인·3인은" [2,3], "4인 미만" [최소 인원~3], "3인 싱글룸 추가" [3]. "4인 기준 요금"은 인원이 아니라 기준이므로 null */
function countsOf(clause: string, floor: number): number[] | null {
  let m: RegExpMatchArray | null;
  if ((m = clause.match(/^(\d)\s*~\s*(\d)\s*인/))) {
    const out: number[] = [];
    for (let n = num(m[1]); n <= num(m[2]); n++) out.push(n);
    return out;
  }
  if ((m = clause.match(/^(\d)\s*인\s*[·,]\s*(\d)\s*인/))) return [num(m[1]), num(m[2])];
  if ((m = clause.match(/^(\d)\s*인\s*미만/))) { const out: number[] = []; for (let n = floor; n < num(m[1]); n++) out.push(n); return out; }
  if (/^\d\s*인\s*(?:출발\s*|셀프\s*플레이\s*)?기준/.test(clause)) return null;
  if ((m = clause.match(/^(\d)\s*인(?!\s*1실)/))) return [num(m[1])];
  return null;
}

/** 괄호 안 글을 덩어리로 — 쉼표(숫자 사이 천 단위 쉼표 제외) · " · " · " — " 로 나눈다 */
function splitClauses(inner: string): string[] {
  return inner
    .split(/,(?!\d{3})|\s·\s|\s[—–-]\s/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function classify(clause: string): "none" | "surcharge" | "varies" | "condition" | "airfare" | "basis" {
  if (AIRFARE_RE.test(clause)) return "airfare";
  if (NONE_RE.test(clause)) return "none";
  if (BASIS_RE.test(clause) && !SURCHARGE_RE.test(clause.replace(BASIS_RE, ""))) return "basis";
  if (SURCHARGE_RE.test(clause)) return "surcharge";
  if (VARIES_RE.test(clause)) return "varies";
  return "condition";
}

export function parsePeopleCondition(input: unknown): PeopleCondition {
  // 숫자
  if (typeof input === "number") {
    return finalize({ ...empty(), raw: String(input), minDeparture: input > 0 ? input : null });
  }
  const raw = String(input ?? "").trim();
  if (!raw) return empty();

  // 괄호 덩어리를 모두 모은다 (첫 괄호만 쓰면 뒤쪽 조건이 사라진다)
  const groups: string[] = [];
  const head = raw.replace(/\(([^)]*)\)/g, (_, g: string) => { groups.push(g); return " "; }).replace(/\s+/g, " ").trim();
  const clauseTexts = groups.flatMap(splitClauses);

  const c: PeopleCondition = { ...empty(), raw };
  let headMin: number | null = null;
  let m: RegExpMatchArray | null;

  if (/^항공/.test(head)) {
    // 항공 운임 기준 — 최소 출발 인원으로 읽지 않는다
    c.airfareBasis = num(head.match(/(\d+)\s*인/)?.[1]) || null;
  } else if (/^\d+\s*명/.test(head)) {
    c.capacity = num(head.match(/^(\d+)/)?.[1]) || null; // "24명 (선착순)" 모집 정원
  } else if ((m = head.match(/^(\d+)\s*인\s*1실/))) {
    c.roomBasis = num(m[1]); // 객실 기준
  } else if ((m = head.match(/^(\d+)\s*인/))) {
    const n = num(m[1]);
    if (/^\d+\s*인\s*(?:출발\s*|셀프\s*플레이\s*)?기준/.test(head)) {
      c.priceBasis = n; // "4인 기준 요금" — 요금 기준일 뿐 최소 출발 인원은 아래 덩어리가 정한다
    } else {
      headMin = n;
    }
  }

  // 덩어리 분류
  let low: number | null = null;
  for (const text of clauseTexts) {
    const kind = classify(text);
    if (kind === "none") continue;
    if (kind === "airfare") {
      c.airfareBasis = c.airfareBasis ?? (num(text.match(/(\d+)\s*인/)?.[1]) || null);
      c.extra = c.extra === "surcharge" ? "surcharge" : "varies";
      continue;
    }
    const basis = text.match(BASIS_RE);
    if (basis) c.priceBasis = c.priceBasis ?? num(basis[1]);
    if (kind === "basis") continue;
    const counts = countsOf(text, headMin ?? 2);
    c.clauses.push({ text, kind, counts });
    if (kind === "surcharge" || kind === "varies") c.extra = c.extra === "surcharge" || kind === "surcharge" ? "surcharge" : "varies";
    // 적은 인원이 추가요금으로 '출발'하는 경우 그 인원이 최소 출발 인원이다.
    // "2인 플레이 … 추가"는 2인 출발이 아니라 플레이 조건이므로 제외한다.
    if (kind === "surcharge" && counts && !/플레이/.test(text)) {
      const lo = Math.min(...counts);
      if (low === null || lo < low) low = lo;
    }
  }
  if (head && /출발 인원은 예약 시 확인|예약\s*(?:시|때)\s*확인/.test(raw)) c.needsConfirm = true;
  if (/^항공/.test(head) || c.roomBasis) c.needsConfirm = c.needsConfirm || c.roomBasis != null;

  // 최소 출발 인원: 머리말 숫자 → 없으면 적은 인원 추가요금 덩어리
  const base = headMin ?? c.priceBasis ?? null;
  if (headMin !== null) {
    c.minDeparture = low !== null && low < headMin ? low : headMin;
    // "4인 (2~3인은 추가요금)"은 표시 요금이 4인 기준이다
    if (low !== null && low < headMin && c.priceBasis === null) c.priceBasis = headMin;
  } else if (low !== null) {
    c.minDeparture = low; // "4인 기준 (2인 출발 1인 3만원 추가)", "2인 1실 기준 요금 (1인 출발은 싱글룸 추가)"
    if (c.priceBasis === null && base !== null) c.priceBasis = base;
  } else {
    c.minDeparture = null;
  }
  // "4인 미만 출발 시 추가"는 4인 이상이 기준 요금이라는 뜻
  for (const cl of c.clauses) {
    const mm = cl.text.match(/^(\d)\s*인\s*미만/);
    if (mm && c.priceBasis === null && cl.kind === "surcharge") c.priceBasis = num(mm[1]);
  }

  return finalize(c);
}

function finalize(c: PeopleCondition): PeopleCondition {
  const min = c.minDeparture;
  c.extraLines = c.clauses.filter((x) => x.kind !== "condition").map((x) => x.text);
  c.conditionLines = c.clauses.filter((x) => x.kind === "condition" && KEEP_CONDITION_RE.test(x.text)).map((x) => x.text);

  const tail = c.extra === "surcharge" ? " · 추가비용 별도" : c.extra === "varies" ? " · 인원별 요금 확인" : "";
  if (min) c.chip = `${min}인 출발 가능${tail}`;
  else if (c.needsConfirm) c.chip = "출발 인원은 예약 시 확인";
  else if (c.airfareBasis) c.chip = `항공 ${c.airfareBasis}인 그룹 운임 기준`;

  if (c.priceBasis && (min === null || c.priceBasis > min)) c.basisText = `표시 요금은 ${c.priceBasis}인 출발 기준`;
  if (c.airfareBasis) c.airfareText = `항공 운임은 ${c.airfareBasis}인 그룹 기준 · 소인원은 운임 확인 필요`;
  return c;
}

/** 이 인원으로 문의할 수 있는가 — 최소 출발 인원 미만이면 false */
export function peopleAllowed(c: PeopleCondition, people: number): boolean {
  return c.minDeparture == null || people >= c.minDeparture;
}

/**
 * 선택한 인원에 해당하는 추가요금 안내. 금액은 합산하지 않고 원문 그대로 보여 준다.
 *  - 그 인원에게 적용되는 덩어리가 있으면 그것만 (4명을 골랐는데 2·3명용 추가금을 보여 주지 않는다)
 *  - 인원이 안 적힌 덩어리는 표시 요금 기준보다 적을 때(기준이 없으면 항상)만
 */
export function selectionNotes(c: PeopleCondition, people: number): string[] {
  const out: string[] = [];
  for (const cl of c.clauses) {
    if (cl.kind === "condition") continue;
    if (cl.counts) {
      if (cl.counts.includes(people)) out.push(cl.text);
    } else if (c.priceBasis == null || people < c.priceBasis) {
      out.push(cl.text);
    }
  }
  return out;
}

/** 검색 인원이 최소 출발 인원보다 적을 때 보여 줄 한 줄 */
export function shortPeopleNotice(c: PeopleCondition, asked: number): string {
  return c.minDeparture != null && asked < c.minDeparture
    ? `검색하신 ${asked}명은 이 상품의 최소 출발 인원(${c.minDeparture}명) 미만이라 ${c.minDeparture}명으로 맞췄어요.`
    : "";
}

/** 인원 선택지 — 1인 출발이 명시된 상품만 1명부터 */
export function peopleOptionsFor(c: PeopleCondition | null | undefined, base: number[]): number[] {
  return c?.minDeparture === 1 && !base.includes(1) ? [1, ...base] : base;
}

/**
 * 객실 사용 기준 — 요금이 몇 인 1실 기준인가. 상품 글(제목·호텔·특징)에 "1인 1실"·"1인실 우선"이 적혀 있으면 1, 아니면 기존대로 2.
 * "1인 1실 사용 시 1박 N원"처럼 추가 요금을 설명하는 문장은 객실 기준으로 읽지 않는다.
 */
export function roomBasisOf(t: { minPeople?: unknown; title?: string; subtitle?: string; hotel?: string; hotelDesc?: string; highlights?: string[]; productSummary?: string }): 1 | 2 {
  const fromCond = parsePeopleCondition(t.minPeople).roomBasis;
  if (fromCond === 1 || fromCond === 2) return fromCond;
  const text = [t.title, t.subtitle, t.hotel, t.hotelDesc, t.productSummary, ...(t.highlights ?? [])].filter(Boolean).join("\n");
  if (/2인\s*1실/.test(text)) return 2;
  return /1인\s*1실(?!\s*(?:사용|추가|이용|요금은|은\s*1박|싱글))|1인실\s*우선/.test(text) ? 1 : 2;
}

/** 선택 인원에 해당하는 추가요금·요금 확인 안내 — 없으면 null. 금액은 합산하지 않고 원문 그대로 보여 준다 */
export function selectionInfo(c: PeopleCondition, people: number): { label: string; lines: string[] } | null {
  const lines = selectionNotes(c, people);
  if (!lines.length) return null;
  const surcharge = c.clauses.some((cl) => lines.includes(cl.text) && cl.kind === "surcharge");
  return { label: surcharge ? "추가요금 별도" : "인원별 요금 확인", lines };
}
