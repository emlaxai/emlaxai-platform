// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';

// TKGM Tapu İşlem Hacmi Heatmap Katmanı
const TapuHeatmapLayer = dynamic(
  () => Promise.resolve(function TapuHeatmapLayerInner({ il, active }: { il: string; active: boolean }) {
    const { useMap, useMapEvents } = require('react-leaflet');
    const { useState: uS, useEffect: uE, useRef: uR } = require('react');
    const L = require('leaflet');
    require('leaflet.heat');
    const map = useMap();
    const heatRef = (uR as any)(null);
    const abortRef = (uR as any)(null);
    const lastKeyRef = (uR as any)('');
    const [stats, setStats] = (uS as any)(null);

    const fetchHeatmap = () => {
      if (!active) return;
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      const key = `${il}-${bbox}-${zoom}`;
      if (key === lastKeyRef.current) return;
      lastKeyRef.current = key;

      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const params = new URLSearchParams({ zoom: String(zoom), bbox, limit: '8000' });
      if (il) params.set('il', il);

      fetch(`/api/heatmap?${params.toString()}`, { signal: ctrl.signal })
        .then(r => r.json())
        .then(data => {
          if (!data.points || !data.points.length) return;
          setStats(data.stats);

          // Mevcut heatmap'i kaldır
          if (heatRef.current) {
            map.removeLayer(heatRef.current);
            heatRef.current = null;
          }

          // Yoğunluk değerlerini normalize et
          const maxVal = Math.max(...data.points.map((p: number[]) => p[2]));
          const points = data.points.map((p: number[]) => [p[0], p[1], p[2] / maxVal]);

          // @ts-ignore - leaflet.heat
          const heat = (L as any).heatLayer(points, {
            radius: zoom <= 8 ? 8 : zoom <= 10 ? 12 : zoom <= 12 ? 18 : 25,
            blur: zoom <= 8 ? 12 : zoom <= 10 ? 15 : 20,
            maxZoom: 17,
            max: 1.0,
            minOpacity: 0.25,
            gradient: {
              0.0: '#00000000',
              0.15: '#0d47a1',
              0.3: '#1565c0',
              0.45: '#1e88e5',
              0.55: '#43a047',
              0.65: '#fdd835',
              0.75: '#ff8f00',
              0.85: '#f4511e',
              0.95: '#d50000',
              1.0: '#b71c1c',
            },
          });

          heat.addTo(map);
          heatRef.current = heat;
        })
        .catch(() => {});
    };

    useMapEvents({
      moveend: fetchHeatmap,
      zoomend: fetchHeatmap,
    });

    uE(() => {
      if (active) {
        fetchHeatmap();
      } else {
        if (heatRef.current) {
          map.removeLayer(heatRef.current);
          heatRef.current = null;
        }
        lastKeyRef.current = '';
        setStats(null);
      }
    }, [active, il]);

    uE(() => {
      return () => {
        if (heatRef.current) {
          map.removeLayer(heatRef.current);
          heatRef.current = null;
        }
        if (abortRef.current) abortRef.current.abort();
      };
    }, []);

    return null;
  }),
  { ssr: false }
);

export default TapuHeatmapLayer;
