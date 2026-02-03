export default async function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-black overflow-hidden pt-20 md:pt-32 pb-32 md:pb-48">
        <div className="relative flex justify-center px-6">
          <div className="w-full max-w-5xl px-8">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-medium text-white mb-6 leading-tight max-w-3xl">
              Yapay zeka ile emlak
              <br />
              analizi artık çok kolay
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mb-10 leading-relaxed">
              Parsel analizi, piyasa verileri ve AI destekli tahminler. Tek platformda.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="/signin/signup"
                className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-100 transition-colors duration-200"
              >
                Ücretsiz Başla
              </a>
              <a
                href="/nasil-calisir"
                className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-full border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-colors duration-200"
              >
                Nasıl Çalışır?
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Özellikler
            </h2>
            <p className="text-xl text-zinc-400">
              Emlak analizi için ihtiyacınız olan her şey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <h3 className="text-2xl font-bold text-white mb-4">ParselENS</h3>
              <p className="text-zinc-400">
                Türkiye genelindeki tüm parselleri anında görüntüleyin ve analiz edin
              </p>
            </div>
            
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <h3 className="text-2xl font-bold text-white mb-4">Değerleme</h3>
              <p className="text-zinc-400">
                AI destekli değerleme sistemi ile gerçek zamanlı fiyat analizi
              </p>
            </div>
            
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <h3 className="text-2xl font-bold text-white mb-4">Karşılaştır</h3>
              <p className="text-zinc-400">
                İlleri ve bölgeleri karşılaştırarak en iyi yatırım fırsatlarını bulun
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-black py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Fiyatlandırma
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Yakında açıklanacak
          </p>
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <p className="text-zinc-300">
              Abonelik paketlerimiz ve fiyatlandırma detayları çok yakında sizlerle!
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
