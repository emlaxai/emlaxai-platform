export default function ParselensPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          📊 Parselens - Bölge Analizi
        </h1>
        
        <div className="bg-zinc-900 rounded-2xl p-8 mb-8">
          <p className="text-xl text-gray-300 mb-4">
            Türkiye'nin tüm illerinde detaylı bölge analizleri yapın!
          </p>
          <p className="text-gray-400">
            📍 İl seçin, emlak verilerini görün, AI destekli içgörüler edinin.
          </p>
        </div>

        {/* İl Seçici - Buraya eklenecek */}
        <div className="bg-zinc-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">İl Seçin</h2>
          <p className="text-gray-400">🚧 Analiz kartları yakında eklenecek...</p>
        </div>
      </div>
    </div>
  );
}
