'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();

  const navItems = [
    {
      href: '/',
      label: 'Ana Sayfa',
      iconPath: '/icons/anasayfa.svg'
    },
    {
      href: '/parselens',
      label: 'Parselens',
      iconPath: '/icons/parselens.svg'
    },
    {
      href: '/karsilastir',
      label: 'Karşılaştır',
      iconPath: '/icons/karsilastir.svg'
    },
    {
      href: '/rapor-al',
      label: 'Rapor Al',
      iconPath: '/icons/raporal.svg'
    },
    {
      href: '/degerlemeler',
      label: 'Değerlemeler',
      iconPath: '/icons/degerlemeler.svg'
    }
  ];

  return (
    <aside 
      className={`
        hidden md:block fixed left-5 top-5 bottom-5 z-50 transition-all duration-300 overflow-x-hidden
        ${isOpen ? 'w-[280px]' : 'w-20'}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(20px) saturate(120%)',
        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className={`flex flex-col h-full ${isOpen ? 'p-5' : 'p-2'}`}>
        {/* Logo */}
        <div className="flex items-center justify-center mb-5">
          {isOpen ? (
            <img 
              src="https://emlaxai.com/wp-content/uploads/2025/12/exalogo4.svg" 
              alt="EmlaXAI" 
              style={{
                width: '140px',
                height: 'auto',
                filter: 'brightness(0) invert(1)'
              }}
            />
          ) : (
            <img 
              src="https://emlaxai.com/wp-content/uploads/2025/12/exa-spiral.svg" 
              alt="EmlaXAI" 
              className="flex-shrink-0"
              style={{
                width: '52px',
                height: '52px',
                minWidth: '52px',
                minHeight: '52px',
                filter: 'brightness(0) invert(1)'
              }}
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-xl transition-all duration-200
                  outline-none focus:outline-none
                  ${isOpen ? 'px-4 py-3' : 'p-2 justify-center'}
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
                {isOpen && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Exa Button */}
          <button
            className={`
              flex items-center gap-3 rounded-xl transition-all duration-200 text-white/65 hover:bg-white/8 hover:text-white/95
              outline-none focus:outline-none
              ${isOpen ? 'px-4 py-3' : 'p-2 justify-center'}
            `}
          >
            <div className={`flex-shrink-0 flex items-center justify-center ${isOpen ? 'w-6 h-6' : 'w-12 h-12'}`}>
              <img 
                src="https://emlaxai.com/wp-content/uploads/2025/12/exa-spiral.svg" 
                alt="Exa" 
                className="flex-shrink-0"
                style={{
                  width: isOpen ? '24px' : '48px',
                  height: isOpen ? '24px' : '48px',
                  minWidth: isOpen ? '24px' : '48px',
                  minHeight: isOpen ? '24px' : '48px',
                  transform: isOpen ? 'scale(1.5)' : 'scale(1)',
                  filter: 'brightness(0) invert(1) opacity(0.7)'
                }}
              />
            </div>
            {isOpen && (
              <span className="text-sm font-medium">Exa</span>
            )}
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2 pt-5 border-t border-white/8">
          <Link
            href="/account"
            className={`
              flex items-center gap-3 rounded-xl transition-all duration-200 text-white/65 hover:bg-white/8 hover:text-white/95
              outline-none focus:outline-none
              ${isOpen ? 'px-4 py-3' : 'p-2 justify-center'}
            `}
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            {isOpen && (
              <span className="text-sm font-medium">Profil</span>
            )}
          </Link>

          <button
            className={`
              flex items-center gap-3 rounded-xl transition-all duration-200 text-white/65 hover:bg-white/8 hover:text-white/95
              outline-none focus:outline-none
              ${isOpen ? 'px-4 py-3' : 'p-2 justify-center'}
            `}
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            {isOpen && (
              <span className="text-sm font-medium">Tema</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
