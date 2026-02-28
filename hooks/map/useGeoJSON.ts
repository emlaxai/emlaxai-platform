'use client';

import { useQuery } from '@tanstack/react-query';
import type { FeatureCollection } from 'geojson';

async function fetchGeoJSON(path: string): Promise<FeatureCollection> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GeoJSON yüklenemedi: ${path}`);
  return res.json();
}

export function useIllerGeoJSON(enabled = true) {
  return useQuery({
    queryKey: ['geojson', 'iller'],
    queryFn: () => fetchGeoJSON('/geojson/iller_sinirlari.json'),
    enabled,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  });
}

export function useIlcelerGeoJSON(il: string | null) {
  return useQuery({
    queryKey: ['geojson', 'ilceler', il],
    queryFn: () => fetchGeoJSON(`/api/ilce-sinir?il=${encodeURIComponent(il!)}`),
    enabled: !!il,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useMahallelerGeoJSON(il: string | null, ilce: string | null) {
  return useQuery({
    queryKey: ['geojson', 'mahalleler', il, ilce],
    queryFn: () =>
      fetchGeoJSON(
        `/api/mahalle-sinir?il=${encodeURIComponent(il!)}&ilce=${encodeURIComponent(ilce!)}`
      ),
    enabled: !!il && !!ilce,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
