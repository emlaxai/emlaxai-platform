'use client';

import { useQuery } from '@tanstack/react-query';
import type { MahalleFiyatlari } from '@/types';

async function fetchMahalleFiyatlari(il: string, ilce: string, kategori: string): Promise<MahalleFiyatlari> {
  const res = await fetch(`/api/mahalle-fiyatlari/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}?kategori=${encodeURIComponent(kategori)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useMahalleFiyatlari(il: string | null, ilce: string | null, kategori: string = 'konut') {
  return useQuery({
    queryKey: ['mahalle-fiyatlari', il, ilce, kategori],
    queryFn: () => fetchMahalleFiyatlari(il!, ilce!, kategori),
    enabled: !!il && !!ilce,
    staleTime: 10 * 60 * 1000,
  });
}
