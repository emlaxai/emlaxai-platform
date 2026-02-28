'use client';

import { useQuery } from '@tanstack/react-query';
import type { IlFiyatlari } from '@/types';

async function fetchIlFiyatlari(kategori: string): Promise<IlFiyatlari> {
  const res = await fetch(`/api/il-fiyatlari?kategori=${encodeURIComponent(kategori)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useIlFiyatlari(kategori: string = 'konut') {
  return useQuery({
    queryKey: ['il-fiyatlari', kategori],
    queryFn: () => fetchIlFiyatlari(kategori),
    staleTime: 30 * 60 * 1000,
  });
}
