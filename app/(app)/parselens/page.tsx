'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useExaChat } from '@/contexts/ExaChatContext';
import MobileSidebar from '@/components/MobileSidebar/MobileSidebar';
import { type FilterValues } from '@/components/FilterPopup/FilterPopup';
import { getEconomicData, getIlFiyatlari, getIlceFiyatlari, getMahalleFiyatlari, getIlTrend, getIlceTrend, getMahalleTrend, getTurkiyeTrend, getTapuIslemToplam, formatNumber, formatChange, getChangeColor, getRiskColor, getRiskGradient, type EconomicData, type IlFiyatlari, type IlceFiyatlari, type MahalleFiyatlari, type IlTrend, type IlceTrend, type TurkiyeTrend, type TapuIslemToplam } from '@/lib/api';
import { setMapRefCallback, setMapBackClickCallback } from './components/MapHelpers';

import { GEOJSON_TO_DB_NAME, geoNameToDbName, ParselDetail, PRICE_GRADIENT_COLORS, getPriceColor } from './utils/constants';
import { normalizeForMatch, normalizeMahalle, displayMahalleName, buildMahalleFiyatMap } from './utils/helpers';
import { getChartOption } from './utils/chartOptions';
import DesktopMapPanel from './components/DesktopMapPanel';
import MobileLayout from './components/MobileLayout';
import GenelTab from './components/tabs/GenelTab';
import TalepTab from './components/tabs/TalepTab';
import NufusTab from './components/tabs/NufusTab';
import RiskTab from './components/tabs/RiskTab';
import YatirimTab from './components/tabs/YatirimTab';

