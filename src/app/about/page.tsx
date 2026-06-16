export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ?덉뼱濡?*/}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 text-white py-16 px-4 text-center">
        <p className="text-emerald-200 text-sm font-semibold mb-2 tracking-widest">ABOUT US</p>
        <h1 className="text-3xl md:text-4xl font-black mb-3">?ы뻾???뚮룄瑜??뚭컻?⑸땲??/h1>
        <p className="text-emerald-100 text-base">怨⑦봽瑜??щ옉?섎뒗 紐⑤뱺 遺꾨뱾??理쒓퀬???ы뻾 ?뚰듃??/p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* ??쒖옄??留?*/}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            ??쒖옄??留?          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* ?ъ쭊 ?먮━ */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-40 h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">?뫀</span>
                <span className="text-xs text-center leading-relaxed">?ъ쭊<br/>以鍮?以?/span>
              </div>
              <p className="text-center mt-3 font-black text-gray-800">?댁??????/p>
              <p className="text-center text-xs text-gray-500">?ы뻾???뚮룄</p>
            </div>

            {/* ?몄궗留??먮━ */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-gray-300 text-5xl font-serif mb-3">"</div>
              <div className="space-y-3 text-gray-400 text-sm leading-relaxed italic">
                <p>??쒖옄???몄궗留먯씠 ??怨녹뿉 ?ㅼ뼱媛묐땲??</p>
                <p>湲??蹂대궡二쇱떆硫?諛붾줈 ?낅뜲?댄듃???쒕┫寃뚯슂.</p>
              </div>
              <div className="text-gray-300 text-5xl font-serif text-right mt-3">"</div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                <p className="font-black text-gray-500 text-sm">?ы뻾???뚮룄 ???<span className="text-gray-700">?댁???/span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ?뚯궗 ?뚭컻 */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            ?뚯궗 ?뚭컻
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center text-gray-400 text-sm py-16">
            <div className="text-4xl mb-3">?룫</div>
            <p>?뚯궗 ?뚭컻 ?댁슜????怨녹뿉 ?ㅼ뼱媛묐땲??</p>
            <p className="mt-1">湲??蹂대궡二쇱떆硫?諛붾줈 ?낅뜲?댄듃???쒕┫寃뚯슂.</p>
          </div>
        </section>

        {/* ?듭떖 媛移?*/}
        <section className="mb-14">
          <h2 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
            ?ы뻾???뚮룄媛 ?쎌냽?섎뒗 寃?          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "??, title: "怨⑦봽 ?꾨Ц??, desc: "怨⑦봽 ?ы뻾留뚯쓣 ?꾪븳\n?뱁솕???명븯?? },
              { icon: "?쩃", title: "?좊ː? ?덉쟾", desc: "?쒖슱蹂댁쬆蹂댄뿕 媛??n?ы뻾??蹂댁쬆" },
              { icon: "?덌툘", title: "?⑸━?곸씤 媛寃?, desc: "吏곸젒 怨꾩빟?쇰줈\n?щ챸??媛寃??쒓났" },
            ].map((item) => (
              <div key={item.title} className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-black text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 臾몄쓽 */}
        <section className="bg-blue-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-black mb-1">沅곴툑???먯씠 ?덉쑝?좉???</h3>
          <p className="text-blue-200 text-sm mb-4">移댁뭅?ㅽ넚 ?먮뒗 ?꾪솕濡??명븯寃?臾몄쓽??二쇱꽭??/p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://pf.kakao.com/_bxoxnXxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-6 py-3 rounded-full text-sm transition-colors"
            >
              ?뮠 移댁뭅?ㅽ넚 臾몄쓽
            </a>
            <a
              href="tel:02-6401-5252"
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
            >
              ?뱸 02-6401-5252
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

