type FooterProps = {
  departure?: "incheon" | "busan";
};

const info = {
  incheon: {
    phones: [
      { href: "tel:0264015252", label: "02-6401-5252" },
      { href: "tel:0264015252", label: "02-6401-5252 (?몄쿇)" },
    ],
    blog: "https://blog.naver.com/pado-tour-",
    band: "https://band.us/@padotour",
  },
  busan: {
    phones: [
      { href: "tel:0264015252", label: "02-6401-5252" },
      { href: "tel:07047985252", label: "070-4798-5252 (遺??" },
    ],
    blog: "https://blog.naver.com/padoro-52so",
    band: "https://band.us/@padoro52so",
  },
  default: {
    phones: [
      { href: "tel:0264015252", label: "02-6401-5252" },
      { href: "tel:0264015252", label: "02-6401-5252 (?몄쿇)" },
      { href: "tel:07047985252", label: "070-4798-5252 (遺??" },
    ],
    blog: "https://blog.naver.com/pado-tour-",
    band: "https://band.us/@padotour",
  },
};

export default function Footer({ departure }: FooterProps) {
  const d = departure ? info[departure] : info.default;

  return (
    <footer className="mt-16">
      {/* ?? ?덉빟臾몄쓽 / ?댁쁺?쒓컙 ?곷떒 諛??? */}
      <div className="bg-white border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* ?덉빟臾몄쓽 */}
            <div className="text-center pb-6 md:pb-0 md:pr-8">
              <h3 className="text-base font-black text-gray-700 mb-3 pb-2 border-b border-gray-200">?덉빟臾몄쓽</h3>
              <div className="space-y-1">
                {d.phones.map((p) => (
                  <a key={p.href} href={p.href} className="block">
                    <span className="text-xl font-black text-gray-800 hover:text-emerald-600 transition-colors">
                      T. {p.label}
                    </span>
                  </a>
                ))}
              </div>
              <a
                href="https://pf.kakao.com/_bxoxnXxj/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 border border-gray-300 hover:border-yellow-400 text-gray-600 hover:text-gray-800 text-sm px-4 py-1.5 rounded transition-colors"
              >
                ?뮠 移댁뭅?ㅽ넚 梨꾨꼸 ?곷떞
              </a>
            </div>
            {/* ?댁쁺?쒓컙 */}
            <div className="text-center pt-6 md:pt-0 md:pl-8">
              <h3 className="text-base font-black text-gray-700 mb-3 pb-2 border-b border-gray-200">?댁쁺?쒓컙</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>?됱씪 : AM 9:00 ~ PM 6:00</p>
                <p>?좎슂??: AM 9:00 ~ PM 2:00</p>
              </div>
              <p className="mt-2 text-xs text-gray-400 border border-gray-200 rounded px-3 py-1.5 inline-block">
                ?쇱슂??쨌 怨듯쑕?쇱? 移댄넚?쇰줈 臾몄쓽?댁＜?몄슂
              </p>
            </div>
          </div>
        </div>
      </div>

    <div className="bg-blue-600 text-white/90 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* ?ы뻾???뺣낫 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">??/span>
              <span className="text-white text-xl font-bold">?ы뻾???뚮룄</span>
              {departure && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  departure === "incheon"
                    ? "bg-emerald-600 text-emerald-100"
                    : "bg-blue-700 text-white/90"
                }`}>
                  {departure === "incheon" ? "?몄쿇異쒕컻" : "遺?곗텧諛?}
                </span>
              )}
            </div>
            <p className="text-sm text-white/90 mb-4">怨⑦봽?꾨Ц ?ы뻾??/p>
            <div className="space-y-1 text-sm">
              <p>?곹샇紐? ?ы뻾???뚮룄</p>
              <p>??? ?댁???/p>
              <p>?ъ뾽?먮쾲?? 372-57-00613</p>
              <p>愿愿묒궗?낅벑濡앸쾲?? ??2022-000029 ??/p>
            </div>
          </div>

          {/* ?곕씫泥?*/}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">?곕씫泥?/h3>
            <div className="space-y-3">
              {d.phones.map((p) => (
                <a key={p.href} href={p.href} className="flex items-center gap-2 group">
                  <span className="text-yellow-400 text-lg">?뱸</span>
                  <span className="text-yellow-300 group-hover:text-yellow-200 font-bold text-lg transition-colors">
                    {p.label}
                  </span>
                </a>
              ))}
              <a
                href="https://pf.kakao.com/_bxoxnXxj/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors text-sm text-gray-400 mt-1"
              >
                <span>?뮠</span> 移댁뭅?ㅽ넚 梨꾨꼸 ?곷떞
              </a>
              <a href={d.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors text-sm text-gray-400">
                <span>?뱷</span> ?ㅼ씠踰?釉붾줈洹?              </a>
              <a href={d.band} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors text-sm text-gray-400">
                <span>?뱽</span> ?ㅼ씠踰?諛대뱶
              </a>
            </div>
          </div>

          {/* ?곷떞 ?쒓컙 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">?곷떞 ?쒓컙</h3>
            <div className="space-y-1 text-sm">
              <p>?됱씪: ?ㅼ쟾 9??~ ?ㅽ썑 6??/p>
              <p>?좎슂?? ?ㅼ쟾 9??~ ?ㅽ썑 2??/p>
              <p>?쇱슂?셋룰났?댁씪: 移댄넚 臾몄쓽</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-500 mt-8 pt-6 text-xs text-blue-200 text-center">
          <p>짤 2025 ?ы뻾???뚮룄. All rights reserved.</p>
          <p className="mt-1">怨⑦봽?ы뻾 ?덉빟? ??났쨌?숇컯쨌怨⑦봽???곹솴???곕씪 ?붽툑??蹂?숇맆 ???덉뒿?덈떎.</p>
        </div>
      </div>
    </div>
    </footer>
  );
}

