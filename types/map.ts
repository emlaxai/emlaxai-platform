import type { FeatureCollection } from 'geojson';

export type MapMode = 'dark' | 'satellite' | 'hybrid' | '3d';

export interface TileConfig {
  url: string;
  subdomains: string | undefined;
  maxZoom: number;
}

export interface LayerState {
  talepYogunlugu: boolean;
  imarBaskisi: boolean;
  ilSinirlari: boolean;
  ilceSinirlari: boolean;
  mahalleSinirlari: boolean;
}

export interface MapSelection {
  il: string | null;
  ilce: string | null;
  ilCenter: [number, number] | null;
  ilZoom: number;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  showResults: boolean;
  pin: [number, number] | null;
}

export interface SearchResult {
  type: 'il' | 'ilce' | 'mahalle' | 'parsel' | 'adres';
  label: string;
  il?: string;
  ilce?: string;
  mahalle?: string;
  ada?: string;
  parsel?: string;
  lat?: number;
  lng?: number;
  display_name?: string;
}

export interface GeoJSONState {
  iller: FeatureCollection | null;
  ilceler: FeatureCollection | null;
  mahalleler: FeatureCollection | null;
}

export interface CesiumFlyTo {
  lat: number;
  lng: number;
  height?: number;
  coordinates?: number[][];
}

export const PRICE_GRADIENT_COLORS = [
  { r: 16, g: 185, b: 129 },
  { r: 34, g: 197, b: 94 },
  { r: 132, g: 204, b: 22 },
  { r: 234, g: 179, b: 8 },
  { r: 245, g: 158, b: 11 },
  { r: 249, g: 115, b: 22 },
  { r: 239, g: 68, b: 68 },
  { r: 220, g: 38, b: 38 },
] as const;

export function getPriceColor(price: number, min: number, max: number): string {
  if (max <= min) return '#10b981';
  const t = Math.max(0, Math.min(1, (price - min) / (max - min)));
  const segment = t * (PRICE_GRADIENT_COLORS.length - 1);
  const idx = Math.min(Math.floor(segment), PRICE_GRADIENT_COLORS.length - 2);
  const localT = segment - idx;
  const c1 = PRICE_GRADIENT_COLORS[idx];
  const c2 = PRICE_GRADIENT_COLORS[idx + 1];
  const r = Math.round(c1.r + (c2.r - c1.r) * localT);
  const g = Math.round(c1.g + (c2.g - c1.g) * localT);
  const b = Math.round(c1.b + (c2.b - c1.b) * localT);
  return `rgb(${r}, ${g}, ${b})`;
}
