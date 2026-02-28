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

export interface TapuIslemStats {
  parsel_islem?: number;
  yakin_cevre?: { ort_islem: number; max_islem: number; parsel_sayisi: number };
  il_stats?: { parsel_sayisi: number; toplam_islem: number; ort_islem: number; max_islem: number; yogun_parsel_sayisi: number };
  il_siralama?: number;
  toplam_il?: number;
}

export interface TapuIslemMahalle {
  il: string;
  ilce: string;
  mahalleler: { mahalle: string; parsel_sayisi: number; toplam_islem: number; ort_islem: number; max_islem: number }[];
  total: number;
  toplam_islem: number;
}

export interface TapuIslemIlce {
  il: string;
  ilceler: { ilce: string; parsel_sayisi: number; toplam_islem: number; ort_islem: number; max_islem: number }[];
  total: number;
  toplam_islem: number;
  enriched: boolean;
}

/** İl bazlı TKGM tapu işlem istatistikleri */
export async function getTapuIslemStats(il?: string, parselId?: string): Promise<TapuIslemStats> {
  const params = new URLSearchParams();
  if (il) params.set('il', il);
  if (parselId) params.set('parsel_id', parselId);
  return apiFetch<TapuIslemStats>(`/api/tapu-islem-stats?${params.toString()}`);
}

/** Mahalle bazlı TKGM tapu işlem dağılımı (spatial join ~130ms) */
export async function getTapuIslemMahalle(il: string, ilce: string): Promise<TapuIslemMahalle> {
  return apiFetch<TapuIslemMahalle>(
    `/api/tapu-islem-mahalle?il=${encodeURIComponent(il)}&ilce=${encodeURIComponent(ilce)}`
  );
}

/** İlçe bazlı TKGM tapu işlem dağılımı */
export async function getTapuIslemIlce(il: string): Promise<TapuIslemIlce> {
  return apiFetch<TapuIslemIlce>(`/api/tapu-islem-ilce?il=${encodeURIComponent(il)}`);
}

// ========================================================================
// NÜFUS VERİLERİ
// ========================================================================

export interface NufusIlItem {
  il: string;
  toplam: number;
  erkek: number;
  kadin: number;
  genc_0_14: number;
  yasli_65_plus: number;
  genc_yuzde: number;
  yasli_yuzde: number;
  erkek_yuzde: number;
  kadin_yuzde: number;
  ilce_sayisi: number | null;
  mahalle_sayisi: number | null;
}

export interface NufusYillikTrend {
  yil: number;
  toplam: number;
  toplam_nufus?: number;
  erkek: number;
  erkek_nufus?: number;
  kadin: number;
  kadin_nufus?: number;
}

export interface NufusIlceItem {
  ilce: string;
  toplam: number;
  erkek: number;
  kadin: number;
  nufus_yuzdesi: number;
}

export interface NufusSesItem {
  ilce: string;
  skor: number;
}

export interface NufusMahalleItem {
  mahalle_adi: string;
  ilce_adi?: string;
  toplam_nufus: number;
  erkek_nufus?: number;
  kadin_nufus?: number;
}

export interface NufusDataTurkiye {
  seviye: 'turkiye';
  toplam_nufus: number;
  erkek_nufus: number;
  kadin_nufus: number;
  genc_0_14: number;
  yasli_65_plus: number;
  erkek_yuzde: number;
  kadin_yuzde: number;
  genc_yuzde: number;
  yasli_yuzde: number;
  yillik_degisim: number | null;
  il_sayisi: number;
  iller: NufusIlItem[];
  yillik_trend: NufusYillikTrend[];
  genc_iller: { il: string; yuzde: number }[];
  yasli_iller: { il: string; yuzde: number }[];
  buyuk_il: number;
  orta_il: number;
  kucuk_il: number;
}

export interface NufusDataIl {
  seviye: 'il';
  il: string;
  toplam: number;
  erkek: number;
  kadin: number;
  genc_0_14: number;
  yasli_65_plus: number;
  genc_yuzde: number;
  yasli_yuzde: number;
  erkek_yuzde: number;
  kadin_yuzde: number;
  ilce_sayisi: number | null;
  mahalle_sayisi: number | null;
  yillik_degisim: number | null;
  yillik_trend: NufusYillikTrend[];
  yillik_degisimler: { yil: number; degisim: number }[];
  ilceler: NufusIlceItem[];
  ilce_cinsiyet: { ilce: string; erkek_yuzde: number; kadin_yuzde: number }[];
  ses_data: NufusSesItem[];
  top_mahalleler: NufusMahalleItem[];
  turkiye_sira: number;
  turkiye_ort: { ort_genc: number; ort_yasli: number; ort_erkek: number };
}

export interface NufusDataIlce {
  seviye: 'ilce';
  il: string;
  ilce: string;
  toplam: number;
  erkek: number;
  kadin: number;
  nufus_yuzdesi: number;
  mahalleler: NufusMahalleItem[];
  ses_skor: number | null;
  il_yillik_trend: NufusYillikTrend[];
  il_detay: NufusIlItem | null;
  tum_ilceler: NufusIlceItem[];
  ses_tum_ilceler: NufusSesItem[];
  ilce_sira: number;
}

