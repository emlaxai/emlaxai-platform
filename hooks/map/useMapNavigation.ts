'use client';

import { useCallback, useRef } from 'react';
import { useMapStore } from '@/stores/useMapStore';
import { useAnalysisStore } from '@/stores/useAnalysisStore';

interface PendingZoom {
  center: [number, number];
  zoom: number;
}

export function useMapNavigation() {
  const {
    selectedIl,
    selectedIlce,
    setSelectedIl,
    setSelectedIlce,
    setSelectedIlCenter,
    setSelectedIlZoom,
    resetSelection,
  } = useMapStore();

  const { setAnalysisTitle, setSelectedParcel } = useAnalysisStore();
  const pendingZoomRef = useRef<PendingZoom | null>(null);

  const navigateToIl = useCallback(
    (ilName: string, center: [number, number], zoom: number) => {
      setSelectedIl(ilName);
      setSelectedIlce(null);
      setSelectedIlCenter(center);
      setSelectedIlZoom(zoom);
      setAnalysisTitle(`${ilName} Analizi`);
      setSelectedParcel(null);
    },
    [setSelectedIl, setSelectedIlce, setSelectedIlCenter, setSelectedIlZoom, setAnalysisTitle, setSelectedParcel]
  );

  const navigateToIlce = useCallback(
    (ilceName: string) => {
      setSelectedIlce(ilceName);
      setAnalysisTitle(`${selectedIl} / ${ilceName} Analizi`);
      setSelectedParcel(null);
    },
    [selectedIl, setSelectedIlce, setAnalysisTitle, setSelectedParcel]
  );

  const goBackToTurkiye = useCallback(() => {
    resetSelection();
    setAnalysisTitle('Türkiye Genel Bakış');
    setSelectedParcel(null);
    pendingZoomRef.current = { center: [39.0, 35.5], zoom: 6 };
  }, [resetSelection, setAnalysisTitle, setSelectedParcel]);

  const goBackToIl = useCallback(() => {
    setSelectedIlce(null);
    if (selectedIl) {
      setAnalysisTitle(`${selectedIl} Analizi`);
    }
    setSelectedParcel(null);
  }, [selectedIl, setSelectedIlce, setAnalysisTitle, setSelectedParcel]);

  const consumePendingZoom = useCallback(() => {
    const zoom = pendingZoomRef.current;
    pendingZoomRef.current = null;
    return zoom;
  }, []);

  return {
    selectedIl,
    selectedIlce,
    navigateToIl,
    navigateToIlce,
    goBackToTurkiye,
    goBackToIl,
    pendingZoomRef,
    consumePendingZoom,
  };
}
