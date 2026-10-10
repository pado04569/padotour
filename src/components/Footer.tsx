import Link from "next/link";
import ExternalVerificationButton from "./ExternalVerificationModal";

type FooterProps = {
  departure?: "incheon" | "busan";
};

// 아직 확인되지 않은 사업자 정보는 빈 값으로 두세요 — 값이 있을 때만 화면에 표시됩니다.
const businessInfo = {
  address: "서울특별시 마포구 토정로35길 11, 5층 5427호(용강동, 인우빌딩)",
  mailOrderNumber: "", // 통신판매업 미신고
  email: "pado-tour-@naver.com",
};

const KAKAO_CHAT = "https://pf.kakao.com/_bxoxnXxj/chat";

const info = {
  incheon: {
    phones: [
      { href: "tel:01053015250", label: "010-5301-5250" },
      { href: "tel:0264015252", label: "02-6401-5252" },
    ],
    blog: "https://blog.naver.com/pado-tour-",
    band: "https://band.us/@padotour",
  },
  busan: {
    phones: [
      { href: "tel:01053015250", label: "010-5301-5250" },
      { href: "tel:07047985252", label: "070-4798-5252 (부산)" },
    ],
    blog: "https://blog.naver.com/padoro-52so",
    band: "https://band.us/@padoro52so",
  },
  default: {
    phones: [
      { href: "tel:0264015252", label: "02-6401-5252" },
      { href: "tel:07047985252", label: "070-4798-5252 (부산)" },
    ],
    blog: "https://blog.naver.com/pado-tour-",
    band: "https://band.us/@padotour",
  },
};

// 아이콘은 모두 같은 브랜드 블루 + 옅은 블루 배경으로 통일 (사장님 지적 10/10: 색이 제각각이면 앱 메뉴처럼 보인다)
const ICON = "flex-none w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center";
const SVG = { viewBox: "0 0 24 24", className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const PhoneIcon = () => <svg {...SVG}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>;
const ChatIcon = () => <svg {...SVG}><path d="M12 4C6.9 4 3 7.1 3 10.9c0 2.5 1.7 4.6 4.2 5.8L6.4 20l3.9-2.5c.6.1 1.1.1 1.7.1 5.1 0 9-3.1 9-6.9S17.1 4 12 4z" /></svg>;
const DocIcon = () => <svg {...SVG}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>;
const ShieldIcon = () => <svg {...SVG}><path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 9.5-4-1.8-7-5.2-7-9.5V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>;

function QuickCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <>
      <span className={ICON}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-base md:text-[17px] font-extrabold text-slate-900">{title}</span>
        <span className="block text-[13px] md:text-sm text-slate-500 mt-0.5 break-keep">{sub}</span>
      </span>
    </>
  );
}