export type NufusData = NufusDataTurkiye | NufusDataIl | NufusDataIlce;

export async function getNufusData(il?: string, ilce?: string): Promise<NufusData> {
  const params = new URLSearchParams();
  if (il) params.set('il', il);
  if (ilce) params.set('ilce', ilce);
  const qs = params.toString();
  return apiFetch<NufusData>(`/api/nufus-data${qs ? `?${qs}` : ''}`);
}

// ========================================================================
// DEMOGRAFİ & GÖÇ
// ========================================================================

export interface DemografiData {
  il_demografi?: Record<string, any>;
  ilce_demografi?: Record<string, any>;
  mahalle_demografi?: Record<string, any>;
  tum_ilceler_demografi?: Record<string, any>[];
  ilceler_demografi?: Record<string, any>[];
  goc?: { yil: number; alinan_goc: number; verilen_goc: number; net_goc: number; net_goc_hizi: number }[];
  goc_ozet?: { son_yil: number; net_goc: number; net_goc_hizi: number; alinan: number; verilen: number; trend: string };
  ses_detay?: { il: string; ilce: string; ses_skor: number; ust_seviye_a: number; ust_alti_b: number; orta_c: number; alt_d: number; en_alt_e: number }[];
}

export async function getDemografi(il?: string, ilce?: string, mahalle?: string): Promise<DemografiData> {
  const params = new URLSearchParams();
  if (il) params.set('il', il);
  if (ilce) params.set('ilce', ilce);
  if (mahalle) params.set('mahalle', mahalle);
  const qs = params.toString();
  return apiFetch<DemografiData>(`/api/demografi${qs ? `?${qs}` : ''}`);
}

// ========================================================================
// YAŞANILABILIRLIK ENDEKSİ
// ========================================================================

export interface YasanilabilirlikData {
  il: string;
  guvenlik_skoru: number;
  suc_orani_10k: number;
  tr_suc_orani_10k: number;
  toplam_hukumlu: number;
  suc_turleri: { tur: string; sayi: number; tr_sayi: number }[];
  guvenlik_sira: number;
  toplam_il: number;
  nufus: number;
  seviye: string;
}

export async function getYasanilabilirlik(il: string): Promise<YasanilabilirlikData> {
  return apiFetch<YasanilabilirlikData>(`/api/yasanilabilirlik?il=${encodeURIComponent(il)}`);
}

// ========================================================================
// TALEP İLGİ (YERLİ / YABANCI)
// ========================================================================

export interface TalepIlgiData {
  satis_trend?: { yil: number; toplam_satis: number; ipotekli_satis: number; ilk_satis?: number; ikinci_el_satis?: number; yabanci_satis?: number }[];
  yabanci_satis_trend?: { yil: number; yillik_toplam: number }[];
  yerli_ilgi?: { skor: number; degisim: number; son_yil_satis: number; onceki_yil_satis: number; ipotekli_oran: number; seviye: string };
  yabanci_ilgi?: { skor: number; degisim: number; son_yil: number; seviye: string };
  ilce_karsilastirma?: { ilce: string; yil: number; toplam_satis: number; ipotekli_satis: number; yabanci_satis?: number }[];
}

export async function getTalepIlgi(il: string, ilce?: string): Promise<TalepIlgiData> {
  const params = new URLSearchParams({ il });
  if (ilce) params.set('ilce', ilce);
  return apiFetch<TalepIlgiData>(`/api/talep-ilgi?${params.toString()}`);
}

// ── Yapı Belgesi (İnşaat Aktivitesi) ─────────────────
export interface YapiBelgesiData {
  ruhsat_trend?: { yil: number; daire_sayisi: number }[];
  iskan_trend?: { yil: number; daire_sayisi: number }[];
  ruhsat_son_yil?: number;
  ruhsat_degisim?: number;
  iskan_son_yil?: number;
  iskan_degisim?: number;
  ruhsat_iskan_orani?: number;
  il_sirasi?: number;
  toplam_il?: number;
  ceyreklik_ruhsat?: { ceyrek: number; daire_sayisi: number }[];
  top_iller?: { il: string; daire_sayisi: number }[];
}

export async function getYapiBelgesi(il: string): Promise<YapiBelgesiData> {
  return apiFetch<YapiBelgesiData>(`/api/yapi-belgesi?il=${encodeURIComponent(il)}`);
}

// ── Arsa Pazar Verileri ──────────────────────────────
export interface ArsaPazarData {
  ozet?: { toplam_ilan: number; ort_m2_fiyat: number; medyan_m2_fiyat: number; ort_alan: number; ort_fiyat: number };
  imar_dagilimi?: { imar: string; sayi: number }[];
  tapu_dagilimi?: { tapu: string; sayi: number }[];
  fiyat_segmentleri?: { aralik: string; sayi: number }[];
  ilce_karsilastirma?: { ilce: string; ilan_sayisi: number; ort_m2_fiyat: number; ort_alan: number }[];
}

export async function getArsaPazar(il: string, ilce?: string): Promise<ArsaPazarData> {
  const params = new URLSearchParams({ il });
  if (ilce) params.set('ilce', ilce);
  return apiFetch<ArsaPazarData>(`/api/arsa-pazar?${params.toString()}`);
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
