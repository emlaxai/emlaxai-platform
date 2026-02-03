export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            EmlaXAI
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Çok Yakında
        </h2>
        
        <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
          Yapay zeka destekli emlak değerleme platformumuz üzerinde çalışıyoruz.
          <br />
          Yakında sizlerle!
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="text-white font-semibold mb-2">ParselENS</h3>
            <p className="text-zinc-500 text-sm">Türkiye geneli parsel analizi</p>
          </div>
          
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-white font-semibold mb-2">AI Değerleme</h3>
            <p className="text-zinc-500 text-sm">Yapay zeka ile fiyat tahmini</p>
          </div>
          
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-white font-semibold mb-2">Piyasa Analizi</h3>
            <p className="text-zinc-500 text-sm">Gerçek zamanlı piyasa verileri</p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12">
          <p className="text-zinc-500 text-sm">
            Bilgi almak için:{' '}
            <a href="mailto:info@emlaxai.com" className="text-blue-400 hover:text-blue-300">
              info@emlaxai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
