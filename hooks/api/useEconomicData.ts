'use client';

import { useQuery } from '@tanstack/react-query';
import type { EconomicData } from '@/types';

async function fetchEconomicData(): Promise<EconomicData> {
  const res = await fetch('/api/economic', { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useEconomicData() {
  return useQuery({
    queryKey: ['economic-data'],
    queryFn: fetchEconomicData,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
