// 작은 국기 (사장님 지시 2026-10-25, 카드 기본 정보형)
// 그림은 /public/flags/*.png (flagcdn w40, 퍼블릭 도메인) — 바깥 요청 없음. 대체 글자는 국가명.
const FLAGS: Record<string, string> = {
  "일본": "jp", "중국": "cn", "태국": "th", "베트남": "vn", "말레이시아": "my",
  "필리핀": "ph", "괌": "gu", "사이판": "mp", "인도네시아": "id",
};

export default function CountryFlag({ country, className = "w-5 h-auto rounded-[2px] ring-1 ring-black/10" }: { country: string; className?: string }) {
  const code = FLAGS[country];
  if (!code) return null;
  // 20px 작은 깃발이라 next/image 최적화 불필요
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/flags/${code}.png`} alt={`${country} 국기`} width={20} height={14} loading="lazy" className={className} />;
}
