import Image from "next/image";
import DepartureChooser from "@/components/DepartureChooser";

// 첫 화면 — 골프장 사진을 화면 가득 + 출발공항 카드 2개 (사장님 확정 L1, 2026-10-10)
// 목표: 2초 안에 "해외 골프여행 전문 여행사"로 보이고 바로 인천/부산을 고르게.
// 사업자 정보는 사진 위에 얹으면 복잡해 보여 사진 아래 흰 줄로 분리했다.
// 휴대폰은 오른쪽 아래 카카오 버튼이 카드를 가리지 않게 카드 아래 여백을 둔다.
export default function Home() {
  return (
    <div className="bg-white">
      <section className="relative min-h-[100svh] flex flex-col text-white overflow-hidden">
        {/* 첫 화면 사진은 바로 보여야 해서 우선 불러온다 (Vercel 이미지 변환 한도를 쓰지 않게 원본 그대로) */}
        <img
          src="/images/golf-main.jpg"
          alt="해외 골프장 페어웨이와 호수"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,30,50,0.55)] via-[rgba(8,30,50,0.15)] to-[rgba(8,30,50,0.7)]" />
        {/* PC는 하늘이 넓게 보여 브랜드가 묻힌다 → 위쪽만 조금 더 어둡게 (사장님 요청 10/10) */}
        <div className="hidden md:block absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[rgba(6,24,44,0.35)] to-transparent" />

        {/* 로고 — 흰색 단색으로 사진 위에 바로 (원·유리·박스 없이, 사장님 확정 D2, 2026-10-10)
            흰색 로고 파일이 따로 없어 투명 로고(logo.png)를 화면에서만 흰색으로 바꿔 보여준다. 원본 파일은 그대로.
            하늘과 겹치는 부분은 위쪽 어두운 그라데이션 + 아주 약한 그림자로만 띄운다. */}
        {/* PC는 브랜드가 사진·메인 문구에 비해 작아 보여 로고 +25%, 이름 +18%, 여백 확대 (사장님 요청 10/10). 휴대폰은 그대로 */}
        <header className="relative px-5 md:px-16 pt-5 md:pt-7 flex items-center gap-3 md:gap-5">
          <Image
            src="/images/logo.png"
            alt="여행의 파도 로고"
            width={721}
            height={721}
            priority
            className="flex-none w-[86px] h-[86px] md:w-[120px] md:h-[120px] brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          />
          <div className="[text-shadow:0_1px_3px_rgba(0,0,0,0.25)]">
            <div className="text-2xl md:text-[33px] font-black leading-tight tracking-tight">여행의 파도</div>
            <div className="text-sm md:text-lg font-medium text-white/90 mt-0.5 md:mt-1">해외 골프여행 전문 여행사</div>
          </div>
        </header>

        <div className="relative flex-1 flex flex-col justify-end w-full max-w-5xl mx-auto px-5 md:px-12 pb-24 md:pb-24">
          <p className="text-base md:text-xl font-bold text-white/95 mb-1.5 break-keep">즐거운 골프 너울거림, 여행의 파도</p>
          <h1 className="text-[clamp(27px,8vw,32px)] md:text-[52px] font-black leading-[1.2] mb-6 md:mb-8 drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] break-keep">
            해외 골프여행,
            <br />
            출발공항부터 골라 주세요
          </h1>
          <DepartureChooser />
        </div>
      </section>

      {/* 사업자 정보 — 사진 아래로 분리 (정보는 기존 그대로) */}
      <footer className="px-5 py-5 text-center text-[13px] leading-relaxed text-slate-500 break-keep">
        <p>여행의 파도 · 대표 이지안 · 사업자번호 372-57-00613</p>
        <p>관광사업등록번호 제2022-000029호 · 서울 마포구 토정로35길 11 인우빌딩</p>
      </footer>
    </div>
  );
}
