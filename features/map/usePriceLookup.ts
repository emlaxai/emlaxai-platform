'use client';

import { useMemo } from 'react';
import { getPriceColor } from '@/types/map';
import { normalizeForMatch, normalizeMahalle, buildMahalleFiyatMap } from '@/app/(app)/parselens/utils/helpers';
import { geoNameToDbName } from '@/app/(app)/parselens/utils/constants';

interface IlFiyatlari {
  iller: Array<{ il: string; m2_fiyat: number; trend_12ay: number | null }>;
}

interface IlceFiyatlari {
  ilceler: Array<{ ilce: string; m2_fiyat: number }>;
}

interface MahalleFiyatlari {
  mahalleler: Array<{ mahalle: string; m2_fiyat: number }>;
}

export function usePriceLookup(
  ilFiyatlari: IlFiyatlari | null,
  ilceFiyatlari: IlceFiyatlari | null,
  mahalleFiyatlari: MahalleFiyatlari | null
) {
  const ilFiyatMap = useMemo(() => {
    const map: Record<string, { m2_fiyat: number; trend_12ay: number | null }> = {};
    if (ilFiyatlari?.iller) {
      for (const il of ilFiyatlari.iller) {
        map[il.il] = { m2_fiyat: il.m2_fiyat, trend_12ay: il.trend_12ay };
      }
    }
    return map;
  }, [ilFiyatlari]);

  const { priceMin, priceMax } = useMemo(() => {
    if (!ilFiyatlari?.iller?.length) return { priceMin: 0, priceMax: 100000 };
    const prices = ilFiyatlari.iller.map((il) => il.m2_fiyat);
    return { priceMin: Math.min(...prices), priceMax: Math.max(...prices) };
  }, [ilFiyatlari]);

  const ilceFiyatMap = useMemo(() => {
    const map: Record<string, { ilce: string; m2_fiyat: number }> = {};
    if (ilceFiyatlari?.ilceler) {
      for (const ilce of ilceFiyatlari.ilceler) {
        const key = normalizeForMatch(ilce.ilce);
        map[key] = { ilce: ilce.ilce, m2_fiyat: ilce.m2_fiyat };
      }
    }
    return map;
  }, [ilceFiyatlari]);

  const { ilcePriceMin, ilcePriceMax } = useMemo(() => {
    if (!ilceFiyatlari?.ilceler?.length) return { ilcePriceMin: 0, ilcePriceMax: 100000 };
    const prices = ilceFiyatlari.ilceler.map((i) => i.m2_fiyat);
    return { ilcePriceMin: Math.min(...prices), ilcePriceMax: Math.max(...prices) };
  }, [ilceFiyatlari]);

  const mahalleFiyatMapObj = useMemo(() => {
    if (!mahalleFiyatlari?.mahalleler) return {};
    return buildMahalleFiyatMap(mahalleFiyatlari.mahalleler);
  }, [mahalleFiyatlari]);

  const { mahallePriceMin, mahallePriceMax, mahalleAvgPrice } = useMemo(() => {
    if (!mahalleFiyatlari?.mahalleler?.length) {
      return { mahallePriceMin: 0, mahallePriceMax: 100000, mahalleAvgPrice: 0 };
    }
    const prices = mahalleFiyatlari.mahalleler.map((m) => m.m2_fiyat);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { mahallePriceMin: Math.min(...prices), mahallePriceMax: Math.max(...prices), mahalleAvgPrice: avg };
  }, [mahalleFiyatlari]);

  const getIlPrice = (geoName: string) => {
    const dbName = geoNameToDbName(geoName);
    return ilFiyatMap[dbName] || null;
  };

  const getIlColor = (geoName: string): string => {
    const priceData = getIlPrice(geoName);
    if (!priceData) return '#10b981';
    return getPriceColor(priceData.m2_fiyat, priceMin, priceMax);
  };

  const getIlcePrice = (geoIlceName: string) => {
    const key = normalizeForMatch(geoIlceName);
    return ilceFiyatMap[key] || null;
  };

  const getIlceColor = (geoIlceName: string): string => {
    const data = getIlcePrice(geoIlceName);
    if (!data) return '#06b6d4';
    return getPriceColor(data.m2_fiyat, ilcePriceMin, ilcePriceMax);
  };

  const getMahallePrice = (geoMahalleAdi: string) => {
    const key = normalizeMahalle(geoMahalleAdi);
    const exact = mahalleFiyatMapObj[key];
    if (exact) return exact;
    if (mahalleAvgPrice > 0) {
      return { mahalle: geoMahalleAdi, m2_fiyat: mahalleAvgPrice, tahmini: true };
    }
    return null;
  };

  const getMahalleColor = (geoMahalleAdi: string): string => {
    const data = getMahallePrice(geoMahalleAdi);
    if (!data) return '#06b6d4';
    const color = getPriceColor(data.m2_fiyat, mahallePriceMin, mahallePriceMax);
    if ((data as any).tahmini) {
      return color.replace('rgb(', 'rgba(').replace(')', ', 0.6)');
    }
    return color;
  };

  return {
    priceMin,
    priceMax,
    ilcePriceMin,
    ilcePriceMax,
    mahallePriceMin,
    mahallePriceMax,
    getIlPrice,
    getIlColor,
    getIlcePrice,
    getIlceColor,
    getMahallePrice,
    getMahalleColor,
  };
}
