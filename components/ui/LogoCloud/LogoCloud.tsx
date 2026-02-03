export default function LogoCloud() {
  return (
    <div className="mt-32 mb-16">
      <p className="text-[10px] uppercase text-zinc-600 text-center font-semibold tracking-[0.4em] mb-8">
        Veri ve Teknoloji Ortaklarımız
      </p>
      
      {/* Tek Satır Minimalist Logo Bandı */}
      <div className="flex items-center justify-center gap-12 flex-wrap max-w-5xl mx-auto px-8">
        {/* Google Cloud */}
        <div className="flex items-center justify-center grayscale opacity-40 hover:opacity-60 transition-opacity duration-300">
          <img
            src="https://www.gstatic.com/images/branding/product/2x/google_cloud_512dp.png"
            alt="Google Cloud"
            className="h-7 object-contain"
          />
        </div>
        
        {/* OpenAI */}
        <div className="flex items-center justify-center grayscale opacity-40 hover:opacity-60 transition-opacity duration-300">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg"
            alt="OpenAI"
            className="h-5 object-contain"
          />
        </div>
        
        {/* Anthropic */}
        <div className="flex items-center justify-center grayscale opacity-40 hover:opacity-60 transition-opacity duration-300">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg"
            alt="Anthropic"
            className="h-5 object-contain"
          />
        </div>
        
        {/* Cloudflare */}
        <div className="flex items-center justify-center grayscale opacity-40 hover:opacity-60 transition-opacity duration-300">
          <img
            src="https://www.cloudflare.com/img/logo-web-badges/cf-logo-on-white-bg.svg"
            alt="Cloudflare"
            className="h-6 object-contain"
          />
        </div>
        
        {/* Divider */}
        <div className="h-6 w-px bg-zinc-800"></div>
        
        {/* TÜİK */}
        <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300">
          <span className="text-zinc-500 text-xs font-semibold tracking-wider">TÜİK</span>
        </div>
        
        {/* TKGM */}
        <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300">
          <span className="text-zinc-500 text-xs font-semibold tracking-wider">TKGM</span>
        </div>
        
        {/* Çevre Bakanlığı */}
        <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300">
          <span className="text-zinc-500 text-xs font-semibold tracking-wider">ÇŞİDB</span>
        </div>
        
        {/* Sanayi Bakanlığı */}
        <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300">
          <span className="text-zinc-500 text-xs font-semibold tracking-wider">SanTek</span>
        </div>
      </div>
    </div>
  );
}
