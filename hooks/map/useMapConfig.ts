'use client';

import { useMemo } from 'react';
import type { MapMode, TileConfig } from '@/types';

const TILE_CONFIGS: Record<Exclude<MapMode, '3d'>, TileConfig> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  satellite: {
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: undefined,
    maxZoom: 21,
  },
  hybrid: {
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: undefined,
    maxZoom: 21,
  },
};

export function useMapConfig(mapMode: MapMode) {
  const tileConfig = useMemo<TileConfig>(() => {
    if (mapMode === '3d') return TILE_CONFIGS.dark;
    return TILE_CONFIGS[mapMode];
  }, [mapMode]);

  const is3D = mapMode === '3d';

  return { tileConfig, is3D };
}
