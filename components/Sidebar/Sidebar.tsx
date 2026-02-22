'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useExaChat } from '@/contexts/ExaChatContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const { sessions, activeSessionId, setActiveSession, deleteSession } = useExaChat();

  const isExaActive = pathname === '/exa' || pathname.startsWith('/exa');

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

  const recentSessions = sessions.slice(0, 6);

  return (
    <aside 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`
        hidden md:block fixed left-5 top-5 bottom-5 z-50 transition-[width] duration-300 ease-in-out overflow-hidden
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
      <div className="flex flex-col h-full px-3 py-4 transition-[padding] duration-300">
        {/* Logo */}
        <div className="flex items-center justify-center mb-5 h-10 relative overflow-hidden">
          <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <Image
              src="/icons/emlaxai-logo.svg"
              alt="EmlaXAI Logo"
              width={110}
              height={26}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
            <Image
              src="/icons/emlaxai-icon.svg"
              alt="EmlaXAI Icon"
              width={36}
              height={36}
              priority
              style={{ objectFit: 'contain', width: '36px', height: '36px' }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-xl transition-all duration-200 h-11 px-4
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
                <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Exa Link */}
          <Link
            href="/exa"
            className={`
              flex items-center gap-3 rounded-xl transition-all duration-200 h-11 px-3
              outline-none focus:outline-none
              ${isExaActive
                ? 'bg-white/12 text-blue-400'
                : 'text-white/65 hover:bg-white/8 hover:text-white/95'
              }
            `}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <Image
                src="/icons/emlaxai-icon.svg"
                alt="Exa"
                width={28}
                height={28}
                style={{
                  objectFit: 'contain',
                  width: '28px',
                  height: '28px',
                  opacity: isExaActive ? 1 : 0.6,
                  filter: isExaActive ? 'brightness(0) saturate(100%) invert(52%) sepia(98%) saturate(1000%) hue-rotate(196deg) brightness(100%) contrast(96%)' : 'none',
                }}
              />
            </div>
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              Exa
            </span>
          </Link>

          {/* Exa Chat Geçmişi */}
          <div className={`ml-4 pl-4 border-l border-white/8 flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ${isOpen && recentSessions.length > 0 ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {recentSessions.map(session => (
              <div
                key={session.id}
                className={`
                  group flex items-center gap-1 rounded-lg transition-all
                  ${activeSessionId === session.id && isExaActive
                    ? 'bg-white/5'
                    : 'hover:bg-white/3'
                  }
                `}
              >
                <Link
                  href={`/exa?chat=${session.id}`}
                  onClick={() => setActiveSession(session.id)}
                  className={`
                    text-[11px] py-1.5 px-2 truncate block flex-1 min-w-0
                    ${activeSessionId === session.id && isExaActive
                      ? 'text-blue-400'
                      : 'text-white/35 hover:text-white/60'
                    }
                  `}
                  title={session.title}
                >
                  {session.title}
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="flex-shrink-0 p-1 mr-1 rounded opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 hover:bg-white/5 transition-all"
                  title="Sohbeti sil"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2 pt-5 border-t border-white/8">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-xl transition-all duration-200 text-white/65 hover:bg-white/8 hover:text-white/95 outline-none focus:outline-none h-11 px-4"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              Hesabım
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
