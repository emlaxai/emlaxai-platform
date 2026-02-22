/**
 * EmlaXAI API Client v2
 * =======================
 * Tüm API çağrıları kendi domainimiz üzerinden yapılır (/api/...).
 * Backend IP ve API Key asla browser'a sızmaz.
 */

import React from 'react';

// ========================================================================
// INTERFACES
// ========================================================================

export interface EconomicData {
  live_data: {
    usd_try: { value: number; change: number };
    eur_try: { value: number; change: number };
    gold_gram_try: { value: number; change: number };
    bist100: { value: number; change: number };
    timestamp: string;
    source: string;
  };
  inflation: {
    monthly: number;
    yearly: number;
    date: string;
    source: string;
  };
  interest_rate: {
    value: number;
    last_update: string;
    source: string;
    note: string;
  };
  historical_forex: {
    usd_try: Array<{ month: string; value: number }>;
    eur_try: Array<{ month: string; value: number }>;
    source: string;
  };
  risk_scores: {
    doviz_volatilitesi: number;
    enflasyon_riski: number;
    faiz_degisim_riski: number;
    piyasa_likidite_riski: number;
    toplam_risk: number;
  };
  risk_levels: {
    [key: string]: { text: string; level: string };
  };
  last_updated: string;
}

export interface IlFiyat {
  il: string;
  m2_fiyat: number;
  guvenilirlik: number;
  trend_12ay: number | null;
  referans: string;
}

export interface IlFiyatlari {
  iller: IlFiyat[];
  total: number;
}

export interface TrendNokta {
  tarih: string;
  m2_fiyat: number | null;
  endeksa_m2?: number | null;
  sahibinden_m2?: number | null;
  mahalle_agg_m2?: number | null;
  confidence_lower: number | null;
  confidence_upper: number | null;
  guvenilirlik: number | null;
  ilan_sayisi: number;
  veri_tipi: 'gercek' | 'tahmin';
}

export interface IlTrend {
  il: string;
  trend: TrendNokta[];
  total_ay: number;
  gercek_ay: number;
  tahmin_ay: number;
  son_gercek_fiyat: number | null;
  son_tahmin_fiyat: number | null;
}

export interface IlceFiyat {
  ilce: string;
  m2_fiyat: number;
  guvenilirlik: number;
  referans: string;
}

export interface IlceFiyatlari {
  il: string;
  ilceler: IlceFiyat[];
  total: number;
}

export interface IlceTrend {
  il: string;
  ilce: string;
  trend: TrendNokta[];
  total_ay: number;
  gercek_ay: number;
  tahmin_ay: number;
  son_gercek_fiyat: number | null;
  son_tahmin_fiyat: number | null;
}

export interface MahalleFiyat {
  mahalle: string;
  m2_fiyat: number;
  guvenilirlik: number;
  referans: string;
}

export interface MahalleFiyatlari {
  il: string;
  ilce: string;
  mahalleler: MahalleFiyat[];
  total: number;
}

export interface MahalleTrend {
  il: string;
  ilce: string;
  mahalle: string;
  trend: TrendNokta[];
  total_ay: number;
  gercek_ay: number;
  tahmin_ay: number;
  son_gercek_fiyat: number | null;
  son_tahmin_fiyat: number | null;
}

// ========================================================================
// FETCH FUNCTIONS
// ========================================================================

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/** Türkiye geneli trend interface */
export interface TurkiyeTrend {
  baslik: string;
  trend: TrendNokta[];
  total_ay: number;
  gercek_ay: number;
  tahmin_ay: number;
  son_gercek_fiyat: number | null;
  son_tahmin_fiyat: number | null;
}

/** Ekonomik veriler (döviz, altın, BIST, enflasyon, faiz, risk) */
export async function getEconomicData(): Promise<EconomicData> {
  return apiFetch<EconomicData>('/api/economic');
}

/** Türkiye geneli m² fiyat trendi (tüm illerin ortalaması) */
export async function getTurkiyeTrend(ay_sayisi: number = 60, kategori: string = 'konut'): Promise<TurkiyeTrend> {
  return apiFetch<TurkiyeTrend>(`/api/turkiye-trend?ay_sayisi=${ay_sayisi}&kategori=${encodeURIComponent(kategori)}`);
}

/** Tüm illerin güncel m² fiyatları */
export async function getIlFiyatlari(kategori: string = 'konut'): Promise<IlFiyatlari> {
  return apiFetch<IlFiyatlari>(`/api/il-fiyatlari?kategori=${encodeURIComponent(kategori)}`);
}

/** Tek ilin trend verisi (geçmiş + tahmin) */
export async function getIlTrend(il: string, ay_sayisi: number = 48, kategori: string = 'konut'): Promise<IlTrend> {
  return apiFetch<IlTrend>(`/api/il-trend/${encodeURIComponent(il)}?ay_sayisi=${ay_sayisi}&kategori=${encodeURIComponent(kategori)}`);
}

