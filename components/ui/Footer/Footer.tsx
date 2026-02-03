import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-start justify-between py-12 gap-12">
          {/* Logo Icon - Sol Tarafta, Biraz Yukarıda */}
          <div className="flex-shrink-0 md:-mt-4">
            <Link href="/" className="inline-block">
              <Image 
                src="/emlaxai-icon.svg" 
                alt="EmlaXAI" 
                width={48} 
                height={48}
                className="hover:opacity-80 transition-opacity brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
          </div>

          {/* Navigation Columns - Merkezde */}
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 flex-1">
            {/* Ürünler */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-white mb-2 tracking-wider">ÜRÜNLER</h3>
              <Link 
                href="/parselens" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Parselens
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Fiyatlandırma
              </Link>
            </div>

            {/* Kurumsal */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-white mb-2 tracking-wider">KURUMSAL</h3>
              <Link 
                href="/hakkimizda" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Hakkımızda
              </Link>
              <Link 
                href="/nasil-calisir" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Nasıl Çalışır?
              </Link>
            </div>

            {/* Yasal */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-white mb-2 tracking-wider">YASAL</h3>
              <Link 
                href="/gizlilik-politikasi" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Gizlilik Politikası
              </Link>
              <Link 
                href="/kullanim-sartlari" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Kullanım Şartları
              </Link>
            </div>

            {/* İletişim */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-white mb-2 tracking-wider">İLETİŞİM</h3>
              <a 
                href="mailto:ai@emlaxai.com" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                ai@emlaxai.com
              </a>
              <a 
                href="mailto:destek@emlaxai.com" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                destek@emlaxai.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 py-6">
          <p className="text-center text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} EmlaXAI. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
