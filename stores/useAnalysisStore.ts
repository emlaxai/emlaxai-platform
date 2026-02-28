'use client';

import { create } from 'zustand';
import type { ParselDetail, DisasterRisk } from '@/types';

interface AnalysisState {
  activeTab: string;
  trendKategori: string;
  propertyType: string;
  selectedMetric: string;
  analysisTitle: string;
  selectedParcel: ParselDetail | null;
  parcelLoading: boolean;
  disasterRisk: DisasterRisk | null;
  showAll81Cities: boolean;

  setActiveTab: (tab: string) => void;
  setTrendKategori: (kategori: string) => void;
  setPropertyType: (type: string) => void;
  setSelectedMetric: (metric: string) => void;
  setAnalysisTitle: (title: string) => void;
  setSelectedParcel: (parcel: ParselDetail | null) => void;
  setParcelLoading: (loading: boolean) => void;
  setDisasterRisk: (risk: DisasterRisk | null) => void;
  setShowAll81Cities: (show: boolean) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  activeTab: 'genel',
  trendKategori: 'konut',
  propertyType: 'Konut',
  selectedMetric: 'm2',
  analysisTitle: 'Türkiye Genel Bakış',
  selectedParcel: null,
  parcelLoading: false,
  disasterRisk: null,
  showAll81Cities: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setTrendKategori: (kategori) => set({ trendKategori: kategori }),
  setPropertyType: (type) => set({ propertyType: type }),
  setSelectedMetric: (metric) => set({ selectedMetric: metric }),
  setAnalysisTitle: (title) => set({ analysisTitle: title }),
  setSelectedParcel: (parcel) => set({ selectedParcel: parcel }),
  setParcelLoading: (loading) => set({ parcelLoading: loading }),
  setDisasterRisk: (risk) => set({ disasterRisk: risk }),
  setShowAll81Cities: (show) => set({ showAll81Cities: show }),
}));
