'use client';

import { useCallback, useRef } from 'react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { geoNameToDbName } from '@/app/(app)/parselens/utils/constants';
import { normalizeMahalle, displayMahalleName } from '@/app/(app)/parselens/utils/helpers';
import {
  getIlceFiyatlari,
  getIlTrend,
  getIlceTrend,
  getMahalleFiyatlari,
  getMahalleTrend,
} from '@/lib/api';

interface MapHandlerDeps {
  selectedIl: string | null;
  selectedIlce: string | null;
  trendKategori: string;
  mahalleFiyatlari: any;
  setSelectedIl: (il: string | null) => void;
  setSelectedIlce: (ilce: string | null) => void;
  setSelectedIlCenter: (c: [number, number] | null) => void;
  setIlceFiyatlari: (d: any) => void;
  setIlTrend: (d: any) => void;
  setIlceTrend: (d: any) => void;
  setIlSinirlari: (v: boolean) => void;
  setIlceSinirlari: (v: boolean) => void;
  setMahalleSinirlari: (v: boolean) => void;
  setMahallelerGeoJSON: (d: any) => void;
  setMahalleFiyatlari: (d: any) => void;
  setParselTrend: (d: any) => void;
  setSelectedIlZoom: (z: number) => void;
  setMahalleLoading: (v: boolean) => void;
  imarBaskisi: boolean;
}

export function useMapHandlers(deps: MapHandlerDeps) {
  const { setAnalysisTitle, setSelectedParcel } = useAnalysisStore();
  const ilTrendLoadingRef = useRef(false);

  const handleIlClick = useCallback(
    (ilAdi: string, layer: any) => {
      deps.setSelectedIl(ilAdi);
      if (!deps.imarBaskisi) deps.setIlceSinirlari(true);
      setAnalysisTitle(`${ilAdi} Analizi`);
      deps.setIlceFiyatlari(null);
      deps.setIlTrend(null);
      deps.setSelectedIlce(null);
      deps.setIlceTrend(null);
      deps.setMahallelerGeoJSON(null);
      deps.setMahalleSinirlari(false);
      deps.setMahalleFiyatlari(null);
      deps.setParselTrend(null);
      deps.setIlSinirlari(false);

      const dbIlAdi = geoNameToDbName(ilAdi);
      getIlceFiyatlari(dbIlAdi, deps.trendKategori)
        .then((data) => deps.setIlceFiyatlari(data))
        .catch(console.error);

      ilTrendLoadingRef.current = true;
      getIlTrend(dbIlAdi, 120, deps.trendKategori)
        .then((data) => deps.setIlTrend(data))
        .catch(console.error)
        .finally(() => {
          ilTrendLoadingRef.current = false;
        });

      const map = layer._map;
      if (map) {
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        deps.setSelectedIlCenter([center.lat, center.lng]);
        const targetZoom = Math.min(map.getBoundsZoom(bounds, false, [50, 50]), 10);
        deps.setSelectedIlZoom(targetZoom);
        map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
      }
    },
    [deps, setAnalysisTitle]
  );

  const handleIlceClick = useCallback(
    (ilceAdi: string, layer: any) => {
      deps.setSelectedIlce(ilceAdi);
      deps.setMahalleSinirlari(true);
      deps.setMahallelerGeoJSON(null);
      deps.setMahalleFiyatlari(null);
      deps.setMahalleLoading(true);
      deps.setIlSinirlari(false);
      deps.setIlceSinirlari(false);

      const ilForApi = deps.selectedIl || '';
      fetch(
        `/api/mahalle-sinirlari?il=${encodeURIComponent(ilForApi)}&ilce=${encodeURIComponent(ilceAdi)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.features?.length > 0) deps.setMahallelerGeoJSON(data);
        })
        .catch(console.error)
        .finally(() => deps.setMahalleLoading(false));

      const dbIl = geoNameToDbName(ilForApi);
      getMahalleFiyatlari(dbIl, ilceAdi, deps.trendKategori)
        .then((data) => deps.setMahalleFiyatlari(data))
        .catch(console.error);

      getIlceTrend(dbIl, ilceAdi, 120, deps.trendKategori)
        .then((data) => deps.setIlceTrend(data))
        .catch(console.error);

      const map = layer._map;
      if (map) {
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        const targetZoom = Math.min(map.getBoundsZoom(bounds, false, [40, 40]), 14);
        setTimeout(() => {
          map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
        }, 100);
      }
    },
    [deps]
  );

  const handleMahalleClick = useCallback(
    (geoMahalleAdi: string, layer?: any) => {
      if (!deps.selectedIl || !deps.selectedIlce || !geoMahalleAdi) return;
      const dbIl = geoNameToDbName(deps.selectedIl);
      deps.setParselTrend(null);

      const key = normalizeMahalle(geoMahalleAdi);
      const fiyatEntry = deps.mahalleFiyatlari?.mahalleler?.find(
        (m: any) => normalizeMahalle(m.mahalle) === key
      );
      const dbMahalleAdi = fiyatEntry?.mahalle || geoMahalleAdi;

      setAnalysisTitle(`${displayMahalleName(dbMahalleAdi)} - ${deps.selectedIlce}`);

      getMahalleTrend(dbIl, deps.selectedIlce, dbMahalleAdi, 120, deps.trendKategori)
        .then((data: any) => {
          if (data?.trend?.length) deps.setIlceTrend(data);
        })
        .catch(console.error);

      if (layer?._map) {
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        const targetZoom = Math.min(layer._map.getBoundsZoom(bounds, false, [30, 30]), 16);
        layer._map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
      }
    },
    [deps, setAnalysisTitle]
  );

  return {
    handleIlClick,
    handleIlceClick,
    handleMahalleClick,
  };
}
