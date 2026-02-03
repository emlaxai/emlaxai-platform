export default function NasilCalisirPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          ❓ Nasıl Çalışır?
        </h1>
        
        {/* Adımlar */}
        <div className="space-y-8">
          {/* Adım 1 */}
          <div className="bg-zinc-900 rounded-2xl p-8 border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold">Kayıt Olun</h2>
            </div>
            <p className="text-gray-400 ml-16">
              EmlaXAI'ya ücretsiz kayıt olun ve hemen analizlere başlayın!
            </p>
          </div>

          {/* Adım 2 */}
          <div className="bg-zinc-900 rounded-2xl p-8 border-l-4 border-purple-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold">İl Seçin</h2>
            </div>
            <p className="text-gray-400 ml-16">
              Parselens sayfasında analiz etmek istediğiniz ili seçin.
            </p>
          </div>

          {/* Adım 3 */}
          <div className="bg-zinc-900 rounded-2xl p-8 border-l-4 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h2 className="text-2xl font-bold">Verileri Görün</h2>
            </div>
            <p className="text-gray-400 ml-16">
              m² fiyat trendi, demografik bilgiler ve daha fazlası!
            </p>
          </div>

          {/* Adım 4 */}
          <div className="bg-zinc-900 rounded-2xl p-8 border-l-4 border-yellow-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-yellow-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <h2 className="text-2xl font-bold">AI'ya Sorun</h2>
            </div>
            <p className="text-gray-400 ml-16">
              Yapay zeka destekli sohbet ile detaylı sorular sorun!
            </p>
          </div>
        </div>

        {/* Pro Özellikler */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-blue-500/30">
          <h2 className="text-3xl font-bold mb-4">💎 Pro Üyelik Avantajları</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ Tüm analizlere sınırsız erişim</li>
            <li>✅ Gelecek tahminleri (Forecast)</li>
            <li>✅ Sınırsız AI sorgusu</li>
            <li>✅ Excel/PDF rapor indirme</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
