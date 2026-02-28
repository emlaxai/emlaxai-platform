// @ts-nocheck
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useExaChat } from '@/contexts/ExaChatContext';
import { type FilterValues } from '@/components/FilterPopup/FilterPopup';
import {
  getEconomicData, getIlFiyatlari, getIlceFiyatlari, getMahalleFiyatlari,
  getIlTrend, getIlceTrend, getMahalleTrend, getTurkiyeTrend, getTapuIslemToplam,
  getNufusData, getDemografi, getYasanilabilirlik, getTalepIlgi,
  getYapiBelgesi, getArsaPazar,
  formatNumber, formatChange, getChangeColor, getRiskColor, getRiskGradient,
  type EconomicData, type IlFiyatlari, type IlceFiyatlari, type MahalleFiyatlari,
  type IlTrend, type IlceTrend, type TurkiyeTrend, type TapuIslemToplam,
  type NufusData, type DemografiData, type YasanilabilirlikData, type TalepIlgiData,
  type YapiBelgesiData, type ArsaPazarData,
} from '@/lib/api';
import { setMapRefCallback } from '@/app/(app)/parselens/components/MapHelpers';
import { GEOJSON_TO_DB_NAME, geoNameToDbName, ParselDetail, PRICE_GRADIENT_COLORS, getPriceColor } from '@/app/(app)/parselens/utils/constants';
import { normalizeForMatch, normalizeMahalle, displayMahalleName, buildMahalleFiyatMap } from '@/app/(app)/parselens/utils/helpers';
import { getChartOption } from '@/app/(app)/parselens/utils/chartOptions';

