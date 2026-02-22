// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';

// İmar Parselleri - Viewport-based GeoJSON yükleyici + İmar Baskısı Analizi
const ImarParcelsLayer = dynamic(
  () => Promise.resolve(function ImarParcelsLayerInner({ il, active, onParcelClick }: { il: string; active: boolean; onParcelClick?: (id: string) => void }) {
    const { useMap, useMapEvents } = require('react-leaflet');
    const { useState: uS, useEffect: uE, useRef: uR, useCallback: uCB } = require('react');
    const L = require('leaflet');
    const map = useMap();
    const layerRef = (uR as any)(null);
    const abortRef = (uR as any)(null);
    const lastBboxRef = (uR as any)('');
    const cacheRef = (uR as any)(new Map());
    const [loading, setLoading] = uS(false);

    // ============================================================
    // 1/1000 İMAR PLANI RENK PALETİ
    // ============================================================
    const PLAN_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
      'KONUT_ALANI':  { fill: '#6B3410', stroke: '#4A2208', label: 'Konut Alanı' },
      'TICARET':      { fill: '#DC143C', stroke: '#8B0000', label: 'Ticari Alan' },
      'SANAYI':       { fill: '#800080', stroke: '#4B0082', label: 'Sanayi / OSB' },
      'KAMUSAL':      { fill: '#4DA6FF', stroke: '#1A73E8', label: 'Kamusal Alan' },
      'TARIM':        { fill: '#228B22', stroke: '#006400', label: 'Tarım Alanı' },
      'ALTYAPI':      { fill: '#708090', stroke: '#2F4F4F', label: 'Yol / Altyapı' },
      'SIT_ALANI':    { fill: '#FF6347', stroke: '#B22222', label: 'Sit Alanı' },
    };
    const DEFAULT_COLOR = { fill: '#696969', stroke: '#3B3B3B', label: 'Diğer' };

    const BOLGE_LABELS: Record<string, string> = {
      'A': 'A Bölgesi (Kentsel Sit + 3. Derece Arkeolojik)',
      'B': 'B Bölgesi (Kentsel Sit Çevresi)',
      'C': 'C Bölgesi (Gelişme Alanı)',
      'D': 'D Bölgesi (1. Derece Arkeolojik — Yapı Yasağı)',
    };

    const getPlanColor = (p: any) => {
      const sit = (p?.sit_alani || '').toUpperCase();
      const ak = (p?.arazi_kullanim || '').toUpperCase();
      if (sit === 'KENTSEL_SIT' || ak === 'SIT_ALANI') return PLAN_COLORS['SIT_ALANI'];
      const nd = (p?.nitelik_detay || '').toLowerCase();
      if (nd.includes('okul') || nd.includes('lise') || nd.includes('üniversi') ||
          nd.includes('hastane') || nd.includes('sağlık') || nd.includes('saglik') ||
          nd.includes('belediye') || nd.includes('hükümet') || nd.includes('hukumet') ||
          nd.includes('devlet') || nd.includes('kamu')) {
        return PLAN_COLORS['KAMUSAL'];
      }
      const kat = (p?.kategori || '').toLowerCase();
      const alan = p?.alan || 0;
      const binaSayisi = p?.bina_sayisi_ms || 0;
      if (kat === 'arsa' && alan > 5000 && binaSayisi <= 3) return PLAN_COLORS['TARIM'];
      if (kat === 'konut' || kat === 'mesken' || kat === 'arsa') return PLAN_COLORS['KONUT_ALANI'];
      if (ak === 'KONUT_YOGUN' || ak === 'KONUT_AZ' || ak === 'BOS_ARSA' || ak === 'YAPI_VAR' || ak === 'KARMA') return PLAN_COLORS['KONUT_ALANI'];
      if (kat === 'ticari' || kat === 'sanayi' || ak === 'TICARET') return PLAN_COLORS['TICARET'];
      if (ak === 'SANAYI') return PLAN_COLORS['SANAYI'];
      if (kat === 'tarla' || kat === 'tarim' || kat === 'hamtoprak' || kat === 'ham toprak' || kat === 'orman') return PLAN_COLORS['TARIM'];
      if (ak === 'TARIM' || ak === 'YESIL_KAMUSAL') return PLAN_COLORS['TARIM'];
      if (kat === 'yol' || ak === 'ALTYAPI') return PLAN_COLORS['ALTYAPI'];
      if (ak === 'KAMUSAL' || ak === 'CAMI' || ak === 'UNIVERSITE' || ak === 'SPOR') return PLAN_COLORS['KAMUSAL'];
      return DEFAULT_COLOR;
    };

    const getImarBaskisiColor = (score: number): string => {
      if (score <= 0) return '#22c55e';
      if (score <= 15) return '#84cc16';
      if (score <= 30) return '#eab308';
      if (score <= 50) return '#f59e0b';
      if (score <= 75) return '#f97316';
      return '#ef4444';
    };

    const getBaskiLabel = (score: number): string => {
      if (score <= 0) return 'Baskı yok';
      if (score <= 15) return 'Çok düşük';
      if (score <= 30) return 'Düşük';
      if (score <= 50) return 'Orta';
      if (score <= 75) return 'Yüksek';
      return 'Çok yüksek';
    };

    const isImarPotansiyel = (p: any) => {
      const kat = (p?.kategori || '').toLowerCase();
      const ak = (p?.arazi_kullanim || '').toLowerCase();
      if (kat === 'yol' || ak === 'altyapi' || ak === 'altyapı') return false;
      if (kat === 'konut' || kat === 'mesken' || kat === 'ticari') return false;
      const mlScore = p?.imar_potansiyel ?? 0;
      return mlScore >= 25;
    };

    const isRoadParcel = (p: any) => {
      const kat = (p?.kategori || '').toLowerCase();
      const ak = (p?.arazi_kullanim || '').toLowerCase();
      return kat === 'yol' || ak === 'altyapi' || ak === 'altyapı';
    };

    const fetchParcels = uCB(async (retryCount = 0) => {
      if (!active || !il) return;
      
      const zoom = map.getZoom();
      if (zoom < 14) {
        if (layerRef.current) {
          layerRef.current.clearLayers();
        }
        return;
      }

      const bounds = map.getBounds();
      const pad = 0.001;
      const bbox = `${(bounds.getWest() - pad).toFixed(5)},${(bounds.getSouth() - pad).toFixed(5)},${(bounds.getEast() + pad).toFixed(5)},${(bounds.getNorth() + pad).toFixed(5)}`;
      
      if (bbox === lastBboxRef.current && retryCount === 0) return;
      lastBboxRef.current = bbox;
      
      const cacheKey = `${il}-${bbox}-${zoom}`;
      if (cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        renderGeoJSON(cached);
        return;
      }
      
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      
      setLoading(true);
      
      try {
        const res = await fetch(
          `/api/imar-wms?il=${encodeURIComponent(il)}&bbox=${encodeURIComponent(bbox)}&zoom=${zoom}&limit=8000&imar_mode=true`,
          { signal: abortRef.current.signal }
        );
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        if (data.features && data.features.length > 0) {
          if (cacheRef.current.size > 50) {
            const firstKey = cacheRef.current.keys().next().value;
            cacheRef.current.delete(firstKey);
          }
          cacheRef.current.set(cacheKey, data);
          renderGeoJSON(data);
        } else {
          if (layerRef.current) layerRef.current.clearLayers();
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          if (retryCount < 2) {
            setTimeout(() => fetchParcels(retryCount + 1), 1000 * (retryCount + 1));
            return;
          }
          console.error('Parsel yükleme hatası:', err);
        }
      } finally {
        setLoading(false);
      }
    }, [active, il, map]);

    // SVG tarama desenlerini haritanın SVG container'ına ekle
    const ensurePatterns = uCB(() => {
      const container = map.getContainer();
      const svgEl = container.querySelector('svg.leaflet-zoom-animated');
      if (!svgEl || svgEl.querySelector('#plan-patterns')) return;
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.id = 'plan-patterns';

      const makeHatch = (id: string, bgColor: string, lineColor: string, spacing: number = 6) => {
        const pat = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pat.setAttribute('id', id);
        pat.setAttribute('patternUnits', 'userSpaceOnUse');
        pat.setAttribute('width', String(spacing));
        pat.setAttribute('height', String(spacing));
        pat.setAttribute('patternTransform', 'rotate(45)');
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', String(spacing));
        rect.setAttribute('height', String(spacing));
        rect.setAttribute('fill', bgColor);
        pat.appendChild(rect);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0'); line.setAttribute('y1', '0');
        line.setAttribute('x2', '0'); line.setAttribute('y2', String(spacing));
        line.setAttribute('stroke', lineColor); line.setAttribute('stroke-width', '1.2');
        pat.appendChild(line);
        defs.appendChild(pat);
      };

      makeHatch('hatch-konut', '#6B3410', 'rgba(0,0,0,0.3)', 6);
      makeHatch('hatch-imar-potansiyel', '#FFD700', 'rgba(0,0,0,0.2)', 8);
      makeHatch('hatch-ticaret', '#DC143C', 'rgba(0,0,0,0.3)', 5);
      makeHatch('hatch-sanayi', '#800080', 'rgba(0,0,0,0.35)', 5);
      makeHatch('hatch-kamusal', '#4DA6FF', 'rgba(0,0,0,0.2)', 6);
      makeHatch('hatch-tarim', '#228B22', 'rgba(0,0,0,0.12)', 10);
      makeHatch('hatch-altyapi', '#708090', 'rgba(0,0,0,0.2)', 6);
      makeHatch('hatch-sit', '#FF6347', 'rgba(0,0,0,0.25)', 5);
      makeHatch('hatch-diger', '#696969', 'rgba(0,0,0,0.15)', 8);

      svgEl.insertBefore(defs, svgEl.firstChild);
    }, [map]);

    const getPatternId = (p: any): string => {
      if (isImarPotansiyel(p)) return 'hatch-imar-potansiyel';
      const color = getPlanColor(p);
      if (color === PLAN_COLORS['SIT_ALANI']) return 'hatch-sit';
      if (color === PLAN_COLORS['KAMUSAL']) return 'hatch-kamusal';
      if (color === PLAN_COLORS['KONUT_ALANI']) return 'hatch-konut';
      if (color === PLAN_COLORS['TICARET']) return 'hatch-ticaret';
      if (color === PLAN_COLORS['SANAYI']) return 'hatch-sanayi';
      if (color === PLAN_COLORS['TARIM']) return 'hatch-tarim';
      if (color === PLAN_COLORS['ALTYAPI']) return 'hatch-altyapi';
      return 'hatch-diger';
    };

    const buildTooltip = (p: any, planColor: any) => {
      const taks = p.taks ? (p.taks * 100).toFixed(0) : '-';
      const kaks = p.kaks ? p.kaks.toFixed(2) : '-';
      const maxKat = p.max_kat || 0;
      const tahKat = p.tahmini_kat || 0;
      const katLabel = maxKat > 0 ? `${maxKat} kat` : (tahKat > 0 ? `~${tahKat} kat` : '');
      const bb = p.toplam_bb || 0;
      const mesken = p.mesken_sayisi || 0;
      const isyeri = p.isyeri_sayisi || 0;
      const binaSayisi = p.bina_sayisi_ms || 0;
      const mlScore = p.imar_potansiyel || 0;
      const mlTip = p.imar_tipi_tahmini || '';
      const mlKat = p.tahmini_kat_imar || 0;
      const mlSure = p.imar_sure_tahmini || '';
      const yapiVar = p.yapi_var === true;
      const sitAlani = p.sit_alani || '';
      const imarBolge = p.imar_bolge || '';
      const resmiTaks = p.resmi_taks;
      const resmiKat = p.resmi_max_kat;
      const resmiKul = p.resmi_kullanim || '';

      const yapiVarHtml = yapiVar ? `<div style="margin-top:3px;padding:2px 5px;border-radius:3px;background:rgba(255,165,0,0.12);border:1px solid rgba(255,165,0,0.3);font-size:9px;color:#FFA500">⚠ Tarla — Üzerinde yapı tespit edildi</div>` : '';
      const sitHtml = sitAlani === 'KENTSEL_SIT' ? `<div style="margin-top:3px;padding:2px 5px;border-radius:3px;background:rgba(255,99,71,0.15);border:1px solid rgba(255,99,71,0.4);font-size:9px;color:#FF6347">🏛 Kentsel Sit Alanı${imarBolge ? ' — ' + (BOLGE_LABELS[imarBolge] || 'Bölge ' + imarBolge) : ''}</div>` : (imarBolge ? `<div style="margin-top:3px;padding:2px 5px;border-radius:3px;background:rgba(100,149,237,0.12);border:1px solid rgba(100,149,237,0.3);font-size:9px;color:#6495ED">📋 ${BOLGE_LABELS[imarBolge] || 'Bölge ' + imarBolge}</div>` : '');
      const resmiImarHtml = (resmiTaks || resmiKat || resmiKul) ? `<div style="display:flex;gap:6px;margin-top:2px;font-size:9px;color:rgba(255,255,255,0.5)">${resmiTaks ? `<span>Resmi TAKS: ${(resmiTaks * 100).toFixed(0)}%</span>` : ''}${resmiKat ? `<span>Max ${resmiKat} Kat</span>` : ''}${resmiKul ? `<span>Kullanım: ${resmiKul}</span>` : ''}</div>` : '';
      const imarHtml = isImarPotansiyel(p) ? `<div style="margin-top:4px;padding:3px 6px;border-radius:4px;background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.3)"><div style="display:flex;align-items:center;gap:6px;margin-bottom:2px"><span style="font-size:10px;font-weight:700;color:#FFD700">AI İmar Potansiyeli: %${mlScore}</span></div><div style="display:flex;gap:8px;font-size:9px;color:rgba(255,255,255,0.55)">${mlTip ? `<span>📋 ${mlTip}</span>` : ''}${mlKat > 0 ? `<span>↕ ${mlKat} kat</span>` : ''}${mlSure ? `<span>⏱ ${mlSure} yıl</span>` : ''}</div></div>` : '';
      const bbHtml = bb > 0 ? `<div style="display:flex;gap:8px;margin-top:3px;font-size:9px;color:rgba(255,255,255,0.45)"><span>BB: ${bb}</span>${mesken > 0 ? `<span>Mesken: ${mesken}</span>` : ''}${isyeri > 0 ? `<span>İşyeri: ${isyeri}</span>` : ''}</div>` : '';

      return `<div style="padding:8px 12px;min-width:160px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="width:10px;height:10px;border-radius:2px;background:${planColor.fill};border:1px solid ${planColor.stroke};flex-shrink:0"></span><span style="font-size:12px;font-weight:700;color:#fff">${p.ada || '-'}/${p.parsel || '-'}</span><span style="font-size:9px;color:rgba(255,255,255,0.4);margin-left:auto">${planColor.label}</span></div><div style="font-size:10px;color:rgba(255,255,255,0.6)">${p.mahalle || ''} • ${p.ilce || ''}</div><div style="display:flex;gap:10px;margin-top:4px;font-size:10px;color:rgba(255,255,255,0.5)"><span>${p.alan ? Math.round(p.alan).toLocaleString('tr-TR') + ' m²' : ''}</span>${binaSayisi > 0 ? `<span>🏢 ${binaSayisi} bina</span>` : ''}${katLabel ? `<span>↕ ${katLabel}</span>` : ''}</div>${bbHtml}${(taks !== '-' || kaks !== '-') ? `<div style="display:flex;gap:8px;margin-top:3px;font-size:9px;color:rgba(255,255,255,0.4)">${taks !== '-' ? `<span>TAKS %${taks}</span>` : ''}${kaks !== '-' ? `<span>KAKS ${kaks}</span>` : ''}</div>` : ''}${sitHtml}${resmiImarHtml}${yapiVarHtml}${imarHtml}</div>`;
    };

    const renderGeoJSON = uCB((data: any) => {
      ensurePatterns();

      const newLayer = L.geoJSON(data, {
        filter: (feature: any) => !isRoadParcel(feature?.properties),
        style: (feature: any) => {
          const p = feature?.properties;
          const planColor = isImarPotansiyel(p)
            ? { fill: '#FFD700', stroke: '#B8860B', label: 'İmar Potansiyel' }
            : getPlanColor(p);
          return {
            color: planColor.stroke,
            weight: 1.2,
            fillColor: planColor.fill,
            fillOpacity: 0.55,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const p = feature.properties;
          if (!p) return;

          const planColor = isImarPotansiyel(p)
            ? { fill: '#FFD700', stroke: '#B8860B', label: 'İmar Potansiyel' }
            : getPlanColor(p);

          layer.bindTooltip(buildTooltip(p, planColor), {
            className: 'dark-tooltip', sticky: true, direction: 'top', offset: [0, -5], opacity: 1
          });

          layer.on('click', () => {
            if (onParcelClick && p.id) {
              onParcelClick(p.id);
              layer.setStyle({ color: '#3b82f6', weight: 3, fillOpacity: 0.8 });
            }
          });
        },
      }).addTo(map);

      // Pattern'leri tek seferde uygula
      requestAnimationFrame(() => {
        newLayer.eachLayer((layer: any) => {
          const el = layer.getElement?.();
          const p = layer.feature?.properties;
          if (el && p) {
            el.setAttribute('fill', `url(#${getPatternId(p)})`);
            el.setAttribute('fill-opacity', '0.7');
          }
        });
      });

      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      layerRef.current = newLayer;
    }, [map]);

    const debounceRef = (uR as any)(null);
    useMapEvents({
      moveend: () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchParcels, 150);
      },
      zoomend: () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchParcels, 150);
      },
    });

    uE(() => {
      if (active && il) {
        fetchParcels();
      }
      return () => {
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
          layerRef.current = null;
        }
        if (abortRef.current) {
          abortRef.current.abort();
        }
      };
    }, [active, il]);

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

export default ImarParcelsLayer;
