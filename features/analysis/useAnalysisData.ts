'use client';

import { useMemo } from 'react';
import { useEconomicData, useIlFiyatlari, useTurkiyeTrend, useTapuIslemToplam } from '@/hooks';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { getChartOption } from '@/app/(app)/parselens/utils/chartOptions';

export function useAnalysisData() {
  const { trendKategori, selectedParcel } = useAnalysisStore();

  const { data: economicData, isLoading: economicDataLoading } = useEconomicData();

  const { data: ilFiyatlari, isLoading: ilFiyatlariLoading } = useIlFiyatlari(trendKategori);

  const {
    data: turkiyeTrend,
    isLoading: turkiyeTrendLoading,
  } = useTurkiyeTrend(120, trendKategori);

  const { data: tapuIslemToplam, isLoading: tapuIslemLoading } = useTapuIslemToplam();

  const scoreCards = useMemo(
    () => [
      { title: `emlaX Konut`, value: 85, change: 12, changeType: 'increase' },
      { title: 'Satış Skoru', value: 78, change: 5, changeType: 'increase' },
      { title: 'Kira Skoru', value: 92, change: 8, changeType: 'increase' },
      { title: 'Yaşam Skoru', value: 87, change: 10, changeType: 'increase' },
    ],
    []
  );

  return {
    economicData: economicData ?? null,
    economicDataLoading,
    ilFiyatlari: ilFiyatlari ?? null,
    ilFiyatlariLoading,
    turkiyeTrend: turkiyeTrend ?? null,
    turkiyeTrendLoading,
    tapuIslemToplam: tapuIslemToplam ?? null,
    tapuIslemLoading,
    scoreCards,
  };
}