/** Bir ilin tüm ilçelerinin güncel fiyatları */
export async function getIlceFiyatlari(il: string, kategori: string = 'konut'): Promise<IlceFiyatlari> {
  return apiFetch<IlceFiyatlari>(`/api/ilce-fiyatlari/${encodeURIComponent(il)}?kategori=${encodeURIComponent(kategori)}`);
}

/** Tek ilçenin trend verisi */
export async function getIlceTrend(il: string, ilce: string, ay_sayisi: number = 48, kategori: string = 'konut'): Promise<IlceTrend> {
  return apiFetch<IlceTrend>(`/api/ilce-trend/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}?ay_sayisi=${ay_sayisi}&kategori=${encodeURIComponent(kategori)}`);
}

/** Bir ilçenin tüm mahallelerinin güncel fiyatları */
export async function getMahalleFiyatlari(il: string, ilce: string, kategori: string = 'konut'): Promise<MahalleFiyatlari> {
  return apiFetch<MahalleFiyatlari>(`/api/mahalle-fiyatlari/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}?kategori=${encodeURIComponent(kategori)}`);
}

/** Tek mahallenin trend verisi */
export async function getMahalleTrend(
  il: string, ilce: string, mahalle: string, ay_sayisi: number = 48, kategori: string = 'konut'
): Promise<MahalleTrend> {
  return apiFetch<MahalleTrend>(
    `/api/mahalle-trend/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}/${encodeURIComponent(mahalle)}?ay_sayisi=${ay_sayisi}&kategori=${encodeURIComponent(kategori)}`
  );
}

// ========================================================================
// TKGM TAPU İŞLEM HACMİ
// ========================================================================

export interface TapuIlItem {
  il: string;
  sira: number;
  parsel_sayisi: number;
  toplam_islem: number;
  ort_islem: number;
  max_islem: number;
  yogun_parsel: number;
}

export interface TapuIslemToplam {
  iller: TapuIlItem[];
  total: number;
  genel: {
    toplam_islem: number;
    toplam_parsel: number;
    ort_islem_per_parsel: number;
  };
}

/** TKGM tüm illerin tapu işlem hacmi istatistikleri */
export async function getTapuIslemToplam(): Promise<TapuIslemToplam> {
  return apiFetch<TapuIslemToplam>('/api/tapu-islem-toplam');
}

// ========================================================================
// HOOKS
// ========================================================================

export function useEconomicData() {
  const [data, setData] = React.useState<EconomicData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    getEconomicData()
      .then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}

export function useIlFiyatlari() {
  const [data, setData] = React.useState<IlFiyatlari | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    getIlFiyatlari()
      .then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}

export function useIlTrend(il: string, ay_sayisi: number = 48) {
  const [data, setData] = React.useState<IlTrend | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!il) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    getIlTrend(il, ay_sayisi)
      .then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [il, ay_sayisi]);

  return { data, loading, error };
}

export function useIlceFiyatlari(il: string) {
  const [data, setData] = React.useState<IlceFiyatlari | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!il) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    getIlceFiyatlari(il)
      .then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [il]);

  return { data, loading, error };
}

export function useIlceTrend(il: string, ilce: string, ay_sayisi: number = 48) {
  const [data, setData] = React.useState<IlceTrend | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!il || !ilce) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    getIlceTrend(il, ilce, ay_sayisi)
      .then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [il, ilce, ay_sayisi]);

  return { data, loading, error };
}

export function useMahalleFiyatlari(il: string, ilce: string) {
  const [data, setData] = React.useState<MahalleFiyatlari | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!il || !ilce) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    getMahalleFiyatlari(il, ilce)
      .then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [il, ilce]);

  return { data, loading, error };
}

export function useMahalleTrend(il: string, ilce: string, mahalle: string, ay_sayisi: number = 48) {
  const [data, setData] = React.useState<MahalleTrend | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!il || !ilce || !mahalle) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    getMahalleTrend(il, ilce, mahalle, ay_sayisi)
      .then(d => { if (mounted) { setData(d); setError(null); } })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [il, ilce, mahalle, ay_sayisi]);

  return { data, loading, error };
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

/** Sayıyı Türkçe formatla */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Değişim yüzdesini formatla (+/-) */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatNumber(change, 2)}%`;
}

/** Değişim rengini döndür */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-white/60';
}

/** Risk skoruna göre renk */
export function getRiskColor(score: number): string {
  if (score >= 75) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
}

/** Risk gradyanı */
export function getRiskGradient(score: number): string {
  if (score >= 75) return 'from-red-500 to-red-400';
  if (score >= 60) return 'from-orange-500 to-orange-400';
  if (score >= 40) return 'from-yellow-500 to-yellow-400';
  return 'from-green-500 to-green-400';
}

/** Güvenilirlik skoruna göre renk */
export function getGuvenilirlikColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}
