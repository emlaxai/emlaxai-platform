// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import OzelBolgelerLayer from './OzelBolgelerLayer';
import { displayMahalleName } from '../utils/helpers';
import TapuHeatmapLayer from './TapuHeatmapLayer';
import { MapRefSetter, MapResizer, MapClickHandler } from './MapHelpers';
import { geoNameToDbName, getPriceColor } from '../utils/constants';
import ExaMarkdown from '@/components/ExaMarkdown/ExaMarkdown';

const CesiumMapComponent = dynamic(() => import('./CesiumMap'), { ssr: false });

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);

export default function DesktopMapPanel(props: Record<string, any>) {
  const {
    splitPosition, mapRef, pendingZoomRef, tileConfig, mapMode,
    illerGeoJSON, ilcelerGeoJSON, mahallelerGeoJSON,
    selectedIl, selectedIlce, selectedMahalle, selectedIlCenter, selectedIlZoom,
    ilSinirlari, ilceSinirlari, mahalleSinirlari,
    ilFiyatlari, ilceFiyatlari, mahalleFiyatlari,
    priceMin, priceMax, ilcePriceMin, ilcePriceMax, mahallePriceMin, mahallePriceMax,
    imarBaskisi, talepYogunlugu,
    isLayersDropdownOpen, layersDropdownRef, searchContainerRef,
    searchQuery, searchResults, searchLoading, searchPin, showSearchResults,
    isExaChatOpen, exaChatInput, exaChatLoading,
    chatContainerRef, chatResizing,
    analysisTitle, propertyType, trendKategori,
    isFilterOpen,
    setMapMode, setIsLayersDropdownOpen, setIlSinirlari, setIlceSinirlari,
    setMahalleSinirlari, setMahallelerGeoJSON, setMahalleFiyatlari,
    setSelectedIl, setSelectedIlce, setSelectedIlCenter,
    setIlTrend, setIlceTrend, setIlceFiyatlari,
    setSearchPin, setShowSearchResults, setAnalysisTitle,
    setTalepYogunlugu, setIsExaChatOpen, setExaChatInput,
    setIsFilterOpen, setChatPanelHeight,
    handleIlClick, handleIlceClick, handleSearchInput, handleSearchSelect,
    handleFiltersApply, handleImarBaskisiToggle, handleExaChatSend,
    handleChatResizeStart, handleParcelClick, handleMahalleClick, handleMapBackClick, searchAddress, chatEndRef, chatPanelHeight, exaChatMessages,
    formatNumber, getMahallePrice, getMahalleColor, getIlColor, getIlPrice, getIlceColor, getIlcePrice,
    _mapRefCb, pageMode, parselFlyTo,
  } = props;

  const cesiumFlyTo = parselFlyTo
    ? { lat: parselFlyTo.lat, lon: parselFlyTo.lon, polygon: parselFlyTo.polygon || undefined }
    : searchPin
      ? { lat: searchPin[0], lon: searchPin[1] }
      : null;

  return (
    <>
        {/* Sağ Panel - Harita */}
        <div 
          className="absolute top-0 right-0 bottom-0 overflow-hidden transition-[width] duration-200"
          style={{ width: `${100 - splitPosition}%`, display: splitPosition === 100 ? 'none' : undefined }}
        >

          {/* Breadcrumb Navigasyon - Bölgelens modunda */}
          {selectedIl && pageMode !== 'imar' && (
            <div 
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5 text-[13px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const m = mapRef.current;
                    // Önce haritayı animasyonlu uzaklaştır
                    if (m) {
                      try { m.stop(); } catch {}
                      m.flyTo([39.0, 35.0], 6, { animate: true, duration: 1 });
                    }
                    setSelectedIl(null);
                    setSelectedIlce(null);
                    setIlceTrend(null);
                    setMahallelerGeoJSON(null);
                    setMahalleSinirlari(false);
                    setMahalleFiyatlari(null);
                    setIlSinirlari(true);
                    setIlceSinirlari(false);
                    setIlceFiyatlari(null);
                    setIlTrend(null);
                    setAnalysisTitle('Türkiye Genel Bakış');
                    setSelectedIlCenter(null);
                    setSearchPin(null);
                    pendingZoomRef.current = { center: [39.0, 35.0], zoom: 6 };
                  }}
                  className="text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Türkiye
                </button>
                
                <span className="text-white/30">›</span>
                
                {!selectedIlce ? (
                  <span className="text-white font-semibold drop-shadow-sm">{selectedIl}</span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const center = selectedIlCenter;
                      const zoom = selectedIlZoom;
                      // Önce haritayı animasyonlu uzaklaştır
                      const m = mapRef.current;
                      if (m && center) {
                        try { m.stop(); } catch {}
                        m.flyTo(center, zoom, { animate: true, duration: 1 });
                      }
                      setSelectedIlce(null);
                      setIlceTrend(null);
                      setMahallelerGeoJSON(null);
                      setMahalleSinirlari(false);
                      setMahalleFiyatlari(null);
                      setIlSinirlari(true);
                      setIlceSinirlari(true);
                      // Yedek: animasyon bozulursa fallback
                      if (center) {
                        pendingZoomRef.current = { center: center as [number, number], zoom };
                      }
                    }}
                    className="text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {selectedIl}
                  </button>
                )}
                
                {selectedIlce && (
                  <>
                    <span className="text-white/30">›</span>
                    <span className="text-white font-semibold drop-shadow-sm">{selectedIlce}</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style jsx global>{`
            .exa-markdown { overflow-x: hidden; max-width: 100%; }
            .exa-markdown p { margin: 0.25em 0; }
            .exa-markdown strong { color: #fff; font-weight: 600; }
            .exa-markdown em { color: rgba(255,255,255,0.7); font-style: italic; }
            .exa-markdown ul, .exa-markdown ol { margin: 0.4em 0; padding-left: 1.2em; }
            .exa-markdown li { margin: 0.15em 0; }
            .exa-markdown li::marker { color: rgba(59,130,246,0.7); }
            .exa-markdown h1, .exa-markdown h2, .exa-markdown h3 { color: #fff; font-weight: 700; margin: 0.5em 0 0.25em; }
            .exa-markdown h1 { font-size: 1.1em; }
            .exa-markdown h2 { font-size: 1.05em; }
            .exa-markdown h3 { font-size: 1em; }
            .exa-markdown code { background: rgba(255,255,255,0.08); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; color: #93c5fd; word-break: break-all; overflow-wrap: break-word; }
            .exa-markdown pre { max-width: 100%; overflow-x: auto; }
            .exa-markdown blockquote { border-left: 2px solid rgba(59,130,246,0.4); padding-left: 0.75em; margin: 0.4em 0; color: rgba(255,255,255,0.6); }
            .exa-markdown a { color: #60a5fa; text-decoration: underline; }
            .exa-markdown hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 0.5em 0; }
            .leaflet-control-zoom {
              border: none !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
            }
            .leaflet-control-zoom a {
              background-color: rgba(0, 0, 0, 0.8) !important;
              color: white !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              transition: all 0.2s ease !important;
            }
            .leaflet-control-zoom a:hover {
              background-color: rgba(255, 255, 255, 0.15) !important;
              border-color: rgba(255, 255, 255, 0.3) !important;
            }
            .leaflet-control-zoom a:first-child {
              border-radius: 8px 8px 0 0 !important;
            }
            .leaflet-control-zoom a:last-child {
              border-radius: 0 0 8px 8px !important;
            }
            .dark-tooltip {
              background: rgba(10, 10, 10, 0.92) !important;
              backdrop-filter: blur(12px) !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
              border-radius: 10px !important;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
              color: #fff !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            .dark-tooltip .leaflet-tooltip-content {
              margin: 0 !important;
            }
            .dark-tooltip::before {
              border-top-color: rgba(10, 10, 10, 0.92) !important;
            }
            .leaflet-tooltip-top.dark-tooltip::before {
              border-top-color: rgba(10, 10, 10, 0.92) !important;
            }
            .leaflet-tooltip-bottom.dark-tooltip::before {
              border-bottom-color: rgba(10, 10, 10, 0.92) !important;
            }
            .leaflet-tooltip-left.dark-tooltip::before {
              border-left-color: rgba(10, 10, 10, 0.92) !important;
            }
            .leaflet-tooltip-right.dark-tooltip::before {
              border-right-color: rgba(10, 10, 10, 0.92) !important;
            }
          `}</style>
          {mapMode === '3d' ? (
            <CesiumMapComponent flyTo={cesiumFlyTo} />
          ) : (
          <MapContainer
            center={[39.0, 35.0]} // Türkiye merkez koordinatları
            zoom={6}
            style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
            className="z-0"
            zoomControl={false}
            attributionControl={false}
          >
            <MapRefSetter />
            <MapResizer />
            <MapClickHandler />
            <ZoomControl position="bottomleft" />
            <TileLayer
              key={mapMode}
              url={tileConfig.url}
              {...(tileConfig.subdomains ? { subdomains: tileConfig.subdomains } : {})}
              maxZoom={tileConfig.maxZoom}
            />
            
            {/* Arama Pin Marker */}
            {searchPin && (() => {
              const L = typeof window !== 'undefined' ? require('leaflet') : null;
              if (!L) return null;
              const pinIcon = L.divIcon({
                className: '',
                html: `<div style="position:relative;width:30px;height:42px">
                  <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 0C6.72 0 0 6.72 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.72 23.28 0 15 0z" fill="#3B82F6"/>
                    <circle cx="15" cy="14" r="6" fill="white"/>
                  </svg>
                </div>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                popupAnchor: [0, -42]
              });
              return <Marker position={searchPin} icon={pinIcon} />;
            })()}
            
            {/* İl Sınırları - Fiyata göre renklendirilmiş */}
            {ilSinirlari && illerGeoJSON && (
              <GeoJSON
                key={`il-sinirlari-${ilFiyatlari ? 'loaded' : 'default'}`}
                data={illerGeoJSON}
                style={(feature) => {
                  const geoName = feature?.properties?.NAME_1 || '';
                  const isSelected = selectedIl === geoName;
                  const color = isSelected ? '#3b82f6' : getIlColor(geoName);
                  return {
                    color: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                    weight: isSelected ? 3 : 1,
                    opacity: isSelected ? 1 : 0.6,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.5 : 0.45,
                  };
                }}
                onEachFeature={(feature: any, layer: any) => {
                  if (feature.properties && feature.properties.NAME_1) {
                    const ilAdi = feature.properties.NAME_1;
                    const priceData = getIlPrice(ilAdi);
                    
                    // Dark themed tooltip - dikdörtgen: sol il adı, sağ fiyat
                    const fiyatHtml = priceData
                      ? `<div style="text-align:right"><div style="font-size:14px;font-weight:700;color:#10b981;line-height:1.2">${formatNumber(priceData.m2_fiyat)} ₺/m²</div>${priceData.trend_12ay != null ? `<div style="font-size:10px;color:${priceData.trend_12ay >= 0 ? '#22c55e' : '#ef4444'};margin-top:1px">${priceData.trend_12ay >= 0 ? '+' : ''}%${priceData.trend_12ay.toFixed(1)}</div>` : ''}</div>`
                      : '<div style="font-size:11px;color:rgba(255,255,255,0.4)">—</div>';
                    
                    layer.bindTooltip(
                      `<div style="display:flex;align-items:center;gap:14px;padding:8px 14px;white-space:nowrap"><div style="font-size:13px;font-weight:600;color:#fff">${ilAdi}</div><div style="width:1px;height:24px;background:rgba(255,255,255,0.15)"></div>${fiyatHtml}</div>`,
                      {
                        className: 'dark-tooltip',
                        sticky: true,
                        direction: 'top',
                        offset: [0, -10],
                        opacity: 1,
                      }
                    );
                    
                    layer.on('click', (e: any) => {
                      e.originalEvent._stopped = true;
                      handleIlClick(ilAdi, layer);
                    });
                    
                    layer.on('mouseover', () => {
                      layer.setStyle({
                        fillOpacity: 0.65,
                        weight: 3
                      });
                    });
                    
                    layer.on('mouseout', () => {
                      const baseColor = selectedIl === ilAdi ? '#3b82f6' : getIlColor(ilAdi);
                      layer.setStyle({
                        fillColor: baseColor,
                        fillOpacity: selectedIl === ilAdi ? 0.5 : 0.45,
                        weight: selectedIl === ilAdi ? 3 : 1
                      });
                    });
                  }
                }}
              />
            )}
            
            {/* İlçe Sınırları - Fiyata göre renklendirilmiş */}
            {ilceSinirlari && ilcelerGeoJSON && selectedIl && (
              <GeoJSON
                key={`ilce-sinirlari-${selectedIl}-${ilceFiyatlari ? 'loaded' : 'default'}`}
                data={{
                  ...ilcelerGeoJSON,
                  features: ilcelerGeoJSON.features.filter((f: any) => 
                    f.properties?.NAME_1 === selectedIl
                  )
                }}
                style={(feature) => {
                  const ilceAdi = feature?.properties?.NAME_2 || '';
                  const color = getIlceColor(ilceAdi);
                  return {
                    color: 'rgba(255,255,255,0.4)',
                    weight: 1.5,
                    opacity: 0.7,
                    fillColor: color,
                    fillOpacity: 0.5,
                  };
                }}
                onEachFeature={(feature: any, layer: any) => {
                  if (feature.properties && feature.properties.NAME_2) {
                    const ilceAdi = feature.properties.NAME_2;
                    const priceData = getIlcePrice(ilceAdi);
                    
                    const fiyatHtml = priceData
                      ? `<div style="text-align:right"><div style="font-size:14px;font-weight:700;color:#10b981;line-height:1.2">${formatNumber(priceData.m2_fiyat)} ₺/m²</div></div>`
                      : '<div style="font-size:11px;color:rgba(255,255,255,0.4)">—</div>';
                    
                    layer.bindTooltip(
                      `<div style="display:flex;align-items:center;gap:14px;padding:8px 14px;white-space:nowrap"><div style="font-size:13px;font-weight:600;color:#fff">${ilceAdi}</div><div style="width:1px;height:24px;background:rgba(255,255,255,0.15)"></div>${fiyatHtml}</div>`,
                      {
                        className: 'dark-tooltip',
                        sticky: true,
                        direction: 'top',
                        offset: [0, -10],
                        opacity: 1,
                      }
                    );
                    
                    layer.on('click', (e: any) => {
                      e.originalEvent._stopped = true;
                      handleIlceClick(ilceAdi, layer);
                    });
                    
                    layer.on('mouseover', () => {
                      layer.setStyle({
                        fillOpacity: 0.7,
                        weight: 3
                      });
                    });
                    
                    layer.on('mouseout', () => {
                      layer.setStyle({
                        fillColor: getIlceColor(ilceAdi),
                        fillOpacity: 0.5,
                        weight: 1.5
                      });
                    });
                  }
                }}
              />
            )}

            {/* Mahalle Sınırları Katmanı - Fiyata göre renklendirilmiş */}
            {mahalleSinirlari && mahallelerGeoJSON && selectedIlce && (() => {
              const normMahalle = (s: string) => s.toLowerCase()
                .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
                .replace(/\s*\(.*?\)\s*/g, '')
                .replace(/(mahallesi|mah\.|koyu|koy\.|mh\.)/gi, '')
                .replace(/[^a-z0-9]/g, '').trim();
              const matchesMahalle = (geoAd: string, selected: string) => {
                if (geoAd === selected) return true;
                return normMahalle(geoAd) === normMahalle(selected);
              };
              const filteredData = selectedMahalle ? {
                ...mahallelerGeoJSON,
                features: mahallelerGeoJSON.features.filter((f: any) => matchesMahalle(f.properties?.ad || '', selectedMahalle))
              } : mahallelerGeoJSON;
              return (
              <GeoJSON
                key={`mahalle-sinirlari-${selectedIl}-${selectedIlce}-${selectedMahalle || 'all'}-${mahalleFiyatlari ? 'loaded' : 'default'}`}
                data={filteredData}
                style={(feature) => {
                  const mahalleAdi = feature?.properties?.ad || '';
                  if (selectedMahalle) {
                    return {
                      color: '#3b82f6',
                      weight: 3,
                      opacity: 1,
                      fillColor: 'transparent',
                      fillOpacity: 0,
                    };
                  }
                  const color = getMahalleColor(mahalleAdi);
                  return {
                    color: 'rgba(255,255,255,0.4)',
                    weight: 1.5,
                    opacity: 0.7,
                    fillColor: color,
                    fillOpacity: 0.5,
                  };
                }}
                onEachFeature={(feature: any, layer: any) => {
                  if (feature.properties && feature.properties.ad) {
                    const mahalleAdi = feature.properties.ad;
                    const priceData = getMahallePrice(mahalleAdi);
                    const isTahmini = priceData && (priceData as any).tahmini;
                    
                    const fiyatHtml = priceData
                      ? `<div style="text-align:right"><div style="font-size:14px;font-weight:700;color:${isTahmini ? '#f59e0b' : '#10b981'};line-height:1.2">${formatNumber(priceData.m2_fiyat)} ₺/m²</div>${isTahmini ? '<div style="font-size:9px;color:rgba(255,255,255,0.35)">ilçe ort. tahmin</div>' : ''}</div>`
                      : '<div style="font-size:11px;color:rgba(255,255,255,0.4)">—</div>';
                    
                    layer.bindTooltip(
                      `<div style="display:flex;align-items:center;gap:14px;padding:8px 14px;white-space:nowrap"><div style="font-size:13px;font-weight:600;color:#fff">${displayMahalleName(mahalleAdi)}</div><div style="width:1px;height:24px;background:rgba(255,255,255,0.15)"></div>${fiyatHtml}</div>`,
                      {
                        className: 'dark-tooltip',
                        sticky: true,
                        direction: 'top',
                        offset: [0, -10],
                        opacity: 1,
                      }
                    );
                    
                    layer.on('mouseover', () => {
                      layer.setStyle({
                        fillOpacity: 0.7,
                        weight: 3,
                      });
                    });
                    
                    layer.on('mouseout', () => {
                      layer.setStyle({
                        fillColor: getMahalleColor(mahalleAdi),
                        fillOpacity: 0.5,
                        weight: 1.5,
                      });
                    });

                    layer.on('click', (e: any) => {
                      e.originalEvent._stopped = true;
                      if (handleMahalleClick) handleMahalleClick(mahalleAdi, layer);
                    });
                  }
                }}
              />
              );
            })()}

            {/* Özel Bölge Sınırları (OSB, Havalimanı, vb.) */}
            <OzelBolgelerLayer active={imarBaskisi && !!selectedIl} />

            {/* TKGM Tapu İşlem Hacmi Heatmap */}
            <TapuHeatmapLayer il={selectedIl || ''} active={talepYogunlugu} />
          </MapContainer>
          )}



          {/* Exa Hızlı Analiz Butonu */}
          <button
            onClick={() => setIsExaChatOpen(!isExaChatOpen)}
            className="absolute z-20 flex items-center justify-center outline-none focus:outline-none"
            style={{
              bottom: '16px',
              right: '16px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed, #0ea5e9, #f59e0b)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4), 0 0 12px rgba(124,58,237,0.15)',
              transition: 'all 0.2s',
            }}
            title="Exa Hızlı Analiz"
          >
            <Image
              src="/icons/emlaxai-icon.svg"
              alt="Exa"
              width={22}
              height={22}
              style={{ objectFit: 'contain' }}
            />
          </button>
          
          {/* Fiyat Skalası / İmar Bilgi Barı */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-stretch gap-3"
          >
            {pageMode === 'imar' ? null : talepYogunlugu ? (
              /* Talep Yoğunluğu Heatmap Modu */
              <div 
                className="rounded-lg px-4 py-2 w-[400px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,71,161,0.15), rgba(213,0,0,0.15))',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(30,136,229,0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42a5f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-blue-300 text-[10px] font-semibold">{selectedIl ? `${selectedIl} -` : ''} Tapu İşlem Hacmi Heatmap</span>
                  </div>
                  <button
                    onClick={() => setTalepYogunlugu(false)}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
                    title="Heatmap'i kapat"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                {/* Heatmap Renk Skalası */}
                <div className="flex items-center gap-1.5">
                  <span className="text-white/40 text-[9px] whitespace-nowrap">Az</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
                    background: 'linear-gradient(to right, #0d47a1, #1e88e5, #43a047, #fdd835, #ff8f00, #f4511e, #d50000)'
                  }} />
                  <span className="text-white/40 text-[9px] whitespace-nowrap">Yoğun</span>
                </div>
                <div className="text-white/30 text-[8px] mt-1 text-center">TKGM tapu işlem hacmi yoğunluğu • Kaynak: Tapu ve Kadastro Genel Müdürlüğü</div>
              </div>
            ) : (
              /* Normal Mod - Fiyat Skalası */
              <div 
                className="rounded-lg px-4 py-1.5 w-[400px]"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-white/70 text-[10px] font-medium mb-1 text-center">{propertyType} m² Birim Fiyatı</h3>
                <div className="flex items-center gap-2.5">
                  <span className="text-white text-xs font-medium whitespace-nowrap">{formatNumber(priceMin)} ₺/m²</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
                    background: 'linear-gradient(to right, #10b981, #22c55e, #84cc16, #eab308, #f59e0b, #f97316, #ef4444, #dc2626)'
                  }}>
                  </div>
                  <span className="text-white text-xs font-medium whitespace-nowrap">{formatNumber(priceMax)} ₺/m²</span>
                </div>
              </div>
            )}
          </div>

          {/* Exa Chat Paneli */}
          <div 
            ref={chatContainerRef}
            className="absolute left-0 right-0 bottom-0 z-30 overflow-hidden"
            style={{
              height: isExaChatOpen ? `${chatPanelHeight}%` : '0',
              opacity: isExaChatOpen ? 1 : 0,
              pointerEvents: isExaChatOpen ? 'auto' : 'none',
              transition: chatResizing.current ? 'none' : 'height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
            }}
          >
            <div 
              className="w-full h-full flex flex-col"
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(20px) saturate(120%)',
                WebkitBackdropFilter: 'blur(20px) saturate(120%)',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Resize Handle - Sürükle */}
              <div 
                className="flex items-center justify-center cursor-ns-resize group shrink-0"
                style={{ height: '10px' }}
                onMouseDown={handleChatResizeStart}
                onTouchStart={handleChatResizeStart}
              >
                <div className="w-10 h-1 rounded-full bg-white/15 group-hover:bg-white/35 group-active:bg-blue-400/60 transition-colors" />
              </div>

              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-2 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/emlaxai-icon.svg"
                    alt="Exa"
                    width={22}
                    height={22}
                    className="flex-shrink-0"
                    style={{ objectFit: 'contain', position: 'relative', top: '-7px' }}
                  />
                  <div>
                    <h3 className="text-white text-sm font-semibold leading-none">Exa Hızlı Analiz</h3>
                    <p className="text-white/40 text-[10px] leading-none mt-1">
                      {selectedIl ? `${selectedIl} bölgesi analiz ediliyor` : 'Türkiye geneli emlak analizi'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => setIsExaChatOpen(false)}
                    title="Kapat"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat Mesajları */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {exaChatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Image
                      src="/icons/emlaxai-icon.svg"
                      alt="Exa"
                      width={40}
                      height={40}
                      style={{ objectFit: 'contain', opacity: 0.3 }}
                    />
                    <p className="text-white/30 text-sm mt-3">Emlak hakkında bir soru sorun</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-md">
                      {[
                        selectedIl ? `${selectedIl}'da m² fiyat trendi nasıl?` : 'En çok değerlenen iller hangileri?',
                        selectedIl ? `${selectedIl}'da yatırım yapmalı mıyım?` : 'Kira getirisi en yüksek iller?',
                        'Konut piyasası 2026 beklentileri?'
                      ].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setExaChatInput(q); }}
                          className="px-3 py-1.5 rounded-full text-[11px] text-white/50 border border-white/10 hover:border-white/25 hover:text-white/70 transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {exaChatMessages.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed bg-blue-500/20 text-white border border-blue-500/20">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[85%] text-sm leading-relaxed text-white/85">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Image src="/icons/emlaxai-icon.svg" alt="Exa" width={14} height={14} style={{ objectFit: 'contain' }} />
                          <span className="text-[10px] text-white/40 font-medium">Exa</span>
                        </div>
                        <ExaMarkdown compact>{msg.content}</ExaMarkdown>
                      </div>
                    )}
                  </div>
                ))}
                {exaChatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-white/30 text-xs">Exa düşünüyor...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="px-5 py-3 border-t border-white/8">
                <div className="relative">
                  <input
                    type="text"
                    value={exaChatInput}
                    onChange={(e) => setExaChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExaChatSend()}
                    placeholder="Emlak hakkında bir şey sorun..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25 transition-colors"
                  />
                  <button
                    onClick={handleExaChatSend}
                    disabled={!exaChatInput.trim() || exaChatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                  >
                    <Image
                      src="/icons/send-prompt.svg"
                      alt="Gönder"
                      width={28}
                      height={28}
                      style={{ objectFit: 'contain' }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
