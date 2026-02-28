'use client';

import { useQuery } from '@tanstack/react-query';
import type { SearchResult } from '@/types/map';

async function fetchSmartSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const res = await fetch(`/api/smart-search?q=${encodeURIComponent(query)}&limit=10`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();

  if (data.results && data.results.length > 0) {
    return data.results;
  }

  const nominatimRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=5&q=${encodeURIComponent(query)}`,
    { headers: { 'Accept-Language': 'tr' } }
  );
  if (!nominatimRes.ok) return [];
  const places = await nominatimRes.json();
  return places.map((p: any) => ({
    type: 'adres' as const,
    label: p.display_name,
    display_name: p.display_name,
    lat: parseFloat(p.lat),
    lng: parseFloat(p.lon),
  }));
}

export function useSmartSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['smart-search', query],
    queryFn: () => fetchSmartSearch(query),
    enabled: enabled && query.length >= 2,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