export function useParselensPage() {
  const { isOpen: sidebarOpen } = useSidebar();
  const { sessions, createSession, addMessage, updateLastAssistantMessage, getSessionMessages, sessionExists } = useExaChat();

  // ─── Page Mode ─────────────────────────────
  const [pageMode, setPageMode] = useState<'market' | 'imar'>('market');
  const [previousMapMode, setPreviousMapMode] = useState<'dark' | 'satellite' | 'hybrid' | '3d'>('dark');

  // ─── Location Cache ───────────────────────
  const locationCacheRef = useRef<Record<string, string[]>>({});

  // ─── UI State ──────────────────────────────
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState('genel');
  const [imarActiveTab, setImarActiveTab] = useState('genel');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ─── Map State ─────────────────────────────
  const [mapMode, setMapMode] = useState<'dark' | 'satellite' | 'hybrid' | '3d'>('dark');
  const mapRef = useRef<any>(null);
  const _mapRefCb = useCallback((map: any) => { mapRef.current = map; }, []);
  useEffect(() => { setMapRefCallback(_mapRefCb); return () => { setMapRefCallback(null); }; }, [_mapRefCb]);

  const tileConfig = useMemo(() => {
    switch (mapMode) {
      case 'satellite': return { url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', subdomains: undefined, maxZoom: 21 };
      case 'hybrid': return { url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', subdomains: undefined, maxZoom: 21 };
      default: return { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', subdomains: 'abcd', maxZoom: 20 };
    }
  }, [mapMode]);

  // ─── Search State ──────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchPin, setSearchPin] = useState<[number, number] | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // ─── Search Mode (Adres Girin / Şehir Seçin) ─
  const [searchMode, setSearchMode] = useState<'address' | 'city'>('address');
  const [cityIlOptions, setCityIlOptions] = useState<string[]>([]);
  const [cityIlceOptions, setCityIlceOptions] = useState<string[]>([]);
  const [cityMahalleOptions, setCityMahalleOptions] = useState<string[]>([]);
  const [citySelectedIl, setCitySelectedIl] = useState('');
  const [citySelectedIlce, setCitySelectedIlce] = useState('');
  const [citySelectedMahalle, setCitySelectedMahalle] = useState('');
  const [cityIlLoading, setCityIlLoading] = useState(false);
  const [cityIlceLoading, setCityIlceLoading] = useState(false);
  const [cityMahalleLoading, setCityMahalleLoading] = useState(false);

  // ─── Ada/Parsel Search ────────────────────
  const [adaNo, setAdaNo] = useState('');
  const [parselNo, setParselNo] = useState('');

  // ─── Parsel FlyTo (CesiumMap 3D) ─────────
  const [parselFlyTo, setParselFlyTo] = useState<{ lat: number; lon: number; polygon?: number[][] } | null>(null);

  // ─── Layer State ───────────────────────────
  const [isLayersDropdownOpen, setIsLayersDropdownOpen] = useState(false);
  const [talepYogunlugu, setTalepYogunlugu] = useState(false);
  const [imarBaskisi, setImarBaskisi] = useState(false);
  const [ilSinirlari, setIlSinirlari] = useState(true);
  const [ilceSinirlari, setIlceSinirlari] = useState(false);
  const preImarRef = useRef<{ il: boolean; ilce: boolean } | null>(null);

  // ─── Selection State ───────────────────────
  const [selectedParcel, setSelectedParcel] = useState<ParselDetail | null>(null);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [parselTrend, setParselTrend] = useState<any>(null);
  const [chartKey, setChartKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersDropdownRef = useRef<HTMLDivElement>(null);

  // ─── GeoJSON State ─────────────────────────
  const [illerGeoJSON, setIllerGeoJSON] = useState<any>(null);
  const [ilcelerGeoJSON, setIlcelerGeoJSON] = useState<any>(null);
  const [selectedIl, setSelectedIl] = useState<string | null>(null);
  const [selectedIlCenter, setSelectedIlCenter] = useState<[number, number] | null>(null);
  const [selectedIlZoom, setSelectedIlZoom] = useState<number>(9);
  const [selectedIlce, setSelectedIlce] = useState<string | null>(null);
  const [mahallelerGeoJSON, setMahallelerGeoJSON] = useState<any>(null);
  const [mahalleSinirlari, setMahalleSinirlari] = useState(false);
  const [selectedMahalle, setSelectedMahalle] = useState<string | null>(null);
  const [mahalleLoading, setMahalleLoading] = useState(false);
  const [mahalleFiyatlari, setMahalleFiyatlari] = useState<MahalleFiyatlari | null>(null);

  // ─── Breadcrumb & Analysis State ───────────
  const pendingZoomRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const [showAll81Cities, setShowAll81Cities] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState('Türkiye Genel Bakış');
  const [propertyType, setPropertyType] = useState('Konut');
  const [trendKategori, setTrendKategori] = useState('konut');

  // ─── Data State ────────────────────────────
  const [economicData, setEconomicData] = useState<EconomicData | null>(null);
  const [economicDataLoading, setEconomicDataLoading] = useState(true);
  const [economicDataError, setEconomicDataError] = useState<string | null>(null);
  const [ilFiyatlari, setIlFiyatlari] = useState<IlFiyatlari | null>(null);
  const [ilFiyatlariLoading, setIlFiyatlariLoading] = useState(true);
  const [ilFiyatlariError, setIlFiyatlariError] = useState<string | null>(null);
  const [ilceFiyatlari, setIlceFiyatlari] = useState<IlceFiyatlari | null>(null);
  const [ilTrend, setIlTrend] = useState<IlTrend | null>(null);
  const [ilTrendLoading, setIlTrendLoading] = useState(false);
  const [ilceTrend, setIlceTrend] = useState<IlceTrend | null>(null);
  const [disasterRisk, setDisasterRisk] = useState<any>(null);
  const [nufusData, setNufusData] = useState<NufusData | null>(null);
  const [nufusLoading, setNufusLoading] = useState(false);
  const [demografiData, setDemografiData] = useState<DemografiData | null>(null);
  const [demografiLoading, setDemografiLoading] = useState(false);
  const [yasanilabilirlik, setYasanilabilirlik] = useState<YasanilabilirlikData | null>(null);
  const [yasanilabilirlikLoading, setYasanilabilirlikLoading] = useState(false);
  const [talepIlgi, setTalepIlgi] = useState<TalepIlgiData | null>(null);
  const [talepIlgiLoading, setTalepIlgiLoading] = useState(false);
  const [yapiBelgesi, setYapiBelgesi] = useState<YapiBelgesiData | null>(null);
  const [yapiBelgesiLoading, setYapiBelgesiLoading] = useState(false);
  const [arsaPazar, setArsaPazar] = useState<ArsaPazarData | null>(null);
  const [arsaPazarLoading, setArsaPazarLoading] = useState(false);
  const [turkiyeTrend, setTurkiyeTrend] = useState<TurkiyeTrend | null>(null);
  const [turkiyeTrendLoading, setTurkiyeTrendLoading] = useState(true);
  const [tapuIslemToplam, setTapuIslemToplam] = useState<TapuIslemToplam | null>(null);
  const [tapuIslemLoading, setTapuIslemLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('m2');

  // ─── Chat State ────────────────────────────
  const [isExaChatOpen, setIsExaChatOpen] = useState(false);
  const [exaChatInput, setExaChatInput] = useState('');
  const [exaChatLoading, setExaChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [quickAnalysisSessionId, setQuickAnalysisSessionId] = useState<string | null>(null);
  const [chatPanelHeight, setChatPanelHeight] = useState(55);
  const chatResizing = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ─── Trend Kategori Change ─────────────────
  useEffect(() => {
    if (!selectedIl) return;
    const dbIlAdi = geoNameToDbName(selectedIl);
    setIlTrendLoading(true);
    getIlTrend(dbIlAdi, 120, trendKategori)
      .then(data => setIlTrend(data)).catch(console.error).finally(() => setIlTrendLoading(false));
    getIlceFiyatlari(dbIlAdi, trendKategori).then(data => setIlceFiyatlari(data)).catch(console.error);
    if (selectedIlce) {
      getIlceTrend(dbIlAdi, selectedIlce, 120, trendKategori).then(data => setIlceTrend(data)).catch(console.error);
      getMahalleFiyatlari(dbIlAdi, selectedIlce, trendKategori).then(data => setMahalleFiyatlari(data)).catch(console.error);
    }
  }, [trendKategori]);

  // ─── Disaster Risk ─────────────────────────
  useEffect(() => {
    const dbIl = selectedIl ? geoNameToDbName(selectedIl) : 'TURKIYE';
    fetch(`/api/disaster-risk?il=${encodeURIComponent(dbIl)}`)
      .then(r => r.json()).then(data => setDisasterRisk(data)).catch(() => setDisasterRisk(null));
  }, [selectedIl]);

  // ─── Filter Handler ────────────────────────
  const handleFiltersApply = useCallback((filters: FilterValues) => {
    const kategoriMap: Record<string, string> = { konut: 'konut', arsa: 'arsa', arazi: 'arazi', ticari: 'ticari' };
    const displayMap: Record<string, string> = { konut: 'Konut', arsa: 'Arsa', arazi: 'Arazi', ticari: 'Ticari' };
    setTrendKategori(kategoriMap[filters.category] || 'konut');
    setPropertyType(displayMap[filters.category] || 'Konut');
  }, []);

  // ─── Chat Panel Resize ─────────────────────
  const handleChatResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    chatResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    const handleMove = (ev: MouseEvent | TouchEvent) => {
      if (!chatResizing.current || !chatContainerRef.current) return;
      const container = chatContainerRef.current.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientY = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const newHeight = ((rect.bottom - clientY) / rect.height) * 100;
      setChatPanelHeight(Math.min(90, Math.max(25, newHeight)));
    };
    const handleEnd = () => {
      chatResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  }, []);

  // ─── Chat Messages ─────────────────────────
  const exaChatMessages = quickAnalysisSessionId
    ? (sessions.find(s => s.id === quickAnalysisSessionId)?.messages || [])
    : [];

  // ─── Chat Send ─────────────────────────────
  const exaAbortRef = useRef<AbortController | null>(null);
  const handleExaChatSend = useCallback(async () => {
    if (!exaChatInput.trim() || exaChatLoading) return;
    const userMsg = exaChatInput.trim();
    let context = selectedIl ? `${selectedIl} bölgesi` : 'Türkiye geneli';
    if (imarBaskisi && selectedParcel) {
      const p = selectedParcel.parsel;
      const ib = selectedParcel.imar_baskisi;
      const ti = selectedParcel.tapu_islem;
      context += ` | İmar Modu Aktif | Seçili Parsel: Ada ${p.ada}/Parsel ${p.parsel}, ${p.mahalle} ${p.ilce}/${p.il}, Cins: ${p.cins}, Alan: ${Math.round(p.alan)} m², İmar Baskısı: ${ib.skor}/100 (${ib.seviye}, base:${ib.base_skor || 0} + tapu_bonus:${ib.tapu_bonus || 0}), Parsel ID: ${p.tapu_kimlik_no}`;
      if (ti) context += ` | TKGM Tapu İşlem: Bu parsel ${ti.parsel_islem} işlem, Çevre ort: ${ti.cevre_ort}, Çevre max: ${ti.cevre_max}, Çevre toplam: ${ti.cevre_toplam || 0} işlem (${ti.cevre_parsel} parsel)`;
    }
    let sessionId = quickAnalysisSessionId;
    if (!sessionId || !sessionExists(sessionId)) {
      sessionId = createSession(context, 'quick-analysis');
      setQuickAnalysisSessionId(sessionId);
    }
    addMessage(sessionId, { role: 'user', content: userMsg });
    setExaChatInput('');
    setExaChatLoading(true);
    if (exaAbortRef.current) exaAbortRef.current.abort();
    const controller = new AbortController();
    exaAbortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    try {
      const currentMessages = getSessionMessages(sessionId);
      const allMessages = [...currentMessages, { role: 'user' as const, content: userMsg }];
      const res = await fetch('/api/exa-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, context }), signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`API hatası: ${res.status}`);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream okunamadı');
      addMessage(sessionId, { role: 'assistant', content: '' });
      setExaChatLoading(false);
      let accumulated = '';
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) { accumulated += parsed.content; updateLastAssistantMessage(sessionId, accumulated); }
          } catch {}
        }
      }
      if (!accumulated) updateLastAssistantMessage(sessionId, 'Yanıt alınamadı. Lütfen tekrar deneyin. 🔄');
    } catch (err: any) {
      clearTimeout(timeoutId);
      const errorMsg = err?.name === 'AbortError' ? 'İstek zaman aşımına uğradı. ⏱️' : 'Bağlantı hatası. Lütfen tekrar deneyin. 🔄';
      addMessage(sessionId, { role: 'assistant', content: errorMsg });
      setExaChatLoading(false);
    }
  }, [exaChatInput, exaChatLoading, quickAnalysisSessionId, selectedIl, imarBaskisi, selectedParcel, createSession, addMessage, updateLastAssistantMessage, getSessionMessages, sessionExists]);

  useEffect(() => { if (!isExaChatOpen) setQuickAnalysisSessionId(null); }, [isExaChatOpen]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [exaChatMessages]);

  // ─── Price Lookups ─────────────────────────
  const ilFiyatMap = useMemo(() => {
    const map: Record<string, { m2_fiyat: number; trend_12ay: number | null }> = {};
    if (ilFiyatlari?.iller) { for (const il of ilFiyatlari.iller) map[il.il] = { m2_fiyat: il.m2_fiyat, trend_12ay: il.trend_12ay }; }
    return map;
  }, [ilFiyatlari]);

  const { priceMin, priceMax } = useMemo(() => {
    if (!ilFiyatlari?.iller?.length) return { priceMin: 0, priceMax: 100000 };
    const prices = ilFiyatlari.iller.map(il => il.m2_fiyat);
    return { priceMin: Math.min(...prices), priceMax: Math.max(...prices) };
  }, [ilFiyatlari]);

  const getIlPrice = (geoName: string) => { const dbName = geoNameToDbName(geoName); return ilFiyatMap[dbName] || null; };
  const getIlColor = (geoName: string): string => { const d = getIlPrice(geoName); return d ? getPriceColor(d.m2_fiyat, priceMin, priceMax) : '#10b981'; };

  const ilceFiyatMap = useMemo(() => {
    const map: Record<string, { ilce: string; m2_fiyat: number }> = {};
    if (ilceFiyatlari?.ilceler) { for (const ilce of ilceFiyatlari.ilceler) map[normalizeForMatch(ilce.ilce)] = { ilce: ilce.ilce, m2_fiyat: ilce.m2_fiyat }; }
    return map;
  }, [ilceFiyatlari]);

  const { ilcePriceMin, ilcePriceMax } = useMemo(() => {
    if (!ilceFiyatlari?.ilceler?.length) return { ilcePriceMin: 0, ilcePriceMax: 100000 };
    const prices = ilceFiyatlari.ilceler.map(i => i.m2_fiyat);
    return { ilcePriceMin: Math.min(...prices), ilcePriceMax: Math.max(...prices) };
  }, [ilceFiyatlari]);

  const getIlcePrice = (geoIlceName: string) => ilceFiyatMap[normalizeForMatch(geoIlceName)] || null;
  const getIlceColor = (geoIlceName: string): string => { const d = getIlcePrice(geoIlceName); return d ? getPriceColor(d.m2_fiyat, ilcePriceMin, ilcePriceMax) : '#06b6d4'; };

  const mahalleFiyatMap = useMemo(() => {
    if (!mahalleFiyatlari?.mahalleler) return {};
    return buildMahalleFiyatMap(mahalleFiyatlari.mahalleler);
  }, [mahalleFiyatlari]);

  const { mahallePriceMin, mahallePriceMax, mahalleAvgPrice } = useMemo(() => {
    if (!mahalleFiyatlari?.mahalleler?.length) return { mahallePriceMin: 0, mahallePriceMax: 100000, mahalleAvgPrice: 0 };
    const prices = mahalleFiyatlari.mahalleler.map(m => m.m2_fiyat);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { mahallePriceMin: Math.min(...prices), mahallePriceMax: Math.max(...prices), mahalleAvgPrice: avg };
  }, [mahalleFiyatlari]);

  const getMahallePrice = (geoMahalleAdi: string) => {
    const exact = mahalleFiyatMap[normalizeMahalle(geoMahalleAdi)];
    if (exact) return exact;
    if (mahalleAvgPrice > 0) return { mahalle: geoMahalleAdi, m2_fiyat: mahalleAvgPrice, tahmini: true };
    return null;
  };
  const getMahalleColor = (geoMahalleAdi: string): string => {
    const d = getMahallePrice(geoMahalleAdi);
    if (!d) return '#06b6d4';
    const c = getPriceColor(d.m2_fiyat, mahallePriceMin, mahallePriceMax);
    return (d as any).tahmini ? c.replace('rgb(', 'rgba(').replace(')', ', 0.6)') : c;
  };

  // ─── Score Cards & Chart ───────────────────
  const marketTabs = [
    { id: 'genel', label: 'Genel' }, { id: 'talep', label: 'Talep' },
    { id: 'nufus', label: 'Nüfus' }, { id: 'risk', label: 'Risk' },
  ];
  const imarTabs = [
    { id: 'genel', label: 'Genel' }, { id: 'talep', label: 'Talep' },
    { id: 'nufus', label: 'Nüfus' }, { id: 'risk', label: 'Risk' }, { id: 'yatirim', label: 'Yatırım' },
  ];
  const scoreCards = [
    { title: `emlaX ${propertyType}`, value: 85, change: 12, changeType: 'increase' },
    { title: 'Satış Skoru', value: 78, change: 5, changeType: 'increase' },
    { title: 'Kira Skoru', value: 92, change: 8, changeType: 'increase' },
    { title: 'Yaşam Skoru', value: 87, change: 10, changeType: 'increase' },
  ];
  const chartData = [
    { ay: 'Oca', m2: 12500, satis: 3.25, kira: 4.2 }, { ay: 'Şub', m2: 13200, satis: 3.42, kira: 4.3 },
    { ay: 'Mar', m2: 13800, satis: 3.58, kira: 4.5 }, { ay: 'Nis', m2: 14100, satis: 3.66, kira: 4.4 },
    { ay: 'May', m2: 14800, satis: 3.84, kira: 4.6 }, { ay: 'Haz', m2: 15500, satis: 4.02, kira: 4.7 },
    { ay: 'Tem', m2: 16200, satis: 4.20, kira: 4.8 }, { ay: 'Ağu', m2: 16800, satis: 4.36, kira: 4.9 },
    { ay: 'Eyl', m2: 17400, satis: 4.52, kira: 5.0 }, { ay: 'Eki', m2: 18200, satis: 4.73, kira: 5.1 },
    { ay: 'Kas', m2: 19100, satis: 4.96, kira: 5.2 }, { ay: 'Ara', m2: 20000, satis: 5.20, kira: 5.3 },
  ];
  const chartOption = getChartOption({ selectedIlce, ilceTrend, selectedIl, ilTrend, turkiyeTrend, selectedMetric, chartData, parselTrend });
  useEffect(() => { setChartKey(k => k + 1); }, [ilTrend, ilceTrend, parselTrend]);

  // ─── Sidebar Width ─────────────────────────
  const sidebarWidth = sidebarOpen ? 320 : 120;

  // ─── Pending Zoom ──────────────────────────
  useEffect(() => {
    const target = pendingZoomRef.current;
    if (target) {
      pendingZoomRef.current = null;
      const timer = setTimeout(() => {
        const m = mapRef.current;
        if (m && Math.abs(m.getZoom() - target.zoom) > 0.5) {
          m.flyTo(target.center, target.zoom, { animate: true, duration: 1 });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedIl, selectedIlce]);

  // ─── GeoJSON Load ──────────────────────────
  useEffect(() => {
    if (ilSinirlari && !illerGeoJSON) {
      fetch('/turkiye-sinir-verileri/turkiye_iller_gadm.geojson')
        .then(res => res.json()).then(data => setIllerGeoJSON(data)).catch(console.error);
    }
    if (!ilcelerGeoJSON) {
      fetch('/turkiye-sinir-verileri/turkiye_ilceler_gadm.geojson')
        .then(res => res.json()).then(data => setIlcelerGeoJSON(data)).catch(console.error);
    }
  }, [ilSinirlari, illerGeoJSON, ilcelerGeoJSON]);

  // ─── Tab Keyboard ──────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const currentTabs = pageMode === 'imar' ? imarTabs : marketTabs;
        const idx = currentTabs.findIndex(t => t.id === activeTab);
        setActiveTab(currentTabs[(idx + 1) % currentTabs.length].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const searchSelectRef = useRef<((result: any) => void) | null>(null);
  const parcelClickRef = useRef<((id: string) => void) | null>(null);

  // ─── Ada/Parsel Search (Parselens Pro) ────
  const [adaParselError, setAdaParselError] = useState('');

  const searchAdaParsel = useCallback(async () => {
    if (!adaNo || !parselNo) { setAdaParselError(''); setParselFlyTo(null); return; }
    const il = citySelectedIl || selectedIl || '';
    const ilce = citySelectedIlce || selectedIlce || '';
    if (!il) { setAdaParselError('Önce il seçimi yapın'); return; }
    if (!ilce) { setAdaParselError('Önce ilçe seçimi yapın'); return; }
    setAdaParselError('');
    setParselFlyTo(null);
    setParcelLoading(true);
    try {
      const mahalle = citySelectedMahalle || '';
      const params = new URLSearchParams({ il, ilce, ada: adaNo, parsel: parselNo, ...(mahalle ? { mahalle } : {}) });
      const res = await fetch(`/api/parcel-by-location?${params.toString()}`).then(r => r.json()).catch(() => null);

      if (!res?.found || !res?.results?.length) {
        setAdaParselError('Parsel bulunamadı. Bilgileri kontrol edin.');
        setParselFlyTo(null);
        setSelectedParcel(null);
        return;
      }

      const p = res.results[0];
      if (p.lat && p.lon) {
        setTimeout(() => {
          setParselFlyTo({ lat: p.lat, lon: p.lon, polygon: p.polygon || undefined });
        }, 50);
      }
      if (p.tapu_kimlik_no && parcelClickRef.current) {
        parcelClickRef.current(p.tapu_kimlik_no);
      }
      setAdaParselError('');
    } catch {
      setAdaParselError('Bağlantı hatası. Tekrar deneyin.');
      setParselFlyTo(null);
    } finally {
      setParcelLoading(false);
    }
  }, [adaNo, parselNo, selectedIl, citySelectedIl, selectedIlce, citySelectedIlce, citySelectedMahalle]);

  // ─── Search Address ────────────────────────
  const searchAddress = useCallback(async (query: string, autoSelect = false) => {
    if (!query || query.length < 2) { setSearchResults([]); setShowSearchResults(false); return; }
    setSearchLoading(true);
    try {
      const words = query.trim().split(/[\s,]+/).filter(Boolean);
      const fetches: Promise<any>[] = [
        fetch(`/api/smart-search?q=${encodeURIComponent(query)}&limit=10`).then(r => r.json()).catch(() => null),
        fetch(`/api/location-search?q=${encodeURIComponent(query)}&limit=10`).then(r => r.json()).catch(() => null),
      ];
      for (const w of words) {
        if (w.length >= 2 && w.toLowerCase() !== query.trim().toLowerCase()) {
          fetches.push(fetch(`/api/location-search?q=${encodeURIComponent(w)}&limit=5`).then(r => r.json()).catch(() => null));
        }
      }
      const allRes = await Promise.all(fetches);
      const [smartRes, ...locResults] = allRes;

      const results: any[] = [];
      const seen = new Set<string>();

      for (const locRes of locResults) {
        if (locRes?.results?.length > 0) {
          for (const r of locRes.results) {
            const key = `${r.type}:${r.display}`;
            if (!seen.has(key)) { seen.add(key); results.push({ ...r, source: 'backend' }); }
          }
        }
      }
      if (smartRes?.results?.length > 0) {
        for (const r of smartRes.results) {
          const key = `${r.type}:${r.display}`;
          if (!seen.has(key)) { seen.add(key); results.push({ ...r, source: 'backend' }); }
        }
      }

      if (words.length >= 2) {
        const normQ = (s: string) => s.toLowerCase().replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u');
        const qNorm = normQ(query);
        results.sort((a, b) => {
          const aN = normQ(a.display || '');
          const bN = normQ(b.display || '');
          const aMatch = qNorm.split(/\s+/).every((w: string) => aN.includes(w));
          const bMatch = qNorm.split(/\s+/).every((w: string) => bN.includes(w));
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }

      if (results.length < 3) {
        try {
          const nomRes = await fetch(`/api/geocode?q=${encodeURIComponent(query + ' Türkiye')}&limit=3`).then(r => r.json());
          const nomData = nomRes?.results || nomRes;
          if (Array.isArray(nomData)) for (const r of nomData) results.push({ ...r, source: 'nominatim' });
        } catch {}
      }

      if (autoSelect && results.length > 0 && searchSelectRef.current) {
        searchSelectRef.current(results[0]);
        return;
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch { setSearchResults([]); } finally { setSearchLoading(false); }
  }, []);

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length >= 2) searchTimeoutRef.current = setTimeout(() => searchAddress(value), 400);
    else { setSearchResults([]); setShowSearchResults(false); }
  }, [searchAddress]);

  // ─── Search Utils ──────────────────────────
  const normTR = useCallback((s: string) => s.toLowerCase().replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/Ç/g,'c').replace(/Ğ/g,'g').replace(/İ/g,'i').replace(/Ö/g,'o').replace(/Ş/g,'s').replace(/Ü/g,'u'), []);

  const matchIlFeature = useCallback((ilName: string) => {
    if (!illerGeoJSON?.features) return null;
    const n = normTR(ilName);
    return illerGeoJSON.features.find((f: any) => {
      const geoName = f.properties?.NAME_1 || '';
      const dbName = geoNameToDbName(geoName);
      return normTR(dbName) === n || normTR(geoName) === n || geoName.toLowerCase() === ilName.toLowerCase();
    });
  }, [illerGeoJSON, normTR]);

  const openIlAnalysis = useCallback((ilGeoName: string, centerLat?: number, centerLon?: number) => {
    setSelectedIl(ilGeoName);
    if (!imarBaskisi) setIlceSinirlari(true);
    setAnalysisTitle(`${ilGeoName} Analizi`);
    setIlceFiyatlari(null); setIlTrend(null); setMahalleFiyatlari(null);
    const dbIlAdi = geoNameToDbName(ilGeoName);
    getIlceFiyatlari(dbIlAdi, trendKategori).then(data => setIlceFiyatlari(data)).catch(console.error);
    setIlTrendLoading(true);
    getIlTrend(dbIlAdi, 120, trendKategori).then(data => setIlTrend(data)).catch(console.error).finally(() => setIlTrendLoading(false));
    if (centerLat && centerLon) setSelectedIlCenter([centerLat, centerLon]);
  }, [imarBaskisi, trendKategori]);

  // ─── Geocode helper (proxy üzerinden) ─────
  const geocode = useCallback((query: string, limit = 3): Promise<any[]> => {
    return fetch(`/api/geocode?q=${encodeURIComponent(query)}&limit=${limit}`)
      .then(r => r.json())
      .then(d => d.results || [])
      .catch(() => []);
  }, []);

  const zoomToBounds = useCallback((result: any, padding: [number, number], maxZoom: number, flyZoom: number) => {
    if (mapMode === '3d') return;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const m = mapRef.current;
    if (!m || !m._leaflet_pos) return;
    try {
      if (result.boundingbox) {
        const [s, n, w, e] = result.boundingbox.map(Number);
        m.flyToBounds([[s, w], [n, e]], { padding, maxZoom, animate: true, duration: 1.2 });
      } else {
        m.flyTo([lat, lon], flyZoom, { animate: true, duration: 1.2 });
      }
    } catch {}
  }, [mapMode]);

  // ─── Search Select ─────────────────────────
  const handleSearchSelect = useCallback((result: any) => {
    if (result.source === 'backend') {
      if (result.type === 'parsel' && result.lat && result.lon) {
        setSearchPin([result.lat, result.lon]);
        setIlSinirlari(false); setIlceSinirlari(false); setMahalleSinirlari(false);
        setSelectedMahalle(null); setSelectedIlce(null);
        setTimeout(() => { const m = mapRef.current; if (m) m.flyTo([result.lat, result.lon], 18, { animate: true, duration: 1.5 }); }, 100);
        const feature = matchIlFeature(result.il); if (feature) openIlAnalysis(feature.properties.NAME_1, result.lat, result.lon);
        if (result.id) handleParcelClick(result.id);
        setSearchQuery(result.display); setShowSearchResults(false); setSearchResults([]); return;
      }

      if (result.type === 'il') {
        setSearchPin(null);
        const ilName = result.il || result.display;
        const feature = matchIlFeature(ilName);
        const geoName = feature?.properties?.NAME_1 || ilName;

        setSelectedIl(geoName);
        setIlSinirlari(false);
        if (!imarBaskisi) setIlceSinirlari(true);
        setMahalleSinirlari(false);
        setSelectedMahalle(null); setSelectedIlce(null);
        setMahallelerGeoJSON(null); setIlceTrend(null); setParselTrend(null);
        setAnalysisTitle(`${geoName} Analizi`);

        setCitySelectedIl(ilName); setCitySelectedIlce(''); setCitySelectedMahalle('');

        const dbIlAdi = geoNameToDbName(geoName);
        setIlceFiyatlari(null); setIlTrend(null); setMahalleFiyatlari(null);
        getIlceFiyatlari(dbIlAdi, trendKategori).then(d => setIlceFiyatlari(d)).catch(console.error);
        setIlTrendLoading(true);
        getIlTrend(dbIlAdi, 120, trendKategori).then(d => setIlTrend(d)).catch(console.error).finally(() => setIlTrendLoading(false));

        geocode(ilName, 3).then(data => {
          const best = data.find((d: any) => d.type === 'administrative' && d.addresstype === 'state') || data.find((d: any) => d.type === 'administrative') || data[0];
          if (!best) return;
          setSelectedIlCenter([parseFloat(best.lat), parseFloat(best.lon)]);
          zoomToBounds(best, [50, 50], 10, 8);
        });

        setSearchQuery(result.display); setShowSearchResults(false); setSearchResults([]); return;
      }

      if (result.type === 'ilce') {
        const ilName = result.il || '';
        const ilceName = result.ilce || result.display?.split(',')[0]?.trim() || '';
        const feature = matchIlFeature(ilName);
        const geoName = feature?.properties?.NAME_1 || ilName;

        setSelectedIl(geoName);
        setSelectedIlce(ilceName);
        setSelectedMahalle(null);
        setIlSinirlari(false); setIlceSinirlari(false);
        setMahalleSinirlari(true);
        setMahallelerGeoJSON(null); setMahalleFiyatlari(null); setMahalleLoading(true);
        setAnalysisTitle(`${ilceName}, ${geoName} Analizi`);

        setCitySelectedIl(ilName); setCitySelectedIlce(ilceName); setCitySelectedMahalle('');

        const ilForApi = geoName;
        fetch(`/api/mahalle-sinirlari?il=${encodeURIComponent(ilForApi)}&ilce=${encodeURIComponent(ilceName)}`)
          .then(res => res.json()).then(data => { if (data?.features?.length > 0) setMahallelerGeoJSON(data); })
          .catch(console.error).finally(() => setMahalleLoading(false));

        const dbIl = geoNameToDbName(geoName);
        setIlceFiyatlari(null); setIlTrend(null); setMahalleFiyatlari(null);
        getIlceFiyatlari(dbIl, trendKategori).then(d => setIlceFiyatlari(d)).catch(console.error);
        setIlTrendLoading(true);
        getIlTrend(dbIl, 120, trendKategori).then(d => setIlTrend(d)).catch(console.error).finally(() => setIlTrendLoading(false));
        getMahalleFiyatlari(dbIl, ilceName, trendKategori).then(d => setMahalleFiyatlari(d)).catch(console.error);
        getIlceTrend(dbIl, ilceName, 120, trendKategori).then(d => setIlceTrend(d)).catch(console.error);

        const ilceQuery = ilceName === 'Merkez' ? `${ilName} Merkez` : `${ilceName}, ${ilName}`;
        geocode(ilceQuery, 3).then(data => {
          const best = data.find((d: any) => d.type === 'administrative') || data.find((d: any) => d.type === 'city' || d.type === 'town') || data[0];
          if (best) zoomToBounds(best, [10, 10], 17, 15);
        });

        setSearchQuery(result.display); setShowSearchResults(false); setSearchResults([]); return;
      }

      if (result.type === 'mahalle') {
        const ilName = result.il || '';
        const ilceName = result.ilce || '';
        const mahalleName = result.mahalle || result.display?.split(',')[0]?.trim() || '';
        const feature = matchIlFeature(ilName);
        const geoName = feature?.properties?.NAME_1 || ilName;

        setSelectedIl(geoName);
        setSelectedIlce(ilceName);
        setSelectedMahalle(mahalleName);
        setIlSinirlari(false); setIlceSinirlari(false);
        setMahalleSinirlari(true);
        setMahallelerGeoJSON(null); setMahalleLoading(true);
        setAnalysisTitle(`${mahalleName}, ${ilceName} Analizi`);

        setCitySelectedIl(ilName); setCitySelectedIlce(ilceName); setCitySelectedMahalle(mahalleName);

        const ilForApi = geoName;
        fetch(`/api/mahalle-sinirlari?il=${encodeURIComponent(ilForApi)}&ilce=${encodeURIComponent(ilceName)}`)
          .then(res => res.json()).then(data => { if (data?.features?.length > 0) setMahallelerGeoJSON(data); })
          .catch(console.error).finally(() => setMahalleLoading(false));

        const dbIl = geoNameToDbName(geoName);
        setIlceFiyatlari(null); setIlTrend(null); setMahalleFiyatlari(null);
        getIlceFiyatlari(dbIl, trendKategori).then(d => setIlceFiyatlari(d)).catch(console.error);
        setIlTrendLoading(true);
        getIlTrend(dbIl, 120, trendKategori).then(d => setIlTrend(d)).catch(console.error).finally(() => setIlTrendLoading(false));
        getMahalleFiyatlari(dbIl, ilceName, trendKategori).then(d => setMahalleFiyatlari(d)).catch(console.error);
        getIlceTrend(dbIl, ilceName, 120, trendKategori).then(d => setIlceTrend(d)).catch(console.error);

        const cleanName = mahalleName
          .replace(/\s*\(.*?\)\s*/g, ' ')
          .replace(/\s*(Mahallesi|Mah\.|Köyü|Koy\.|Mh\.)\s*/gi, ' ')
          .trim();
        const query = `${cleanName}, ${ilceName}, ${ilName}`;
        geocode(query, 3).then(data => {
          const best = data.find((d: any) =>
            d.type === 'suburb' || d.type === 'neighbourhood' || d.type === 'village' || d.type === 'hamlet' || d.type === 'administrative'
          ) || data[0];
          if (best) zoomToBounds(best, [10, 10], 18, 16);
        });

        setSearchQuery(result.display); setShowSearchResults(false); setSearchResults([]); return;
      }
    }

    // Nominatim fallback
    const lat = parseFloat(result.lat); const lon = parseFloat(result.lon);
    setSearchPin([lat, lon]);
    const address = result.address || {};
    const ilAdi = address.province || address.state || '';
    if (ilAdi) {
      const feature = matchIlFeature(ilAdi);
      if (feature) {
        const geoName = feature.properties.NAME_1;
        setSelectedIl(geoName);
        setIlSinirlari(false);
        if (!imarBaskisi) setIlceSinirlari(true);
        setMahalleSinirlari(false);
        setSelectedMahalle(null); setSelectedIlce(null);
        setCitySelectedIl(ilAdi); setCitySelectedIlce(''); setCitySelectedMahalle('');
        openIlAnalysis(geoName, lat, lon);
      }
    }
    const bb = result.boundingbox;
    setTimeout(() => {
      const m = mapRef.current; if (!m) return;
      if (bb) { const [s, n, w, e] = bb.map(Number); m.fitBounds([[s, w], [n, e]], { padding: [50, 50], maxZoom: 16, animate: true, duration: 1 }); }
      else m.flyTo([lat, lon], 14, { animate: true, duration: 1.5 });
    }, 200);
    setSearchQuery(result.display_name || ''); setShowSearchResults(false); setSearchResults([]);
  }, [matchIlFeature, openIlAnalysis, trendKategori, imarBaskisi, geocode, zoomToBounds]);

  useEffect(() => { searchSelectRef.current = handleSearchSelect; }, [handleSearchSelect]);

  // ─── Map Click Handlers ────────────────────
  const handleIlClick = (ilAdi: string, layer: any) => {
    setSearchPin(null); setSelectedIl(ilAdi);
    if (!imarBaskisi) setIlceSinirlari(true);
    setAnalysisTitle(`${ilAdi} Analizi`);
    setIlceFiyatlari(null); setIlTrend(null); setSelectedIlce(null);
    setSelectedMahalle(null);
    setIlceTrend(null); setMahallelerGeoJSON(null); setMahalleSinirlari(false);
    setMahalleFiyatlari(null); setParselTrend(null); setIlSinirlari(false);
    const dbIlAdi = geoNameToDbName(ilAdi);
    getIlceFiyatlari(dbIlAdi, trendKategori).then(data => setIlceFiyatlari(data)).catch(console.error);
    setIlTrendLoading(true);
    getIlTrend(dbIlAdi, 120, trendKategori).then(data => setIlTrend(data)).catch(console.error).finally(() => setIlTrendLoading(false));
    const map = layer._map;
    if (map) {
      const bounds = layer.getBounds(); const center = bounds.getCenter();
      setSelectedIlCenter([center.lat, center.lng]);
      const targetZoom = Math.min(map.getBoundsZoom(bounds, false, [50, 50]), 10);
      setSelectedIlZoom(targetZoom);
      map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
    }
  };

  const handleIlceClick = (ilceAdi: string, layer: any) => {
    setSelectedIlce(ilceAdi); setSelectedMahalle(null); setMahalleSinirlari(true);
    setMahallelerGeoJSON(null); setMahalleFiyatlari(null); setMahalleLoading(true);
    setIlSinirlari(false); setIlceSinirlari(false);
    const ilForApi = selectedIl || '';
    fetch(`/api/mahalle-sinirlari?il=${encodeURIComponent(ilForApi)}&ilce=${encodeURIComponent(ilceAdi)}`)
      .then(res => res.json()).then(data => { if (data?.features?.length > 0) setMahallelerGeoJSON(data); })
      .catch(console.error).finally(() => setMahalleLoading(false));
    const dbIl = geoNameToDbName(ilForApi);
    getMahalleFiyatlari(dbIl, ilceAdi, trendKategori).then(data => setMahalleFiyatlari(data)).catch(console.error);
    getIlceTrend(dbIl, ilceAdi, 120, trendKategori).then(data => setIlceTrend(data)).catch(console.error);
    const map = layer._map;
    if (map) {
      const bounds = layer.getBounds(); const center = bounds.getCenter();
      const targetZoom = Math.min(map.getBoundsZoom(bounds, false, [40, 40]), 14);
      setTimeout(() => { map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 }); }, 100);
    }
  };

  // ─── Parcel Click ──────────────────────────
  const handleParcelClick = useCallback(async (parcelId: string) => {
    setParcelLoading(true); setSelectedParcel(null); setParselTrend(null);
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 55000);
        const res = await fetch(`/api/parcel-detail?id=${encodeURIComponent(parcelId)}`, { signal: controller.signal });
        clearTimeout(tid);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.error) {
          setSelectedParcel(data);
          if (data.parsel?.ilce && data.parsel?.il) setAnalysisTitle(`${data.parsel.ada}/${data.parsel.parsel} - ${data.parsel.mahalle}`);
          const parselKat = data.parsel?.kategori || '';
          const cins = (data.parsel?.cins || '').toLowerCase();
          let apiKategori = trendKategori;
          if (parselKat === 'arazi' || cins.includes('tarla') || cins.includes('bağ') || cins.includes('bahçe')) apiKategori = 'arazi';
          else if (parselKat === 'arsa' || cins.includes('arsa')) apiKategori = 'arsa';
          else if (parselKat === 'ticari' || cins.includes('dükkan') || cins.includes('fabrika')) apiKategori = 'ticari';
          else if (parselKat === 'konut' || cins.includes('ev') || cins.includes('apartman')) apiKategori = 'konut';
          fetch(`/api/parcel-price-trend?id=${encodeURIComponent(parcelId)}&kategori=${apiKategori}&tip=satilik&ay=120`)
            .then(r => r.ok ? r.json() : null).then(trendData => { if (trendData?.trend?.length) setParselTrend(trendData); }).catch(() => {});
        }
        break;
      } catch (err) {
        if (attempt === 2) console.error('Parsel detay hatası:', err);
        else await new Promise(r => setTimeout(r, 1000));
      }
    }
    setParcelLoading(false);
  }, [trendKategori]);

  useEffect(() => { parcelClickRef.current = handleParcelClick; }, [handleParcelClick]);

  // ─── Page Mode Change ──────────────────────
  const handlePageModeChange = useCallback((mode: 'market' | 'imar') => {
    if (mode === pageMode) return;
    if (mode === 'imar') {
      setPreviousMapMode(mapMode);
      setMapMode('3d');
      setImarBaskisi(true);
      setTrendKategori('arsa');
      setPropertyType('Arsa');
      if (!imarBaskisi) {
        preImarRef.current = { il: ilSinirlari, ilce: ilceSinirlari };
        setIlSinirlari(false);
        setIlceSinirlari(false);
      }
      setImarActiveTab('genel');
    } else {
      setMapMode(previousMapMode);
      setImarBaskisi(false);
      setSelectedParcel(null);
      setParselTrend(null);
      setParselFlyTo(null);
      setAdaNo('');
      setParselNo('');
      setAdaParselError('');
      setTrendKategori('konut');
      setPropertyType('Konut');
      if (preImarRef.current) {
        setIlSinirlari(preImarRef.current.il);
        setIlceSinirlari(preImarRef.current.ilce);
        preImarRef.current = null;
      } else {
        setIlSinirlari(true);
      }
      setActiveTab('genel');
    }
    setPageMode(mode);
  }, [pageMode, mapMode, previousMapMode, imarBaskisi, ilSinirlari, ilceSinirlari]);

  // ─── İmar Detail Tabs ────────────────────────────
  const imarDetailTabs = [
    { id: 'durum', label: 'İmar Durumu' },
    { id: 'potansiyel', label: 'Potansiyel' },
    { id: 'cevresel', label: 'Çevresel Analiz' },
  ];

  // ─── İmar Toggle ───────────────────────────
  const handleImarBaskisiToggle = useCallback((checked: boolean) => {
    if (checked) {
      preImarRef.current = { il: ilSinirlari, ilce: ilceSinirlari };
      setIlSinirlari(false); setIlceSinirlari(false); setImarBaskisi(true);
    } else {
      setImarBaskisi(false); setSelectedParcel(null); setParselTrend(null);
      if (preImarRef.current) { setIlSinirlari(preImarRef.current.il); setIlceSinirlari(preImarRef.current.ilce); preImarRef.current = null; }
      else setIlSinirlari(true);
    }
  }, [ilSinirlari, ilceSinirlari]);

  // ─── Mahalle Click ─────────────────────────
  const handleMahalleClick = useCallback((geoMahalleAdi: string, layer?: any) => {
    if (!selectedIl || !selectedIlce || !geoMahalleAdi) return;
    setSelectedMahalle(geoMahalleAdi);
    const dbIl = geoNameToDbName(selectedIl); setParselTrend(null);
    const key = normalizeMahalle(geoMahalleAdi);
    const fiyatEntry = mahalleFiyatlari?.mahalleler?.find((m: any) => normalizeMahalle(m.mahalle) === key);
    const dbMahalleAdi = fiyatEntry?.mahalle || geoMahalleAdi;
    setAnalysisTitle(`${displayMahalleName(dbMahalleAdi)} - ${selectedIlce}`);
    setIlTrendLoading(true);
    getMahalleTrend(dbIl, selectedIlce, dbMahalleAdi, 120, trendKategori)
      .then(data => { if (data?.trend?.length) setIlceTrend(data as any); }).catch(console.error).finally(() => setIlTrendLoading(false));
    if (layer?._map) {
      const bounds = layer.getBounds(); const center = bounds.getCenter();
      const targetZoom = Math.min(layer._map.getBoundsZoom(bounds, false, [30, 30]), 16);
      layer._map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
    }
  }, [selectedIl, selectedIlce, mahalleFiyatlari, trendKategori]);

  // ─── Map Back Click ────────────────────────
  const handleMapBackClick = useCallback(() => {
    const map = mapRef.current;
    setSelectedMahalle(null);
    if (selectedIlce) {
      setMahalleSinirlari(true); setIlceSinirlari(false); setIlSinirlari(false);
      setIlceTrend(null); setParselTrend(null);
      if (selectedIl) {
        setAnalysisTitle(`${selectedIl} / ${selectedIlce} Analizi`);
        const dbIl = geoNameToDbName(selectedIl);
        getIlceTrend(dbIl, selectedIlce, 120, trendKategori).then(data => setIlceTrend(data)).catch(console.error);
      }
      if (map && selectedIlCenter) map.flyTo(selectedIlCenter, (selectedIlZoom || 10) + 2, { animate: true, duration: 1 });
    } else if (selectedIl) {
      setSelectedIlce(null); setIlceTrend(null); setMahallelerGeoJSON(null);
      setMahalleSinirlari(false); setMahalleFiyatlari(null); setParselTrend(null);
      setIlSinirlari(false); setIlceSinirlari(true);
      setAnalysisTitle(`${selectedIl} Analizi`);
      if (map && selectedIlCenter && selectedIlZoom) map.flyTo(selectedIlCenter, selectedIlZoom, { animate: true, duration: 1 });
    } else {
      setSelectedIl(null); setIlSinirlari(true); setIlceSinirlari(false);
      setAnalysisTitle('Türkiye Genel Bakış');
      if (map) map.flyTo([39.0, 35.5], 6, { animate: true, duration: 1.5 });
    }
  }, [selectedIl, selectedIlce, selectedIlCenter, selectedIlZoom, trendKategori]);

  // ─── Split Resize ──────────────────────────
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      let pos: number;
      if (raw < 5) pos = 0; else if (raw > 95) pos = 100; else pos = Math.max(20, Math.min(80, raw));
      setSplitPosition(pos);
    };
    const handleMouseUp = () => { setIsResizing(false); document.body.style.userSelect = ''; document.body.style.cursor = ''; };
    document.body.style.userSelect = 'none'; document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); document.body.style.userSelect = ''; document.body.style.cursor = ''; };
  }, [isResizing]);

  // ─── Data Fetching ─────────────────────────
  useEffect(() => {
    const fetchEconomicData = async () => {
      try { setEconomicDataLoading(true); const data = await getEconomicData(); setEconomicData(data); setEconomicDataError(null); }
      catch { setEconomicDataError('Veriler yüklenemedi'); } finally { setEconomicDataLoading(false); }
    };
    fetchEconomicData();
    const interval = setInterval(fetchEconomicData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchIlFiyatlari = async () => {
      try { setIlFiyatlariLoading(true); const data = await getIlFiyatlari(trendKategori); setIlFiyatlari(data); setIlFiyatlariError(null); }
      catch { setIlFiyatlariError('İl fiyatları yüklenemedi'); } finally { setIlFiyatlariLoading(false); }
    };
    fetchIlFiyatlari();
    const interval = setInterval(fetchIlFiyatlari, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trendKategori]);

  useEffect(() => {
    const fetchTurkiyeTrend = async () => {
      try { setTurkiyeTrendLoading(true); const data = await getTurkiyeTrend(120, trendKategori); setTurkiyeTrend(data); }
      catch { console.error('Türkiye trend çekilemedi'); } finally { setTurkiyeTrendLoading(false); }
    };
    fetchTurkiyeTrend();
  }, [trendKategori]);

  useEffect(() => {
    const fetchTapuIslem = async () => {
      try { setTapuIslemLoading(true); const data = await getTapuIslemToplam(); setTapuIslemToplam(data); }
      catch { console.error('Tapu işlem çekilemedi'); } finally { setTapuIslemLoading(false); }
    };
    fetchTapuIslem();
  }, []);

  // ─── Nüfus Data Fetch ────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchNufus = async () => {
      try {
        setNufusLoading(true);
        const data = await getNufusData(selectedIl || undefined, selectedIlce || undefined);
        if (mounted) setNufusData(data);
      } catch {
        console.error('Nüfus verisi çekilemedi');
      } finally {
        if (mounted) setNufusLoading(false);
      }
    };
    fetchNufus();
    return () => { mounted = false; };
  }, [selectedIl, selectedIlce]);

  // ─── Demografi + Göç Fetch ────────────────────────
  useEffect(() => {
    if (!selectedIl) { setDemografiData(null); return; }
    let mounted = true;
    const fetch_ = async () => {
      try {
        setDemografiLoading(true);
        const data = await getDemografi(selectedIl, selectedIlce || undefined, selectedMahalle || undefined);
        if (mounted) setDemografiData(data);
      } catch { console.error('Demografi verisi çekilemedi'); }
      finally { if (mounted) setDemografiLoading(false); }
    };
    fetch_();
    return () => { mounted = false; };
  }, [selectedIl, selectedIlce, selectedMahalle]);

  // ─── Yaşanılabilirlik Fetch ────────────────────────
  useEffect(() => {
    if (!selectedIl) { setYasanilabilirlik(null); return; }
    let mounted = true;
    const fetch_ = async () => {
      try {
        setYasanilabilirlikLoading(true);
        const data = await getYasanilabilirlik(selectedIl);
        if (mounted) setYasanilabilirlik(data);
      } catch { console.error('Yaşanılabilirlik verisi çekilemedi'); }
      finally { if (mounted) setYasanilabilirlikLoading(false); }
    };
    fetch_();
    return () => { mounted = false; };
  }, [selectedIl]);

  // ─── Talep İlgi Fetch ────────────────────────
  useEffect(() => {
    if (!selectedIl) { setTalepIlgi(null); return; }
    let mounted = true;
    const fetch_ = async () => {
      try {
        setTalepIlgiLoading(true);
        const data = await getTalepIlgi(selectedIl, selectedIlce || undefined);
        if (mounted) setTalepIlgi(data);
      } catch { console.error('Talep ilgi verisi çekilemedi'); }
      finally { if (mounted) setTalepIlgiLoading(false); }
    };
    fetch_();
    return () => { mounted = false; };
  }, [selectedIl, selectedIlce]);

  // ─── Yapı Belgesi Fetch ─────────────────────────
  useEffect(() => {
    if (!selectedIl) { setYapiBelgesi(null); return; }
    let mounted = true;
    const fetch_ = async () => {
      try {
        setYapiBelgesiLoading(true);
        const data = await getYapiBelgesi(selectedIl);
        if (mounted) setYapiBelgesi(data);
      } catch { console.error('Yapı belgesi verisi çekilemedi'); }
      finally { if (mounted) setYapiBelgesiLoading(false); }
    };
    fetch_();
    return () => { mounted = false; };
  }, [selectedIl]);

  // ─── Arsa Pazar Fetch ──────────────────────────
  useEffect(() => {
    if (!selectedIl) { setArsaPazar(null); return; }
    let mounted = true;
    const fetch_ = async () => {
      try {
        setArsaPazarLoading(true);
        const data = await getArsaPazar(selectedIl, selectedIlce || undefined);
        if (mounted) setArsaPazar(data);
      } catch { console.error('Arsa pazar verisi çekilemedi'); }
      finally { if (mounted) setArsaPazarLoading(false); }
    };
    fetch_();
    return () => { mounted = false; };
  }, [selectedIl, selectedIlce]);

  // ─── City Search: İl listesini yükle (sayfa açılışında) ───────
  useEffect(() => {
    if (cityIlOptions.length > 0) return;
    const cached = locationCacheRef.current['iller'];
    if (cached) { setCityIlOptions(cached); return; }
    setCityIlLoading(true);
    fetch('/api/locations?type=iller')
      .then(r => r.json())
      .then(d => {
        if (d.iller) {
          locationCacheRef.current['iller'] = d.iller;
          setCityIlOptions(d.iller);
        }
      })
      .catch(() => {})
      .finally(() => setCityIlLoading(false));
  }, []);

  // ─── Mahalle dedup helper ─────────────────
  const dedupMahalleler = useCallback((list: string[]): string[] => {
    const norm = (s: string) => s.toLowerCase()
      .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/(mahallesi|mah\.|köyü|koy\.|mh\.)/gi, '')
      .replace(/[^a-z0-9]/g, '');
    const seen = new Map<string, string>();
    for (const m of list) {
      const key = norm(m);
      if (!seen.has(key)) {
        seen.set(key, m.includes('Mahallesi') || m.includes('Köyü') ? m : m);
      } else {
        const existing = seen.get(key)!;
        if ((m.includes('Mahallesi') || m.includes('Köyü')) && !existing.includes('Mahallesi') && !existing.includes('Köyü')) {
          seen.set(key, m);
        }
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, 'tr'));
  }, []);

  // ─── City Search: İlçe listesi ───────────
  useEffect(() => {
    if (!citySelectedIl) { setCityIlceOptions([]); setCitySelectedIlce(''); setCityMahalleOptions([]); setCitySelectedMahalle(''); return; }
    const cacheKey = `ilceler_${citySelectedIl}`;
    const cached = locationCacheRef.current[cacheKey];
    if (cached) {
      setCityIlceOptions(cached);
      setCitySelectedIlce(''); setCityMahalleOptions([]); setCitySelectedMahalle('');
      return;
    }
    setCityIlceLoading(true);
    setCityIlceOptions([]); setCitySelectedIlce(''); setCityMahalleOptions([]); setCitySelectedMahalle('');
    fetch(`/api/locations?type=ilceler&il=${encodeURIComponent(citySelectedIl)}`)
      .then(r => r.json())
      .then(d => {
        if (d.ilceler) {
          const filtered = d.ilceler.filter((n: string) => n && n.trim().length >= 3 && !/^\d+$/.test(n.trim()));
          locationCacheRef.current[cacheKey] = filtered;
          setCityIlceOptions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => setCityIlceLoading(false));
  }, [citySelectedIl]);

  // ─── City Search: Mahalle listesi ─────────
  useEffect(() => {
    if (!citySelectedIl || !citySelectedIlce) { setCityMahalleOptions([]); setCitySelectedMahalle(''); return; }
    const cacheKey = `mahalleler_${citySelectedIl}_${citySelectedIlce}`;
    const cached = locationCacheRef.current[cacheKey];
    if (cached) {
      setCityMahalleOptions(cached);
      setCitySelectedMahalle('');
      return;
    }
    setCityMahalleLoading(true);
    setCityMahalleOptions([]); setCitySelectedMahalle('');
    fetch(`/api/locations?type=mahalleler&il=${encodeURIComponent(citySelectedIl)}&ilce=${encodeURIComponent(citySelectedIlce)}`)
      .then(r => r.json())
      .then(d => {
        if (d.mahalleler) {
          const filtered = dedupMahalleler(d.mahalleler.filter((n: string) => n && n.trim().length >= 3 && !/^\d+$/.test(n.trim())));
          locationCacheRef.current[cacheKey] = filtered;
          setCityMahalleOptions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => setCityMahalleLoading(false));
  }, [citySelectedIl, citySelectedIlce, dedupMahalleler]);

  // ─── City Search: Seçim tetikleme ─────────
  const handleCityIlSelect = useCallback((il: string) => {
    setCitySelectedIl(il);
    setCitySelectedIlce('');
    setCitySelectedMahalle('');
    if (!il) return;
    if (pageMode === 'imar') {
      setSelectedIl(il);
      setSelectedIlce(null);
      setSelectedMahalle(null);
      return;
    }
    const feature = matchIlFeature(il);
    const geoName = feature?.properties?.NAME_1 || il;
    setSelectedIl(geoName);
    setIlSinirlari(false);
    if (!imarBaskisi) setIlceSinirlari(true);
    setMahalleSinirlari(false);
    setSelectedMahalle(null);
    setSelectedIlce(null);
    setAnalysisTitle(`${geoName} Analizi`);
    setIlceFiyatlari(null); setIlTrend(null); setMahalleFiyatlari(null);
    setMahallelerGeoJSON(null); setIlceTrend(null); setParselTrend(null);
    const dbIlAdi = geoNameToDbName(geoName);
    getIlceFiyatlari(dbIlAdi, trendKategori).then(data => setIlceFiyatlari(data)).catch(console.error);
    setIlTrendLoading(true);
    getIlTrend(dbIlAdi, 120, trendKategori).then(data => setIlTrend(data)).catch(console.error).finally(() => setIlTrendLoading(false));
    geocode(il, 3).then(data => {
      const best = data.find((d: any) => d.type === 'administrative' && d.addresstype === 'state') || data.find((d: any) => d.type === 'administrative') || data[0];
      if (!best) return;
      setSelectedIlCenter([parseFloat(best.lat), parseFloat(best.lon)]);
      zoomToBounds(best, [50, 50], 10, 8);
    });
  }, [matchIlFeature, imarBaskisi, trendKategori, geocode, zoomToBounds, pageMode]);

  const handleCityIlceSelect = useCallback((ilce: string) => {
    setCitySelectedIlce(ilce);
    setCitySelectedMahalle('');
    if (!ilce || !citySelectedIl) return;
    setSelectedIlce(ilce);
    setSelectedMahalle(null);

    if (pageMode === 'imar') return;

    setMahalleSinirlari(true);
    setMahallelerGeoJSON(null);
    setMahalleFiyatlari(null);
    setMahalleLoading(true);
    setIlSinirlari(false);
    setIlceSinirlari(false);
    const ilForApi = selectedIl || citySelectedIl;
    fetch(`/api/mahalle-sinirlari?il=${encodeURIComponent(ilForApi)}&ilce=${encodeURIComponent(ilce)}`)
      .then(res => res.json()).then(data => { if (data?.features?.length > 0) setMahallelerGeoJSON(data); })
      .catch(console.error).finally(() => setMahalleLoading(false));
    const dbIl = geoNameToDbName(ilForApi);
    getMahalleFiyatlari(dbIl, ilce, trendKategori).then(data => setMahalleFiyatlari(data)).catch(console.error);
    getIlceTrend(dbIl, ilce, 120, trendKategori).then(data => setIlceTrend(data)).catch(console.error);
    const ilceQuery = ilce === 'Merkez' ? `${citySelectedIl} Merkez` : `${ilce}, ${citySelectedIl}`;
    geocode(ilceQuery, 3).then(data => {
      const best = data.find((d: any) => d.type === 'administrative') || data.find((d: any) => d.type === 'city' || d.type === 'town') || data[0];
      if (best) zoomToBounds(best, [10, 10], 17, 15);
    });
  }, [citySelectedIl, selectedIl, trendKategori, geocode, zoomToBounds, pageMode]);

  const handleCityMahalleSelect = useCallback((mahalle: string) => {
    setCitySelectedMahalle(mahalle);
    setSelectedMahalle(mahalle || null);
    if (!mahalle || !citySelectedIl || !citySelectedIlce) return;
    const cleanName = mahalle
      .replace(/\s*\(.*?\)\s*/g, ' ')
      .replace(/\s*(Mahallesi|Mah\.|Köyü|Koy\.|Mh\.)\s*/gi, ' ')
      .trim();
    const query = `${cleanName}, ${citySelectedIlce}, ${citySelectedIl}`;
    geocode(query, 3).then(data => {
      const best = data.find((d: any) =>
        d.type === 'suburb' || d.type === 'neighbourhood' || d.type === 'village' || d.type === 'hamlet' || d.type === 'administrative'
      ) || data[0];
      if (best) zoomToBounds(best, [10, 10], 18, 16);
    });
  }, [citySelectedIl, citySelectedIlce, geocode, zoomToBounds]);

  // ─── Click Outside ─────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layersDropdownRef.current && !layersDropdownRef.current.contains(event.target as Node)) setIsLayersDropdownOpen(false);
    };
    if (isLayersDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLayersDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) setShowSearchResults(false);
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node)) setShowSearchResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseDown = () => setIsResizing(true);

  return {
    // Page Mode
    pageMode, handlePageModeChange,
    imarActiveTab, setImarActiveTab, imarDetailTabs,
    // UI
    sidebarWidth, splitPosition, setSplitPosition, isResizing, handleMouseDown,
    activeTab, setActiveTab, isDrawerOpen, setIsDrawerOpen,
    isMobileSidebarOpen, setIsMobileSidebarOpen, isFilterOpen, setIsFilterOpen,
    containerRef, marketTabs, imarTabs,
    // Map
    mapMode, setMapMode, mapRef, tileConfig, pendingZoomRef, _mapRefCb,
    // Search
    searchQuery, searchResults, searchLoading, showSearchResults, searchPin,
    setSearchPin, setShowSearchResults, searchContainerRef, mobileSearchContainerRef,
    handleSearchInput, handleSearchSelect, searchAddress,
    adaNo, setAdaNo, parselNo, setParselNo, searchAdaParsel, adaParselError, parselFlyTo,
    // City Search Mode
    searchMode, setSearchMode,
    cityIlOptions, cityIlceOptions, cityMahalleOptions,
    citySelectedIl, citySelectedIlce, citySelectedMahalle,
    cityIlLoading, cityIlceLoading, cityMahalleLoading,
    handleCityIlSelect, handleCityIlceSelect, handleCityMahalleSelect,
    // Layers
    isLayersDropdownOpen, setIsLayersDropdownOpen, layersDropdownRef,
    talepYogunlugu, setTalepYogunlugu, imarBaskisi,
    ilSinirlari, setIlSinirlari, ilceSinirlari, setIlceSinirlari,
    mahalleSinirlari, setMahalleSinirlari,
    // Selection
    selectedIl, setSelectedIl, selectedIlce, setSelectedIlce, selectedMahalle, setSelectedMahalle, selectedMahalle, setSelectedMahalle,
    selectedIlCenter, setSelectedIlCenter, selectedIlZoom,
    selectedParcel, parcelLoading, parselTrend,
    // GeoJSON
    illerGeoJSON, ilcelerGeoJSON, mahallelerGeoJSON, setMahallelerGeoJSON,
    // Data
    economicData, economicDataLoading,
    ilFiyatlari, ilFiyatlariLoading, ilFiyatlariError,
    ilceFiyatlari, setIlceFiyatlari, mahalleFiyatlari, setMahalleFiyatlari,
    ilTrend, setIlTrend, ilTrendLoading, ilceTrend, setIlceTrend,
    disasterRisk, turkiyeTrend, turkiyeTrendLoading,
    tapuIslemToplam, tapuIslemLoading,
    nufusData, nufusLoading,
    demografiData, demografiLoading,
    yasanilabilirlik, yasanilabilirlikLoading,
    talepIlgi, talepIlgiLoading,
    yapiBelgesi, yapiBelgesiLoading,
    arsaPazar, arsaPazarLoading,
    scoreCards, chartOption, chartKey, selectedMetric, setSelectedMetric,
    trendKategori, setTrendKategori, propertyType, analysisTitle, setAnalysisTitle,
    showAll81Cities, setShowAll81Cities,
    // Price lookups
    priceMin, priceMax, ilcePriceMin, ilcePriceMax, mahallePriceMin, mahallePriceMax,
    getIlColor, getIlPrice, getIlceColor, getIlcePrice, getMahalleColor, getMahallePrice,
    // Handlers
    handleIlClick, handleIlceClick, handleMahalleClick, handleMapBackClick,
    handleParcelClick, handleFiltersApply, handleImarBaskisiToggle,
    // Chat
    isExaChatOpen, setIsExaChatOpen, exaChatInput, setExaChatInput, exaChatLoading,
    exaChatMessages, chatEndRef, chatContainerRef, chatResizing, chatPanelHeight, setChatPanelHeight,
    handleExaChatSend, handleChatResizeStart,
    // Utils
    formatNumber,
  };
}
