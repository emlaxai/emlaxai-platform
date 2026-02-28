'use client';

import { useQuery } from '@tanstack/react-query';
import type { TapuIslemToplam } from '@/types';

async function fetchTapuIslemToplam(): Promise<TapuIslemToplam> {
  const res = await fetch('/api/tapu-islem-toplam', { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useTapuIslemToplam() {
  return useQuery({
    queryKey: ['tapu-islem-toplam'],
    queryFn: fetchTapuIslemToplam,
    staleTime: 30 * 60 * 1000,
  });
}