// 꼬리말 — 위: 밝은 바탕 빠른 상담 4개 / 아래: 남색 브랜드·상담센터·빠른 메뉴·사업자 정보 (사장님 확정 F2, 2026-10-10)
export default function Footer({ departure }: FooterProps) {
  const d = departure ? info[departure] : info.default;
  const card =
    "flex flex-col md:flex-row items-start md:items-center gap-2.5 md:gap-3.5 p-3.5 md:px-5 md:py-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition text-left";

  const menu: { label: string; href: string; external?: boolean; key?: boolean }[] = [
    { label: "회사소개", href: "/about" },
    { label: "왜 여행의 파도인가요?", href: "/about#why-padotour", key: true },
    { label: "골프장 소개", href: "/courses" },
    { label: "고객 후기", href: "/reviews" },
    { label: "예약/문의 확인", href: "/my-inquiries" },
    { label: "네이버 블로그", href: d.blog, external: true },
    { label: "네이버 밴드", href: d.band, external: true },
    { label: "카카오톡", href: KAKAO_CHAT, external: true },
  ];

  return (
    <footer>
      {/* 빠른 상담 — 휴대폰 2×2, PC 4칸 */}
      <div className="bg-slate-100 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-5 md:py-6 grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
          <a href={d.phones[0].href} className={card}>
            <QuickCard icon={<PhoneIcon />} title="전화 상담" sub={d.phones[0].label} />
          </a>
          <a href={KAKAO_CHAT} target="_blank" rel="noopener noreferrer" className={card}>
            <QuickCard icon={<ChatIcon />} title="카카오 상담" sub="간편하게 문의하세요" />
          </a>
          <Link href="/my-inquiries" className={card}>
            <QuickCard icon={<DocIcon />} title="예약/문의 확인" sub="접수한 문의를 확인하세요" />
          </Link>
          <ExternalVerificationButton className={card}>
            <QuickCard icon={<ShieldIcon />} title="등록·보증 확인" sub="여행사 등록정보 확인" />
          </ExternalVerificationButton>
        </div>
      </div>

      <div className="bg-[#13253D] text-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1.1fr_1.4fr] gap-8 md:gap-10 py-8 md:py-11">
            {/* 브랜드 — 이전 시안보다 크게 (사장님 요청 +15~20%) */}
            <div>
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" alt="여행의 파도 로고" className="w-[62px] h-[62px] brightness-0 invert" />
                <div>
                  {/* 꼬리말은 인천·부산 공통 회사 영역 — 출발지 표시는 넣지 않는다 (사장님 확정 10/10) */}
                  <div className="text-2xl font-black text-white">여행의 파도</div>
                  <div className="text-[15px] text-slate-300 mt-0.5">해외 골프여행 전문 여행사</div>
                </div>
              </div>
              <p className="text-base text-slate-300 mt-4">즐거운 골프 너울거림, 여행의 파도</p>
            </div>

            {/* 상담센터 — 출발지별 번호는 기존 그대로 */}
            <div>
              <h3 className="text-base font-extrabold text-white mb-2">상담센터</h3>
              {d.phones.map((p, i) => (
                <a key={p.href} href={p.href} className={`block font-black text-blue-300 hover:text-blue-200 ${i === 0 ? "text-2xl" : "text-lg mt-0.5"}`}>
                  {p.label}
                </a>
              ))}
              <div className="text-[15px] text-slate-300 mt-3 leading-relaxed">
                <p>평일 09:00~18:00</p>
                <p>토요일 09:00~14:00</p>
                <p>일요일·공휴일 카카오톡 문의</p>
              </div>
            </div>

            {/* 빠른 메뉴 */}
            <div>
              <h3 className="text-base font-extrabold text-white mb-2">빠른 메뉴</h3>
              <ul className="grid grid-cols-2 gap-x-4">
                {menu.map((m) => (
                  <li key={m.label}>
                    {m.external ? (
                      <a href={m.href} target="_blank" rel="noopener noreferrer" className="flex items-center min-h-10 text-[15px] text-slate-200 hover:text-white">{m.label}</a>
                    ) : m.key ? (
                      // 핵심 신뢰 페이지 — 한 단계만 강조 (굵게·흰색·체크, 마우스 올리면 브랜드 블루) (사장님 요청 10/10)
                      <Link href={m.href} className="flex items-center gap-1 min-h-10 text-[15px] font-bold text-white hover:text-blue-300">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none text-blue-300" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        {m.label}
                      </Link>
                    ) : (
                      <Link href={m.href} className="flex items-center min-h-10 text-[15px] text-slate-200 hover:text-white">{m.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 사업자 정보 — 읽을 수는 있되 브랜드·상담보다 약하게. 값은 기존 그대로
              휴대폰은 가운데 정렬 + 의미 단위로만 줄바꿈(각 묶음 nowrap), PC는 가로형 그대로 (사장님 요청 10/10) */}
          <div className="border-t border-white/10 pt-5 pb-24 md:py-6 text-[13px] md:text-sm leading-relaxed text-slate-400 break-keep text-center md:text-left">
            <p className="flex flex-wrap justify-center md:justify-start gap-x-1.5 md:gap-x-3">
              <span className="whitespace-nowrap">상호 여행의 파도</span>
              <span className="md:hidden" aria-hidden="true">·</span>
              <span className="whitespace-nowrap">대표 이지안</span>
              <span className="md:hidden" aria-hidden="true">·</span>
              <span className="whitespace-nowrap">사업자번호 372-57-00613</span>
              <span className="basis-full h-0 md:hidden" aria-hidden="true" />
              <span className="whitespace-nowrap">관광사업등록번호 제 2022-000029 호</span>
              {businessInfo.mailOrderNumber && <span className="whitespace-nowrap">통신판매업신고번호 {businessInfo.mailOrderNumber}</span>}
            </p>
            {businessInfo.address && (
              <p className="mt-1 md:mt-0">
                주소 <span className="whitespace-nowrap">서울특별시 마포구</span> <span className="whitespace-nowrap">토정로35길 11,</span>
                <br className="md:hidden" />
                <span className="hidden md:inline"> </span>
                <span className="whitespace-nowrap">5층 5427호(용강동, 인우빌딩)</span>
              </p>
            )}
            {businessInfo.email && <p className="mt-1 md:mt-0">이메일 {businessInfo.email}</p>}
            {/* 저작권·요금 안내는 따로 떼어 서로 섞여 줄바꿈되지 않게 */}
            <p className="mt-3 md:mt-2 text-slate-500 text-[13px] md:text-sm">© 2026 여행의 파도. All rights reserved.</p>
            <p className="mt-1.5 md:mt-0 text-slate-500 text-[13px] md:text-sm">
              <span className="whitespace-nowrap">골프여행 요금은 항공·숙박·골프장</span>{" "}
              <span className="whitespace-nowrap">상황에 따라 변동될 수 있습니다.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
