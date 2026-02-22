// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import BottomDrawer from '@/components/BottomDrawer/BottomDrawer';
import MobileSidebar from '@/components/MobileSidebar/MobileSidebar';
import { displayMahalleName } from '../utils/helpers';
import ImarParcelsLayer from './ImarParcelsLayer';
import OzelBolgelerLayer from './OzelBolgelerLayer';
import TapuHeatmapLayer from './TapuHeatmapLayer';
import { MapRefSetter, MapResizer } from './MapHelpers';
import { geoNameToDbName, getPriceColor } from '../utils/constants';
import FilterPopup from '@/components/FilterPopup/FilterPopup';
import ExaMarkdown from '@/components/ExaMarkdown/ExaMarkdown';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });
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

export default function MobileLayout(props: Record<string, any>) {
  const {
    illerGeoJSON, ilcelerGeoJSON, mahallelerGeoJSON,
    selectedIl, selectedIlce, selectedIlCenter,
    ilSinirlari, ilceSinirlari, mahalleSinirlari,
    ilFiyatlari, ilceFiyatlari, mahalleFiyatlari,
    priceMin, priceMax, ilcePriceMin, ilcePriceMax, mahallePriceMin, mahallePriceMax,
    imarBaskisi, talepYogunlugu,
    tileConfig, mapMode, mapRef, pendingZoomRef,
    searchQuery, searchResults, searchLoading, searchPin, showSearchResults,
    isExaChatOpen, exaChatInput, exaChatLoading,
    isDrawerOpen, isMobileSidebarOpen, isLayersDropdownOpen, isFilterOpen,
    analysisTitle, propertyType, trendKategori, activeTab,
    scoreCards, chartOption, tapuIslemToplam, tapuIslemLoading,
    chatContainerRef, chatResizing, layersDropdownRef, mobileSearchContainerRef,
    setMapMode, setIsLayersDropdownOpen, setIlSinirlari, setIlceSinirlari,
    setMahalleSinirlari, setMahallelerGeoJSON, setMahalleFiyatlari,
    setSelectedIl, setSelectedIlce, setSelectedIlCenter,
    setIlTrend, setIlceTrend, setIlceFiyatlari,
    setSearchPin, setShowSearchResults, setAnalysisTitle,
    setTalepYogunlugu, setIsExaChatOpen, setExaChatInput,
    setIsFilterOpen, setIsDrawerOpen, setIsMobileSidebarOpen, setActiveTab,
    setChatPanelHeight, 
    handleIlClick, handleIlceClick, handleSearchInput, handleSearchSelect,
    handleFiltersApply, handleImarBaskisiToggle, handleExaChatSend,
    handleChatResizeStart, handleParcelClick, searchAddress, tabs, exaChatMessages, chatEndRef, chatPanelHeight,
    formatNumber, getMahallePrice, getMahalleColor, getIlColor, getIlPrice, getIlceColor, getIlcePrice,
    _mapRefCb,
  } = props;
  return (
    <>
    <div className="md:hidden fixed inset-0 bg-black">
      {/* Harita - Full Screen */}
      <div className="absolute inset-0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style jsx global>{`
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
          center={[39.0, 35.0]}
          zoom={6}
          style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
          className="z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <MapRefSetter />
          <MapResizer />
          <ZoomControl position="bottomleft" />
          <TileLayer
            key={mapMode}
            url={tileConfig.url}
            {...(tileConfig.subdomains ? { subdomains: tileConfig.subdomains } : {})}
            maxZoom={tileConfig.maxZoom}
          />
          
          {/* Arama Pin Marker (Mobil) */}
          {searchPin && (() => {
            const L = typeof window !== 'undefined' ? require('leaflet') : null;
            if (!L) return null;
            const pinIcon = L.divIcon({
              className: '',
              html: `<div style="position:relative;width:30px;height:42px"><svg width="30" height="42" viewBox="0 0 30 42" fill="none"><path d="M15 0C6.72 0 0 6.72 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.72 23.28 0 15 0z" fill="#3B82F6"/><circle cx="15" cy="14" r="6" fill="white"/></svg></div>`,
              iconSize: [30, 42], iconAnchor: [15, 42]
            });
            return <Marker position={searchPin} icon={pinIcon} />;
          })()}
          
          {/* İl Sınırları - Fiyata göre renklendirilmiş */}
          {ilSinirlari && illerGeoJSON && (
            <GeoJSON
              key={`il-sinirlari-mobile-${ilFiyatlari ? 'loaded' : 'default'}`}
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
                  
                  layer.on('click', () => {
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
              key={`ilce-sinirlari-mobile-${selectedIl}-${ilceFiyatlari ? 'loaded' : 'default'}`}
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
                  
                  layer.on('click', () => {
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

          {/* Mahalle Sınırları Katmanı (Mobil) - Fiyata göre renklendirilmiş */}
          {mahalleSinirlari && mahallelerGeoJSON && selectedIlce && (
            <GeoJSON
              key={`mahalle-sinirlari-mobile-${selectedIl}-${selectedIlce}-${mahalleFiyatlari ? 'loaded' : 'default'}`}
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
                }
              }}
            />
          )}

          {/* İmar Baskısı - Parsel Katmanı (Mobil - Viewport-based GeoJSON) */}
          <ImarParcelsLayer il={selectedIl || ''} active={imarBaskisi && !!selectedIl} onParcelClick={handleParcelClick} />

          {/* Özel Bölge Sınırları (Mobil) */}
          <OzelBolgelerLayer active={imarBaskisi && !!selectedIl} />

          {/* TKGM Tapu İşlem Hacmi Heatmap (Mobil) */}
          <TapuHeatmapLayer il={selectedIl || ''} active={talepYogunlugu} />
        </MapContainer>

        {/* 1/1000 İmar Planı Lejantı - Mobil Sol Alt */}
        {imarBaskisi && (
          <div
            className="absolute bottom-14 left-3 z-20 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              maxHeight: '220px',
              width: '160px',
            }}
          >
            <div className="px-2 py-1.5 border-b border-white/10">
              <span className="text-[8px] font-bold text-white/80 tracking-wider">PLAN LEJANTI</span>
            </div>
            <div className="px-2 py-1.5 flex flex-col gap-1" style={{ overflowY: 'auto', maxHeight: '185px' }}>
              {[
                { color: '#6B3410', label: 'Konut Alanı' },
                { color: '#FFD700', label: 'İmar Potansiyel' },
                { color: '#DC143C', label: 'Ticari Alan' },
                { color: '#800080', label: 'Sanayi / OSB' },
                { color: '#4DA6FF', label: 'Kamusal Alan' },
                { color: '#228B22', label: 'Tarım Alanı' },
                { color: '#708090', label: 'Yol / Altyapı' },
                { color: '#FF6347', label: 'Sit Alanı' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className="flex-shrink-0"
                    style={{
                      width: 12, height: 9, borderRadius: 1,
                      background: `repeating-linear-gradient(45deg, ${color}, ${color} 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)`,
                      border: `1px solid ${color}88`,
                    }}
                  />
                  <span className="text-[8px] text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Harita Modu Toggle - Mobil Sağ Üst */}
        <div className="absolute top-16 right-3 z-30 flex flex-col bg-black/80 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
          <button
            onClick={() => setMapMode('dark')}
            className={`px-2.5 py-2 text-[10px] font-medium transition-all duration-200 flex items-center gap-1 outline-none focus:outline-none ${
              mapMode === 'dark' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            Koyu
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-2 text-[10px] font-medium transition-all duration-200 flex items-center gap-1 outline-none focus:outline-none border-t border-white/10 ${
              mapMode === 'satellite' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Uydu
          </button>
          <button
            onClick={() => setMapMode('hybrid')}
            className={`px-2.5 py-2 text-[10px] font-medium transition-all duration-200 flex items-center gap-1 outline-none focus:outline-none border-t border-white/10 ${
              mapMode === 'hybrid' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            Hibrit
          </button>
        </div>

        {/* Exa Hızlı Analiz Butonu - Mobil Ayrı */}
        <button
          onClick={() => setIsExaChatOpen(!isExaChatOpen)}
          className="absolute z-30 px-2.5 py-2 text-[10px] font-semibold transition-all duration-200 flex items-center gap-1 outline-none focus:outline-none text-white rounded-lg"
          style={{
            top: '180px',
            right: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #ec4899)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
        >
          <Image src="/icons/emlaxai-icon.svg" alt="Exa" width={12} height={12} style={{ objectFit: 'contain' }} />
          <span>Exa</span>
        </button>
        
        {/* Fiyat Skalası - Mobile */}
        <div className="absolute bottom-20 left-4 right-4 z-20 flex items-end gap-2">
          <div 
            className="flex-1 rounded-lg px-3 py-1.5"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 className="text-white/70 text-[9px] font-medium mb-0.5 text-center">{propertyType} m² Birim Fiyatı</h3>
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] font-medium whitespace-nowrap">{formatNumber(priceMin)} ₺</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{
                background: 'linear-gradient(to right, #10b981, #22c55e, #84cc16, #eab308, #f59e0b, #f97316, #ef4444, #dc2626)'
              }}>
              </div>
              <span className="text-white text-[10px] font-medium whitespace-nowrap">{formatNumber(priceMax)} ₺</span>
            </div>
          </div>
        </div>

        {/* Exa Chat Paneli - Mobile */}
        <div 
          className="absolute left-0 right-0 bottom-0 z-30 transition-all duration-500 ease-in-out overflow-hidden"
          style={{
            height: isExaChatOpen ? '60%' : '0',
            opacity: isExaChatOpen ? 1 : 0,
            pointerEvents: isExaChatOpen ? 'auto' : 'none',
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
            {/* Chat Header - Mobile */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/emlaxai-icon.svg"
                  alt="Exa"
                  width={18}
                  height={18}
                  className="flex-shrink-0"
                  style={{ objectFit: 'contain', position: 'relative', top: '-7px' }}
                />
                <div>
                  <h3 className="text-white text-xs font-semibold leading-none">Exa Hızlı Analiz</h3>
                  <p className="text-white/40 text-[9px] leading-none mt-0.5">
                    {selectedIl ? `${selectedIl} analizi` : 'Türkiye geneli'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsExaChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 15 12 9 18 15"></polyline>
                </svg>
              </button>
            </div>

            {/* Chat Mesajları - Mobile */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {exaChatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Image
                    src="/icons/emlaxai-icon.svg"
                    alt="Exa"
                    width={32}
                    height={32}
                    style={{ objectFit: 'contain', opacity: 0.3 }}
                  />
                  <p className="text-white/30 text-xs mt-2">Emlak hakkında bir soru sorun</p>
                  <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                    {[
                      selectedIl ? `${selectedIl} fiyat trendi?` : 'En değerli iller?',
                      'Kira getirisi?',
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setExaChatInput(q); }}
                        className="px-2.5 py-1 rounded-full text-[10px] text-white/50 border border-white/10 hover:border-white/25 hover:text-white/70 transition-all"
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
                    <div className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed bg-blue-500/20 text-white border border-blue-500/20">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[85%] text-xs leading-relaxed text-white/85">
                      <div className="flex items-center gap-1 mb-1">
                        <Image src="/icons/emlaxai-icon.svg" alt="Exa" width={12} height={12} style={{ objectFit: 'contain' }} />
                        <span className="text-[9px] text-white/40 font-medium">Exa</span>
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
                    <span className="text-white/30 text-[10px]">Exa düşünüyor...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input - Mobile */}
            <div className="px-4 py-2.5 border-t border-white/8">
              <div className="relative">
                <input
                  type="text"
                  value={exaChatInput}
                  onChange={(e) => setExaChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExaChatSend()}
                  placeholder="Bir şey sorun..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/25 transition-colors"
                />
                <button
                  onClick={handleExaChatSend}
                  disabled={!exaChatInput.trim() || exaChatLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                >
                  <Image
                    src="/icons/send-prompt.svg"
                    alt="Gönder"
                    width={24}
                    height={24}
                    style={{ objectFit: 'contain' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      {/* Filter Popup */}
      <FilterPopup 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onApply={handleFiltersApply}
        initialValues={{ category: trendKategori as any, tip: 'satilik' }}
      />

      {/* Üst Bar - Hamburger + Arama + Filtre */}
      <div className="fixed top-4 left-4 right-4 z-30 flex items-center justify-center gap-2">
        {/* Sol - Hamburger Menu */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Orta - Arama Kutusu */}
        <div ref={mobileSearchContainerRef} className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.length >= 2) searchAddress(searchQuery);
              if (e.key === 'Escape') setShowSearchResults(false);
            }}
            placeholder="İl, ilçe, mahalle, ada/parsel..."
            className="w-full pl-3 pr-9 py-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-white/40"
          />
          {searchLoading ? (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
            </div>
          ) : (
            <button 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md"
              onClick={() => { if (searchQuery.length >= 2) searchAddress(searchQuery); }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          )}

          {/* Mobil Arama Sonuçları - Google Style */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[999] overflow-hidden max-h-[50vh] overflow-y-auto py-1">
              {searchResults.map((result: any, i: number) => {
                if (result.source === 'backend') {
                  const typeLabel = result.type === 'parsel' ? 'Parsel' : result.type === 'mahalle' ? 'Mahalle' : result.type === 'ilce' ? 'İlçe' : 'İl';
                  return (
                    <button key={`mb-${i}`} onClick={() => handleSearchSelect(result)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left outline-none focus:outline-none">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 flex-shrink-0">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className="text-white/90 text-[12px] truncate flex-1">{result.display}</span>
                      <span className="text-[9px] text-white/20 flex-shrink-0">{typeLabel}</span>
                    </button>
                  );
                }
                const parts = (result.display_name || '').split(',');
                const title = parts[0]?.trim() || '';
                return (
                  <button key={`mn-${i}`} onClick={() => handleSearchSelect(result)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left outline-none focus:outline-none">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 flex-shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-white/90 text-[12px] truncate flex-1">{title}</span>
                    <span className="text-[9px] text-white/20 flex-shrink-0">Adres</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ - Filtre */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="p-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all flex-shrink-0 outline-none focus:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </button>
      </div>

      {/* Sol Alt - Katmanlar Dropdown */}
      <div className="fixed bottom-24 left-4 z-30">
        <button 
          onClick={() => setIsLayersDropdownOpen(!isLayersDropdownOpen)}
          className="p-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all outline-none focus:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        {isLayersDropdownOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-52 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
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

      {/* Sağ Alt - Analiz Başlat Butonu */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-24 right-4 z-30 px-4 py-2 bg-blue-600 backdrop-blur-md border border-blue-500/50 rounded-full text-white text-xs font-medium hover:bg-blue-700 transition-all shadow-lg"
      >
        Analiz Başlat
      </button>

      {/* Bottom Drawer - Analiz Sonuçları */}
      <BottomDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-white">{analysisTitle}</h2>
            <span className="text-sm font-medium text-white/80 bg-white/10 px-3 py-1.5 rounded-lg">
              {imarBaskisi ? 'Arsa' : propertyType}
            </span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
            {tabs.map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 text-sm font-medium transition-all duration-200 relative text-center whitespace-nowrap
                  outline-none focus:outline-none
                  ${activeTab === tab.id 
                    ? 'text-blue-500' 
                    : 'text-white/60 hover:text-white/90'
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'genel' && (
              <>
                {selectedIl && (
                <>
                <div className="grid grid-cols-2 gap-3">
                  {scoreCards.map((card: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-white/60 text-xs">{card.title}</p>
                        <span className={`text-xs font-medium ${card.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                          {card.change > 0 ? '↑' : '↓'} {Math.abs(card.change)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-white text-2xl font-semibold">{card.value}</p>
                        <div className="flex-shrink-0">
                          <svg width="50" height="50" viewBox="0 0 60 60" className="transform -rotate-90">
                            <circle
                              cx="30"
                              cy="30"
                              r="25"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="5"
                            />
                            <circle
                              cx="30"
                              cy="30"
                              r="25"
                              fill="none"
                              stroke={card.value >= 85 ? '#10b981' : card.value >= 70 ? '#3b82f6' : '#f59e0b'}
                              strokeWidth="5"
                              strokeDasharray={`${(card.value / 100) * 157} 157`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skor Açıklama Kartı - Mobile */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2">
                  {/* Gradient Bar */}
                  <div className="relative h-1.5 rounded-full overflow-hidden mb-1.5" style={{
                    background: 'linear-gradient(to right, #ef4444 0%, #f97316 20%, #eab308 40%, #84cc16 60%, #22c55e 80%, #10b981 100%)'
                  }}>
                    {/* Skor İndikatörü - Glass Balon */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center transition-all duration-300"
                      style={{ left: `${(scoreCards.reduce((acc, card) => acc + card.value, 0) / scoreCards.length)}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="text-white text-[9px] font-bold">
                        {Math.round(scoreCards.reduce((acc, card) => acc + card.value, 0) / scoreCards.length)}
                      </span>
                    </div>
                  </div>

                  {/* Açıklama Etiketleri */}
                  <div className="flex justify-between items-center text-[8px]">
                    <div className="text-center">
                      <div className="text-white/40 font-medium">0-40</div>
                      <div className="text-white/50 mt-0.5">Çok Düşük</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/40 font-medium">40-50</div>
                      <div className="text-white/50 mt-0.5">Düşük</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/40 font-medium">50-60</div>
                      <div className="text-white/50 mt-0.5">Orta</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/40 font-medium">60-70</div>
                      <div className="text-white/50 mt-0.5">İyi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/40 font-medium">70-100</div>
                      <div className="text-white/50 mt-0.5">Mükemmel</div>
                    </div>
                  </div>
                </div>
                </>
                )}
              </>
            )}
            {activeTab === 'talep' && (
              <div className="space-y-4">
                {/* TKGM Tapu İşlem Hacmi - Mobile */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex flex-col gap-2 mb-3">
                    <h3 className="text-white text-base font-semibold">TKGM Tapu İşlem Hacmi</h3>
                    <span className="text-blue-400 text-[10px] font-semibold bg-blue-500/10 px-2 py-1 rounded-full self-start">
                      Kaynak: TKGM
                    </span>
                  </div>
                  <div className="h-72">
                    {tapuIslemLoading ? (
                      <div className="flex items-center justify-center h-full text-white/60 text-sm animate-pulse">Yükleniyor...</div>
                    ) : tapuIslemToplam ? (
                      typeof window !== 'undefined' && (
                        <ReactECharts 
                          option={{
                            backgroundColor: 'transparent',
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              borderWidth: 1,
                              textStyle: { color: '#fff', fontSize: 10 },
                              axisPointer: { type: 'shadow' }
                            },
                            grid: { left: '20%', right: '4%', bottom: '3%', top: '3%', containLabel: false },
                            xAxis: {
                              type: 'value',
                              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                              axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}` },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' } }
                            },
                            yAxis: {
                              type: 'category',
                              data: tapuIslemToplam.iller.slice(0, 10).reverse().map(i => i.il),
                              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                              axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
                              splitLine: { show: false }
                            },
                            series: [{
                              name: 'Toplam İşlem',
                              type: 'bar',
                              data: tapuIslemToplam.iller.slice(0, 10).reverse().map(i => i.toplam_islem),
                              itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#60a5fa' }] }, borderRadius: [0, 3, 3, 0] },
                              barWidth: '50%'
                            }]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-red-400 text-sm">Yüklenemedi</div>
                    )}
                  </div>
                </div>

                {/* Piyasa Metrikleri - Mobile (2x2) Gerçek Veri */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Toplam İşlem</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">{tapuIslemToplam ? `${(tapuIslemToplam.genel.toplam_islem / 1000000).toFixed(1)}M` : '...'}</p>
                    <span className="text-blue-400 text-[10px] font-semibold">TKGM 81 İl</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="10" height="10" viewBox="0 0 440 440" fill="#10b981" className="flex-shrink-0 mt-1">
                        <path d="M344.33,212.5c0,103.857-80.577,189.248-182.5,196.936V197.361l151.76-55.236l-10.26-28.191l-141.5,51.502V121.38l151.76-55.236l-10.26-28.191l-141.5,51.502V0h-30v100.374l-66.16,24.08l10.261,28.191L131.83,132.3v44.055l-66.16,24.08l10.261,28.191l55.899-20.346V440h15c60.813,0,117.957-23.651,160.902-66.597c42.946-42.946,66.598-100.089,66.598-160.903H344.33z"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Ort. m² Fiyat</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">{ilFiyatlari ? `${(ilFiyatlari.iller.reduce((a, b) => a + b.m2_fiyat, 0) / ilFiyatlari.iller.length / 1000).toFixed(1)}K ₺` : '...'}</p>
                    <span className="text-green-500 text-[10px] font-semibold">TR Ort. Güncel</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Toplam Parsel</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">{tapuIslemToplam ? `${(tapuIslemToplam.genel.toplam_parsel / 1000000).toFixed(1)}M` : '...'}</p>
                    <span className="text-purple-400 text-[10px] font-semibold">TKGM Kayıtlı</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Ort. İşlem/Parsel</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">{tapuIslemToplam ? tapuIslemToplam.genel.ort_islem_per_parsel.toFixed(2) : '...'}</p>
                    <span className="text-amber-400 text-[10px] font-semibold">Likidite Ort.</span>
                  </div>
                </div>

                {/* En Yüksek İşlem Yoğunluğu - Mobile */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex flex-col gap-2 mb-3">
                    <h3 className="text-white text-base font-semibold">En Yüksek İşlem Yoğunluğu</h3>
                    <span className="text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-2 py-1 rounded-full self-start">
                      Ort. İşlem / Parsel
                    </span>
                  </div>
                  <div className="h-72">
                    {tapuIslemLoading ? (
                      <div className="flex items-center justify-center h-full text-white/60 text-sm animate-pulse">Yükleniyor...</div>
                    ) : tapuIslemToplam ? (
                      typeof window !== 'undefined' && (() => {
                        const sorted = [...tapuIslemToplam.iller].sort((a, b) => b.ort_islem - a.ort_islem).slice(0, 10);
                        return (
                          <ReactECharts 
                            option={{
                              backgroundColor: 'transparent',
                              tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, textStyle: { color: '#fff', fontSize: 10 }, axisPointer: { type: 'shadow' } },
                              grid: { left: '20%', right: '4%', bottom: '3%', top: '3%', containLabel: false },
                              xAxis: {
                                type: 'value',
                                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                                axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9 },
                                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' } }
                              },
                              yAxis: {
                                type: 'category',
                                data: sorted.reverse().map(i => i.il),
                                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                                axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
                                splitLine: { show: false }
                              },
                              series: [{
                                name: 'Ort. İşlem/Parsel',
                                type: 'bar',
                                data: sorted.map(i => i.ort_islem),
                                itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#34d399' }] }, borderRadius: [0, 3, 3, 0] },
                                barWidth: '50%'
                              }]
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                        );
                      })()
                    ) : (
                      <div className="flex items-center justify-center h-full text-red-400 text-sm">Yüklenemedi</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'nufus' && (
              <div className="text-white/60 text-center py-8">Nüfus analizi içeriği buraya gelecek...</div>
            )}
            {activeTab === 'risk' && (
              <div className="text-white/60 text-center py-8">Risk analizi içeriği buraya gelecek...</div>
            )}
            {activeTab === 'yatirim' && (
              <div className="text-white/60 text-center py-8">Yatırım analizi içeriği buraya gelecek...</div>
            )}
          </div>
        </div>
      </BottomDrawer>
    </div>
    </>
  );
}
