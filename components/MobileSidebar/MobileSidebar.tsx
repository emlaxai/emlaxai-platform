'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Ana Sayfa', iconPath: '/icons/anasayfa.svg' },
    { href: '/parselens', label: 'Parselens', iconPath: '/icons/parselens.svg' },
    { href: '/karsilastir', label: 'Karşılaştır', iconPath: '/icons/karsilastir.svg' },
    { href: '/rapor-al', label: 'Rapor Al', iconPath: '/icons/raporal.svg' },
    { href: '/degerlemeler', label: 'Değerlemeler', iconPath: '/icons/degerlemeler.svg' }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`
          fixed left-0 top-0 bottom-0 z-50 md:hidden w-72
          bg-gradient-to-br from-white/[0.12] to-white/[0.08]
          backdrop-blur-xl backdrop-saturate-120
          border-r border-white/[0.15]
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full p-5">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between mb-5">
            <Image
              src="/emlaxai-logo.svg"
              alt="EmlaXAI"
              width={120}
              height={36}
              className="filter brightness-0 invert"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    outline-none focus:outline-none
                    ${isActive 
                      ? 'bg-white/12 text-blue-400' 
                      : 'text-white/65 hover:bg-white/8 hover:text-white/95'
                    }
                  `}
                >
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <Image 
                      src={item.iconPath} 
                      alt={item.label}
                      width={20}
                      height={20}
                      className={`filter brightness-0 invert ${isActive ? 'opacity-100' : 'opacity-70'}`}
                      style={isActive ? { filter: 'brightness(0) saturate(100%) invert(64%) sepia(98%) saturate(2898%) hue-rotate(197deg) brightness(101%) contrast(93%)' } : undefined}
                    />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Exa Button */}
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/65 hover:bg-white/8 hover:text-white/95 outline-none focus:outline-none">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <Image 
                  src="https://emlaxai.com/wp-content/uploads/2025/12/exa-spiral.svg" 
                  alt="Exa" 
                  width={24}
                  height={24}
                  className="filter brightness-0 invert opacity-70 scale-150"
                />
              </div>
              <span className="text-sm font-medium">Exa</span>
            </button>
          </nav>

          {/* Bottom Section */}
          <div className="flex flex-col gap-2 pt-5 border-t border-white/8">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/65 hover:bg-white/8 hover:text-white/95 outline-none focus:outline-none"
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Profil</span>
            </Link>

            <button className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/65 hover:bg-white/8 hover:text-white/95 outline-none focus:outline-none">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Tema</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
