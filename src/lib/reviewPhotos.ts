import type { Review } from "@/data/reviews";

// 후기 사진 구분 — 고객이 직접 보낸 여행 사진 / 확정서·일정표·카톡 캡처 같은 자료 (사장님 요청 2026-10-10)
// 대표 사진은 고객 사진을 먼저 쓴다. 확정서·카톡 캡처는 글씨 위주라 작게 보면 화질이 깨져 보인다.
// 파일 이름에 schedule·kakao 가 들어가면 자료로 본다. 이름과 내용이 다른 파일은 아래 목록에 적는다.
const DOCUMENT_FILES = new Set([
  "hainan-may2-fairway.jpg", // 이름은 fairway 지만 실제로는 확정서
]);

export function isDocumentImage(src: string): boolean {
  const file = src.split("/").pop() ?? "";
  return DOCUMENT_FILES.has(file) || /schedule|kakao/i.test(file);
}

export function splitReviewImages(review: Review) {
  const all = [...(review.images ?? [])];
  if (review.image && !all.includes(review.image)) all.unshift(review.image);
  const photos = all.filter((s) => !isDocumentImage(s));
  const documents = [...all.filter(isDocumentImage), ...(review.kakaoImage ? [review.kakaoImage] : [])];
  return {
    photos,
    documents,
    // 목록 썸네일: 고객 사진 → 없으면 자료 이미지(작게, 윗부분만)
    cover: photos[0] ?? documents[0],
    coverIsDocument: photos.length === 0,
  };
}
