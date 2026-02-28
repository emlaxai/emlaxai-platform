// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParselensPage } from '@/features/parselens';
import { formatChange, getChangeColor, getRiskColor, getRiskGradient } from '@/lib/api';
import DesktopMapPanel from './components/DesktopMapPanel';
import MobileLayout from './components/MobileLayout';
import ModeSwitch from './components/ModeSwitch';
import GenelTab from './components/tabs/GenelTab';
import TalepTab from './components/tabs/TalepTab';
import NufusTab from './components/tabs/NufusTab';
import RiskTab from './components/tabs/RiskTab';
import YatirimTab from './components/tabs/YatirimTab';

export default function ParselensPage() {
  const state = useParselensPage();

  const {
    sidebarWidth, splitPosition, setSplitPosition, isResizing, handleMouseDown,
    activeTab, setActiveTab, containerRef, marketTabs, imarTabs,
    analysisTitle, propertyType, imarBaskisi,
    pageMode, handlePageModeChange,
    imarActiveTab, setImarActiveTab,
    selectedParcel, parcelLoading, scoreCards, chartOption, chartKey,
    selectedMetric, setSelectedMetric, trendKategori, setTrendKategori,
    selectedIl, selectedIlce, selectedMahalle, ilTrendLoading,
    tapuIslemToplam, tapuIslemLoading,
    ilFiyatlari, ilFiyatlariLoading, ilFiyatlariError,
    showAll81Cities, setShowAll81Cities,
    disasterRisk, economicData, economicDataLoading,
    nufusData, nufusLoading,
    demografiData, demografiLoading,
    yasanilabilirlik, yasanilabilirlikLoading,
    talepIlgi, talepIlgiLoading,
    yapiBelgesi, yapiBelgesiLoading,
    arsaPazar, arsaPazarLoading,
    formatNumber,
    searchQuery, handleSearchInput, searchAddress, searchResults, searchLoading,
    showSearchResults, handleSearchSelect, setShowSearchResults,
    isFilterOpen, setIsFilterOpen, searchContainerRef,
    searchMode, setSearchMode,
    cityIlOptions, cityIlceOptions, cityMahalleOptions,
    citySelectedIl, citySelectedIlce, citySelectedMahalle,
    cityIlLoading, cityIlceLoading, cityMahalleLoading,
    handleCityIlSelect, handleCityIlceSelect, handleCityMahalleSelect,
    adaNo, setAdaNo, parselNo, setParselNo, searchAdaParsel, adaParselError,
  } = state;

  return (
    <>
      {/* ─── DESKTOP LAYOUT ─── */}
      <div
        className="hidden md:block fixed top-5 right-5 bottom-5 transition-all duration-300"
        style={{ left: `${sidebarWidth}px` }}
      >
        <div
          ref={containerRef}
          className="w-full h-full rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px) saturate(120%)',
            WebkitBackdropFilter: 'blur(20px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Sol Panel - Analiz */}
          <div
            className="absolute top-0 left-0 bottom-0 overflow-y-auto transition-[width] duration-200"
            style={{ width: `${splitPosition}%`, display: splitPosition === 0 ? 'none' : undefined }}
          >
            {/* Satır 1: Başlık + Mod Switch + Kategori */}
            <div className="flex items-center" style={{ height: '52px', padding: '0 24px' }}>
              <h2 className="text-sm font-medium text-white truncate flex-1 min-w-0">
                {pageMode === 'imar' ? 'İmar Analizi' : analysisTitle}
              </h2>
              <div className="flex-shrink-0">
                <ModeSwitch pageMode={pageMode} onModeChange={handlePageModeChange} />
              </div>
              {pageMode !== 'imar' ? (
                <div className="flex-1 min-w-0 flex justify-end">
                  <span className="text-xs font-medium text-white/70 bg-white/8 px-2.5 py-1 rounded-md">{propertyType}</span>
                </div>
              ) : (
                <div className="flex-1 min-w-0 flex justify-end">
                  <span className="text-xs font-medium text-white/50 truncate">{analysisTitle !== 'Türkiye Genel Bakış' ? analysisTitle : ''}</span>
                </div>
              )}
            </div>
            <div style={{ margin: '0 24px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />

            {/* Satır 2: Arama / Seçim */}
            <div className="flex items-center" style={{ height: '62px', padding: '0 24px', gap: '8px' }}>
              {pageMode !== 'imar' ? (
                <>
                  <SearchModeDropdown searchMode={searchMode} setSearchMode={setSearchMode} />
                  {searchMode === 'address' ? (
                    <div ref={searchContainerRef} className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery.length >= 2) searchAddress(searchQuery, true);
                          if (e.key === 'Escape') setShowSearchResults(false);
                        }}
                        placeholder="İl, ilçe, mahalle veya ada/parsel..."
                        className="w-full pl-3 pr-8 text-white text-xs placeholder-white/30 focus:outline-none transition-all"
                        style={{ height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                      {searchLoading ? (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <button
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                          onClick={() => { if (searchQuery.length >= 2) searchAddress(searchQuery); }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </button>
                      )}
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 right-0 border border-white/10 rounded-xl shadow-2xl z-[999] overflow-hidden max-h-[380px] overflow-y-auto py-1" style={{ background: 'rgba(21, 19, 18, 0.98)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}>
                          {searchResults.filter((r: any) => r.type !== 'parsel').map((result: any, i: number) => {
                            if (result.source === 'backend') {
                              const typeLabel = result.type === 'mahalle' ? 'Mahalle' : result.type === 'ilce' ? 'İlçe' : 'İl';
                              return (
                                <button key={`b-${i}`} onClick={() => handleSearchSelect(result)}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/[0.06] transition-colors text-left outline-none focus:outline-none group">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 group-hover:text-white/40 flex-shrink-0 transition-colors">
                                    <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3"/></>
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-white/90 text-[13px] truncate block">{result.display}</span>
                                  </div>
                                  <span className="flex-shrink-0 text-[10px] text-white/20 font-medium">{typeLabel}</span>
                                </button>
                              );
                            }
                            const parts = (result.display_name || '').split(',');
                            const title = parts[0]?.trim() || '';
                            const subtitle = parts.slice(1, 3).join(',').trim();
                            return (
                              <button key={`n-${i}`} onClick={() => handleSearchSelect(result)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/[0.06] transition-colors text-left outline-none focus:outline-none group">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 group-hover:text-white/40 flex-shrink-0 transition-colors">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3"/>
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
                  ) : (
                    <div className="flex flex-1 gap-1.5">
                      <CitySelect value={citySelectedIl} onChange={handleCityIlSelect} options={cityIlOptions} loading={cityIlLoading} placeholder="İl" />
                      <CitySelect value={citySelectedIlce} onChange={handleCityIlceSelect} options={cityIlceOptions} loading={cityIlceLoading} placeholder="İlçe" disabled={!citySelectedIl} autoOpen={!!citySelectedIl && !citySelectedIlce} />
                      <CitySelect value={citySelectedMahalle} onChange={handleCityMahalleSelect} options={cityMahalleOptions} loading={cityMahalleLoading} placeholder="Mahalle" disabled={!citySelectedIlce} autoOpen={!!citySelectedIlce && !citySelectedMahalle} />
                    </div>
                  )}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-1.5 flex-shrink-0 outline-none focus:outline-none"
                    style={{
                      height: '34px', padding: '0 12px', borderRadius: '8px',
                      border: trendKategori !== 'konut' ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      background: trendKategori !== 'konut' ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.06)',
                      fontSize: '12px', fontWeight: 500,
                      color: trendKategori !== 'konut' ? '#93c5fd' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    {trendKategori === 'konut' ? 'Filtre' : propertyType}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-1 gap-1.5">
                    <CitySelect value={citySelectedIl} onChange={handleCityIlSelect} options={cityIlOptions} loading={cityIlLoading} placeholder="İl" />
                    <CitySelect value={citySelectedIlce} onChange={handleCityIlceSelect} options={cityIlceOptions} loading={cityIlceLoading} placeholder="İlçe" disabled={!citySelectedIl} autoOpen={!!citySelectedIl && !citySelectedIlce} />
                    <CitySelect value={citySelectedMahalle} onChange={handleCityMahalleSelect} options={cityMahalleOptions} loading={cityMahalleLoading} placeholder="Mahalle" disabled={!citySelectedIlce} autoOpen={!!citySelectedIlce && !citySelectedMahalle} />
                  </div>
                  <input
                    type="text"
                    value={adaNo}
                    onChange={(e) => setAdaNo(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchAdaParsel(); }}
                    placeholder="Ada"
                    className="text-xs placeholder-white/30 focus:outline-none"
                    style={{ width: '52px', height: '34px', borderRadius: '8px', textAlign: 'center', fontWeight: 500, color: adaNo ? '#93c5fd' : 'white', background: adaNo ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.06)', border: adaNo ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.08)', transition: 'all 0.15s' }}
                  />
                  <input
                    type="text"
                    value={parselNo}
                    onChange={(e) => setParselNo(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchAdaParsel(); }}
                    placeholder="Parsel"
                    className="text-xs placeholder-white/30 focus:outline-none"
                    style={{ width: '52px', height: '34px', borderRadius: '8px', textAlign: 'center', fontWeight: 500, color: parselNo ? '#93c5fd' : 'white', background: parselNo ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.06)', border: parselNo ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.08)', transition: 'all 0.15s' }}
                  />
                  <button
                    onClick={searchAdaParsel}
                    title="Parsel Ara"
                    className="flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
                    style={{ width: '38px', height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <svg fill="currentColor" className="w-[18px] h-[18px] text-white/50" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 19 3 C 13.489 3 9 7.489 9 13 C 9 15.395 9.839 17.5875 11.25 19.3125 L 3.28125 27.28125 L 4.71875 28.720703 L 12.6875 20.751953 C 14.4115 22.161953 16.605 23 19 23 C 24.511 23 29 18.511 29 13 C 29 7.489 24.511 3 19 3 z M 19 5 C 23.43 5 27 8.57 27 13 C 27 17.43 23.43 21 19 21 C 14.57 21 11 17.43 11 13 C 11 8.57 14.57 5 19 5 z M 19 8 C 16.791 8 15 9.791 15 12 C 15 15 19 19 19 19 C 19 19 23 15 23 12 C 23 9.791 21.209 8 19 8 z M 19 10 C 20.105 10 21 10.895 21 12 C 21 13.104 20.105 14 19 14 C 17.895 14 17 13.104 17 12 C 17 10.895 17.895 10 19 10 z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <div style={{ margin: '0 24px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />

            {/* Piyasa Modu */}
            {pageMode === 'market' && (
              <div className="p-6 pt-0">
                  {/* Tab Navigation */}
                <div className="grid grid-cols-4 border-b border-white/10 mb-6" style={{ marginTop: '16px' }}>
                  {marketTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative text-center outline-none focus:outline-none ${
                        activeTab === tab.id ? 'text-blue-500' : 'text-white/60 hover:text-white/90'
                      }`}
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
                    <GenelTab
                      selectedParcel={selectedParcel} parcelLoading={parcelLoading}
                      scoreCards={scoreCards} chartOption={chartOption} chartKey={chartKey}
                      selectedMetric={selectedMetric} setSelectedMetric={setSelectedMetric}
                      trendKategori={trendKategori} setTrendKategori={setTrendKategori}
                      selectedIl={selectedIl} selectedIlce={selectedIlce}
                      ilTrendLoading={ilTrendLoading} imarBaskisi={imarBaskisi}
                    />
                  )}
                  {activeTab === 'talep' && (
                    <TalepTab
                      tapuIslemToplam={tapuIslemToplam} tapuIslemLoading={tapuIslemLoading}
                      ilFiyatlari={ilFiyatlari} ilFiyatlariLoading={ilFiyatlariLoading}
                      ilFiyatlariError={ilFiyatlariError}
                      showAll81Cities={showAll81Cities} setShowAll81Cities={setShowAll81Cities}
                      selectedParcel={selectedParcel} selectedIl={selectedIl} selectedIlce={selectedIlce}
                      trendKategori={trendKategori}
                      talepIlgi={talepIlgi} talepIlgiLoading={talepIlgiLoading}
                    />
                  )}
                  {activeTab === 'nufus' && <NufusTab nufusData={nufusData} nufusLoading={nufusLoading} selectedIl={selectedIl} selectedIlce={selectedIlce} selectedMahalle={selectedMahalle} demografiData={demografiData} formatNumber={formatNumber} />}
                  {activeTab === 'risk' && (
                    <RiskTab
                      selectedIl={selectedIl} disasterRisk={disasterRisk}
                      economicData={economicData} economicDataLoading={economicDataLoading}
                      yasanilabilirlik={yasanilabilirlik} yasanilabilirlikLoading={yasanilabilirlikLoading}
                      formatNumber={formatNumber} formatChange={formatChange}
                      getChangeColor={getChangeColor} getRiskColor={getRiskColor}
                      getRiskGradient={getRiskGradient}
                    />
                  )}
                </div>
              </div>
            )}

            {/* İmar Pro Modu */}
            {pageMode === 'imar' && (
              adaParselError ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <p className="text-red-400/80 text-sm font-medium mt-4">{adaParselError}</p>
                  <p className="text-white/30 text-xs mt-2 text-center">Lütfen doğru il, ilçe, ada ve parsel bilgilerini girdiğinizden emin olun.</p>
                </div>
              ) : (
                <div className="p-6 pt-0">
                  {/* Tab Navigation */}
                  <div className="grid grid-cols-5 border-b border-white/10 mb-6" style={{ marginTop: '16px' }}>
                    {imarTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setImarActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative text-center outline-none focus:outline-none ${
                          imarActiveTab === tab.id ? 'text-blue-500' : 'text-white/60 hover:text-white/90'
                        }`}
                      >
                        {tab.label}
                        {imarActiveTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-4">
                    {imarActiveTab === 'genel' && (
                      <GenelTab
                        selectedParcel={selectedParcel} parcelLoading={parcelLoading}
                        scoreCards={scoreCards} chartOption={chartOption} chartKey={chartKey}
                        selectedMetric={selectedMetric} setSelectedMetric={setSelectedMetric}
                        trendKategori={trendKategori} setTrendKategori={setTrendKategori}
                        selectedIl={selectedIl} selectedIlce={selectedIlce}
                        ilTrendLoading={ilTrendLoading} imarBaskisi={imarBaskisi}
                      />
                    )}
                    {imarActiveTab === 'talep' && (
                    <TalepTab
                      tapuIslemToplam={tapuIslemToplam} tapuIslemLoading={tapuIslemLoading}
                      ilFiyatlari={ilFiyatlari} ilFiyatlariLoading={ilFiyatlariLoading}
                      ilFiyatlariError={ilFiyatlariError}
                      showAll81Cities={showAll81Cities} setShowAll81Cities={setShowAll81Cities}
                      selectedParcel={selectedParcel} selectedIl={selectedIl} selectedIlce={selectedIlce}
                      trendKategori={trendKategori}
                      talepIlgi={talepIlgi} talepIlgiLoading={talepIlgiLoading}
                      isPro={true}
                      yapiBelgesi={yapiBelgesi} yapiBelgesiLoading={yapiBelgesiLoading}
                      arsaPazar={arsaPazar} arsaPazarLoading={arsaPazarLoading}
                    />
                    )}
                    {imarActiveTab === 'nufus' && <NufusTab nufusData={nufusData} nufusLoading={nufusLoading} selectedIl={selectedIl} selectedIlce={selectedIlce} selectedMahalle={selectedMahalle} demografiData={demografiData} isPro={true} formatNumber={formatNumber} />}
                    {imarActiveTab === 'risk' && (
                      <RiskTab
                        selectedIl={selectedIl} disasterRisk={disasterRisk}
                        economicData={economicData} economicDataLoading={economicDataLoading}
                        yasanilabilirlik={yasanilabilirlik} yasanilabilirlikLoading={yasanilabilirlikLoading}
                        isPro={true}
                        formatNumber={formatNumber} formatChange={formatChange}
                        getChangeColor={getChangeColor} getRiskColor={getRiskColor}
                        getRiskGradient={getRiskGradient}
                      />
                    )}
                    {imarActiveTab === 'yatirim' && <YatirimTab selectedIl={selectedIl} selectedIlce={selectedIlce} isPro={true} />}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Resize Handle */}
          <div
            className="absolute top-0 bottom-0 z-10 flex items-center"
            style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div
              className="absolute top-0 bottom-0 w-1 bg-white/10 cursor-col-resize hover:bg-white/30 transition-colors"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
              onMouseDown={handleMouseDown}
            />
            <button
              onClick={() => {
                if (splitPosition === 0) setSplitPosition(50);
                else if (splitPosition === 100) setSplitPosition(50);
                else if (splitPosition > 50) setSplitPosition(0);
                else setSplitPosition(100);
              }}
              className="relative z-20 w-5 h-10 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                {splitPosition === 0 ? (
                  <polyline points="3,2 7,5 3,8" />
                ) : splitPosition === 100 ? (
                  <polyline points="7,2 3,5 7,8" />
                ) : (
                  <><line x1="3" y1="2" x2="3" y2="8" /><line x1="7" y1="2" x2="7" y2="8" /></>
                )}
              </svg>
            </button>
          </div>

          {/* Map Panel */}
          <DesktopMapPanel {...state} />
        </div>
      </div>

      {/* ─── MOBILE LAYOUT ─── */}
      <MobileLayout {...state} />
    </>
  );
}


/* ── Search Mode Dropdown ──────────────────────────── */
function SearchModeDropdown({ searchMode, setSearchMode }: { searchMode: 'address' | 'city'; setSearchMode: (m: 'address' | 'city') => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label = searchMode === 'address' ? 'Adres' : 'Şehir';

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 outline-none focus:outline-none"
        style={{
          height: '34px',
          padding: '0 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.06)',
          fontSize: '12px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 rounded-lg shadow-2xl z-[999] overflow-hidden min-w-[130px]"
          style={{ animation: 'fadeIn 0.12s ease-out', background: 'rgba(21, 19, 18, 0.98)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => { setSearchMode('address'); setOpen(false); }}
            className={`w-full text-left px-3 py-2.5 text-xs transition-colors outline-none focus:outline-none ${searchMode === 'address' ? 'text-blue-400 bg-blue-500/10' : 'text-white/70 hover:bg-white/[0.04]'}`}
          >
            Adres Girin
          </button>
          <button
            onClick={() => { setSearchMode('city'); setOpen(false); }}
            className={`w-full text-left px-3 py-2.5 text-xs transition-colors outline-none focus:outline-none ${searchMode === 'city' ? 'text-blue-400 bg-blue-500/10' : 'text-white/70 hover:bg-white/[0.04]'}`}
          >
            Şehir Seçin
          </button>
        </div>
      )}
    </div>
  );
}


/* ── City Select Dropdown ──────────────────────────── */
function CitySelect({ value, onChange, options, loading, placeholder, disabled, autoOpen }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  loading: boolean;
  placeholder: string;
  disabled?: boolean;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoOpen && !disabled && options.length > 0 && !value) {
      const t = setTimeout(() => setOpen(true), 150);
      return () => clearTimeout(t);
    }
  }, [autoOpen, disabled, options.length, value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setFilter(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = filter
    ? options.filter(o => o.toLowerCase().includes(filter.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        onClick={() => { if (!disabled) setOpen(!open); }}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-1 outline-none focus:outline-none truncate"
        style={{
          height: '34px',
          padding: '0 10px',
          borderRadius: '8px',
          border: value ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.08)',
          background: value ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.06)',
          fontSize: '12px',
          fontWeight: 500,
          color: disabled ? 'rgba(255,255,255,0.2)' : value ? '#93c5fd' : 'rgba(255,255,255,0.4)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <span className="truncate">{value || placeholder}</span>
        {loading ? (
          <div className="w-3 h-3 border-[1.5px] border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" style={{ opacity: 0.3 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>
      {open && !disabled && (
        <div className="absolute top-full mt-1 left-0 right-0 rounded-lg shadow-2xl z-[999] overflow-hidden"
          style={{ animation: 'fadeIn 0.12s ease-out', maxHeight: '280px', background: 'rgba(21, 19, 18, 0.98)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {options.length > 8 && (
            <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Ara..."
                autoFocus
                className="w-full px-2.5 py-1.5 rounded text-white text-[11px] placeholder-white/25 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: options.length > 8 ? '228px' : '280px' }}>
            {filtered.length === 0 && (
              <div className="px-3 py-2.5 text-white/30 text-[11px]">Sonuç bulunamadı</div>
            )}
            {filtered.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); setFilter(''); }}
                className={`w-full text-left px-3 py-2 text-[11px] transition-colors outline-none focus:outline-none ${opt === value ? 'text-blue-400 bg-blue-500/10' : 'text-white/70 hover:bg-white/[0.04]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
