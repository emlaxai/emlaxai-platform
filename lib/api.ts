/**
 * EmlaXAI API Client
 * Centralized API communication
 */

import React from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://34.6.58.78:8000';

export interface EconomicData {
  live_data: {
    usd_try: {
      value: number;
      change: number;
    };
    eur_try: {
      value: number;
      change: number;
    };
    gold_gram_try: {
      value: number;
      change: number;
    };
    bist100: {
      value: number;
      change: number;
    };
    timestamp: string;
    source: string;
  };
  inflation: {
    monthly: number;
    yearly: number;
    date: string;
    source: string;
    note: string;
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
    period: string;
  };
  historical_inflation_housing: {
    inflation: Array<{ month: string; value: number }>;
    housing_price_increase: Array<{ month: string; value: number }>;
    source: string;
    period: string;
    note: string;
  };
  risk_scores: {
    doviz_volatilitesi: number;
    enflasyon_riski: number;
    faiz_degisim_riski: number;
    piyasa_likidite_riski: number;
    toplam_risk: number;
  };
  risk_levels: {
    doviz_volatilitesi: { text: string; level: string };
    enflasyon_riski: { text: string; level: string };
    faiz_degisim_riski: { text: string; level: string };
    piyasa_likidite_riski: { text: string; level: string };
    toplam_risk: { text: string; level: string };
  };
  last_updated: string;
}

/**
 * Fetch economic data (USD, EUR, Gold, BIST100, Inflation, Interest Rate)
 */
export async function getEconomicData(): Promise<EconomicData> {
  const response = await fetch(`${API_BASE_URL}/economic-data`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch economic data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Format number with Turkish locale
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format change percentage with +/- sign
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatNumber(change, 2)}%`;
}

/**
 * Get color class based on change value
 */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-white/60';
}

/**
 * Risk utilities - Frontend sadece renklendirme yapar, hesaplama backend'de
 */

/**
 * Get risk color based on score
 */
export function getRiskColor(score: number): string {
  if (score >= 75) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
}

/**
 * Get risk gradient based on score
 */
export function getRiskGradient(score: number): string {
  if (score >= 75) return 'from-red-500 to-red-400';
  if (score >= 60) return 'from-orange-500 to-orange-400';
  if (score >= 40) return 'from-yellow-500 to-yellow-400';
  return 'from-green-500 to-green-400';
}

/**
 * İl Fiyatları Interface (V2 - Armageddon V2 verileri)
 */
export interface IlFiyatlari {
  iller: Array<{
    il: string;
    m2_fiyat: number;
    smoothed_m2: number;
    confidence_lower: number;
    confidence_upper: number;
    guvenilirlik_skoru: number;  // 0-100
    ilan_sayisi: number;
    zaman_penceresi: number;
    volatilite: number;
    trend_12ay: number;
    momentum: number;  // 1-5 arası (⚡)
  }>;
  total: number;
  kategori: string;
  tip: string;
  referans_tarih: string;
  timestamp: string;
}

/**
 * İl Trend Verisi Interface
 */
export interface IlTrend {
  il: string;
  trend: Array<{
    tarih: string;
    final_m2: number;
    smoothed_m2: number;
    endeksa_m2: number;
    confidence_lower: number;
    confidence_upper: number;
    guvenilirlik_skoru: number;
    ilan_sayisi: number;
  }>;
  total_ay: number;
  timestamp: string;
}

/**
 * Fetch il fiyatlari (Tüm illerin m² fiyatları)
 */
export async function getIlFiyatlari(
  kategori: string = 'konut',
  tip: string = 'satilik'
): Promise<IlFiyatlari> {
  const response = await fetch(
    `${API_BASE_URL}/il-fiyatlari?kategori=${kategori}&tip=${tip}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch il fiyatlari: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch il trend (Belirli bir ilin trend verisi)
 */
export async function getIlTrend(
  il: string,
  kategori: string = 'konut',
  tip: string = 'satilik',
  ay_sayisi: number = 24
): Promise<IlTrend> {
  const response = await fetch(
    `${API_BASE_URL}/il-trend/${encodeURIComponent(il)}?kategori=${kategori}&tip=${tip}&ay_sayisi=${ay_sayisi}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch il trend: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Custom hook for il fiyatlari with caching
 */
export function useIlFiyatlari(kategori: string = 'konut', tip: string = 'satilik') {
  const [data, setData] = React.useState<IlFiyatlari | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getIlFiyatlari(kategori, tip);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [kategori, tip]);

  return { data, loading, error };
}

/**
 * Custom hook for il trend with caching
 */
export function useIlTrend(
  il: string,
  kategori: string = 'konut',
  tip: string = 'satilik',
  ay_sayisi: number = 24
) {
  const [data, setData] = React.useState<IlTrend | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!il) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getIlTrend(il, kategori, tip, ay_sayisi);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [il, kategori, tip, ay_sayisi]);

  return { data, loading, error };
}

/**
 * Get güvenilirlik color based on score (0-100)
 */
export function getGuvenilirlikColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get güvenilirlik gradient based on score
 */
export function getGuvenilirlikGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-green-400';
  if (score >= 60) return 'from-yellow-500 to-yellow-400';
  if (score >= 40) return 'from-orange-500 to-orange-400';
  return 'from-red-500 to-red-400';
}
