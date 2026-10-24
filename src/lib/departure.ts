// 출발지 4곳(인천·부산·청주·대구) 공통 표 (사장님 확정 10/24~25: 버튼 3개·출발지 4개)
// 헤더·꼬리말·카카오 번호는 인천·부산 두 가지뿐이라, 청주는 인천 쪽·대구는 부산 쪽 화면을 쓴다
// (청주 손님은 인천, 대구 손님은 부산을 함께 본다 — 사장님 현장 지식).
export type Dep = "incheon" | "busan" | "cheongju" | "daegu";
export type MainDep = "incheon" | "busan";

export const DEPARTURES: Dep[] = ["incheon", "busan", "cheongju", "daegu"];
export const isDep = (v: unknown): v is Dep => typeof v === "string" && (DEPARTURES as string[]).includes(v);

export const DEP_NAME: Record<Dep, string> = { incheon: "인천출발", busan: "부산출발", cheongju: "청주출발", daegu: "대구출발" };
export const DEP_AIRPORT: Record<Dep, string> = { incheon: "인천공항", busan: "부산·김해공항", cheongju: "청주공항", daegu: "대구공항" };
export const DEP_HOME: Record<Dep, string> = { incheon: "/incheon", busan: "/busan", cheongju: "/cheongju", daegu: "/daegu" };

/** 헤더·꼬리말·카카오 번호가 쓰는 인천/부산 화면 */
export const CHROME_DEP: Record<Dep, MainDep> = { incheon: "incheon", busan: "busan", cheongju: "incheon", daegu: "busan" };
