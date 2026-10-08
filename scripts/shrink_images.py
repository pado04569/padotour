# 홈페이지 사진 용량 줄이기 — 파일 이름·형식·장수는 그대로, JPG 저장 화질만 낮춘다.
# 사용: python scripts/shrink_images.py (시험) / --apply (적용). 2026-10-08 Vercel 배포 공간 10GB 초과로 만듦 — 새 사진 올리기 전에 돌린다.
import os, sys, io
from PIL import Image, ImageOps
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "images")
APPLY = "--apply" in sys.argv
MAXSIDE, Q, MIN_BYTES = 1920, 82, 300_000
before = after = n = 0
for d, _, fs in os.walk(ROOT):
    for f in fs:
        if not f.lower().endswith((".jpg", ".jpeg")): continue
        p = os.path.join(d, f); s = os.path.getsize(p)
        if s <= MIN_BYTES: continue
        im = Image.open(p); im = ImageOps.exif_transpose(im).convert("RGB")
        if max(im.size) > MAXSIDE: im.thumbnail((MAXSIDE, MAXSIDE), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=Q, optimize=True, progressive=True)
        new = buf.getvalue()
        if len(new) > s * 0.85: continue          # 15% 미만으로 줄면 건드리지 않는다
        before += s; after += len(new); n += 1
        if APPLY:
            with open(p, "wb") as fh: fh.write(new)
print(f"{'적용' if APPLY else '시험'}: {n}장 {before/1e6:.0f}MB -> {after/1e6:.0f}MB (-{(before-after)/1e6:.0f}MB)")
