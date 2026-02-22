// GeoJSON NAME_1 → DB il ismi eşleştirme
export const GEOJSON_TO_DB_NAME: Record<string, string> = {
  'Afyon': 'Afyonkarahisar',
  'Istanbul': 'İstanbul',
  'Izmir': 'İzmir',
  'K.Maras': 'Kahramanmaras',
  'Kinkkale': 'Kirikkale',
  'Zinguldak': 'Zonguldak',
  'Bartın': 'Bartin',
  'Bingöl': 'Bingol',
  'Düzce': 'Duzce',
  'Elazığ': 'Elazig',
  'Gümüshane': 'Gumushane',
  'Iğdır': 'Igdir',
  'Karabük': 'Karabuk',
  'Kütahya': 'Kutahya',
  'Çanakkale': 'Canakkale',
  'Çankiri': 'Cankiri',
  'Çorum': 'Corum',
};

export function geoNameToDbName(geoName: string): string {
  return GEOJSON_TO_DB_NAME[geoName] || geoName;
}

// ========================================================================
// Parsel Detay Tipi (İmar Baskısı click)
// ========================================================================
export interface ParselDetail {
  parsel: {
    tapu_kimlik_no: string;
    il: string;
    ilce: string;
    mahalle: string;
    ada: string;
    parsel: string;
    pafta: string | null;
    cins: string;
    kategori: string;
    alan: number;
    gercek_alan_m2: number;
    lat: number;
    lng: number;
    max_kat: number;
    toplam_bb: number;
    mesken_sayisi: number;
    isyeri_sayisi: number;
    taks: number;
    kaks: number;
    tahmini_kat: number;
    bina_sayisi_ms: number;
    bina_alan_ms: number;
    arazi_kullanim: string;
    wsf3d_height: number;
    imar_potansiyel: number;
    imar_tipi_tahmini: string;
    imar_tipi_guven: number;
    tahmini_kat_imar: number;
    tahmini_taks_imar: number;
    tahmini_kaks_imar: number;
    imar_sure_tahmini: string;
  };
  imar_baskisi: {
    skor: number;
    base_skor?: number;
    tapu_bonus?: number;
    seviye: string;
    aciklama: string;
  };
  tapu_islem?: {
    parsel_islem: number;
    cevre_ort: number;
    cevre_max: number;
    cevre_toplam?: number;
    cevre_parsel: number;
  };
  mesafeler: {
    yol: number | null;
    arsa: number | null;
    konut: number | null;
    ticari: number | null;
  };
  bolge_dagilim: Array<{ kategori: string; sayi: number; ort_alan: number }>;
  poi_mesafeler: {
    okul: { name: string; distance_m: number } | null;
    hastane: { name: string; distance_m: number } | null;
    cami: { name: string; distance_m: number } | null;
    market: { name: string; distance_m: number } | null;
    eczane: { name: string; distance_m: number } | null;
    otobus: { name: string; distance_m: number } | null;
    sanayi: { name: string; distance_m: number } | null;
    havalimani: { name: string; distance_m: number } | null;
  };
  fiyat_tahmini?: {
    tahmini_m2: number;
    tahmini_toplam: number;
    arazi_m2?: number;
    arazi_toplam?: number;
    yapi_degeri?: number;
    ada_ortalama_m2?: number;
    konum_skoru?: number;
    konum_carpan?: number;
    kategori: string;
    guvenilirlik: string;
    mahalle_m2_baz?: number;
  };
}

export const PRICE_GRADIENT_COLORS = [
  { r: 16, g: 185, b: 129 },   // #10b981 - yeşil (en ucuz)
  { r: 34, g: 197, b: 94 },    // #22c55e
  { r: 132, g: 204, b: 22 },   // #84cc16
  { r: 234, g: 179, b: 8 },    // #eab308
  { r: 245, g: 158, b: 11 },   // #f59e0b
  { r: 249, g: 115, b: 22 },   // #f97316
  { r: 239, g: 68, b: 68 },    // #ef4444
  { r: 220, g: 38, b: 38 },    // #dc2626 - kırmızı (en pahalı)
];

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
