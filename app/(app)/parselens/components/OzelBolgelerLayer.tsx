// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';

// Özel Bölge Sınırları Katmanı (OSB, Havalimanı, Askeri, Üniversite, Spor)
const OzelBolgelerLayer = dynamic(
  () => Promise.resolve(function OzelBolgelerLayerInner({ active }: { active: boolean }) {
    const { useMap, useMapEvents } = require('react-leaflet');
    const { useEffect: uE, useRef: uR, useCallback: uCB } = require('react');
    const L = require('leaflet');
    const map = useMap();
    const layerRef = (uR as any)(null);
    const abortRef = (uR as any)(null);
    const lastBboxRef = (uR as any)('');

    const ZONE_STYLES: Record<string, { color: string; label: string }> = {
      'OSB':         { color: '#800080', label: 'OSB' },
      'HAVALIMANI':  { color: '#4169E1', label: 'Havalimanı' },
      'ASKERI':      { color: '#556B2F', label: 'Askeri Bölge' },
      'UNIVERSITE':  { color: '#6A5ACD', label: 'Üniversite' },
      'SPOR':        { color: '#20B2AA', label: 'Spor Alanı' },
    };

    const fetchZones = uCB(async () => {
      if (!active) return;
      const zoom = map.getZoom();
      if (zoom < 11) {
        if (layerRef.current) layerRef.current.clearLayers();
        return;
      }
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest().toFixed(4)},${bounds.getSouth().toFixed(4)},${bounds.getEast().toFixed(4)},${bounds.getNorth().toFixed(4)}`;
      if (bbox === lastBboxRef.current) return;
      lastBboxRef.current = bbox;

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(
          `/api/imar-wms?zones=true&bbox=${encodeURIComponent(bbox)}`,
          { signal: abortRef.current.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!data.features || data.features.length === 0) {
          if (layerRef.current) layerRef.current.clearLayers();
          return;
        }
        if (!layerRef.current) {
          layerRef.current = L.geoJSON(null, {
            style: (feature: any) => {
              const tip = feature?.properties?.tip || '';
              const zs = ZONE_STYLES[tip] || { color: '#fff' };
              return {
                color: zs.color,
                weight: 2.5,
                dashArray: '8, 6',
                fillColor: zs.color,
                fillOpacity: 0.08,
              };
            },
            onEachFeature: (feature: any, layer: any) => {
              const p = feature?.properties;
              if (!p) return;
              const zs = ZONE_STYLES[p.tip] || { color: '#fff', label: p.tip };
              const name = p.ad || zs.label;
              layer.bindTooltip(
                `<div style="padding:4px 8px;font-size:11px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.8)">${zs.label}${name !== zs.label ? ': ' + name : ''}</div>`,
                { permanent: zoom >= 13, direction: 'center', className: 'zone-label-tooltip', opacity: 0.9 }
              );
            },
          }).addTo(map);
        }
        layerRef.current.clearLayers();
        layerRef.current.addData(data);
      } catch (err: any) {
        if (err?.name !== 'AbortError') console.error('Zone yükleme hatası:', err);
      }
    }, [active, map]);

    useMapEvents({
      moveend: () => setTimeout(fetchZones, 200),
      zoomend: () => setTimeout(fetchZones, 200),
    });

    uE(() => {
      if (active) fetchZones();
      return () => {
        if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
        if (abortRef.current) abortRef.current.abort();
      };
    }, [active]);

    uE(() => {
      if (!active && layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
        lastBboxRef.current = '';
      }
    }, [active]);

    return null;
  }),
  { ssr: false }
);

export default OzelBolgelerLayer;
