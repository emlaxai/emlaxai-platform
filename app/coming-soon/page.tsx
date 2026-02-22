import Image from 'next/image';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
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
  );
}