export default function ParselensPage() {
  const { isOpen: sidebarOpen, setIsOpen } = useSidebar();
  const [splitPosition, setSplitPosition] = useState(50); // Yüzde olarak
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState('genel'); // Tab state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Mobil drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobil sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Filter popup state
  const [mapMode, setMapMode] = useState<'dark' | 'satellite' | 'hybrid'>('dark');
  const mapRef = useRef<any>(null); // Leaflet map instance ref
  const _mapRefCb = useCallback((map: any) => { mapRef.current = map; }, []);
  useEffect(() => { setMapRefCallback(_mapRefCb); return () => { setMapRefCallback(null); }; }, [_mapRefCb]);

  const tileConfig = useMemo(() => {
    switch (mapMode) {
      case 'satellite':
        return { url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', subdomains: undefined, maxZoom: 21 };
      case 'hybrid':
        return { url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', subdomains: undefined, maxZoom: 21 };
      default:
        return { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', subdomains: 'abcd', maxZoom: 20 };
    }
  }, [mapMode]);

  // Adres arama state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchPin, setSearchPin] = useState<[number, number] | null>(null); // Arama pin koordinatı
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const [isLayersDropdownOpen, setIsLayersDropdownOpen] = useState(false); // Layers dropdown state
  const [talepYogunlugu, setTalepYogunlugu] = useState(false); // Talep yoğunluğu katmanı
  const [imarBaskisi, setImarBaskisi] = useState(false); // İmar baskısı katmanı
  const [ilSinirlari, setIlSinirlari] = useState(true); // İl sınırları katmanı (default açık)
  const [ilceSinirlari, setIlceSinirlari] = useState(false); // İlçe sınırları katmanı
  // İmar öncesi sınır durumlarını sakla (geri yüklemek için)
  const preImarRef = useRef<{ il: boolean; ilce: boolean } | null>(null);
  // İmar parsel detayı
  const [selectedParcel, setSelectedParcel] = useState<ParselDetail | null>(null);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [parselTrend, setParselTrend] = useState<any>(null);
  const [chartKey, setChartKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersDropdownRef = useRef<HTMLDivElement>(null);
  
  // GeoJSON verileri için state
  const [illerGeoJSON, setIllerGeoJSON] = useState<any>(null);
  const [ilcelerGeoJSON, setIlcelerGeoJSON] = useState<any>(null);
  const [selectedIl, setSelectedIl] = useState<string | null>(null);
  const [selectedIlCenter, setSelectedIlCenter] = useState<[number, number] | null>(null);
  const [selectedIlZoom, setSelectedIlZoom] = useState<number>(9);
  
  // Mahalle sınırları state'leri
  const [selectedIlce, setSelectedIlce] = useState<string | null>(null);
  const [mahallelerGeoJSON, setMahallelerGeoJSON] = useState<any>(null);
  const [mahalleSinirlari, setMahalleSinirlari] = useState(false);
  const [mahalleLoading, setMahalleLoading] = useState(false);
  const [mahalleFiyatlari, setMahalleFiyatlari] = useState<MahalleFiyatlari | null>(null);
  
  // Breadcrumb geri dönüş zoom hedefi
  const pendingZoomRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const [showAll81Cities, setShowAll81Cities] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState('Türkiye Genel Bakış');
  const [propertyType, setPropertyType] = useState('Konut');
  const [trendKategori, setTrendKategori] = useState('konut');
  
  // Ekonomik veri state'leri
  const [economicData, setEconomicData] = useState<EconomicData | null>(null);
  const [economicDataLoading, setEconomicDataLoading] = useState(true);
  const [economicDataError, setEconomicDataError] = useState<string | null>(null);
  
  // İl fiyatları state'leri
  const [ilFiyatlari, setIlFiyatlari] = useState<IlFiyatlari | null>(null);
  const [ilFiyatlariLoading, setIlFiyatlariLoading] = useState(true);
  const [ilFiyatlariError, setIlFiyatlariError] = useState<string | null>(null);
  
  // İlçe fiyatları state'leri (seçili il'e göre)
  const [ilceFiyatlari, setIlceFiyatlari] = useState<IlceFiyatlari | null>(null);

  // Seçili il trend state'leri
  const [ilTrend, setIlTrend] = useState<IlTrend | null>(null);
  const [ilTrendLoading, setIlTrendLoading] = useState(false);
  const [ilceTrend, setIlceTrend] = useState<IlceTrend | null>(null);

  // Doğal afet risk verileri
  const [disasterRisk, setDisasterRisk] = useState<{
    deprem?: {
      pga_2: number; pga_10: number; ss_2: number; ss_10: number;
      s1_2: number; s1_10: number; pgv_2: number;
      risk_label: string; risk_color: string; risk_pct: number;
    };
    yangin?: {
      fwi_max: number; fwi_ortalama: number;
      risk_label: string; risk_color: string; risk_pct: number;
    };
    sel?: {
      sel_nehir: string; sel_kentsel: string;
      risk_label: string; risk_color: string; risk_pct: number;
    };
    heyelan?: {
      risk_label: string; risk_color: string; risk_pct: number;
    };
    tsunami?: {
      risk_label: string; risk_color: string; risk_pct: number;
    };
  } | null>(null);

  useEffect(() => {
    if (!selectedIl) return;
    const dbIlAdi = geoNameToDbName(selectedIl);
    setIlTrendLoading(true);
    getIlTrend(dbIlAdi, 120, trendKategori)
      .then(data => setIlTrend(data))
      .catch(err => console.error('İl trend çekilemedi:', err))
      .finally(() => setIlTrendLoading(false));
    getIlceFiyatlari(dbIlAdi, trendKategori)
      .then(data => setIlceFiyatlari(data))
      .catch(console.error);
    if (selectedIlce) {
      getIlceTrend(dbIlAdi, selectedIlce, 120, trendKategori)
        .then(data => setIlceTrend(data))
        .catch(console.error);
      getMahalleFiyatlari(dbIlAdi, selectedIlce, trendKategori)
        .then(data => setMahalleFiyatlari(data))
        .catch(console.error);
    }
  }, [trendKategori]);

  // İl değiştiğinde (veya ilk yüklemede) doğal afet risk verilerini çek
  useEffect(() => {
    const dbIl = selectedIl ? geoNameToDbName(selectedIl) : 'TURKIYE';
    fetch(`/api/disaster-risk?il=${encodeURIComponent(dbIl)}`)
      .then(r => r.json())
      .then(data => setDisasterRisk(data))
      .catch(() => setDisasterRisk(null));
  }, [selectedIl]);

  // Filtre uygulama handler'ı
  const handleFiltersApply = useCallback((filters: FilterValues) => {
    // Kategori mapping
    const kategoriMap: Record<string, string> = {
      'konut': 'konut',
      'arsa': 'arsa',
      'arazi': 'arazi',
      'ticari': 'ticari',
    };
    const displayMap: Record<string, string> = {
      'konut': 'Konut',
      'arsa': 'Arsa',
      'arazi': 'Arazi',
      'ticari': 'Ticari',
    };
    
    const newKategori = kategoriMap[filters.category] || 'konut';
    setTrendKategori(newKategori);
    setPropertyType(displayMap[filters.category] || 'Konut');
  }, []);

  // Türkiye geneli trend state'leri
  const [turkiyeTrend, setTurkiyeTrend] = useState<TurkiyeTrend | null>(null);
  const [turkiyeTrendLoading, setTurkiyeTrendLoading] = useState(true);

  // TKGM Tapu İşlem Hacmi state'leri
  const [tapuIslemToplam, setTapuIslemToplam] = useState<TapuIslemToplam | null>(null);
  const [tapuIslemLoading, setTapuIslemLoading] = useState(true);

  // Exa Chat - Context'ten
  const { sessions, activeSessionId, activeSession, createSession, setActiveSession, addMessage, updateLastAssistantMessage, getSessionMessages, sessionExists } = useExaChat();
  const [isExaChatOpen, setIsExaChatOpen] = useState(false);
  const [exaChatInput, setExaChatInput] = useState('');
  const [exaChatLoading, setExaChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [quickAnalysisSessionId, setQuickAnalysisSessionId] = useState<string | null>(null);

  // Chat panel resize
  const [chatPanelHeight, setChatPanelHeight] = useState(55); // yüzde
  const chatResizing = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Resize handler - sürükleme
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

  // Hızlı analiz mesajları (aktif session'dan)
  const exaChatMessages = quickAnalysisSessionId
    ? (sessions.find(s => s.id === quickAnalysisSessionId)?.messages || [])
    : [];

  // Chat mesajı gönder
  const exaAbortRef = useRef<AbortController | null>(null);
  const handleExaChatSend = useCallback(async () => {
    if (!exaChatInput.trim() || exaChatLoading) return;
    const userMsg = exaChatInput.trim();
    let context = selectedIl ? `${selectedIl} bölgesi` : 'Türkiye geneli';
    // İmar modu + seçili parsel varsa zengin context gönder
    if (imarBaskisi && selectedParcel) {
      const p = selectedParcel.parsel;
      const ib = selectedParcel.imar_baskisi;
      const ti = selectedParcel.tapu_islem;
      context += ` | İmar Modu Aktif | Seçili Parsel: Ada ${p.ada}/Parsel ${p.parsel}, ${p.mahalle} ${p.ilce}/${p.il}, Cins: ${p.cins}, Alan: ${Math.round(p.alan)} m², İmar Baskısı: ${ib.skor}/100 (${ib.seviye}, base:${ib.base_skor || 0} + tapu_bonus:${ib.tapu_bonus || 0}), Parsel ID: ${p.tapu_kimlik_no}`;
      if (ti) {
        context += ` | TKGM Tapu İşlem: Bu parsel ${ti.parsel_islem} işlem, Çevre ort: ${ti.cevre_ort}, Çevre max: ${ti.cevre_max}, Çevre toplam: ${ti.cevre_toplam || 0} işlem (${ti.cevre_parsel} parsel)`;
      }
    }

    // Session yoksa VEYA mevcut session bulunamıyorsa yeni oluştur
    let sessionId = quickAnalysisSessionId;
    if (!sessionId || !sessionExists(sessionId)) {
      sessionId = createSession(context, 'quick-analysis');
      setQuickAnalysisSessionId(sessionId);
    }

    addMessage(sessionId, { role: 'user', content: userMsg });
    setExaChatInput('');
    setExaChatLoading(true);

    // Önceki isteği iptal et
    if (exaAbortRef.current) exaAbortRef.current.abort();
    const controller = new AbortController();
    exaAbortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const currentMessages = getSessionMessages(sessionId);
      const allMessages = [...currentMessages, { role: 'user' as const, content: userMsg }];

      const res = await fetch('/api/exa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          context,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`API hatası: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream okunamadı');

      // Boş asistan mesajı ekle
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
            if (parsed.content) {
              accumulated += parsed.content;
              updateLastAssistantMessage(sessionId, accumulated);
            }
          } catch { /* JSON parse hatası, devam et */ }
        }
      }

      if (!accumulated) {
        updateLastAssistantMessage(sessionId, 'Yanıt alınamadı. Lütfen tekrar deneyin. 🔄');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err?.name === 'AbortError';
      const errorMsg = isAbort
        ? 'İstek zaman aşımına uğradı. ⏱️'
        : 'Bağlantı hatası. Lütfen tekrar deneyin. 🔄';
      addMessage(sessionId, { role: 'assistant', content: errorMsg });
      setExaChatLoading(false);
    }
  }, [exaChatInput, exaChatLoading, quickAnalysisSessionId, selectedIl, createSession, addMessage, updateLastAssistantMessage, getSessionMessages, sessionExists]);

  // Chat panel kapanınca session temizle (yeni açılınca yeni session)
  useEffect(() => {
    if (!isExaChatOpen) {
      setQuickAnalysisSessionId(null);
    }
  }, [isExaChatOpen]);

  // Chat scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [exaChatMessages]);

  // İl fiyatları: DB ismine göre fiyat lookup map + min/max
  const ilFiyatMap = useMemo(() => {
    const map: Record<string, { m2_fiyat: number; trend_12ay: number | null }> = {};
    if (ilFiyatlari?.iller) {
      for (const il of ilFiyatlari.iller) {
        map[il.il] = { m2_fiyat: il.m2_fiyat, trend_12ay: il.trend_12ay };
      }
    }
    return map;
  }, [ilFiyatlari]);

  const { priceMin, priceMax } = useMemo(() => {
    if (!ilFiyatlari?.iller || ilFiyatlari.iller.length === 0) {
      return { priceMin: 0, priceMax: 100000 };
    }
    const prices = ilFiyatlari.iller.map(il => il.m2_fiyat);
    return { priceMin: Math.min(...prices), priceMax: Math.max(...prices) };
  }, [ilFiyatlari]);

  // GeoJSON feature'dan il fiyatını bul
  const getIlPrice = (geoName: string) => {
    const dbName = geoNameToDbName(geoName);
    return ilFiyatMap[dbName] || null;
  };

  // GeoJSON feature'dan il rengini hesapla
  const getIlColor = (geoName: string): string => {
    const priceData = getIlPrice(geoName);
    if (!priceData) return '#10b981'; // veri yoksa varsayılan yeşil
    return getPriceColor(priceData.m2_fiyat, priceMin, priceMax);
  };

  const ilceFiyatMap = useMemo(() => {
    const map: Record<string, { ilce: string; m2_fiyat: number }> = {};
    if (ilceFiyatlari?.ilceler) {
      for (const ilce of ilceFiyatlari.ilceler) {
        const key = normalizeForMatch(ilce.ilce);
        map[key] = { ilce: ilce.ilce, m2_fiyat: ilce.m2_fiyat };
      }
    }
    return map;
  }, [ilceFiyatlari]);

  const { ilcePriceMin, ilcePriceMax } = useMemo(() => {
    if (!ilceFiyatlari?.ilceler || ilceFiyatlari.ilceler.length === 0) {
      return { ilcePriceMin: 0, ilcePriceMax: 100000 };
    }
    const prices = ilceFiyatlari.ilceler.map(i => i.m2_fiyat);
    return { ilcePriceMin: Math.min(...prices), ilcePriceMax: Math.max(...prices) };
  }, [ilceFiyatlari]);

  const getIlcePrice = (geoIlceName: string) => {
    const key = normalizeForMatch(geoIlceName);
    return ilceFiyatMap[key] || null;
  };

  const getIlceColor = (geoIlceName: string): string => {
    const data = getIlcePrice(geoIlceName);
    if (!data) return '#06b6d4';
    return getPriceColor(data.m2_fiyat, ilcePriceMin, ilcePriceMax);
  };

  const mahalleFiyatMap = useMemo(() => {
    if (!mahalleFiyatlari?.mahalleler) return {};
    return buildMahalleFiyatMap(mahalleFiyatlari.mahalleler);
  }, [mahalleFiyatlari]);

  const { mahallePriceMin, mahallePriceMax, mahalleAvgPrice } = useMemo(() => {
    if (!mahalleFiyatlari?.mahalleler || mahalleFiyatlari.mahalleler.length === 0) {
      return { mahallePriceMin: 0, mahallePriceMax: 100000, mahalleAvgPrice: 0 };
    }
    const prices = mahalleFiyatlari.mahalleler.map(m => m.m2_fiyat);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { mahallePriceMin: Math.min(...prices), mahallePriceMax: Math.max(...prices), mahalleAvgPrice: avg };
  }, [mahalleFiyatlari]);

  const getMahallePrice = (geoMahalleAdi: string) => {
    const key = normalizeMahalle(geoMahalleAdi);
    const exact = mahalleFiyatMap[key];
    if (exact) return exact;
    if (mahalleAvgPrice > 0) {
      return { mahalle: geoMahalleAdi, m2_fiyat: mahalleAvgPrice, tahmini: true };
    }
    return null;
  };

  const getMahalleColor = (geoMahalleAdi: string): string => {
    const data = getMahallePrice(geoMahalleAdi);
    if (!data) return '#06b6d4';
    const color = getPriceColor(data.m2_fiyat, mahallePriceMin, mahallePriceMax);
    if ((data as any).tahmini) {
      return color.replace('rgb(', 'rgba(').replace(')', ', 0.6)');
    }
    return color;
  };

  const tabs = [
    { id: 'genel', label: 'Genel' },
    { id: 'talep', label: 'Talep' },
    { id: 'nufus', label: 'Nüfus' },
    { id: 'risk', label: 'Risk' },
    { id: 'yatirim', label: 'Yatırım' }
  ];

  // Mock data for score cards
  const scoreCards = [
    { title: `emlaX ${propertyType}`, value: 85, change: 12, changeType: 'increase' },
    { title: 'Satış Skoru', value: 78, change: 5, changeType: 'increase' },
    { title: 'Kira Skoru', value: 92, change: 8, changeType: 'increase' },
    { title: 'Yaşam Skoru', value: 87, change: 10, changeType: 'increase' }
  ];

  // Mock data for line chart
  const chartData = [
    { ay: 'Oca', m2: 12500, satis: 3.25, kira: 4.2 },
    { ay: 'Şub', m2: 13200, satis: 3.42, kira: 4.3 },
    { ay: 'Mar', m2: 13800, satis: 3.58, kira: 4.5 },
    { ay: 'Nis', m2: 14100, satis: 3.66, kira: 4.4 },
    { ay: 'May', m2: 14800, satis: 3.84, kira: 4.6 },
    { ay: 'Haz', m2: 15500, satis: 4.02, kira: 4.7 },
    { ay: 'Tem', m2: 16200, satis: 4.20, kira: 4.8 },
    { ay: 'Ağu', m2: 16800, satis: 4.36, kira: 4.9 },
    { ay: 'Eyl', m2: 17400, satis: 4.52, kira: 5.0 },
    { ay: 'Eki', m2: 18200, satis: 4.73, kira: 5.1 },
    { ay: 'Kas', m2: 19100, satis: 4.96, kira: 5.2 },
    { ay: 'Ara', m2: 20000, satis: 5.20, kira: 5.3 }
  ];
  
  const [selectedMetric, setSelectedMetric] = useState('m2');

  // ECharts chart option (utils/chartOptions.ts'den)
  const chartOption = getChartOption({ selectedIlce, ilceTrend, selectedIl, ilTrend, turkiyeTrend, selectedMetric, chartData, parselTrend });

  // Trend verisi değişince chart key artır → animasyonu tetikle
  useEffect(() => { setChartKey(k => k + 1); }, [ilTrend, ilceTrend, parselTrend]);

  // Sidebar genişliği + boşluklar
  // Açık: 20px (sol) + 280px (sidebar) + 20px (arası) = 320px
  // Kapalı: 20px (sol) + 80px (sidebar) + 20px (arası) = 120px
  const sidebarWidth = sidebarOpen ? 320 : 120;

  // Breadcrumb geri dönüş zoom'u uygula (yedek - flyTo bozulursa)
  useEffect(() => {
    const target = pendingZoomRef.current;
    if (target) {
      pendingZoomRef.current = null;
      const timer = setTimeout(() => {
        const m = mapRef.current;
        if (m) {
          // Eğer harita hala hedef zoom'da değilse düzelt
          const currentZoom = m.getZoom();
          if (Math.abs(currentZoom - target.zoom) > 0.5) {
            m.flyTo(target.center, target.zoom, { animate: true, duration: 1 });
          }
        }
      }, 1500); // flyTo animasyonu bitmesini bekle
      return () => clearTimeout(timer);
    }
  }, [selectedIl, selectedIlce]);
  
  // GeoJSON verilerini yükle
  useEffect(() => {
    if (ilSinirlari && !illerGeoJSON) {
      fetch('/turkiye-sinir-verileri/turkiye_iller_gadm.geojson')
        .then(res => res.json())
        .then(data => setIllerGeoJSON(data))
        .catch(err => console.error('İl sınırları yüklenemedi:', err));
    }
    
    // İlçe verilerini her zaman yükle (tıklama için hazır olsun)
    if (!ilcelerGeoJSON) {
      fetch('/turkiye-sinir-verileri/turkiye_ilceler_gadm.geojson')
        .then(res => res.json())
        .then(data => setIlcelerGeoJSON(data))
        .catch(err => console.error('İlçe sınırları yüklenemedi:', err));
    }
  }, [ilSinirlari, illerGeoJSON, ilcelerGeoJSON]);

  // Klavye ile Tab geçişi (TAB tuşu)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault(); // Varsayılan TAB davranışını engelle
        
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length; // Döngüsel geçiş
        setActiveTab(tabs[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Akıllı arama: önce backend, backend boşsa Nominatim fallback
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setSearchLoading(true);
    try {
      // Önce backend smart-search
      const smartRes = await fetch(`/api/smart-search?q=${encodeURIComponent(query)}&limit=10`).then(r => r.json()).catch(() => null);
      
      const results: any[] = [];
      
      if (smartRes?.results?.length > 0) {
        // Backend sonuçları var - bunları kullan
        for (const r of smartRes.results) {
          results.push({ ...r, source: 'backend' });
        }
      }
      
      // Backend 0 sonuç veya sadece il sonucu döndüyse, Nominatim ile zenginleştir
      if (results.length < 3) {
        try {
          const nomData = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Türkiye')}&limit=3&addressdetails=1&countrycodes=tr&accept-language=tr`
          ).then(r => r.json());
          if (Array.isArray(nomData)) {
            for (const r of nomData) {
              results.push({ ...r, source: 'nominatim' });
            }
          }
        } catch {}
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (err) {
      console.error('Arama hatası:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced arama - her tuşa basmada değil, 400ms bekle
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => searchAddress(value), 400);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchAddress]);

  // Türkçe karakter normalizasyonu
  const normTR = useCallback((s: string) => s.toLowerCase()
    .replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i')
    .replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u')
    .replace(/Ç/g,'c').replace(/Ğ/g,'g').replace(/İ/g,'i')
    .replace(/Ö/g,'o').replace(/Ş/g,'s').replace(/Ü/g,'u'), []);

  // İl adını GeoJSON feature ile eşleştir
  const matchIlFeature = useCallback((ilName: string) => {
    if (!illerGeoJSON?.features) return null;
    const n = normTR(ilName);
    return illerGeoJSON.features.find((f: any) => {
      const geoName = f.properties?.NAME_1 || '';
      const dbName = geoNameToDbName(geoName);
      return normTR(dbName) === n || normTR(geoName) === n || geoName.toLowerCase() === ilName.toLowerCase();
    });
  }, [illerGeoJSON, normTR]);

  // İl analizi açma yardımcı fonksiyonu
  const openIlAnalysis = useCallback((ilGeoName: string, centerLat?: number, centerLon?: number) => {
    setSelectedIl(ilGeoName);
    if (!imarBaskisi) setIlceSinirlari(true);
    setAnalysisTitle(`${ilGeoName} Analizi`);
    setIlceFiyatlari(null);
    setIlTrend(null);
    setMahalleFiyatlari(null);
    
    const dbIlAdi = geoNameToDbName(ilGeoName);
    getIlceFiyatlari(dbIlAdi, trendKategori)
      .then(data => setIlceFiyatlari(data))
      .catch(err => console.error('İlçe fiyatları çekilemedi:', err));
    
    setIlTrendLoading(true);
    getIlTrend(dbIlAdi, 120, trendKategori)
      .then(data => setIlTrend(data))
      .catch(err => console.error('İl trend çekilemedi:', err))
      .finally(() => setIlTrendLoading(false));
    
    if (centerLat && centerLon) setSelectedIlCenter([centerLat, centerLon]);
  }, [imarBaskisi, trendKategori]);

  // Arama sonucuna tıklayınca: tipine göre aksiyon al
  const handleSearchSelect = useCallback((result: any) => {
    const map = mapRef.current;

    // ============================================
    // BACKEND SONUÇLARI (smart-search)
    // ============================================
    if (result.source === 'backend') {
      
      // Nominatim ile konum bul ve zoom + pin at yardımcı fonksiyon
      const geocodeAndZoom = (query: string, zoom: number, maxZoom: number) => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=tr&accept-language=tr`)
          .then(r => r.json())
          .then(data => {
            if (!data[0]) return;
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            // Pin at
            setSearchPin([lat, lon]);
            setSelectedIlCenter([lat, lon]);
            // React re-render sonrası zoom yap (state güncellemeleri bitsin)
            setTimeout(() => {
              const m = mapRef.current;
              if (!m) return;
              if (data[0].boundingbox) {
                const [s, n, w, e] = data[0].boundingbox.map(Number);
                m.fitBounds([[s, w], [n, e]], { padding: [50, 50], maxZoom, animate: true, duration: 1 });
              } else {
                m.flyTo([lat, lon], zoom, { animate: true, duration: 1.5 });
              }
            }, 100);
          })
          .catch(err => console.error('Geocode hatası:', err));
      };

      // --- PARSEL SONUCU ---
      if (result.type === 'parsel' && result.lat && result.lon) {
        setIlSinirlari(false);
        setIlceSinirlari(false);
        setSearchPin([result.lat, result.lon]);
        setTimeout(() => {
          const m = mapRef.current;
          if (m) m.flyTo([result.lat, result.lon], 18, { animate: true, duration: 1.5 });
        }, 100);
        const feature = matchIlFeature(result.il);
        if (feature) openIlAnalysis(feature.properties.NAME_1, result.lat, result.lon);
        if (result.id) {
          handleParcelClick(result.id);
        }
        setSearchQuery(result.display);
        setShowSearchResults(false);
        setSearchResults([]);
        return;
      }
      
      // --- MAHALLE SONUCU ---
      if (result.type === 'mahalle') {
        setIlSinirlari(false);
        setIlceSinirlari(false);
        setAnalysisTitle(`${result.display} Analizi`);
        // display'den doğru isim kullan (ör: "Yalıkavak, Bodrum/Muğla")
        geocodeAndZoom(`${result.display} Türkiye`, 15, 16);
        const mFeature = matchIlFeature(result.il);
        if (mFeature) {
          setSelectedIl(mFeature.properties.NAME_1);
          const dbIl = geoNameToDbName(mFeature.properties.NAME_1);
          setIlceFiyatlari(null);
          setIlTrend(null);
          setMahalleFiyatlari(null);
          getIlceFiyatlari(dbIl, trendKategori).then(d => setIlceFiyatlari(d)).catch(console.error);
          setIlTrendLoading(true);
          getIlTrend(dbIl, 120, trendKategori).then(d => setIlTrend(d)).catch(console.error).finally(() => setIlTrendLoading(false));
        }
        setSearchQuery(result.display);
        setShowSearchResults(false);
        setSearchResults([]);
        return;
      }
      
      // --- İLÇE SONUCU ---
      if (result.type === 'ilce') {
        setIlSinirlari(false);
        setIlceSinirlari(false);
        setAnalysisTitle(`${result.display} Analizi`);
        // display'den doğru isim kullan (ör: "Bodrum, Muğla")
        geocodeAndZoom(`${result.display} Türkiye`, 12, 13);
        const iFeature = matchIlFeature(result.il);
        if (iFeature) {
          setSelectedIl(iFeature.properties.NAME_1);
          const dbIl = geoNameToDbName(iFeature.properties.NAME_1);
          setIlceFiyatlari(null);
          setIlTrend(null);
          setMahalleFiyatlari(null);
          getIlceFiyatlari(dbIl, trendKategori).then(d => setIlceFiyatlari(d)).catch(console.error);
          setIlTrendLoading(true);
          getIlTrend(dbIl, 120, trendKategori).then(d => setIlTrend(d)).catch(console.error).finally(() => setIlTrendLoading(false));
        }
        setSearchQuery(result.display);
        setShowSearchResults(false);
        setSearchResults([]);
        return;
      }
      
      // --- İL SONUCU ---
      if (result.type === 'il') {
        setSearchPin(null);
        const feature = matchIlFeature(result.il);
        if (feature) {
          const L = require('leaflet');
          const geoLayer = L.geoJSON(feature);
          const bounds = geoLayer.getBounds();
          const center = bounds.getCenter();
          openIlAnalysis(feature.properties.NAME_1, center.lat, center.lng);
          setTimeout(() => {
            const m = mapRef.current;
            if (m) m.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, animate: true, duration: 1 });
          }, 100);
        } else {
          geocodeAndZoom(`${result.display} Türkiye`, 9, 10);
          openIlAnalysis(result.display);
        }
        setSearchQuery(result.display);
        setShowSearchResults(false);
        setSearchResults([]);
        return;
      }
    }

    // ============================================
    // NOMİNATİM SONUÇLARI (fallback)
    // ============================================
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Pin at
    setSearchPin([lat, lon]);
    
    // İl analizini aç
    const address = result.address || {};
    const ilAdi = address.province || address.state || '';
    if (ilAdi) {
      const feature = matchIlFeature(ilAdi);
      if (feature) openIlAnalysis(feature.properties.NAME_1, lat, lon);
    }
    
    // Re-render sonrası zoom yap
    const bb = result.boundingbox;
    setTimeout(() => {
      const m = mapRef.current;
      if (!m) return;
      if (bb) {
        const [south, north, west, east] = bb.map(Number);
        m.fitBounds([[south, west], [north, east]], { padding: [50, 50], maxZoom: 16, animate: true, duration: 1 });
      } else {
        m.flyTo([lat, lon], 14, { animate: true, duration: 1.5 });
      }
    }, 100);
    
    setSearchQuery(result.display_name?.split(',')[0] || result.display || '');
    setShowSearchResults(false);
    setSearchResults([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchIlFeature, openIlAnalysis, trendKategori]);

  // Arama dropdown'ını dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchResults(false);
      }
      // Sadece biri varsa da kontrol et
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node) && !mobileSearchContainerRef.current) {
        setShowSearchResults(false);
      }
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node) && !searchContainerRef.current) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // İl tıklama handler
  const handleIlClick = (ilAdi: string, layer: any) => {
    setSearchPin(null);
    setSelectedIl(ilAdi);
    if (!imarBaskisi) {
      setIlceSinirlari(true);
    }
    setAnalysisTitle(`${ilAdi} Analizi`);
    setIlceFiyatlari(null);
    setIlTrend(null);
    
    setSelectedIlce(null);
    setIlceTrend(null);
    setMahallelerGeoJSON(null);
    setMahalleSinirlari(false);
    setMahalleFiyatlari(null);
    setParselTrend(null);
    
    setIlSinirlari(false);
    
    const dbIlAdi = geoNameToDbName(ilAdi);
    getIlceFiyatlari(dbIlAdi, trendKategori)
      .then(data => setIlceFiyatlari(data))
      .catch(err => console.error('İlçe fiyatları çekilemedi:', err));
    
    setIlTrendLoading(true);
    getIlTrend(dbIlAdi, 120, trendKategori)
      .then(data => setIlTrend(data))
      .catch(err => console.error('İl trend çekilemedi:', err))
      .finally(() => setIlTrendLoading(false));
    
    // Haritayı zoom yap - layer'dan map instance'ını al
    const map = layer._map;
    if (map) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      setSelectedIlCenter([center.lat, center.lng]); // Merkez koordinatları kaydet
      
      // fitBounds'un hesaplayacağı zoom'u önceden al, sonra flyTo ile git (tutarlı animasyon)
      const targetZoom = Math.min(map.getBoundsZoom(bounds, false, [50, 50]), 10);
      setSelectedIlZoom(targetZoom);
      map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
    }
  };

  // İlçe tıklama handler - mahalle sınırlarını yükle
  const handleIlceClick = (ilceAdi: string, layer: any) => {
    setSelectedIlce(ilceAdi);
    setMahalleSinirlari(true);
    setMahallelerGeoJSON(null);
    setMahalleFiyatlari(null);
    setMahalleLoading(true);
    
    setIlSinirlari(false);
    setIlceSinirlari(false);

    const ilForApi = selectedIl || '';

    fetch(`/api/mahalle-sinirlari?il=${encodeURIComponent(ilForApi)}&ilce=${encodeURIComponent(ilceAdi)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          setMahallelerGeoJSON(data);
        } else {
          console.warn(`${ilForApi}/${ilceAdi} için mahalle sınırı bulunamadı`);
        }
      })
      .catch(err => console.error('Mahalle sınırları çekilemedi:', err))
      .finally(() => setMahalleLoading(false));

    const dbIl = geoNameToDbName(ilForApi);
    getMahalleFiyatlari(dbIl, ilceAdi, trendKategori)
      .then(data => setMahalleFiyatlari(data))
      .catch(err => console.error('Mahalle fiyatları çekilemedi:', err));

    getIlceTrend(dbIl, ilceAdi, 120, trendKategori)
      .then(data => setIlceTrend(data))
      .catch(err => console.error('İlçe trend çekilemedi:', err));

    const map = layer._map;
    if (map) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      const targetZoom = Math.min(map.getBoundsZoom(bounds, false, [40, 40]), 14);
      setTimeout(() => {
        map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
      }, 100);
    }
  };

  // Parsel tıklama handler (İmar modu) — retry ile
  const handleParcelClick = useCallback(async (parcelId: string) => {
    setParcelLoading(true);
    setSelectedParcel(null);
    setParselTrend(null);
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 55000);
        const res = await fetch(`/api/parcel-detail?id=${encodeURIComponent(parcelId)}`, { signal: controller.signal });
        clearTimeout(tid);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.error) {
          setSelectedParcel(data);
          if (data.parsel?.ilce && data.parsel?.il) {
            setAnalysisTitle(`${data.parsel.ada}/${data.parsel.parsel} - ${data.parsel.mahalle}`);
          }
          // Parselin vasfına göre doğru kategoriyi belirle
          const parselKat = data.parsel?.kategori || '';
          const cins = (data.parsel?.cins || '').toLowerCase();
          let apiKategori = trendKategori;
          if (parselKat === 'arazi' || cins.includes('tarla') || cins.includes('bağ') || cins.includes('bahçe') || cins.includes('zeytinlik') || cins.includes('orman')) {
            apiKategori = 'arazi';
          } else if (parselKat === 'arsa' || cins.includes('arsa')) {
            apiKategori = 'arsa';
          } else if (parselKat === 'ticari' || cins.includes('dükkan') || cins.includes('fabrika') || cins.includes('depo')) {
            apiKategori = 'ticari';
          } else if (parselKat === 'konut' || cins.includes('ev') || cins.includes('apartman') || cins.includes('mesken')) {
            apiKategori = 'konut';
          }
          // Parsel fiyat trendini parselin kategorisiyle çek
          fetch(`/api/parcel-price-trend?id=${encodeURIComponent(parcelId)}&kategori=${apiKategori}&tip=satilik&ay=120`)
            .then(r => r.ok ? r.json() : null)
            .then(trendData => { if (trendData?.trend?.length) setParselTrend(trendData); })
            .catch(() => {});
        }
        break;
      } catch (err) {
        if (attempt === maxRetries) console.error('Parsel detay hatası:', err);
        else await new Promise(r => setTimeout(r, 1000));
      }
    }
    setParcelLoading(false);
  }, [trendKategori]);

  // İmar Baskısı toggle handler
  const handleImarBaskisiToggle = useCallback((checked: boolean) => {
    if (checked) {
      // İmar açılıyor: mevcut il/ilçe sınır durumlarını sakla ve kapat
      preImarRef.current = { il: ilSinirlari, ilce: ilceSinirlari };
      setIlSinirlari(false);
      setIlceSinirlari(false);
      setImarBaskisi(true);
    } else {
      // İmar kapanıyor: önceki durumları geri yükle
      setImarBaskisi(false);
      setSelectedParcel(null);
      setParselTrend(null);
      if (preImarRef.current) {
        setIlSinirlari(preImarRef.current.il);
        setIlceSinirlari(preImarRef.current.ilce);
        preImarRef.current = null;
      } else {
        setIlSinirlari(true); // Varsayılan: il sınırları açık
      }
    }
  }, [ilSinirlari, ilceSinirlari]);

  // Mahalle tıklama handler — mahalle trendini grafiğe yükler + zoom
  const handleMahalleClick = useCallback((geoMahalleAdi: string, layer?: any) => {
    if (!selectedIl || !selectedIlce || !geoMahalleAdi) return;
    const dbIl = geoNameToDbName(selectedIl);
    setParselTrend(null);

    const key = normalizeMahalle(geoMahalleAdi);
    const fiyatEntry = mahalleFiyatlari?.mahalleler?.find(
      (m: any) => normalizeMahalle(m.mahalle) === key
    );
    const dbMahalleAdi = fiyatEntry?.mahalle || geoMahalleAdi;

    setAnalysisTitle(`${displayMahalleName(dbMahalleAdi)} - ${selectedIlce}`);
    setIlTrendLoading(true);
    getMahalleTrend(dbIl, selectedIlce, dbMahalleAdi, 120, trendKategori)
      .then(data => {
        if (data?.trend?.length) {
          setIlceTrend(data as any);
        }
      })
      .catch(console.error)
      .finally(() => setIlTrendLoading(false));

    // Mahalleye zoom yap
    if (layer?._map) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      const targetZoom = Math.min(layer._map.getBoundsZoom(bounds, false, [30, 30]), 16);
      layer._map.flyTo([center.lat, center.lng], targetZoom, { animate: true, duration: 1 });
    }
  }, [selectedIl, selectedIlce, mahalleFiyatlari, trendKategori]);

  // Haritada boş alana tıklayınca bir kademe geri git
  const handleMapBackClick = useCallback(() => {
    const map = mapRef.current;
    if (selectedIlce) {
      // Mahalle → İlçe seviyesine geri dön
      setMahalleSinirlari(true);
      setIlceSinirlari(false);
      setIlSinirlari(false);
      setIlceTrend(null);
      setParselTrend(null);
      if (selectedIl) {
        setAnalysisTitle(`${selectedIl} / ${selectedIlce} Analizi`);
        const dbIl = geoNameToDbName(selectedIl);
        getIlceTrend(dbIl, selectedIlce, 120, trendKategori)
          .then(data => setIlceTrend(data))
          .catch(console.error);
      }
      // İlçe bounds'una zoom
      if (map && selectedIlCenter) {
        map.flyTo(selectedIlCenter, (selectedIlZoom || 10) + 2, { animate: true, duration: 1 });
      }
    } else if (selectedIl) {
      // İlçe → İl seviyesine geri dön
      setSelectedIlce(null);
      setIlceTrend(null);
      setMahallelerGeoJSON(null);
      setMahalleSinirlari(false);
      setMahalleFiyatlari(null);
      setParselTrend(null);
      setIlSinirlari(false);
      setIlceSinirlari(true);
      setAnalysisTitle(`${selectedIl} Analizi`);
      if (map && selectedIlCenter && selectedIlZoom) {
        map.flyTo(selectedIlCenter, selectedIlZoom, { animate: true, duration: 1 });
      }
    } else {
      // İl → Türkiye seviyesine geri dön
      setSelectedIl(null);
      setIlSinirlari(true);
      setIlceSinirlari(false);
      setAnalysisTitle('Türkiye Genel Bakış');
      if (map) {
        map.flyTo([39.0, 35.5], 6, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedIl, selectedIlce, selectedIlCenter, selectedIlZoom, trendKategori]);

  // Map back click devre dışı - parsel analiziyle çakışıyor
  // useEffect(() => { setMapBackClickCallback(handleMapBackClick); return () => { setMapBackClickCallback(null); }; }, [handleMapBackClick]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const rawPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Snap: %5'in altındaysa tamamen kapat (sol panel), %95'in üstündeyse tamamen aç (harita kapat)
      let newPosition: number;
      if (rawPosition < 5) {
        newPosition = 0;
      } else if (rawPosition > 95) {
        newPosition = 100;
      } else {
        newPosition = Math.max(20, Math.min(80, rawPosition));
      }
      setSplitPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // Ekonomik verileri çek
  useEffect(() => {
    const fetchEconomicData = async () => {
      try {
        setEconomicDataLoading(true);
        const data = await getEconomicData();
        setEconomicData(data);
        setEconomicDataError(null);
      } catch (error) {
        console.error('Ekonomik veri çekilemedi:', error);
        setEconomicDataError('Veriler yüklenemedi');
      } finally {
        setEconomicDataLoading(false);
      }
    };

    fetchEconomicData();
    
    // Her 5 dakikada bir güncelle
    const interval = setInterval(fetchEconomicData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // İl fiyatlarını çek (trendKategori değişince yeniden çek)
  useEffect(() => {
    const fetchIlFiyatlari = async () => {
      try {
        setIlFiyatlariLoading(true);
        const data = await getIlFiyatlari(trendKategori);
        setIlFiyatlari(data);
        setIlFiyatlariError(null);
      } catch (error) {
        console.error('İl fiyatları çekilemedi:', error);
        setIlFiyatlariError('İl fiyatları yüklenemedi');
      } finally {
        setIlFiyatlariLoading(false);
      }
    };

    fetchIlFiyatlari();
    
    // Her 30 dakikada bir güncelle (il fiyatları daha az değişir)
    const interval = setInterval(fetchIlFiyatlari, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trendKategori]);

  // Türkiye geneli trend verisi çek (trendKategori değişince yeniden çek)
  useEffect(() => {
    const fetchTurkiyeTrend = async () => {
      try {
        setTurkiyeTrendLoading(true);
        const data = await getTurkiyeTrend(120, trendKategori);
        setTurkiyeTrend(data);
      } catch (error) {
        console.error('Türkiye trend çekilemedi:', error);
      } finally {
        setTurkiyeTrendLoading(false);
      }
    };

    fetchTurkiyeTrend();
  }, [trendKategori]);

  // TKGM Tapu İşlem Hacmi verilerini çek
  useEffect(() => {
    const fetchTapuIslem = async () => {
      try {
        setTapuIslemLoading(true);
        const data = await getTapuIslemToplam();
        setTapuIslemToplam(data);
      } catch (error) {
        console.error('Tapu işlem verileri çekilemedi:', error);
      } finally {
        setTapuIslemLoading(false);
      }
    };
    fetchTapuIslem();
  }, []);

  // Close layers dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layersDropdownRef.current && !layersDropdownRef.current.contains(event.target as Node)) {
        setIsLayersDropdownOpen(false);
      }
    };

    if (isLayersDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLayersDropdownOpen]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  return (
    <>
      {/* DESKTOP LAYOUT */}
      <div 
        className="hidden md:block fixed top-5 right-5 bottom-5 transition-all duration-300"
        style={{ left: `${sidebarWidth}px` }}
      >
      {/* Ana Kart - Sidebar ile Aynı Yükseklik */}
      <div 
        ref={containerRef}
        className="w-full h-full rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(20px) saturate(120%)',
          WebkitBackdropFilter: 'blur(20px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Sol Panel - Analiz */}
        <div 
          className="absolute top-0 left-0 bottom-0 overflow-y-auto transition-[width] duration-200"
          style={{ width: `${splitPosition}%`, display: splitPosition === 0 ? 'none' : undefined }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors group outline-none focus:outline-none"
                  aria-label="Toggle Sidebar"
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-white/60 group-hover:text-white/90 transition-colors"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-xl font-medium text-white">{analysisTitle}</h2>
              </div>
              <span className="text-sm font-medium text-white/80 bg-white/10 px-3 py-1.5 rounded-lg">
                {imarBaskisi ? 'Arsa' : propertyType}
              </span>
            </div>
            
            {/* Tab Navigation */}
            <div className="grid grid-cols-5 border-b border-white/10 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-200 relative text-center
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
                <GenelTab
                  selectedParcel={selectedParcel}
                  parcelLoading={parcelLoading}
                  scoreCards={scoreCards}
                  chartOption={chartOption}
                  chartKey={chartKey}
                  selectedMetric={selectedMetric}
                  setSelectedMetric={setSelectedMetric}
                  trendKategori={trendKategori}
                  setTrendKategori={setTrendKategori}
                  selectedIl={selectedIl}
                  selectedIlce={selectedIlce}
                  ilTrendLoading={ilTrendLoading}
                  imarBaskisi={imarBaskisi}
                />
              )}
              {activeTab === 'talep' && (
                <TalepTab
                  tapuIslemToplam={tapuIslemToplam}
                  tapuIslemLoading={tapuIslemLoading}
                  ilFiyatlari={ilFiyatlari}
                  ilFiyatlariLoading={ilFiyatlariLoading}
                  ilFiyatlariError={ilFiyatlariError}
                  showAll81Cities={showAll81Cities}
                  setShowAll81Cities={setShowAll81Cities}
                />
              )}
              {activeTab === 'nufus' && <NufusTab />}
              {activeTab === 'risk' && (
                <RiskTab
                  selectedIl={selectedIl}
                  disasterRisk={disasterRisk}
                  economicData={economicData}
                  economicDataLoading={economicDataLoading}
                  formatNumber={formatNumber}
                  formatChange={formatChange}
                  getChangeColor={getChangeColor}
                  getRiskColor={getRiskColor}
                  getRiskGradient={getRiskGradient}
                />
              )}
              {activeTab === 'yatirim' && <YatirimTab />}
            </div>
          </div>
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
          {/* Paneli aç/kapat butonu */}
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

        <DesktopMapPanel
          splitPosition={splitPosition} mapRef={mapRef} pendingZoomRef={pendingZoomRef}
          tileConfig={tileConfig} mapMode={mapMode}
          illerGeoJSON={illerGeoJSON} ilcelerGeoJSON={ilcelerGeoJSON} mahallelerGeoJSON={mahallelerGeoJSON}
          selectedIl={selectedIl} selectedIlce={selectedIlce} selectedIlCenter={selectedIlCenter} selectedIlZoom={selectedIlZoom}
          ilSinirlari={ilSinirlari} ilceSinirlari={ilceSinirlari} mahalleSinirlari={mahalleSinirlari}
          ilFiyatlari={ilFiyatlari} ilceFiyatlari={ilceFiyatlari} mahalleFiyatlari={mahalleFiyatlari}
          priceMin={priceMin} priceMax={priceMax} ilcePriceMin={ilcePriceMin} ilcePriceMax={ilcePriceMax}
          mahallePriceMin={mahallePriceMin} mahallePriceMax={mahallePriceMax}
          imarBaskisi={imarBaskisi} talepYogunlugu={talepYogunlugu}
          isLayersDropdownOpen={isLayersDropdownOpen} layersDropdownRef={layersDropdownRef}
          searchQuery={searchQuery} searchResults={searchResults} searchLoading={searchLoading}
          searchPin={searchPin} showSearchResults={showSearchResults}
          isExaChatOpen={isExaChatOpen} exaChatInput={exaChatInput} exaChatLoading={exaChatLoading}
          chatContainerRef={chatContainerRef} chatResizing={chatResizing}
          analysisTitle={analysisTitle} propertyType={propertyType} trendKategori={trendKategori}
          isFilterOpen={isFilterOpen}
          setMapMode={setMapMode} setIsLayersDropdownOpen={setIsLayersDropdownOpen}
          setIlSinirlari={setIlSinirlari} setIlceSinirlari={setIlceSinirlari}
          setMahalleSinirlari={setMahalleSinirlari} setMahallelerGeoJSON={setMahallelerGeoJSON}
          setMahalleFiyatlari={setMahalleFiyatlari}
          setSelectedIl={setSelectedIl} setSelectedIlce={setSelectedIlce} setSelectedIlCenter={setSelectedIlCenter}
          setIlTrend={setIlTrend} setIlceTrend={setIlceTrend} setIlceFiyatlari={setIlceFiyatlari}
          setSearchPin={setSearchPin} setShowSearchResults={setShowSearchResults} setAnalysisTitle={setAnalysisTitle}
          setTalepYogunlugu={setTalepYogunlugu} setIsExaChatOpen={setIsExaChatOpen} setExaChatInput={setExaChatInput}
          setIsFilterOpen={setIsFilterOpen} setChatPanelHeight={setChatPanelHeight}
          handleIlClick={handleIlClick} handleIlceClick={handleIlceClick}
          handleSearchInput={handleSearchInput} handleSearchSelect={handleSearchSelect}
          handleFiltersApply={handleFiltersApply} handleImarBaskisiToggle={handleImarBaskisiToggle}
          handleExaChatSend={handleExaChatSend} handleChatResizeStart={handleChatResizeStart}
          handleParcelClick={handleParcelClick} handleMahalleClick={handleMahalleClick} handleMapBackClick={handleMapBackClick} searchAddress={searchAddress}
          formatNumber={formatNumber} getMahallePrice={getMahallePrice} getMahalleColor={getMahalleColor}
          getIlColor={getIlColor} getIlPrice={getIlPrice} getIlceColor={getIlceColor} getIlcePrice={getIlcePrice}
          exaChatMessages={exaChatMessages} chatEndRef={chatEndRef} chatPanelHeight={chatPanelHeight}
          _mapRefCb={_mapRefCb}
        />
      </div>
    </div>


    <MobileLayout
      illerGeoJSON={illerGeoJSON} ilcelerGeoJSON={ilcelerGeoJSON} mahallelerGeoJSON={mahallelerGeoJSON}
      selectedIl={selectedIl} selectedIlce={selectedIlce} selectedIlCenter={selectedIlCenter}
      ilSinirlari={ilSinirlari} ilceSinirlari={ilceSinirlari} mahalleSinirlari={mahalleSinirlari}
      ilFiyatlari={ilFiyatlari} ilceFiyatlari={ilceFiyatlari} mahalleFiyatlari={mahalleFiyatlari}
      priceMin={priceMin} priceMax={priceMax} ilcePriceMin={ilcePriceMin} ilcePriceMax={ilcePriceMax}
      mahallePriceMin={mahallePriceMin} mahallePriceMax={mahallePriceMax}
      imarBaskisi={imarBaskisi} talepYogunlugu={talepYogunlugu}
      tileConfig={tileConfig} mapMode={mapMode} mapRef={mapRef} pendingZoomRef={pendingZoomRef}
      searchQuery={searchQuery} searchResults={searchResults} searchLoading={searchLoading}
      searchPin={searchPin} showSearchResults={showSearchResults}
      isExaChatOpen={isExaChatOpen} exaChatInput={exaChatInput} exaChatLoading={exaChatLoading}
      isDrawerOpen={isDrawerOpen} isMobileSidebarOpen={isMobileSidebarOpen}
      isLayersDropdownOpen={isLayersDropdownOpen} isFilterOpen={isFilterOpen}
      analysisTitle={analysisTitle} propertyType={propertyType} trendKategori={trendKategori}
      activeTab={activeTab} scoreCards={scoreCards} chartOption={chartOption}
      tapuIslemToplam={tapuIslemToplam} tapuIslemLoading={tapuIslemLoading}
      chatContainerRef={chatContainerRef} chatResizing={chatResizing} layersDropdownRef={layersDropdownRef}
      setMapMode={setMapMode} setIsLayersDropdownOpen={setIsLayersDropdownOpen}
      setIlSinirlari={setIlSinirlari} setIlceSinirlari={setIlceSinirlari}
      setMahalleSinirlari={setMahalleSinirlari} setMahallelerGeoJSON={setMahallelerGeoJSON}
      setMahalleFiyatlari={setMahalleFiyatlari}
      setSelectedIl={setSelectedIl} setSelectedIlce={setSelectedIlce} setSelectedIlCenter={setSelectedIlCenter}
      setIlTrend={setIlTrend} setIlceTrend={setIlceTrend} setIlceFiyatlari={setIlceFiyatlari}
      setSearchPin={setSearchPin} setShowSearchResults={setShowSearchResults} setAnalysisTitle={setAnalysisTitle}
      setTalepYogunlugu={setTalepYogunlugu} setIsExaChatOpen={setIsExaChatOpen} setExaChatInput={setExaChatInput}
      setIsFilterOpen={setIsFilterOpen} setIsDrawerOpen={setIsDrawerOpen}
      setIsMobileSidebarOpen={setIsMobileSidebarOpen} setActiveTab={setActiveTab}
      setChatPanelHeight={setChatPanelHeight}
      handleIlClick={handleIlClick} handleIlceClick={handleIlceClick}
      handleSearchInput={handleSearchInput} handleSearchSelect={handleSearchSelect}
      handleFiltersApply={handleFiltersApply} handleImarBaskisiToggle={handleImarBaskisiToggle}
      handleExaChatSend={handleExaChatSend} handleChatResizeStart={handleChatResizeStart}
      handleParcelClick={handleParcelClick} handleMahalleClick={handleMahalleClick} handleMapBackClick={handleMapBackClick} searchAddress={searchAddress}
      formatNumber={formatNumber} getMahallePrice={getMahallePrice} getMahalleColor={getMahalleColor}
      getIlColor={getIlColor} getIlPrice={getIlPrice} getIlceColor={getIlceColor} getIlcePrice={getIlcePrice}
      exaChatMessages={exaChatMessages} chatEndRef={chatEndRef} chatPanelHeight={chatPanelHeight}
      tabs={tabs} mobileSearchContainerRef={mobileSearchContainerRef}
      _mapRefCb={_mapRefCb}
    />
    </>
  );
}
