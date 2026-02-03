export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          👥 Biz Kimiz?
        </h1>
        
        <div className="bg-zinc-900 rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">EmlaXAI Hakkında</h2>
          <p className="text-xl text-gray-300 mb-6">
            Türkiye'nin en gelişmiş emlak analiz platformu! 🏡
          </p>
          <p className="text-gray-400 mb-4">
            EmlaXAI, yapay zeka destekli emlak analizleri ile yatırımcılara, 
            emlakçılara ve ev sahiplerine doğru kararlar alma konusunda 
            yardımcı olan yenilikçi bir platformdur.
          </p>
          <p className="text-gray-400">
            📊 Detaylı veriler • 🤖 AI destekli tahminler • ⚡ Hızlı sonuçlar
          </p>
        </div>

        {/* Vizyon & Misyon */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-zinc-900 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">🎯 Vizyonumuz</h3>
            <p className="text-gray-400">
              Türkiye emlak sektöründe veri odaklı karar almanın 
              standart haline gelmesi.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">🚀 Misyonumuz</h3>
            <p className="text-gray-400">
              Yapay zeka ile emlak verilerini herkes için erişilebilir 
              ve anlaşılır kılmak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
