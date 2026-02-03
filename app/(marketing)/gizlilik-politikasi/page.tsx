import React from 'react';

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Gizlilik Politikası</h1>
        
        <div className="space-y-8 text-zinc-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Genel Bilgiler</h2>
            <p>
              EmlaXAI olarak, kullanıcılarımızın gizliliğini korumayı en önemli önceliklerimizden biri 
              olarak görüyoruz. Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, 
              kullanıldığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Toplanan Veriler</h2>
            <p className="mb-3">Platformumuz üzerinden aşağıdaki veriler toplanabilir:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>E-posta adresi ve hesap bilgileri</li>
              <li>Kullanım istatistikleri ve analiz verileri</li>
              <li>Tarayıcı ve cihaz bilgileri</li>
              <li>IP adresi ve konum verileri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Verilerin Kullanımı</h2>
            <p className="mb-3">Toplanan veriler şu amaçlarla kullanılır:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Hizmet kalitesinin artırılması</li>
              <li>Kullanıcı deneyiminin iyileştirilmesi</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
              <li>İletişim ve destek hizmetleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Veri Güvenliği</h2>
            <p>
              Kişisel verileriniz, endüstri standardı güvenlik protokolleri ile korunmaktadır. 
              Verilerinize yetkisiz erişimi önlemek için SSL şifreleme ve güvenli veri depolama 
              yöntemleri kullanılmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Üçüncü Taraf Paylaşımları</h2>
            <p>
              Kişisel bilgileriniz, yasal zorunluluklar haricinde üçüncü taraflarla paylaşılmaz. 
              Hizmet sağlayıcılar ile yapılan paylaşımlar, gizlilik sözleşmeleri kapsamında 
              gerçekleştirilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Çerezler (Cookies)</h2>
            <p>
              Web sitemiz, kullanıcı deneyimini geliştirmek amacıyla çerezler kullanmaktadır. 
              Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Kullanıcı Hakları</h2>
            <p className="mb-3">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kişisel verilerinize erişim hakkı</li>
              <li>Verilerin düzeltilmesini talep etme hakkı</li>
              <li>Verilerin silinmesini talep etme hakkı</li>
              <li>İşlemeye itiraz etme hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. İletişim</h2>
            <p>
              Gizlilik politikası ile ilgili sorularınız için{' '}
              <a href="mailto:info@emlaxai.com" className="text-blue-400 hover:text-blue-300">
                info@emlaxai.com
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
