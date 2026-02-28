'use client';

import { useQuery } from '@tanstack/react-query';
import type { IlceFiyatlari } from '@/types';

async function fetchIlceFiyatlari(il: string, kategori: string): Promise<IlceFiyatlari> {
  const res = await fetch(`/api/ilce-fiyatlari/${encodeURIComponent(il)}?kategori=${encodeURIComponent(kategori)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useIlceFiyatlari(il: string | null, kategori: string = 'konut') {
  return useQuery({
    queryKey: ['ilce-fiyatlari', il, kategori],
    queryFn: () => fetchIlceFiyatlari(il!, kategori),
    enabled: !!il,
    staleTime: 10 * 60 * 1000,
  });
}
