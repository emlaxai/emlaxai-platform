import React from 'react';

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Kullanım Şartları</h1>
        
        <div className="space-y-8 text-zinc-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Hizmet Şartlarının Kabulü</h2>
            <p>
              EmlaXAI platformunu kullanarak, bu kullanım şartlarını kabul etmiş sayılırsınız. 
              Şartları kabul etmiyorsanız, lütfen platformumuzu kullanmayınız.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Hizmet Tanımı</h2>
            <p>
              EmlaXAI, yapay zeka destekli emlak analiz hizmetleri sunan bir platformdur. 
              Platform üzerinden parsel analizleri, piyasa değerlendirmeleri ve çeşitli emlak 
              verileri sunulmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Kullanıcı Hesabı</h2>
            <p className="mb-3">Hesap oluştururken:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>Hesap güvenliğinizden sorumlusunuz</li>
              <li>Hesabınızı başkalarıyla paylaşmamalısınız</li>
              <li>Şüpheli aktiviteleri derhal bildirmelisiniz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Üyelik Paketleri</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-white">Free (Ücretsiz) Paket</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Sınırlı parsel analizi</li>
                  <li>Temel demografik veriler</li>
                  <li>Günde 10 AI sorgu hakkı</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-white">Pro (Profesyonel) Paket</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Sınırsız parsel analizi</li>
                  <li>Detaylı demografik ve imar verileri</li>
                  <li>Sınırsız AI sorgu</li>
                  <li>Öncelikli destek</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Ödeme ve Faturalama</h2>
            <p className="mb-3">Ücretli hizmetler için:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Ödemeler İyzico üzerinden güvenli şekilde alınır</li>
              <li>Abonelikler otomatik olarak yenilenir</li>
              <li>İptal işlemi hesap ayarlarından yapılabilir</li>
              <li>İade politikası şartlara tabidir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Kullanım Kısıtlamaları</h2>
            <p className="mb-3">Platform kullanırken yasaktır:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sistemleri hacklemek veya zararlı yazılım kullanmak</li>
              <li>Verileri izinsiz kopyalamak veya yaymak</li>
              <li>Sahte hesap veya bilgiler oluşturmak</li>
              <li>API limitlerini aşmaya çalışmak</li>
              <li>Platformu yasal olmayan amaçlarla kullanmak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Fikri Mülkiyet Hakları</h2>
            <p>
              Platform üzerindeki tüm içerik, yazılım, tasarım ve veriler EmlaXAI'nin fikri 
              mülkiyetindedir. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Sorumluluk Reddi</h2>
            <p>
              EmlaXAI, platformda sunulan verilerin doğruluğunu garanti etmez. Veriler bilgilendirme 
              amaçlıdır ve yatırım kararları için tek başına kullanılmamalıdır. Kullanıcılar kendi 
              araştırmalarını yapmalıdır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Hizmet Değişiklikleri</h2>
            <p>
              EmlaXAI, önceden haber vermeksizin hizmetlerde değişiklik yapma, askıya alma veya 
              sonlandırma hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Uygulanacak Hukuk</h2>
            <p>
              Bu kullanım şartları Türkiye Cumhuriyeti yasalarına tabidir. Anlaşmazlıklar 
              İstanbul mahkemelerinde çözümlenir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. İletişim</h2>
            <p>
              Kullanım şartları ile ilgili sorularınız için{' '}
              <a href="mailto:destek@emlaxai.com" className="text-blue-400 hover:text-blue-300">
                destek@emlaxai.com
              </a>{' '}
              adresinden bize ulaşabilirsiniz.
            </p>
          </section>

          <section className="pt-8 border-t border-zinc-700">
            <p className="text-sm text-zinc-400">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
