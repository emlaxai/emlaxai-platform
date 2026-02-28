'use client';

import { create } from 'zustand';
import type { MapMode, LayerState, SearchResult } from '@/types';

interface MapState {
  mapMode: MapMode;
  selectedIl: string | null;
  selectedIlce: string | null;
  selectedIlCenter: [number, number] | null;
  selectedIlZoom: number;
  searchQuery: string;
  searchResults: SearchResult[];
  searchLoading: boolean;
  showSearchResults: boolean;
  searchPin: [number, number] | null;
  layers: LayerState;

  setMapMode: (mode: MapMode) => void;
  setSelectedIl: (il: string | null) => void;
  setSelectedIlce: (ilce: string | null) => void;
  setSelectedIlCenter: (center: [number, number] | null) => void;
  setSelectedIlZoom: (zoom: number) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSearchLoading: (loading: boolean) => void;
  setShowSearchResults: (show: boolean) => void;
  setSearchPin: (pin: [number, number] | null) => void;
  setLayer: (key: keyof LayerState, value: boolean) => void;
  resetSelection: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  mapMode: 'dark',
  selectedIl: null,
  selectedIlce: null,
  selectedIlCenter: null,
  selectedIlZoom: 9,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  showSearchResults: false,
  searchPin: null,
  layers: {
    talepYogunlugu: false,
    imarBaskisi: false,
    ilSinirlari: true,
    ilceSinirlari: false,
    mahalleSinirlari: false,
  },

  setMapMode: (mode) => set({ mapMode: mode }),
  setSelectedIl: (il) => set({ selectedIl: il }),
  setSelectedIlce: (ilce) => set({ selectedIlce: ilce }),
  setSelectedIlCenter: (center) => set({ selectedIlCenter: center }),
  setSelectedIlZoom: (zoom) => set({ selectedIlZoom: zoom }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchLoading: (loading) => set({ searchLoading: loading }),
  setShowSearchResults: (show) => set({ showSearchResults: show }),
  setSearchPin: (pin) => set({ searchPin: pin }),
  setLayer: (key, value) =>
    set((state) => ({
      layers: { ...state.layers, [key]: value },
    })),
  resetSelection: () =>
    set({
      selectedIl: null,
      selectedIlce: null,
      selectedIlCenter: null,
      selectedIlZoom: 9,
    }),
}));
