# -*- coding: utf-8 -*-
"""ChatGPT 전달용 content-source.md 보안 검사 (공개 저장소에 올라가기 전에 돌린다)
사용: python docs/chatgpt-content/check_sensitive.py docs/chatgpt-content/<상품ID>/content-source.md
걸리면 [CHATGPT 전달 중단] 을 찍고 종료코드 1. 지우지 않고 보고만 한다."""
import re, sys, io, os

PATTERNS = [
    ("전화번호", r"0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}"),
    ("이메일", r"[\w.+-]+@[\w-]+\.[\w.]+"),
    ("주민번호", r"\d{6}[-\s]?[1-4]\d{6}"),
    ("여권번호", r"\b[A-Z]{1,2}\d{7,8}\b"),
    ("계좌번호", r"\b\d{3,6}-\d{2,6}-\d{4,8}\b"),
    ("API 키·토큰", r"(?i)(api[_ -]?key|token|secret|password|비밀번호|sk-[A-Za-z0-9]{10,})"),
    ("원가·B2B", r"원가|지상비|입금가|B2B|공급가|마진|컴\s?\d|수익|정산|핸들링 ?차지|AGT"),
    ("거래처·담당자", r"제이홀리데이|J-?holiday|랜드사|거래처|담당자|소장|차장|주임|과장|이사님|대표님"),
    ("내부 메모", r"_인계|_원본|밴드 글|band\.us|메모리|reasons\.json|TODO"),
    ("고객 정보", r"고객명|예약자|손님 이름|여권"),
]
# 고객 안내문으로 공개돼도 되는 낱말 (위 패턴에 걸리지만 허용)
ALLOW = {"여권 제출", "여권 제출,", "지상비 기준", "핸들링 차지 50,000원"}

p = sys.argv[1]
t = io.open(p, encoding="utf-8").read()
hits = []
for name, rx in PATTERNS:
    for m in re.finditer(rx, t):
        line = t[: m.start()].count("\n") + 1
        ctx = t[max(0, m.start() - 25): m.end() + 25].replace("\n", " ")
        if any(a in ctx for a in ALLOW):
            continue
        hits.append((name, line, m.group(0), ctx))
if hits:
    print("[CHATGPT 전달 중단]", len(hits), "건")
    for h in hits:
        print(f"- {h[0]} | {h[1]}줄 | '{h[2]}' | …{h[3]}…")
    sys.exit(1)
print("보안 검사 통과: 걸린 항목 0건 —", os.path.relpath(p))
