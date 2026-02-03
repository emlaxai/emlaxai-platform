export default async function PricingPage() {
  return (
    <section className="bg-black min-h-screen pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Fiyatlandırma
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Size en uygun paketi seçin ve emlak analizlerinize hemen başlayın
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h3 className="text-2xl font-bold text-white mb-2">Başlangıç</h3>
            <p className="text-zinc-400 mb-6">Bireysel kullanıcılar için</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">₺XX</span>
              <span className="text-zinc-400">/ay</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">100 parsel analizi/ay</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Temel değerleme</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Email destek</span>
              </li>
            </ul>
            <button
              disabled
              className="w-full py-3 bg-zinc-800 text-zinc-500 rounded-lg font-medium cursor-not-allowed"
            >
              Yakında
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Popüler
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Profesyonel</h3>
            <p className="text-zinc-400 mb-6">Emlak profesyonelleri için</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">₺XX</span>
              <span className="text-zinc-400">/ay</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Sınırsız parsel analizi</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Gelişmiş AI değerleme</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Öncelikli destek</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">API erişimi</span>
              </li>
            </ul>
            <button
              disabled
              className="w-full py-3 bg-zinc-700 text-zinc-400 rounded-lg font-medium cursor-not-allowed"
            >
              Yakında
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h3 className="text-2xl font-bold text-white mb-2">Kurumsal</h3>
            <p className="text-zinc-400 mb-6">Şirketler için</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">Özel</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Her şey dahil</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Özel entegrasyonlar</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">7/24 destek</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-zinc-300">Eğitim ve danışmanlık</span>
              </li>
            </ul>
            <button
              disabled
              className="w-full py-3 bg-zinc-800 text-zinc-500 rounded-lg font-medium cursor-not-allowed"
            >
              İletişime Geç
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-zinc-400">
            Ödeme sistemi entegrasyonu (İyzico) hazırlanıyor
          </p>
        </div>
      </div>
    </section>
  );
}
