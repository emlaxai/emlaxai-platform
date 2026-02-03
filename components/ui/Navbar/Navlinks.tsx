'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  return (
    <div className="relative flex justify-center py-4 md:py-6">
      {/* Glass Balon - Geniş */}
      <div className="flex items-center justify-between w-full max-w-5xl px-8 py-4 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 shadow-lg">
        {/* Logo - Sol, Merkezde */}
        <Link href="/" className="flex-shrink-0 self-center outline-none focus:outline-none" aria-label="EmlaXAI Logo">
          <Image
            src="/emlaxai-logo.svg"
            alt="EmlaXAI"
            width={110}
            height={34}
            priority
            className="object-contain mt-0.5"
          />
        </Link>

        {/* Menü İtemleri - Orta, Küçük */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/parselens" className={`${s.link} outline-none focus:outline-none`}>
            Parselens
          </Link>
          <Link href="/pricing" className={`${s.link} outline-none focus:outline-none`}>
            Fiyatlandırma
          </Link>
          <Link href="/hakkimizda" className={`${s.link} outline-none focus:outline-none`}>
            Biz Kimiz?
          </Link>
          <Link href="/nasil-calisir" className={`${s.link} outline-none focus:outline-none`}>
            Nasıl Çalışır?
          </Link>
          {user && (
            <Link href="/account" className={`${s.link} outline-none focus:outline-none`}>
              Hesabım
            </Link>
          )}
        </nav>

        {/* Giriş/Çıkış - Sağ, Küçük */}
        <div className="flex items-center gap-3 flex-shrink-0 text-sm">
          {user ? (
            <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
              <input type="hidden" name="pathName" value={usePathname()} />
              <button type="submit" className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-100 transition-colors outline-none focus:outline-none">
                Çıkış Yap
              </button>
            </form>
          ) : (
            <>
              {/* Kaydol - Hover'da Gri Balon */}
              <Link 
                href="/signin/signup" 
                className="px-4 py-2 rounded-lg text-zinc-200 font-medium hover:bg-zinc-800/50 transition-colors outline-none focus:outline-none"
              >
                Kaydol
              </Link>
              {/* Giriş Yap - Beyaz Balon */}
              <Link 
                href="/signin" 
                className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-100 transition-colors outline-none focus:outline-none"
              >
                Giriş Yap
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
