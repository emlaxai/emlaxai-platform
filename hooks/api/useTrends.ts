'use client';

import { useQuery } from '@tanstack/react-query';
import type { IlTrend, IlceTrend, MahalleTrend, TurkiyeTrend } from '@/types';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useTurkiyeTrend(aySayisi: number = 60, kategori: string = 'konut') {
  return useQuery({
    queryKey: ['turkiye-trend', aySayisi, kategori],
    queryFn: () => apiFetch<TurkiyeTrend>(`/api/turkiye-trend?ay_sayisi=${aySayisi}&kategori=${encodeURIComponent(kategori)}`),
    staleTime: 30 * 60 * 1000,
  });
}

export function useIlTrend(il: string | null, aySayisi: number = 120, kategori: string = 'konut') {
  return useQuery({
    queryKey: ['il-trend', il, aySayisi, kategori],
    queryFn: () => apiFetch<IlTrend>(`/api/il-trend/${encodeURIComponent(il!)}?ay_sayisi=${aySayisi}&kategori=${encodeURIComponent(kategori)}`),
    enabled: !!il,
    staleTime: 10 * 60 * 1000,
  });
}

export function useIlceTrend(il: string | null, ilce: string | null, aySayisi: number = 120, kategori: string = 'konut') {
  return useQuery({
    queryKey: ['ilce-trend', il, ilce, aySayisi, kategori],
    queryFn: () => apiFetch<IlceTrend>(`/api/ilce-trend/${encodeURIComponent(il!)}/${encodeURIComponent(ilce!)}?ay_sayisi=${aySayisi}&kategori=${encodeURIComponent(kategori)}`),
    enabled: !!il && !!ilce,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMahalleTrend(il: string | null, ilce: string | null, mahalle: string | null, aySayisi: number = 48, kategori: string = 'konut') {
  return useQuery({
    queryKey: ['mahalle-trend', il, ilce, mahalle, aySayisi, kategori],
    queryFn: () => apiFetch<MahalleTrend>(`/api/mahalle-trend/${encodeURIComponent(il!)}/${encodeURIComponent(ilce!)}/${encodeURIComponent(mahalle!)}?ay_sayisi=${aySayisi}&kategori=${encodeURIComponent(kategori)}`),
    enabled: !!il && !!ilce && !!mahalle,
    staleTime: 10 * 60 * 1000,
  });
}
