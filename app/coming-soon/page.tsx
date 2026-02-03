export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            EmlaXAI
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
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
