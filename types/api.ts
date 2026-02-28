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

export interface TurkiyeTrend {
  baslik: string;
  trend: TrendNokta[];
  total_ay: number;
  gercek_ay: number;
  tahmin_ay: number;
  son_gercek_fiyat: number | null;
  son_tahmin_fiyat: number | null;
}

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

export interface SmartSearchResult {
  type: 'il' | 'ilce' | 'mahalle' | 'parsel' | 'adres';
  label: string;
  il?: string;
  ilce?: string;
  mahalle?: string;
  ada?: string;
  parsel?: string;
  lat?: number;
  lng?: number;
}
