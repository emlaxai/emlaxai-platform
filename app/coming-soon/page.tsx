'use client';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const Galaxy = dynamic(() => import('./Galaxy'), { ssr: false });

export default function ComingSoon() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Galaxy Arka Plan */}
      <div className="fixed inset-0 z-0" style={{ width: '100%', height: '100%' }}>
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />
      </div>

      {/* İçerik */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          {/* Logo */}
          <div className="mb-10">
            <Image
              src="/icons/exalogo4.svg"
              alt="EmlaXAI Logo"
              width={400}
              height={142}
              priority
              className="mx-auto"
            />
          </div>

          {/* Main Message */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Çok Yakında
          </h2>

          <p className="text-xl text-zinc-400 leading-relaxed">
            Yapay zeka destekli emlak değerleme platformumuz üzerinde çalışıyoruz.
            <br />
            Yakında sizlerle!
          </p>
        </div>
      </div>
    </div>
  );
}
