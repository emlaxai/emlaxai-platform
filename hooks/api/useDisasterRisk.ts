'use client';

import { useQuery } from '@tanstack/react-query';
import type { DisasterRisk } from '@/types';

async function fetchDisasterRisk(il: string): Promise<DisasterRisk> {
  const res = await fetch(`/api/disaster-risk?il=${encodeURIComponent(il)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

export function useDisasterRisk(il: string | null) {
  return useQuery({
    queryKey: ['disaster-risk', il || 'TURKIYE'],
    queryFn: () => fetchDisasterRisk(il || 'TURKIYE'),
    staleTime: 60 * 60 * 1000,
  });
}
