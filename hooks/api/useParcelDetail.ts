'use client';

import { useQuery } from '@tanstack/react-query';
import type { ParselDetail } from '@/types';

async function fetchParcelDetail(parcelId: string): Promise<ParselDetail> {
  const res = await fetch(`/api/parcel-detail?id=${encodeURIComponent(parcelId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useParcelDetail(parcelId: string | null) {
  return useQuery({
    queryKey: ['parcel-detail', parcelId],
    queryFn: () => fetchParcelDetail(parcelId!),
    enabled: !!parcelId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

async function fetchParcelPriceTrend(parcelId: string, kategori: string): Promise<any> {
  const res = await fetch(`/api/parcel-price-trend?id=${encodeURIComponent(parcelId)}&kategori=${encodeURIComponent(kategori)}&tip=satilik&ay=120`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useParcelPriceTrend(parcelId: string | null, kategori: string = 'konut') {
  return useQuery({
    queryKey: ['parcel-price-trend', parcelId, kategori],
    queryFn: () => fetchParcelPriceTrend(parcelId!, kategori),
    enabled: !!parcelId,
    staleTime: 5 * 60 * 1000,
  });
}
