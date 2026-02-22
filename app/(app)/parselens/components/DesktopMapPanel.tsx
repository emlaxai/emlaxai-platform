'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import ImarParcelsLayer from './ImarParcelsLayer';
import OzelBolgelerLayer from './OzelBolgelerLayer';
import { displayMahalleName } from '../utils/helpers';
import TapuHeatmapLayer from './TapuHeatmapLayer';
import { MapRefSetter, MapResizer, MapClickHandler } from './MapHelpers';
import { geoNameToDbName, getPriceColor } from '../utils/constants';
import ExaMarkdown from '@/components/ExaMarkdown/ExaMarkdown';

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
    selectedIl, selectedIlce, selectedIlCenter, selectedIlZoom,
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
    _mapRefCb,
  } = props;
  return (
    <>
        {/* Sağ Panel - Harita */}
        <div 
          className="absolute top-0 right-0 bottom-0 overflow-hidden transition-[width] duration-200"
          style={{ width: `${100 - splitPosition}%`, display: splitPosition === 100 ? 'none' : undefined }}
        >
          {/* Harita Kontrol Barı */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 max-w-[95%]">
            {/* Katmanlar Dropdown */}
            <div ref={layersDropdownRef} className="relative">
              <button 
                onClick={() => setIsLayersDropdownOpen(!isLayersDropdownOpen)}
                className="px-4 py-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 outline-none focus:outline-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                Katmanlar
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isLayersDropdownOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isLayersDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
                     style={{ animation: 'fadeIn 0.15s ease-out' }}>
                  {/* Talep Yoğunluğu */}
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={talepYogunlugu}
                        onChange={(e) => setTalepYogunlugu(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                        {talepYogunlugu && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">Talep Yoğunluğu</span>
                  </label>

                  {/* İmar Baskısı */}
                  <label className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10 ${!selectedIl ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={imarBaskisi}
                        onChange={(e) => handleImarBaskisiToggle(e.target.checked)}
                        className="sr-only peer"
                        disabled={!selectedIl}
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all duration-200 flex items-center justify-center">
                        {imarBaskisi && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-medium">İmar Baskısı</span>
                      {!selectedIl && <span className="text-white/30 text-[9px]">Önce bir il seçin</span>}
                    </div>
                  </label>

                  {/* İl Sınırları */}
                  <label className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10 ${imarBaskisi ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={ilSinirlari}
                        onChange={(e) => setIlSinirlari(e.target.checked)}
                        className="sr-only peer"
                        disabled={imarBaskisi}
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                        {ilSinirlari && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">İl Sınırları</span>
                    {imarBaskisi && <span className="text-amber-400/60 text-[9px] ml-auto">İmar modu aktif</span>}
                  </label>

                  {/* İlçe Sınırları */}
                  <label className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors ${imarBaskisi ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={ilceSinirlari}
                        onChange={(e) => setIlceSinirlari(e.target.checked)}
                        className="sr-only peer"
                        disabled={imarBaskisi}
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                        {ilceSinirlari && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">İlçe Sınırları</span>
                    {imarBaskisi && <span className="text-amber-400/60 text-[9px] ml-auto">İmar modu aktif</span>}
                  </label>
                </div>
              )}
            </div>
            
            {/* Adres Arama Barı */}
            <div ref={searchContainerRef} className="relative flex-1 min-w-[200px] max-w-[320px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.length >= 2) {
                    searchAddress(searchQuery);
                  }
                  if (e.key === 'Escape') setShowSearchResults(false);
                }}
                placeholder="İl, ilçe, mahalle veya ada/parsel ara..."
                className="w-full pl-4 pr-9 py-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-white/40 transition-all duration-200"
              />
              {searchLoading ? (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                </div>
              ) : (
                <button 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  title="Ara"
                  onClick={() => { if (searchQuery.length >= 2) searchAddress(searchQuery); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              )}

              {/* Arama Sonuçları Dropdown - Google Style */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[999] overflow-hidden max-h-[380px] overflow-y-auto py-1"
                     style={{ animation: 'fadeIn 0.12s ease-out' }}>
                  {searchResults.map((result, i) => {
                    if (result.source === 'backend') {
                      const typeLabel = result.type === 'parsel' ? 'Parsel' : result.type === 'mahalle' ? 'Mahalle' : result.type === 'ilce' ? 'İlçe' : 'İl';
                      return (
                        <button key={`b-${i}`} onClick={() => handleSearchSelect(result)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/[0.06] transition-colors text-left outline-none focus:outline-none group">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 group-hover:text-white/40 flex-shrink-0 transition-colors">
                            {result.type === 'parsel' ? (
                              <><rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></>
                            ) : (
                              <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3"/></>
                            )}
                          </svg>
                          <div className="flex-1 min-w-0">
                            <span className="text-white/90 text-[13px] truncate block">{result.display}</span>
                            {result.type === 'parsel' && result.subtitle && (
                              <span className="text-white/30 text-[10px] truncate block">{result.subtitle}</span>
                            )}
                          </div>
                          <span className="flex-shrink-0 text-[10px] text-white/20 font-medium">{typeLabel}</span>
                        </button>
                      );
                    }
                    // Nominatim fallback
                    const parts = (result.display_name || '').split(',');
                    const title = parts[0]?.trim() || '';
                    const subtitle = parts.slice(1, 3).join(',').trim();
                    return (
                      <button key={`n-${i}`} onClick={() => handleSearchSelect(result)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/[0.06] transition-colors text-left outline-none focus:outline-none group">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 group-hover:text-white/40 flex-shrink-0 transition-colors">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <span className="text-white/90 text-[13px] truncate block">{title}</span>
                          <span className="text-white/30 text-[10px] truncate block">{subtitle}</span>
                        </div>
                        <span className="flex-shrink-0 text-[10px] text-white/20 font-medium">Adres</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Filtreler Butonu */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`px-4 py-3 backdrop-blur-md border rounded-lg text-white text-xs font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 outline-none focus:outline-none ${
                trendKategori !== 'konut' 
                  ? 'bg-blue-600/80 border-blue-400/40' 
                  : 'bg-black/80 border-white/20'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              {trendKategori === 'konut' ? 'Filtreler' : propertyType}
            </button>
          </div>

          {/* Breadcrumb Navigasyon */}
          {selectedIl && (
            <div 
              className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[1000]"
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
            {mahalleSinirlari && mahallelerGeoJSON && selectedIlce && (
              <GeoJSON
                key={`mahalle-sinirlari-${selectedIl}-${selectedIlce}-${mahalleFiyatlari ? 'loaded' : 'default'}`}
                data={mahallelerGeoJSON}
                style={(feature) => {
                  const mahalleAdi = feature?.properties?.ad || '';
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
            )}

            {/* İmar Baskısı - Parsel Katmanı (Viewport-based GeoJSON) */}
            <ImarParcelsLayer il={selectedIl || ''} active={imarBaskisi && !!selectedIl} onParcelClick={handleParcelClick} />

            {/* Özel Bölge Sınırları (OSB, Havalimanı, vb.) */}
            <OzelBolgelerLayer active={imarBaskisi && !!selectedIl} />

            {/* TKGM Tapu İşlem Hacmi Heatmap */}
            <TapuHeatmapLayer il={selectedIl || ''} active={talepYogunlugu} />
          </MapContainer>

          {/* 1/1000 İmar Planı Lejantı - Sol Alt */}
          {imarBaskisi && (
            <div
              className="absolute bottom-[104px] right-4 z-20 rounded-lg overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                maxHeight: '320px',
                width: '180px',
              }}
            >
              <div className="px-3 py-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  <span className="text-[10px] font-bold text-white/80 tracking-wider">1/1000 PLAN LEJANTI</span>
                </div>
              </div>
              <div className="px-3 py-2 flex flex-col gap-1.5" style={{ overflowY: 'auto', maxHeight: '270px' }}>
                {[
                  { color: '#6B3410', label: 'Konut Alanı' },
                  { color: '#FFD700', label: 'İmar Potansiyel Alanı' },
                  { color: '#DC143C', label: 'Ticari Alan' },
                  { color: '#800080', label: 'Sanayi / OSB' },
                  { color: '#4DA6FF', label: 'Kamusal Alan' },
                  { color: '#228B22', label: 'Tarım Alanı' },
                  { color: '#708090', label: 'Yol / Altyapı' },
                  { color: '#FF6347', label: 'Sit Alanı' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="flex-shrink-0"
                      style={{
                        width: 16, height: 12, borderRadius: 2,
                        background: `repeating-linear-gradient(45deg, ${color}, ${color} 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)`,
                        border: `1px solid ${color}88`,
                      }}
                    />
                    <span className="text-[9px] text-white/70">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Harita Modu Toggle - Sağ Üst Dikey */}
          <div className="absolute top-4 right-4 z-20 flex flex-col bg-black/80 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden" style={{ minWidth: '78px' }}>
            <button
              onClick={() => setMapMode('dark')}
              className={`px-2.5 py-2 text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5 outline-none focus:outline-none ${
                mapMode === 'dark' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
              title="Koyu Harita"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              Koyu
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-2 text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5 outline-none focus:outline-none border-t border-white/10 ${
                mapMode === 'satellite' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
              title="Uydu Görünümü"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              Uydu
            </button>
            <button
              onClick={() => setMapMode('hybrid')}
              className={`px-2.5 py-2 text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5 outline-none focus:outline-none border-t border-white/10 ${
                mapMode === 'hybrid' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
              title="Hibrit (Uydu + Yollar)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Hibrit
            </button>
          </div>

          {/* Exa Hızlı Analiz Butonu - Ayrı */}
          <button
            onClick={() => setIsExaChatOpen(!isExaChatOpen)}
            className="absolute z-20 py-2 text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 outline-none focus:outline-none text-white rounded-lg"
            style={{
              top: '132px',
              right: '16px',
              left: 'auto',
              minWidth: '78px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #ec4899)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
            title="Exa Hızlı Analiz"
          >
            <Image
              src="/icons/emlaxai-icon.svg"
              alt="Exa"
              width={20}
              height={20}
              style={{ objectFit: 'contain' }}
            />
            <span>Exa</span>
          </button>
          
          {/* Fiyat Skalası / İmar Bilgi Barı */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-stretch gap-3"
          >
            {talepYogunlugu ? (
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
            ) : imarBaskisi && selectedIl ? (
              /* İmar Modu Aktif - Baskı Legend */
              <div 
                className="rounded-lg px-4 py-2 w-[400px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.12))',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <img src="/icons/map-point-rotate.svg" alt="İmar" className="w-5 h-5 flex-shrink-0" style={{ filter: 'brightness(0) invert(1)' }} />
                    <span className="text-amber-300 text-[10px] font-semibold">{selectedIl} - İmar Baskısı Analizi</span>
                  </div>
                  <button
                    onClick={() => handleImarBaskisiToggle(false)}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
                    title="İmar modunu kapat"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                {/* Baskı Renk Skalası */}
                <div className="flex items-center gap-1.5">
                  <span className="text-white/40 text-[9px] whitespace-nowrap">Düşük</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
                    background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f59e0b, #f97316, #ef4444)'
                  }} />
                  <span className="text-white/40 text-[9px] whitespace-nowrap">Yüksek</span>
                </div>
                <div className="text-white/30 text-[8px] mt-1 text-center">Tarla/Ham Toprak parsellerdeki imar baskısı • Zoom 14+ yakınlaştırın</div>
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
                <div className="flex items-center gap-1">
                  {/* Küçült */}
                  <button
                    onClick={() => setChatPanelHeight(30)}
                    title="Küçük"
                    className={`p-1.5 rounded-lg transition-colors ${chatPanelHeight <= 35 ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white/70'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="7 13 12 18 17 13"></polyline>
                      <line x1="12" y1="2" x2="12" y2="18"></line>
                    </svg>
                  </button>
                  {/* Orta */}
                  <button
                    onClick={() => setChatPanelHeight(55)}
                    title="Orta"
                    className={`p-1.5 rounded-lg transition-colors ${chatPanelHeight > 35 && chatPanelHeight < 75 ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white/70'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="7" width="18" height="10" rx="2"></rect>
                    </svg>
                  </button>
                  {/* Tam ekran */}
                  <button
                    onClick={() => setChatPanelHeight(88)}
                    title="Tam ekran"
                    className={`p-1.5 rounded-lg transition-colors ${chatPanelHeight >= 75 ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white/70'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  </button>
                  {/* Ayırıcı */}
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  {/* Kapat */}
                  <button 
                    onClick={() => setIsExaChatOpen(false)}
                    title="Kapat"
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 15 12 9 18 15"></polyline>
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
                {exaChatMessages.map((msg, i) => (
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
