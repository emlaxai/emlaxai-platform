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
    okul: PoiItem | null;
    hastane: PoiItem | null;
    cami: PoiItem | null;
    market: PoiItem | null;
    eczane: PoiItem | null;
    otobus: PoiItem | null;
    sanayi: PoiItem | null;
    havalimani: PoiItem | null;
  };
  arazi_egimi?: {
    egim_pct: number;
    egim_derece: number;
    min_rakım: number;
    max_rakım: number;
    seviye: string;
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

export interface PoiItem {
  name: string;
  distance_m: number;
}

export interface DisasterRisk {
  deprem?: {
    pga_2: number;
    pga_10: number;
    ss_2: number;
    ss_10: number;
    s1_2: number;
    s1_10: number;
    pgv_2: number;
    risk_label: string;
    risk_color: string;
    risk_pct: number;
  };
  yangin?: {
    fwi_max: number;
    fwi_ortalama: number;
    risk_label: string;
    risk_color: string;
    risk_pct: number;
  };
  sel?: {
    sel_nehir: string;
    sel_kentsel: string;
    risk_label: string;
    risk_color: string;
    risk_pct: number;
  };
  heyelan?: {
    risk_label: string;
    risk_color: string;
    risk_pct: number;
  };
  tsunami?: {
    risk_label: string;
    risk_color: string;
    risk_pct: number;
  };
}
