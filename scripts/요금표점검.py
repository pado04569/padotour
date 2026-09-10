# -*- coding: utf-8 -*-
"""
요금표 만료 점검기

상품마다 "마지막 출발일"을 찾아 남은 날짜를 세고,
새 요금표를 준비해야 할 상품을 알려준다.

알림 시점 (사장님 확정 2026-09-10)
  · 30일 전  — 랜드사에 새 요금표 요청할 때
  · 15일 전  — 아직 안 왔으면 다시 챙길 때
  ·  7일 전  — 지금 안 하면 상품이 사라진다

마지막 출발일 기준
  · departurePrices 가 있으면 그중 가장 늦은 날짜  (가장 정확)
  · 없으면 period 문구에서 마지막 날짜를 읽어본다   (형식이 제각각이라 실패할 수 있음)

사용법
  python 요금표점검.py           오늘 기준 점검
  python 요금표점검.py --전체     만료일 상관없이 전 상품 목록
"""
import io, os, re, sys, json
from datetime import date, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOURS = os.path.join(BASE, "src", "data", "tours.json")

ALERTS = [30, 15, 7]          # 알림 시점(일)
DEPARTURE_LABEL = {"incheon": "인천출발", "busan": "부산출발", "both": "인천·부산"}


def load_tours():
    data = json.load(io.open(TOURS, encoding="utf-8"))
    return data if isinstance(data, list) else data.get("tours", [])


def last_departure(tour):
    """마지막 출발일을 (날짜, 근거) 로 돌려준다. 못 찾으면 (None, 사유)."""
    dps = tour.get("departurePrices") or []
    dates = []
    for dp in dps:
        try:
            dates.append(datetime.strptime(dp["date"], "%Y-%m-%d").date())
        except Exception:
            pass
    if dates:
        return max(dates), "출발일별 요금표"

    # period 문구에서 마지막 날짜를 읽어본다
    period = (tour.get("period") or "").strip()
    if period:
        # "2027년 3월 13일" / "2026년 10월 24일" 형태
        ys = re.findall(r"(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일", period)
        if ys:
            y, m, d = ys[-1]
            try:
                return date(int(y), int(m), int(d)), "출발 기간 문구"
            except ValueError:
                pass
        # "2026년 7월 ~ 10월" 처럼 일자가 없으면 그 달의 말일로 본다
        ms = re.findall(r"(?:(\d{4})년\s*)?(\d{1,2})월", period)
        if ms:
            y, m = ms[-1]
            year = int(y) if y else None
            if year is None:
                yy = re.findall(r"(\d{4})년", period)
                year = int(yy[-1]) if yy else date.today().year
            m = int(m)
            nxt = date(year + (m == 12), 1 if m == 12 else m + 1, 1)
            return date.fromordinal(nxt.toordinal() - 1), "출발 기간 문구(월말 기준)"
    return None, "요금 정보 없음"


def scan(today=None):
    today = today or date.today()
    rows = []
    for t in load_tours():
        last, why = last_departure(t)
        left = (last - today).days if last else None
        rows.append({
            "id": t.get("id", ""),
            "title": t.get("title", ""),
            "departure": t.get("departure", ""),
            "price": t.get("price", ""),
            "last": last,
            "left": left,
            "why": why,
            "has_calendar": bool(t.get("departurePrices")),
        })
    return rows


def bucket(left):
    if left is None:
        return "확인필요"
    if left < 0:
        return "만료"
    if left <= 7:
        return "7일"
    if left <= 15:
        return "15일"
    if left <= 30:
        return "30일"
    return "여유"


def print_list(rows):
    """출발지별 전체 상품 목록 — 마지막 출발일 순"""
    today = date.today()
    for key in ("incheon", "busan", "both"):
        items = [r for r in rows if r["departure"] == key]
        if not items:
            continue
        items.sort(key=lambda r: (r["left"] if r["left"] is not None else 9999))
        print(f"\n■ {DEPARTURE_LABEL[key]}  {len(items)}개")
        print("-" * 86)
        for r in items:
            mark = {"만료": "🔴", "7일": "🔴", "15일": "🟠", "30일": "🟡",
                    "확인필요": "⚪", "여유": "🟢"}[bucket(r["left"])]
            when = r["last"].isoformat() if r["last"] else "확인필요"
            left = f"{r['left']:+d}일" if r["left"] is not None else "-"
            print(f"  {mark} {when}  {left:>7}  {r['price']:>12}  {r['title'][:46]}")


def main():
    show_all = "--전체" in sys.argv
    today = date.today()
    rows = scan(today)

    if "--목록" in sys.argv:
        print(f"■ 상품 목록  ({today})   전체 {len(rows)}개")
        print_list(rows)
        return

    print(f"■ 요금표 점검  ({today})   전체 {len(rows)}개 상품\n")

    order = ["만료", "7일", "15일", "30일", "확인필요"]
    label = {
        "만료": "🔴 이미 지남 — 화면에서 사라졌거나 곧 사라짐",
        "7일": "🔴 7일 이내 — 지금 바로",
        "15일": "🟠 15일 이내 — 다시 챙길 것",
        "30일": "🟡 30일 이내 — 랜드사에 요청할 것",
        "확인필요": "⚪ 출발일 정보를 읽지 못함 — 직접 확인 필요",
    }
    if show_all:
        order.append("여유")
        label["여유"] = "🟢 여유 있음"

    hit = False
    for b in order:
        items = [r for r in rows if bucket(r["left"]) == b]
        if not items:
            continue
        hit = True
        items.sort(key=lambda r: (r["left"] if r["left"] is not None else 9999))
        print(f"{label[b]}  ({len(items)}건)")
        print("-" * 78)
        for r in items:
            dep = DEPARTURE_LABEL.get(r["departure"], r["departure"])
            when = r["last"].isoformat() if r["last"] else "?"
            left = f"{r['left']:+4d}일" if r["left"] is not None else "  ?  "
            print(f"  [{dep}] {r['title'][:44]}")
            print(f"        마지막 출발 {when} ({left})  · {r['why']}")
        print()

    if not hit:
        print("당장 챙길 상품이 없습니다.\n")

    # 출발지별 요약
    print("■ 출발지별 상품 수")
    for key in ("incheon", "busan", "both"):
        n = [r for r in rows if r["departure"] == key]
        if n:
            print(f"  {DEPARTURE_LABEL[key]}: {len(n)}개")


if __name__ == "__main__":
    main()
