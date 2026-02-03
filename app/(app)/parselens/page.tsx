'use client';

import { useState, useEffect, useRef } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import dynamic from 'next/dynamic';
import BottomDrawer from '@/components/BottomDrawer/BottomDrawer';
import MobileSidebar from '@/components/MobileSidebar/MobileSidebar';
import FilterPopup from '@/components/FilterPopup/FilterPopup';
import Tracker from '@/components/Tracker/Tracker';
import { getEconomicData, getIlFiyatlari, getIlTrend, formatNumber, formatChange, getChangeColor, getRiskColor, getRiskGradient, type EconomicData, type IlFiyatlari } from '@/lib/api';

// Dynamically import ECharts to prevent SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// Leaflet'i dinamik olarak yükle (SSR'dan kaçınmak için)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
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
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

export default function ParselensPage() {
  const { isOpen: sidebarOpen, setIsOpen } = useSidebar();
  const [splitPosition, setSplitPosition] = useState(50); // Yüzde olarak
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState('genel'); // Tab state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Mobil drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobil sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Filter popup state
  const [isLayersDropdownOpen, setIsLayersDropdownOpen] = useState(false); // Layers dropdown state
  const [talepYogunlugu, setTalepYogunlugu] = useState(false); // Talep yoğunluğu katmanı
  const [imarBaskisi, setImarBaskisi] = useState(false); // İmar baskısı katmanı
  const [ilSinirlari, setIlSinirlari] = useState(true); // İl sınırları katmanı (default açık)
  const [ilceSinirlari, setIlceSinirlari] = useState(false); // İlçe sınırları katmanı
  const containerRef = useRef<HTMLDivElement>(null);
  const layersDropdownRef = useRef<HTMLDivElement>(null);
  
  // GeoJSON verileri için state
  const [illerGeoJSON, setIllerGeoJSON] = useState<any>(null);
  const [ilcelerGeoJSON, setIlcelerGeoJSON] = useState<any>(null);
  const [selectedIl, setSelectedIl] = useState<string | null>(null);
  const [selectedIlCenter, setSelectedIlCenter] = useState<[number, number] | null>(null);
  const [showAll81Cities, setShowAll81Cities] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState('Türkiye Genel Bakış');
  const [propertyType, setPropertyType] = useState('Konut');
  
  // Ekonomik veri state'leri
  const [economicData, setEconomicData] = useState<EconomicData | null>(null);
  const [economicDataLoading, setEconomicDataLoading] = useState(true);
  const [economicDataError, setEconomicDataError] = useState<string | null>(null);
  
  // İl fiyatları state'leri
  const [ilFiyatlari, setIlFiyatlari] = useState<IlFiyatlari | null>(null);
  const [ilFiyatlariLoading, setIlFiyatlariLoading] = useState(true);
  const [ilFiyatlariError, setIlFiyatlariError] = useState<string | null>(null);
  
  // Türkiye geneli trend state'leri
  const [turkiyeTrend, setTurkiyeTrend] = useState<any>(null);
  const [turkiyeTrendLoading, setTurkiyeTrendLoading] = useState(true);

  const tabs = [
    { id: 'genel', label: 'Genel' },
    { id: 'talep', label: 'Talep' },
    { id: 'nufus', label: 'Nüfus' },
    { id: 'risk', label: 'Risk' },
    { id: 'yatirim', label: 'Yatırım' }
  ];

  // Mock data for score cards
  const scoreCards = [
    { title: 'Konut', value: 85, change: 12, changeType: 'increase' },
    { title: 'Al & Sat', value: 78, change: 5, changeType: 'increase' },
    { title: 'Al & Kirala', value: 92, change: 8, changeType: 'increase' },
    { title: 'Al & Otur', value: 87, change: 10, changeType: 'increase' }
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

  // ECharts option - Gerçek API verisi ile
  const getChartOption = () => {
    // Eğer Türkiye trend verisi yüklendiyse onu kullan
    if (turkiyeTrend && turkiyeTrend.trend && turkiyeTrend.trend.length > 0) {
      const aylar = turkiyeTrend.trend.map((item: any) => {
        const [yil, ay] = item.tarih.split('-');
        const ayIsmi = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][parseInt(ay) - 1];
        return ayIsmi;
      });
      
      const values = turkiyeTrend.trend.map((item: any) => item.final_m2);
      
      return {
        backgroundColor: 'transparent',
        grid: {
          left: '3%',
          right: '3%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: aylar,
          axisLine: {
            lineStyle: { color: 'rgba(255, 255, 255, 0.2)' }
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: { color: 'rgba(255, 255, 255, 0.1)', type: 'dashed' }
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 11,
            formatter: (value: number) => {
              return `${(value / 1000).toFixed(0)}K`;
            }
          }
        },
        series: [
          {
            data: values,
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 3,
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: '#8b5cf6' }
                ]
              }
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
                ]
              }
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          textStyle: { color: '#fff', fontSize: 12 },
          formatter: (params: any) => {
            const value = params[0].value;
            const formattedValue = `${value.toLocaleString('tr-TR')} ₺/m²`;
            return `${params[0].axisValue}<br/>${formattedValue}`;
          }
        }
      };
    }
    
    // Fallback: Mock data (yükleme sırasında)
    const dataKey = selectedMetric === 'm2' ? 'm2' : selectedMetric === 'satis' ? 'satis' : 'kira';
    const values = chartData.map(d => d[dataKey]);
    
    return {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '3%',
        top: '10%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.ay),
        axisLine: {
          lineStyle: { color: 'rgba(255, 255, 255, 0.2)' }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: { color: 'rgba(255, 255, 255, 0.1)', type: 'dashed' }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11,
          formatter: (value: number) => {
            if (selectedMetric === 'kira') return `%${value.toFixed(1)}`;
            if (selectedMetric === 'm2') return `${(value / 1000).toFixed(0)}K`;
            return `${value.toFixed(1)}M`;
          }
        }
      },
      series: [
        {
          data: values,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#8b5cf6' }
              ]
            }
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
              ]
            }
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          const value = params[0].value;
          let formattedValue = '';
          if (selectedMetric === 'kira') formattedValue = `%${value.toFixed(1)}`;
          else if (selectedMetric === 'm2') formattedValue = `${value.toLocaleString('tr-TR')} ₺/m²`;
          else formattedValue = `${value.toFixed(2)}M ₺`;
          return `${params[0].axisValue}<br/>${formattedValue}`;
        }
      }
    };
  };
  
  // Sidebar genişliği + boşluklar
  // Açık: 20px (sol) + 280px (sidebar) + 20px (arası) = 320px
  // Kapalı: 20px (sol) + 80px (sidebar) + 20px (arası) = 120px
  const sidebarWidth = sidebarOpen ? 320 : 120;

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

  // İl tıklama handler
  const handleIlClick = (ilAdi: string, layer: any) => {
    setSelectedIl(ilAdi);
    setIlceSinirlari(true); // İlçe katmanını otomatik aç
    setAnalysisTitle(`${ilAdi} Analizi`); // Başlığı güncelle
    
    // Haritayı zoom yap - layer'dan map instance'ını al
    const map = layer._map;
    if (map) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      setSelectedIlCenter([center.lat, center.lng]); // Merkez koordinatları kaydet
      
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 10,
        animate: true,
        duration: 1
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Min %30, Max %70
      if (newPosition >= 30 && newPosition <= 70) {
        setSplitPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Text seçimini yeniden aktif et
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isResizing) {
      // Text seçimini devre dışı bırak
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Cleanup: Text seçimini tekrar aktif et
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

  // İl fiyatlarını çek
  useEffect(() => {
    const fetchIlFiyatlari = async () => {
      try {
        setIlFiyatlariLoading(true);
        const data = await getIlFiyatlari('konut');
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
  }, []);

  // Türkiye geneli trend verisi çek
  useEffect(() => {
    const fetchTurkiyeTrend = async () => {
      try {
        setTurkiyeTrendLoading(true);
        const data = await getIlTrend('TURKIYE', 'konut', 'satilik', 61);
        setTurkiyeTrend(data);
      } catch (error) {
        console.error('Türkiye trend çekilemedi:', error);
      } finally {
        setTurkiyeTrendLoading(false);
      }
    };

    fetchTurkiyeTrend();
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
          className="absolute top-0 left-0 bottom-0 overflow-y-auto"
          style={{ width: `${splitPosition}%` }}
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
                {propertyType}
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
                <>
                  <div className="grid grid-cols-4 gap-4">
                    {scoreCards.map((card, index) => (
                      <div
                        key={index}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0"
                      >
                        {/* Üst Satır: Başlık ve Değişim */}
                        <div className="flex items-start justify-between mb-4">
                          <p className="text-white/60 text-xs truncate">{card.title}</p>
                          <span className={`text-xs font-medium flex-shrink-0 ml-2 ${card.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                            {card.change > 0 ? '↑' : '↓'} {Math.abs(card.change)}%
                          </span>
                        </div>
                        
                        {/* Alt Kısım: Skor ve Grafik */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white text-3xl font-semibold flex-shrink-0">{card.value}</p>
                          <div className="flex-shrink-0">
                            <svg width="60" height="60" viewBox="0 0 60 60" className="transform -rotate-90 max-w-full">
                              <circle
                                cx="30"
                                cy="30"
                                r="25"
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="6"
                              />
                              <circle
                                cx="30"
                                cy="30"
                                r="25"
                                fill="none"
                                stroke={card.value >= 85 ? '#10b981' : card.value >= 70 ? '#3b82f6' : '#f59e0b'}
                                strokeWidth="6"
                                strokeDasharray={`${(card.value / 100) * 157} 157`}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skor Açıklama Kartı */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                    {/* Gradient Bar */}
                    <div className="relative h-2 rounded-full overflow-hidden mb-2" style={{
                      background: 'linear-gradient(to right, #ef4444 0%, #f97316 20%, #eab308 40%, #84cc16 60%, #22c55e 80%, #10b981 100%)'
                    }}>
                      {/* Skor İndikatörü - Glass Balon */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center transition-all duration-300"
                        style={{ left: `${(scoreCards.reduce((acc, card) => acc + card.value, 0) / scoreCards.length)}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <span className="text-white text-[10px] font-bold">
                          {Math.round(scoreCards.reduce((acc, card) => acc + card.value, 0) / scoreCards.length)}
                        </span>
                      </div>
                    </div>

                    {/* Açıklama Etiketleri */}
                    <div className="flex justify-between items-center text-[9px]">
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

                  {/* Line Chart Kartı */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-sm font-medium">m² Fiyat Trendi</h3>
                      <select 
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="bg-white/10 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="m2">m² Fiyatı</option>
                        <option value="satis">Satış Fiyatı</option>
                        <option value="kira">Kira Getirisi</option>
                      </select>
                    </div>
                    <div className="h-80">
                      <ReactECharts 
                        option={getChartOption()} 
                        style={{ height: '100%', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                      />
                    </div>
                    
                    {/* Disclaimer */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="space-y-2 text-[10px] text-white/40 leading-relaxed">
                        <p>
                          <span className="text-white/50 font-medium">* emlaXAI Sorumluluk Reddi:</span> Bu ekranda sunulan tüm analiz, skor, tahmin ve grafik verileri; Tapu ve Kadastro Genel Müdürlüğü (TKGM), TÜİK, belediyeler, açık devlet kaynakları, ilan portalları, üçüncü taraf veri sağlayıcıları ve kullanıcı girdileri gibi farklı kaynaklardan derlenerek yapay zekâ destekli algoritmalar ile işlenmektedir.
                        </p>
                        <p>
                          Sunulan bilgiler <span className="text-white/50">bilgilendirme ve analiz amaçlıdır</span>; hiçbir şekilde kesin yatırım tavsiyesi, alım-satım yönlendirmesi veya hukuki/mali danışmanlık niteliği taşımaz. Veriler sapmalar içerebilir ve son 3 aylık periyotta yeni verilerin eklenmesiyle değişiklik gösterebilir.
                        </p>
                        <p>
                          Bu bilgilerin bir yatırım veya ticarete konu edilmesi halinde emlaXAI hiçbir sorumluluk üstlenmez.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'talep' && (
                <>
                  {/* EN PAHALI vs EN UYGUN 10 İL */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-4">
                    <h3 className="text-white text-lg font-semibold mb-5">Fiyat Ligi: En Pahalı vs En Uygun İller</h3>
                    
                    {ilFiyatlariLoading ? (
                      <div className="flex items-center justify-center h-64 text-white/60 text-sm animate-pulse">
                        İl fiyatları yükleniyor...
                      </div>
                    ) : ilFiyatlari ? (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                          {/* EN PAHALI */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <h4 className="text-white/80 text-sm font-semibold">EN PAHALI 10 İL</h4>
                            </div>
                            <div className="space-y-2">
                              {ilFiyatlari.iller.slice(0, 10).map((item, index) => {
                                const maxPrice = ilFiyatlari.iller[0].m2_fiyat;
                                return (
                                  <div key={item.il} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/40 text-xs font-mono w-6">{index + 1}.</span>
                                      <span className="text-white text-sm capitalize">{item.il}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500" 
                                           style={{ width: `${(item.m2_fiyat / maxPrice) * 100}px` }}></div>
                                      <span className="text-white font-semibold text-sm">{(item.m2_fiyat / 1000).toFixed(1)}K ₺</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* EN UYGUN */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <h4 className="text-white/80 text-sm font-semibold">EN UYGUN 10 İL</h4>
                            </div>
                            <div className="space-y-2">
                              {ilFiyatlari.iller.slice(-10).reverse().map((item, index) => {
                                const maxPriceInCheap = ilFiyatlari.iller[ilFiyatlari.iller.length - 1].m2_fiyat;
                                return (
                                  <div key={item.il} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/40 text-xs font-mono w-6">{index + 1}.</span>
                                      <span className="text-white text-sm capitalize">{item.il}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" 
                                           style={{ width: `${(item.m2_fiyat / maxPriceInCheap) * 100}px` }}></div>
                                      <span className="text-white font-semibold text-sm">{(item.m2_fiyat / 1000).toFixed(1)}K ₺</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Fark Göstergesi */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/60">
                          <span>Fark:</span>
                          <span className="text-white font-semibold">
                            {(ilFiyatlari.iller[0].m2_fiyat / ilFiyatlari.iller[ilFiyatlari.iller.length - 1].m2_fiyat).toFixed(1)}x
                          </span>
                          <span>({ilFiyatlari.iller[0].il} / {ilFiyatlari.iller[ilFiyatlari.iller.length - 1].il})</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
                        {ilFiyatlariError || 'İl fiyatları yüklenemedi'}
                      </div>
                    )}
                  </div>

                  {/* En Çok İlgi Gören İller */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white text-lg font-semibold">En Çok İlgi Gören İller</h3>
                      <span className="text-blue-400 text-xs font-semibold bg-blue-500/10 px-3 py-1 rounded-full">
                        Son 30 Günde
                      </span>
                    </div>
                    <div className="h-96">
                      {typeof window !== 'undefined' && (
                        <ReactECharts 
                          option={{
                            backgroundColor: 'transparent',
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              borderWidth: 1,
                              textStyle: { color: '#fff' },
                              axisPointer: { type: 'shadow' }
                            },
                            legend: {
                              data: ['Yerli İlgi', 'Yabancı İlgi'],
                              textStyle: { color: 'rgba(255,255,255,0.8)' },
                              top: 0
                            },
                            grid: {
                              left: '15%',
                              right: '4%',
                              bottom: '3%',
                              top: '12%',
                              containLabel: false
                            },
                            xAxis: {
                              type: 'value',
                              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                              axisLabel: { 
                                color: 'rgba(255,255,255,0.6)',
                                formatter: (value: number) => `${(value / 1000).toFixed(0)}K`
                              },
                              splitLine: {
                                lineStyle: {
                                  color: 'rgba(255,255,255,0.1)',
                                  type: 'dashed'
                                }
                              }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Kocaeli', 'Adana', 'Muğla', 'Mersin', 'Konya'],
                              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                              axisLabel: { color: 'rgba(255,255,255,0.8)' },
                              splitLine: { show: false }
                            },
                            series: [
                              {
                                name: 'Yerli İlgi',
                                type: 'bar',
                                data: [2500, 850, 620, 450, 380, 320, 285, 240, 215, 190],
                                itemStyle: {
                                  color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 1,
                                    y2: 0,
                                    colorStops: [
                                      { offset: 0, color: '#3b82f6' },
                                      { offset: 1, color: '#60a5fa' }
                                    ]
                                  },
                                  borderRadius: [0, 4, 4, 0]
                                }
                              },
                              {
                                name: 'Yabancı İlgi',
                                type: 'bar',
                                data: [450, 180, 320, 520, 85, 95, 70, 310, 60, 45],
                                itemStyle: {
                                  color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 1,
                                    y2: 0,
                                    colorStops: [
                                      { offset: 0, color: '#f59e0b' },
                                      { offset: 1, color: '#fbbf24' }
                                    ]
                                  },
                                  borderRadius: [0, 4, 4, 0]
                                }
                              }
                            ]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Piyasa Metrikleri - 4'lü */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {/* Ortalama Satış Süresi */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Ort. Satış Süresi</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">32 Gün</p>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500 text-xs font-semibold">↓ %15</span>
                        <span className="text-white/40 text-xs">3 aylık</span>
                      </div>
                    </div>

                    {/* Ortalama m² Fiyat */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="14" height="14" viewBox="0 0 440 440" fill="#10b981" className="flex-shrink-0 mt-1">
                          <path d="M344.33,212.5c0,103.857-80.577,189.248-182.5,196.936V197.361l151.76-55.236l-10.26-28.191l-141.5,51.502V121.38l151.76-55.236l-10.26-28.191l-141.5,51.502V0h-30v100.374l-66.16,24.08l10.261,28.191L131.83,132.3v44.055l-66.16,24.08l10.261,28.191l55.899-20.346V440h15c60.813,0,117.957-23.651,160.902-66.597c42.946-42.946,66.598-100.089,66.598-160.903H344.33z"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Ort. m² Fiyat</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">35.8K ₺</p>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500 text-xs font-semibold">↑ %6.2</span>
                        <span className="text-white/40 text-xs">Yıllık</span>
                      </div>
                    </div>

                    {/* Stok Değişimi */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="18" height="18" viewBox="0 0 50.8 50.8" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                          <path d="M7.854 33.546 16 22.893l7.52 16.293 6.267-27.572 3.76 8.773 5.64-6.893 3.76 8.146"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Stok Değişimi</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">+8.5%</p>
                      <div className="flex items-center gap-1">
                        <span className="text-orange-500 text-xs font-semibold">↑ Artış</span>
                        <span className="text-white/40 text-xs">3 aylık</span>
                      </div>
                    </div>

                    {/* Talep/Arz Oranı */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Talep/Arz Oranı</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">1.8</p>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-500 text-xs font-semibold">Dengeli</span>
                        <span className="text-white/40 text-xs">Piyasa</span>
                      </div>
                    </div>
                  </div>

                  {/* En Yüksek İşlem Hacmi */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white text-lg font-semibold">En Yüksek İşlem Hacmi</h3>
                      <span className="text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
                        3 Ayın en yüksek seviyesinde
                      </span>
                    </div>
                    <div className="h-96">
                      {typeof window !== 'undefined' && (
                        <ReactECharts 
                          option={{
                            backgroundColor: 'transparent',
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              borderWidth: 1,
                              textStyle: { color: '#fff' },
                              axisPointer: { type: 'shadow' },
                              formatter: (params: any) => {
                                const data = params[0];
                                return `${data.name}<br/>İşlem Hacmi: <strong>${data.value}M ₺</strong>`;
                              }
                            },
                            grid: {
                              left: '15%',
                              right: '4%',
                              bottom: '3%',
                              top: '3%',
                              containLabel: false
                            },
                            xAxis: {
                              type: 'value',
                              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                              axisLabel: { 
                                color: 'rgba(255,255,255,0.6)',
                                formatter: (value: number) => `${value}M`
                              },
                              splitLine: {
                                lineStyle: {
                                  color: 'rgba(255,255,255,0.1)',
                                  type: 'dashed'
                                }
                              }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Kocaeli', 'Adana', 'Mersin', 'Muğla', 'Gaziantep'],
                              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                              axisLabel: { color: 'rgba(255,255,255,0.8)' },
                              splitLine: { show: false }
                            },
                            series: [
                              {
                                name: 'İşlem Hacmi',
                                type: 'bar',
                                data: [1850, 650, 480, 420, 385, 340, 310, 285, 260, 245],
                                itemStyle: {
                                  color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 1,
                                    y2: 0,
                                    colorStops: [
                                      { offset: 0, color: '#10b981' },
                                      { offset: 1, color: '#34d399' }
                                    ]
                                  },
                                  borderRadius: [0, 4, 4, 0]
                                },
                                barWidth: '60%'
                              }
                            ]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* TÜRKİYE MOMENTUM TABLOSU */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mt-4">
                    <h3 className="text-white text-lg font-semibold mb-4">Türkiye Piyasa Momentum Tablosu</h3>
                    
                    {ilFiyatlariLoading ? (
                      <div className="flex items-center justify-center h-64 text-white/60 text-sm animate-pulse">
                        Momentum verileri yükleniyor...
                      </div>
                    ) : ilFiyatlari ? (
                      <>
                        {/* Tablo */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left text-white/60 font-medium py-3 px-2">#</th>
                                <th className="text-left text-white/60 font-medium py-3 px-2">İl</th>
                                <th className="text-right text-white/60 font-medium py-3 px-2">m² Fiyat</th>
                                <th className="text-right text-white/60 font-medium py-3 px-2">12 Ay Artış</th>
                                <th className="text-center text-white/60 font-medium py-3 px-2">Momentum</th>
                                <th className="text-center text-white/60 font-medium py-3 px-2">Yapay Zeka<br/>Puanı</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ilFiyatlari.iller.slice(0, showAll81Cities ? ilFiyatlari.total : 20).map((item, index) => {
                                // AI Skoru hesaplama (momentum + trend + fiyat)
                                const priceScore = (item.m2_fiyat / ilFiyatlari.iller[0].m2_fiyat) * 40; // Max 40 puan
                                const trendScore = Math.min(item.trend_12ay / 2, 40); // Max 40 puan
                                const momentumScore = item.momentum * 4; // Max 20 puan
                                const aiScore = Math.round(priceScore + trendScore + momentumScore);
                                
                                return (
                                  <tr key={item.il} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-2 text-white/40 font-mono">{index + 1}</td>
                                    <td className="py-3 px-2 text-white font-medium capitalize">{item.il}</td>
                                    <td className="py-3 px-2 text-white text-right">{(item.m2_fiyat / 1000).toFixed(1)}K ₺</td>
                                    <td className="py-3 px-2 text-right">
                                      <span className={`font-semibold ${
                                        item.trend_12ay >= 50 ? 'text-red-400' : 
                                        item.trend_12ay >= 30 ? 'text-orange-400' : 
                                        'text-green-400'
                                      }`}>
                                        +{item.trend_12ay.toFixed(1)}%
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <div className="flex justify-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <div 
                                            key={i} 
                                            className={`w-1.5 h-4 rounded-sm ${i < item.momentum ? 'bg-blue-500' : 'bg-white/10'}`}
                                          ></div>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className={`font-bold text-base ${
                                          aiScore >= 85 ? 'text-purple-400' : 
                                          aiScore >= 70 ? 'text-blue-400' : 
                                          'text-gray-400'
                                        }`}>
                                          {aiScore}
                                        </span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                                          {/* Büyük yıldız */}
                                          <path d="M12 2L13.5 6.5L18 8L13.5 9.5L12 14L10.5 9.5L6 8L10.5 6.5L12 2Z" 
                                                fill={aiScore >= 85 ? '#a78bfa' : aiScore >= 70 ? '#60a5fa' : '#9ca3af'} 
                                                stroke={aiScore >= 85 ? '#8b5cf6' : aiScore >= 70 ? '#3b82f6' : '#6b7280'} 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"/>
                                          {/* Küçük yıldız sağ üst */}
                                          <path d="M18 4L18.7 5.3L20 6L18.7 6.7L18 8L17.3 6.7L16 6L17.3 5.3L18 4Z" 
                                                fill={aiScore >= 85 ? '#c4b5fd' : aiScore >= 70 ? '#93c5fd' : '#d1d5db'} 
                                                strokeWidth="0"/>
                                          {/* Küçük yıldız sol alt */}
                                          <path d="M7 16L7.7 17.3L9 18L7.7 18.7L7 20L6.3 18.7L5 18L6.3 17.3L7 16Z" 
                                                fill={aiScore >= 85 ? '#c4b5fd' : aiScore >= 70 ? '#93c5fd' : '#d1d5db'} 
                                                strokeWidth="0"/>
                                        </svg>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Alt Bilgi */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className="w-1.5 h-3 rounded-sm bg-blue-500"></div>
                                ))}
                              </div>
                              <span>Çok Güçlü</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div key={i} className="w-1.5 h-3 rounded-sm bg-blue-500"></div>
                                ))}
                              </div>
                              <span>Orta</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                <div className="w-1.5 h-3 rounded-sm bg-blue-500"></div>
                              </div>
                              <span>Zayıf</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{showAll81Cities ? `Tüm ${ilFiyatlari.total} İl` : 'Top 20 İl'} Gösteriliyor</span>
                            <button
                              onClick={() => setShowAll81Cities(!showAll81Cities)}
                              className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 transition-colors outline-none focus:outline-none group"
                              title={showAll81Cities ? 'Daha Az Göster' : `Tümünü Göster (${ilFiyatlari.total} İl)`}
                            >
                              <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className={`text-white/60 group-hover:text-white transition-all duration-200 ${showAll81Cities ? 'rotate-180' : ''}`}
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
                        {ilFiyatlariError || 'Momentum verileri yüklenemedi'}
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'nufus' && (
                <>
                  {/* Genel Nüfus Kartları - 4'lü Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Toplam Nüfus */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <p className="text-white/60 text-xs font-medium truncate">Toplam Nüfus</p>
                      </div>
                      <p className="text-white text-lg font-bold">85.3M</p>
                      <p className="text-green-500 text-sm font-medium mt-1">↑ %0.8 (Yıllık)</p>
                    </div>

                    {/* Kadın/Erkek Oranı */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <circle cx="12" cy="8" r="7"></circle>
                          <polyline points="12 15 12 21"></polyline>
                          <polyline points="8 21 16 21"></polyline>
                        </svg>
                        <p className="text-white/60 text-xs font-medium truncate">Kadın/Erkek Oranı</p>
                      </div>
                      <div className="flex items-center gap-1 justify-start flex-wrap">
                        <p className="text-pink-400 text-lg font-bold">49.7%</p>
                        <span className="text-white/40 text-xs">/</span>
                        <p className="text-blue-400 text-lg font-bold">50.3%</p>
                      </div>
                      <p className="text-white/60 text-xs mt-1">Dengeli dağılım</p>
                    </div>

                    {/* Kişi Başı Gelir */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="14" height="14" viewBox="0 0 440 440" fill="#10b981" className="flex-shrink-0">
                          <path d="M344.33,212.5c0,103.857-80.577,189.248-182.5,196.936V197.361l151.76-55.236l-10.26-28.191l-141.5,51.502V121.38l151.76-55.236l-10.26-28.191l-141.5,51.502V0h-30v100.374l-66.16,24.08l10.261,28.191L131.83,132.3v44.055l-66.16,24.08l10.261,28.191l55.899-20.346V440h15c60.813,0,117.957-23.651,160.902-66.597c42.946-42.946,66.598-100.089,66.598-160.903H344.33z"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium truncate">Kişi Başı Gelir</p>
                      </div>
                      <p className="text-white text-lg font-bold">$12.5K</p>
                      <p className="text-green-500 text-sm font-medium mt-1">↑ %7.2 (Yıllık)</p>
                    </div>

                    {/* Ortalama Hanehalkı */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <p className="text-white/60 text-xs font-medium truncate">Ort. Hanehalkı</p>
                      </div>
                      <p className="text-white text-lg font-bold">3.2</p>
                      <p className="text-white/60 text-sm mt-1">Kişi/Hane</p>
                    </div>
                  </div>

                  {/* Grafikler - 2x2 Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Yaşa Göre Nüfus Dağılımı */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Yaşa Göre Nüfus Dağılımı</h3>
                      <div className="h-64">
                        <ReactECharts
                          option={{
                            grid: { top: 10, right: 40, bottom: 50, left: 60 },
                            xAxis: {
                              type: 'value',
                              axisLabel: { color: '#9ca3af', fontSize: 11 },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['0-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65+'],
                              axisLabel: { color: '#9ca3af', fontSize: 11 }
                            },
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' }
                            },
                            series: [
                              {
                                name: 'Erkek',
                                type: 'bar',
                                stack: 'total',
                                data: [-11.2, -8.5, -9.8, -8.2, -6.9, -5.4, -4.3],
                                itemStyle: { color: '#3b82f6' },
                                label: { show: false }
                              },
                              {
                                name: 'Kadın',
                                type: 'bar',
                                stack: 'total',
                                data: [10.8, 8.2, 9.5, 8.0, 6.7, 5.2, 4.8],
                                itemStyle: { color: '#ec4899' },
                                label: { show: false }
                              }
                            ],
                            legend: {
                              data: ['Erkek', 'Kadın'],
                              textStyle: { color: '#9ca3af', fontSize: 11 },
                              bottom: 5,
                              left: 'center'
                            }
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* Sosyoekonomik Statü */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Sosyoekonomik Statü Dağılımı</h3>
                      <div className="h-64">
                        <ReactECharts
                          option={{
                            grid: { top: 20, right: 20, bottom: 30, left: 60 },
                            xAxis: {
                              type: 'value',
                              axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '{value}%' },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['E (En Düşük)', 'D', 'C2', 'C1', 'B', 'A (En Yüksek)'],
                              axisLabel: { color: '#9ca3af', fontSize: 11 }
                            },
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' },
                              formatter: '{b}: {c}%'
                            },
                            series: [{
                              type: 'bar',
                              data: [8, 22, 28, 24, 12, 6],
                              itemStyle: {
                                color: {
                                  type: 'linear',
                                  x: 0, y: 0, x2: 1, y2: 0,
                                  colorStops: [
                                    { offset: 0, color: '#ef4444' },
                                    { offset: 0.5, color: '#f59e0b' },
                                    { offset: 1, color: '#10b981' }
                                  ]
                                }
                              },
                              barWidth: '60%'
                            }]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* Hanehalkı Gelir Dağılımı */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Hanehalkı Gelir Dağılımı</h3>
                      <div className="h-64">
                        <ReactECharts
                          option={{
                            tooltip: {
                              trigger: 'item',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' },
                              formatter: '{b}: {c}% ({d}%)'
                            },
                            legend: {
                              orient: 'vertical',
                              right: 5,
                              top: 'middle',
                              textStyle: { color: '#9ca3af', fontSize: 10 },
                              itemGap: 8,
                              itemWidth: 12,
                              itemHeight: 12
                            },
                            series: [{
                              type: 'pie',
                              radius: ['40%', '65%'],
                              center: ['38%', '50%'],
                              data: [
                                { value: 15, name: '0-5K ₺', itemStyle: { color: '#ef4444' } },
                                { value: 25, name: '5K-10K ₺', itemStyle: { color: '#f97316' } },
                                { value: 30, name: '10K-20K ₺', itemStyle: { color: '#f59e0b' } },
                                { value: 20, name: '20K-40K ₺', itemStyle: { color: '#84cc16' } },
                                { value: 10, name: '40K+ ₺', itemStyle: { color: '#10b981' } }
                              ],
                              label: { show: false }
                            }]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* Medeni Durum Dağılımı */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Medeni Durum Dağılımı</h3>
                      <div className="h-64">
                        <ReactECharts
                          option={{
                            grid: { top: 20, right: 20, bottom: 30, left: 80 },
                            xAxis: {
                              type: 'value',
                              axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '{value}%' },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['Bekar', 'Evli', 'Boşanmış', 'Dul'],
                              axisLabel: { color: '#9ca3af', fontSize: 11 }
                            },
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' },
                              formatter: '{b}: {c}%'
                            },
                            series: [{
                              type: 'bar',
                              data: [
                                { value: 32, itemStyle: { color: '#3b82f6' } },
                                { value: 58, itemStyle: { color: '#10b981' } },
                                { value: 6, itemStyle: { color: '#f59e0b' } },
                                { value: 4, itemStyle: { color: '#6b7280' } }
                              ],
                              barWidth: '60%'
                            }]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Göç Analizi - 2 Büyük Kart */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* En Çok Göç Alan İller */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-base font-semibold">En Çok Göç Alan İller</h3>
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md">+Artış</span>
                      </div>
                      <div className="h-80">
                        <ReactECharts
                          option={{
                            grid: { top: 10, right: 60, bottom: 30, left: 80 },
                            xAxis: {
                              type: 'value',
                              axisLabel: { color: '#9ca3af', fontSize: 11 },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['Hatay', 'Tekirdağ', 'Antalya', 'Kocaeli', 'Bursa', 'Eskişehir', 'Muğla', 'Ankara', 'İzmir', 'İstanbul'],
                              axisLabel: { color: '#9ca3af', fontSize: 11 }
                            },
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' },
                              formatter: '{b}: +{c} bin kişi'
                            },
                            series: [{
                              type: 'bar',
                              data: [45, 52, 68, 72, 85, 89, 95, 125, 178, 245],
                              itemStyle: {
                                color: {
                                  type: 'linear',
                                  x: 0, y: 0, x2: 1, y2: 0,
                                  colorStops: [
                                    { offset: 0, color: '#10b981' },
                                    { offset: 1, color: '#22c55e' }
                                  ]
                                },
                                borderRadius: [0, 4, 4, 0]
                              },
                              barWidth: '70%',
                              label: {
                                show: true,
                                position: 'right',
                                color: '#10b981',
                                fontSize: 11,
                                formatter: '+{c}K'
                              }
                            }]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* En Çok Göç Veren İller */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-base font-semibold">En Çok Göç Veren İller</h3>
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md">-Azalış</span>
                      </div>
                      <div className="h-80">
                        <ReactECharts
                          option={{
                            grid: { top: 10, right: 60, bottom: 30, left: 80 },
                            xAxis: {
                              type: 'value',
                              axisLabel: { color: '#9ca3af', fontSize: 11 },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['Ağrı', 'Şanlıurfa', 'Diyarbakır', 'Van', 'Sivas', 'Erzurum', 'Malatya', 'Ordu', 'Samsun', 'Kars'],
                              axisLabel: { color: '#9ca3af', fontSize: 11 }
                            },
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' },
                              formatter: '{b}: -{c} bin kişi'
                            },
                            series: [{
                              type: 'bar',
                              data: [28, 32, 38, 42, 45, 48, 52, 58, 62, 68],
                              itemStyle: {
                                color: {
                                  type: 'linear',
                                  x: 0, y: 0, x2: 1, y2: 0,
                                  colorStops: [
                                    { offset: 0, color: '#ef4444' },
                                    { offset: 1, color: '#dc2626' }
                                  ]
                                },
                                borderRadius: [0, 4, 4, 0]
                              },
                              barWidth: '70%',
                              label: {
                                show: true,
                                position: 'right',
                                color: '#ef4444',
                                fontSize: 11,
                                formatter: '-{c}K'
                              }
                            }]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'risk' && (
                <>
                  {/* Ekonomik Göstergeler - 6'lı Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    {economicDataLoading ? (
                      <>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 animate-pulse">
                            <div className="h-3 bg-white/10 rounded mb-2 w-16"></div>
                            <div className="h-5 bg-white/10 rounded mb-1 w-20"></div>
                            <div className="h-3 bg-white/10 rounded w-12"></div>
                          </div>
                        ))}
                      </>
                    ) : economicData ? (
                      <>
                        {/* Dolar/TL */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-3 overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            <p className="text-white/60 text-xs font-medium truncate">Dolar/TL</p>
                          </div>
                          <p className="text-white text-lg font-bold">₺{formatNumber(economicData.live_data.usd_try.value)}</p>
                          <p className={`${getChangeColor(economicData.live_data.usd_try.change)} text-xs font-medium mt-0.5`}>
                            {economicData.live_data.usd_try.change >= 0 ? '↑' : '↓'} {formatChange(economicData.live_data.usd_try.change)}
                          </p>
                        </div>

                        {/* Euro/TL */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-3 overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6" className="flex-shrink-0">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12ZM6.80317 11.25C6.76813 11.495 6.75 11.7454 6.75 12C6.75 12.2546 6.76813 12.505 6.80317 12.75H10C10.4142 12.75 10.75 13.0858 10.75 13.5C10.75 13.9142 10.4142 14.25 10 14.25H7.25522C8.09782 16.0237 9.9057 17.25 12 17.25C12.9575 17.25 13.853 16.9944 14.6245 16.5481C14.983 16.3407 15.4418 16.4632 15.6492 16.8218C15.8566 17.1803 15.7341 17.6391 15.3755 17.8465C14.3819 18.4213 13.2282 18.75 12 18.75C9.06101 18.75 6.56072 16.8717 5.63409 14.25H5C4.58579 14.25 4.25 13.9142 4.25 13.5C4.25 13.0858 4.58579 12.75 5 12.75H5.2912C5.26398 12.5037 5.25 12.2535 5.25 12C5.25 11.7465 5.26398 11.4963 5.2912 11.25H5C4.58579 11.25 4.25 10.9142 4.25 10.5C4.25 10.0858 4.58579 9.75 5 9.75H5.63409C6.56072 7.12832 9.06101 5.25 12 5.25C13.2282 5.25 14.3819 5.57872 15.3755 6.15349C15.7341 6.3609 15.8566 6.81969 15.6492 7.17824C15.4418 7.53678 14.983 7.65931 14.6245 7.4519C13.853 7.00564 12.9575 6.75 12 6.75C9.9057 6.75 8.09782 7.97629 7.25522 9.75H10C10.4142 9.75 10.75 10.0858 10.75 10.5C10.75 10.9142 10.4142 11.25 10 11.25H6.80317Z"/>
                            </svg>
                            <p className="text-white/60 text-xs font-medium truncate">Euro/TL</p>
                          </div>
                          <p className="text-white text-lg font-bold">₺{formatNumber(economicData.live_data.eur_try.value)}</p>
                          <p className={`${getChangeColor(economicData.live_data.eur_try.change)} text-xs font-medium mt-0.5`}>
                            {economicData.live_data.eur_try.change >= 0 ? '↑' : '↓'} {formatChange(economicData.live_data.eur_try.change)}
                          </p>
                        </div>

                        {/* Altın */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-3 overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" className="flex-shrink-0">
                              <path d="M21.7549,16.23l-.6035-4.0239A1.504,1.504,0,0,0,19.6807,11H16.6259a1.4144,1.4144,0,0,0,.0567-.8247l-.5078-3.04A1.5,1.5,0,0,0,14.7188,6H9.2812A1.5081,1.5081,0,0,0,7.8174,7.1753l-.4922,2.9614a1.4869,1.4869,0,0,0,.05.8633H4.3193A1.5092,1.5092,0,0,0,2.8447,12.23L2.249,16.2056A1.5,1.5,0,0,0,3.72,18H10.28a1.4947,1.4947,0,0,0,1.16-.5493,1.4772,1.4772,0,0,0,.3145-1.2212l-.6035-4.0239a1.4225,1.4225,0,0,0-.08-.2056h1.8618a1.493,1.493,0,0,0-.0882.2295l-.5957,3.9761A1.5,1.5,0,0,0,13.72,18H20.28a1.4947,1.4947,0,0,0,1.16-.5493A1.4772,1.4772,0,0,0,21.7549,16.23ZM8.3867,10.8081a.5263.5263,0,0,1-.083-.4687l.4922-2.96A.4991.4991,0,0,1,9.2812,7h5.4376a.4948.4948,0,0,1,.4775.3394l.5078,3.0385A.5.5,0,0,1,15.2188,11H8.7812A.4978.4978,0,0,1,8.3867,10.8081Zm1.78,1.57.6035,4.024A.5.5,0,0,1,10.28,17H3.72a.4992.4992,0,0,1-.3867-.1831.5148.5148,0,0,1-.1-.439l.5957-3.976A.5015.5015,0,0,1,4.3193,12H9.6807A.4978.4978,0,0,1,10.167,12.3779Zm10.5,4.439A.4992.4992,0,0,1,20.28,17H13.72a.4992.4992,0,0,1-.3867-.1831.5148.5148,0,0,1-.1-.439l.5957-3.976a.5015.5015,0,0,1,.49-.4019h5.3614a.4978.4978,0,0,1,.4863.3779l.6035,4.024A.4975.4975,0,0,1,20.667,16.8169Z"/>
                            </svg>
                            <p className="text-white/60 text-xs font-medium truncate">Altın (gr)</p>
                          </div>
                          <p className="text-white text-lg font-bold">₺{formatNumber(economicData.live_data.gold_gram_try.value, 0)}</p>
                          <p className={`${getChangeColor(economicData.live_data.gold_gram_try.change)} text-xs font-medium mt-0.5`}>
                            {economicData.live_data.gold_gram_try.change >= 0 ? '↑' : '↓'} {formatChange(economicData.live_data.gold_gram_try.change)}
                          </p>
                        </div>

                        {/* Enflasyon */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-3 overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                              <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            <p className="text-white/60 text-xs font-medium truncate">Enflasyon</p>
                          </div>
                          <p className="text-white text-lg font-bold">%{formatNumber(economicData.inflation.yearly)}</p>
                          <p className="text-orange-500 text-xs font-medium mt-0.5">Yıllık</p>
                        </div>

                        {/* Faiz Oranı */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-3 overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            <p className="text-white/60 text-xs font-medium truncate">Faiz Oranı</p>
                          </div>
                          <p className="text-white text-lg font-bold">%{formatNumber(economicData.interest_rate.value)}</p>
                          <p className="text-white/60 text-xs font-medium mt-0.5">TCMB</p>
                        </div>

                        {/* Emlak Endeksi - BIST100 ile güncellendi */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-3 overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <svg width="12" height="12" viewBox="0 0 1024 1024" fill="#06b6d4" className="flex-shrink-0">
                              <path d="M904 747H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM165.7 621.8l39.7 39.5c3.1 3.1 8.2 3.1 11.3 0l234.7-233.9 97.6 97.3a32.11 32.11 0 0 0 45.2 0l264.2-263.2c3.1-3.1 3.1-8.2 0-11.3l-39.7-39.6a8.03 8.03 0 0 0-11.3 0l-235.7 235-97.7-97.3a32.11 32.11 0 0 0-45.2 0L165.7 610.5a7.94 7.94 0 0 0 0 11.3z"/>
                            </svg>
                            <p className="text-white/60 text-xs font-medium truncate">BIST 100</p>
                          </div>
                          <p className="text-white text-lg font-bold">{formatNumber(economicData.live_data.bist100.value, 0)}</p>
                          <p className={`${getChangeColor(economicData.live_data.bist100.change)} text-xs font-medium mt-0.5`}>
                            {economicData.live_data.bist100.change >= 0 ? '↑' : '↓'} {formatChange(economicData.live_data.bist100.change)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-full text-center text-red-500 text-sm py-4">
                        Veriler yüklenemedi
                      </div>
                    )}
                  </div>

                  {/* Grafikler - 2x2 Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Döviz Kurları Trend */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Döviz Kurları (Son 12 Ay)</h3>
                      <div className="h-64">
                        {economicData ? (
                          <ReactECharts
                            option={{
                              grid: { top: 40, right: 20, bottom: 50, left: 50 },
                              xAxis: {
                                type: 'category',
                                data: economicData.historical_forex.usd_try.map(d => d.month.split(' ')[0]),
                                axisLabel: { color: '#9ca3af', fontSize: 11 }
                              },
                              yAxis: {
                                type: 'value',
                                axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '₺{value}' },
                                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                              },
                              tooltip: {
                                trigger: 'axis',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                borderColor: 'rgba(255,255,255,0.2)',
                                textStyle: { color: '#fff' },
                                formatter: (params: any) => {
                                  let result = `<div style="font-size: 12px; font-weight: bold;">${params[0].axisValue}</div>`;
                                  params.forEach((param: any) => {
                                    result += `<div style="margin-top: 4px;">${param.marker} ${param.seriesName}: ₺${param.value.toFixed(2)}</div>`;
                                  });
                                  return result;
                                }
                              },
                              legend: {
                                data: ['Dolar', 'Euro'],
                                textStyle: { color: '#9ca3af', fontSize: 11 },
                                top: 5
                              },
                              series: [
                                {
                                  name: 'Dolar',
                                  type: 'line',
                                  data: economicData.historical_forex.usd_try.map(d => d.value),
                                  itemStyle: { color: '#10b981' },
                                  smooth: true
                                },
                                {
                                  name: 'Euro',
                                  type: 'line',
                                  data: economicData.historical_forex.eur_try.map(d => d.value),
                                  itemStyle: { color: '#3b82f6' },
                                  smooth: true
                                }
                              ]
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white/60 text-sm animate-pulse">
                            Döviz kurları yükleniyor...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enflasyon vs Emlak Fiyat Artışı */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Enflasyon vs Emlak Fiyat Artışı</h3>
                      <div className="h-64">
                        {economicData ? (
                          <ReactECharts
                            option={{
                              grid: { top: 40, right: 60, bottom: 50, left: 50 },
                              xAxis: {
                                type: 'category',
                                data: economicData.historical_inflation_housing.inflation.map(d => d.month.split(' ')[0]),
                                axisLabel: { color: '#9ca3af', fontSize: 11 }
                              },
                              yAxis: [
                                {
                                  type: 'value',
                                  name: 'Oran (%)',
                                  axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '{value}%' },
                                  splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                                }
                              ],
                              tooltip: {
                                trigger: 'axis',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                borderColor: 'rgba(255,255,255,0.2)',
                                textStyle: { color: '#fff' },
                                formatter: (params: any) => {
                                  let result = `<div style="font-size: 12px; font-weight: bold;">${params[0].axisValue}</div>`;
                                  params.forEach((param: any) => {
                                    result += `<div style="margin-top: 4px;">${param.marker} ${param.seriesName}: %${param.value.toFixed(2)}</div>`;
                                  });
                                  return result;
                                }
                              },
                              legend: {
                                data: ['Enflasyon', 'Emlak Fiyat Artışı'],
                                textStyle: { color: '#9ca3af', fontSize: 11 },
                                top: 5
                              },
                              series: [
                                {
                                  name: 'Enflasyon',
                                  type: 'line',
                                  data: economicData.historical_inflation_housing.inflation.map(d => d.value),
                                  itemStyle: { color: '#ef4444' },
                                  smooth: true,
                                  areaStyle: { opacity: 0.1 }
                                },
                                {
                                  name: 'Emlak Fiyat Artışı',
                                  type: 'line',
                                  data: economicData.historical_inflation_housing.housing_price_increase.map(d => d.value),
                                  itemStyle: { color: '#06b6d4' },
                                  smooth: true,
                                  areaStyle: { opacity: 0.1 }
                                }
                              ]
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white/60 text-sm animate-pulse">
                            Enflasyon ve emlak verileri yükleniyor...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ekonomik Risk Skoru */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Ekonomik Risk Değerlendirmesi</h3>
                      {economicData ? (() => {
                        // Backend'den gelen risk skorlarını direkt kullan
                        const scores = economicData.risk_scores;
                        const levels = economicData.risk_levels;
                        
                        return (
                          <div className="space-y-4">
                            {/* Döviz Volatilitesi */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80 text-sm">Döviz Volatilitesi</span>
                                <span className={`${getRiskColor(scores.doviz_volatilitesi)} text-sm font-bold`}>
                                  {levels.doviz_volatilitesi.text} ({scores.doviz_volatilitesi})
                                </span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getRiskGradient(scores.doviz_volatilitesi)} rounded-full`}
                                  style={{ width: `${scores.doviz_volatilitesi}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Enflasyon Riski */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80 text-sm">Enflasyon Riski</span>
                                <span className={`${getRiskColor(scores.enflasyon_riski)} text-sm font-bold`}>
                                  {levels.enflasyon_riski.text} ({scores.enflasyon_riski})
                                </span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getRiskGradient(scores.enflasyon_riski)} rounded-full`}
                                  style={{ width: `${scores.enflasyon_riski}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Faiz Riski */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80 text-sm">Faiz Değişim Riski</span>
                                <span className={`${getRiskColor(scores.faiz_degisim_riski)} text-sm font-bold`}>
                                  {levels.faiz_degisim_riski.text} ({scores.faiz_degisim_riski})
                                </span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getRiskGradient(scores.faiz_degisim_riski)} rounded-full`}
                                  style={{ width: `${scores.faiz_degisim_riski}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Likidite Riski */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80 text-sm">Piyasa Likidite Riski</span>
                                <span className={`${getRiskColor(scores.piyasa_likidite_riski)} text-sm font-bold`}>
                                  {levels.piyasa_likidite_riski.text} ({scores.piyasa_likidite_riski})
                                </span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getRiskGradient(scores.piyasa_likidite_riski)} rounded-full`}
                                  style={{ width: `${scores.piyasa_likidite_riski}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Genel Ekonomik Risk */}
                            <div className="pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">GENEL EKONOMİK RİSK</span>
                                <span className={`${getRiskColor(scores.toplam_risk)} text-lg font-bold`}>
                                  {scores.toplam_risk}/100
                                </span>
                              </div>
                              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getRiskGradient(scores.toplam_risk)} rounded-full`}
                                  style={{ width: `${scores.toplam_risk}%` }}
                                ></div>
                              </div>
                              <p className="text-white/60 text-xs mt-2">
                                * {levels.toplam_risk.text} risk: {
                                  scores.toplam_risk >= 70 ? 'Dikkatli olmak gerekiyor' :
                                  scores.toplam_risk >= 50 ? 'Piyasa takibi öneriliyor' :
                                  'Makul risk seviyesi'
                                }
                              </p>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="text-center text-white/60 text-sm py-4 animate-pulse">
                          Risk skorları backend'den yükleniyor...
                        </div>
                      )}
                    </div>

                    {/* Doğal Afet Riskleri */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <h3 className="text-white text-base font-semibold mb-4">Doğal Afet Risk Haritası</h3>
                      <div className="space-y-3">
                        {/* Deprem */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 32 32" fill="#ef4444" className="flex-shrink-0">
                                <path d="M16.6123,2.2139a1.0094,1.0094,0,0,0-1.2427,0L1,13.4194l1.2427,1.5718L4,13.6211V26a2.0041,2.0041,0,0,0,2,2H26a2.0037,2.0037,0,0,0,2-2V13.63L29.7573,15,31,13.4282ZM6,12.0615,15,5.05v7.3638l3.458,3.458-6.7344,4.8105L14.3818,26H6ZM26,26H16.6182l-2.3418-4.6826,7.2656-5.1895L17,11.5859V5.0518l9,7.02Z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Deprem Riski</span>
                            </div>
                            <span className="text-red-400 text-sm font-bold">Yüksek</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: '82%' }}></div>
                          </div>
                        </div>

                        {/* Sel */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 32 32" fill="#3b82f6" className="flex-shrink-0">
                                <path d="M2.884 8.884l2.933-2.933c3.246 4.352 6.929 4.429 10.184 0.24 3.256 4.187 6.936 4.111 10.184-0.24l2.932 2.933c0.226 0.227 0.539 0.367 0.885 0.367 0.691 0 1.251-0.56 1.251-1.251 0-0.345-0.14-0.658-0.366-0.884v0l-4-4c-0.226-0.226-0.539-0.366-0.885-0.366-0.445 0-0.836 0.232-1.058 0.582l-0.003 0.005c-1.395 2.232-2.758 3.413-3.939 3.413s-2.545-1.181-3.94-3.413c-0.238-0.333-0.624-0.548-1.059-0.548s-0.822 0.215-1.057 0.545l-0.003 0.004c-1.396 2.231-2.758 3.412-3.94 3.412s-2.545-1.181-3.94-3.412c-0.199-0.316-0.529-0.534-0.912-0.579l-0.006-0.001c-0.040-0.005-0.087-0.007-0.135-0.007-0.347 0-0.662 0.14-0.891 0.366l-4 4c-0.225 0.226-0.363 0.537-0.363 0.881 0 0.69 0.56 1.25 1.25 1.25 0.344 0 0.655-0.139 0.881-0.363l-0 0zM26.885 13.116c-0.226-0.226-0.539-0.366-0.884-0.366-0.445 0-0.836 0.233-1.058 0.583l-0.003 0.005c-1.395 2.232-2.758 3.413-3.939 3.413s-2.545-1.181-3.94-3.413c-0.238-0.334-0.624-0.549-1.060-0.549s-0.822 0.215-1.057 0.545l-0.003 0.004c-1.395 2.232-2.757 3.413-3.939 3.413s-2.545-1.181-3.939-3.413c-0.224-0.355-0.615-0.588-1.060-0.588-0.345 0-0.658 0.14-0.884 0.366l-4 4c-0.226 0.226-0.366 0.539-0.366 0.884 0 0.69 0.56 1.25 1.25 1.25 0.345 0 0.658-0.14 0.884-0.366l2.933-2.934c3.248 4.354 6.93 4.428 10.184 0.24 1.073 1.714 2.884 2.881 4.976 3.057l0.024 0.002c2.218-0.205 4.103-1.465 5.167-3.268l0.017-0.031 2.932 2.934c0.227 0.228 0.541 0.37 0.888 0.37 0.691 0 1.251-0.56 1.251-1.251 0-0.347-0.141-0.661-0.369-0.887l-0-0zM26.885 23.115c-0.226-0.226-0.539-0.365-0.884-0.365-0.445 0-0.836 0.233-1.058 0.583l-0.003 0.005c-1.395 2.232-2.758 3.412-3.939 3.412s-2.545-1.18-3.94-3.412c-0.238-0.333-0.624-0.548-1.060-0.548s-0.822 0.215-1.057 0.544l-0.003 0.004c-1.395 2.232-2.757 3.412-3.939 3.412s-2.545-1.18-3.939-3.412c-0.225-0.355-0.616-0.588-1.061-0.588-0.345 0-0.657 0.14-0.884 0.366l-4 4c-0.227 0.226-0.367 0.539-0.367 0.885 0 0.691 0.56 1.251 1.251 1.251 0.345 0 0.658-0.14 0.884-0.366v0l2.933-2.934c3.248 4.352 6.93 4.426 10.184 0.24 1.073 1.714 2.884 2.881 4.976 3.057l0.024 0.002c2.218-0.205 4.103-1.465 5.167-3.268l0.017-0.031 2.932 2.934c0.226 0.226 0.539 0.366 0.884 0.366 0.691 0 1.251-0.56 1.251-1.251 0-0.345-0.14-0.658-0.366-0.884l0 0z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Sel/Taşkın Riski</span>
                            </div>
                            <span className="text-orange-400 text-sm font-bold">Orta</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>

                        {/* Heyelan */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 304.428 304.428" fill="#eab308" className="flex-shrink-0">
                                <polygon points="304.428,290.78 192.408,216.411 166.649,216.995 159.753,189.147 122.766,167.54 124.503,117.125 66.696,89.945 56.025,41.215 0,13.648 0,290.78"/>
                                <polygon points="127.064,27.676 97.334,49.67 121.223,81.832 121.223,81.832 178.161,81.832 178.161,41.671"/>
                                <polygon points="179.215,116.416 164.833,147.004 206.817,168.456 207.726,139.461"/>
                                <path d="M235.93,199.49l-14.252,12.685l21.204,20.494c0.023,0.031,0.041,0.06,0.063,0.09l16.106-20.584L235.93,199.49z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Heyelan Riski</span>
                            </div>
                            <span className="text-yellow-400 text-sm font-bold">Düşük</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" style={{ width: '28%' }}></div>
                          </div>
                        </div>

                        {/* Yangın */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316" className="flex-shrink-0">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12.4803 2.76059C13.2315 2.30898 14.208 2.28697 15.0418 2.88997C17.7027 4.81436 20.75 8.2447 20.75 13.1111C20.75 16.9175 19.1146 19.3652 17.0325 20.835C15.7533 21.738 14.3232 22.2609 13.0331 22.5258C12.5577 22.6872 12.1 22.75 11.7333 22.75C11.6306 22.75 11.521 22.746 11.4058 22.7374C11.242 22.746 11.0843 22.75 10.9333 22.75C9.47245 22.75 7.31363 22.2658 5.50409 20.806C3.6625 19.3203 2.25 16.8771 2.25 13.1111C2.25 10.0344 3.87536 7.9652 5.40507 6.79826C6.04192 6.31244 6.80509 6.30435 7.40898 6.63407C7.99302 6.95295 8.40231 7.56762 8.47627 8.28958L8.5621 9.12741C8.59508 9.44943 8.75974 9.71671 8.93177 9.84683C9.0125 9.90789 9.07802 9.92706 9.12163 9.93034C9.15843 9.93311 9.21562 9.92815 9.30063 9.8729C9.95369 9.44849 10.4496 8.68506 10.7833 7.78664C11.1138 6.89653 11.25 5.96663 11.25 5.33336V5.00973C11.25 4.03696 11.7444 3.20294 12.4803 2.76059ZM12.6314 21.0766C12.2057 21.1595 11.7992 21.2101 11.4272 21.2338C10.9433 21.1848 10.3335 21.0197 9.82415 20.6704C9.23942 20.2694 8.75 19.6065 8.75 18.4445C8.75 17.0422 9.61756 15.9772 10.5398 15.295C10.5423 15.3051 10.5441 15.3178 10.5441 15.3334V15.3443C10.5441 15.572 10.5441 15.9166 10.587 16.275C10.6296 16.6315 10.7214 17.0698 10.9474 17.4553C11.1049 17.724 11.3471 17.9513 11.6758 18.0481C11.9989 18.1433 12.3068 18.0833 12.5468 17.97C13.0028 17.7545 13.3288 17.3047 13.4657 16.8303C13.8778 17.1659 14.25 17.6907 14.25 18.4445C14.25 19.648 13.8025 20.3145 13.3124 20.6986C13.0975 20.867 12.8624 20.99 12.6314 21.0766ZM15.5176 20.0225C15.7384 19.8964 15.9557 19.759 16.1675 19.6095C17.8631 18.4126 19.25 16.4159 19.25 13.1111C19.25 8.92389 16.6279 5.88822 14.1627 4.10543C13.838 3.8706 13.5133 3.88975 13.2531 4.04619C12.9775 4.21188 12.75 4.5528 12.75 5.00973V5.33336C12.75 6.14196 12.5831 7.24891 12.1894 8.30886C11.7988 9.3605 11.1494 10.4604 10.118 11.1306C9.38388 11.6077 8.59212 11.4706 8.02694 11.0432C7.49344 10.6397 7.14144 9.97856 7.0699 9.28027L6.98408 8.44244C6.95826 8.19039 6.82167 8.02241 6.69016 7.95061C6.5785 7.88965 6.45645 7.88284 6.31484 7.99087C5.04758 8.9576 3.75 10.6247 3.75 13.1111C3.75 16.4562 4.98195 18.4575 6.44591 19.6385C6.84345 19.9592 7.263 20.2233 7.68701 20.4381C7.41384 19.8888 7.25 19.2282 7.25 18.4445C7.25 16.341 8.57017 14.8717 9.69806 14.0521C10.2109 13.6795 10.8273 13.6907 11.2979 13.9755C11.7522 14.2504 12.0441 14.7589 12.0441 15.3334C12.0441 15.5682 12.0448 15.8335 12.0763 16.0969C12.0815 16.14 12.0873 16.1814 12.0938 16.221C12.254 15.8525 12.5484 15.5666 12.897 15.4155C13.3152 15.2342 13.847 15.2379 14.2912 15.5719C14.9907 16.098 15.75 17.0424 15.75 18.4445C15.75 19.0383 15.666 19.5627 15.5176 20.0225Z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Yangın Riski</span>
                            </div>
                            <span className="text-green-400 text-sm font-bold">Çok Düşük</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>

                        {/* İmar */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">⚖️</span>
                              <span className="text-white text-sm font-medium">İmar/Hukuki Risk</span>
                            </div>
                            <span className="text-yellow-400 text-sm font-bold">Düşük</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" style={{ width: '32%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* İllere Göre Risk Tablosu */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                    <h3 className="text-white text-lg font-semibold mb-4">İllere Göre Toplam Risk Skoru</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-white/60 font-medium py-3 px-2">#</th>
                            <th className="text-left text-white/60 font-medium py-3 px-2">İl</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">Ekonomik<br/>Risk</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">Deprem<br/>Riski</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">Doğal Afet<br/>Riski</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">TOPLAM<br/>RİSK</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { rank: 1, city: 'İstanbul', economic: 72, earthquake: 85, natural: 68, total: 75, status: 'Yüksek' },
                            { rank: 2, city: 'İzmir', economic: 68, earthquake: 82, natural: 65, total: 72, status: 'Yüksek' },
                            { rank: 3, city: 'Bursa', economic: 65, earthquake: 78, natural: 62, total: 68, status: 'Yüksek' },
                            { rank: 4, city: 'Ankara', economic: 70, earthquake: 45, natural: 38, total: 51, status: 'Orta' },
                            { rank: 5, city: 'Antalya', economic: 62, earthquake: 52, natural: 58, total: 57, status: 'Orta' },
                            { rank: 6, city: 'Muğla', economic: 58, earthquake: 68, natural: 72, total: 66, status: 'Yüksek' },
                            { rank: 7, city: 'Kocaeli', economic: 66, earthquake: 76, natural: 55, total: 66, status: 'Yüksek' },
                            { rank: 8, city: 'Tekirdağ', economic: 64, earthquake: 72, natural: 52, total: 63, status: 'Orta' },
                            { rank: 9, city: 'Balıkesir', economic: 60, earthquake: 70, natural: 60, total: 63, status: 'Orta' },
                            { rank: 10, city: 'Aydın', economic: 59, earthquake: 75, natural: 65, total: 66, status: 'Yüksek' }
                          ].map((item) => (
                            <tr key={item.city} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-2 text-white/40 font-mono">{item.rank}</td>
                              <td className="py-3 px-2 text-white font-medium">{item.city}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`font-bold ${item.economic >= 70 ? 'text-red-400' : item.economic >= 60 ? 'text-orange-400' : 'text-yellow-400'}`}>
                                  {item.economic}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={`font-bold ${item.earthquake >= 80 ? 'text-red-400' : item.earthquake >= 60 ? 'text-orange-400' : 'text-yellow-400'}`}>
                                  {item.earthquake}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={`font-bold ${item.natural >= 65 ? 'text-red-400' : item.natural >= 50 ? 'text-orange-400' : 'text-yellow-400'}`}>
                                  {item.natural}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className={`text-lg font-bold ${item.total >= 70 ? 'text-red-400' : item.total >= 60 ? 'text-orange-400' : 'text-yellow-400'}`}>
                                    {item.total}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  item.status === 'Yüksek' ? 'bg-red-500/20 text-red-400' :
                                  item.status === 'Orta' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'yatirim' && (
                <>
                  {/* Yatırım Enstrümanları Karşılaştırma - 5'li Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {/* Konut */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="mb-2">
                        <p className="text-white text-sm font-semibold truncate">Konut</p>
                      </div>
                      <p className="text-blue-400 text-2xl font-bold mb-1">%48.2</p>
                      <p className="text-white/60 text-xs mb-2">Yıllık Getiri</p>
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span>En yüksek</span>
                      </div>
                    </div>

                    {/* Altın */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-sm border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="mb-2">
                        <p className="text-white text-sm font-semibold truncate">Altın</p>
                      </div>
                      <p className="text-yellow-400 text-2xl font-bold mb-1">%38.5</p>
                      <p className="text-white/60 text-xs mb-2">Yıllık Getiri</p>
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span>Güvenli</span>
                      </div>
                    </div>

                    {/* Dolar */}
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="mb-2">
                        <p className="text-white text-sm font-semibold truncate">Dolar</p>
                      </div>
                      <p className="text-green-400 text-2xl font-bold mb-1">%20.3</p>
                      <p className="text-white/60 text-xs mb-2">Yıllık Getiri</p>
                      <div className="flex items-center gap-1 text-orange-400 text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Orta</span>
                      </div>
                    </div>

                    {/* Mevduat */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="mb-2">
                        <p className="text-white text-sm font-semibold truncate">Mevduat</p>
                      </div>
                      <p className="text-purple-400 text-2xl font-bold mb-1">%50.0</p>
                      <p className="text-white/60 text-xs mb-2">Yıllık Faiz</p>
                      <div className="flex items-center gap-1 text-red-400 text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                        </svg>
                        <span>Kayıp</span>
                      </div>
                    </div>

                    {/* Borsa */}
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm border border-red-500/20 hover:border-red-500/40 transition-all duration-200 rounded-xl p-4 overflow-hidden min-w-0">
                      <div className="mb-2">
                        <p className="text-white text-sm font-semibold truncate">BIST 100</p>
                      </div>
                      <p className="text-red-400 text-2xl font-bold mb-1">%52.8</p>
                      <p className="text-white/60 text-xs mb-2">Yıllık Getiri</p>
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span>Volatil</span>
                      </div>
                    </div>
                  </div>

                  {/* Gelecek Fiyat Projeksiyonu - ANA KART */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white text-xl font-bold">Gelecek Fiyat Projeksiyonu</h3>
                        <p className="text-white/60 text-sm">AI destekli fiyat tahmini - Konut bazlı</p>
                      </div>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg font-medium">
                        🎯 Ana Projeksiyon
                      </span>
                    </div>
                    <div className="h-96">
                      <ReactECharts
                        option={{
                          grid: { top: 60, right: 60, bottom: 60, left: 70 },
                          xAxis: {
                            type: 'category',
                            data: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
                            axisLabel: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold' },
                            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
                          },
                          yAxis: {
                            type: 'value',
                            name: 'Ortalama m² Fiyat (₺)',
                            nameTextStyle: { color: '#9ca3af', fontSize: 12 },
                            axisLabel: { color: '#9ca3af', fontSize: 12, formatter: '₺{value}K' },
                            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                          },
                          tooltip: {
                            trigger: 'axis',
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            borderColor: 'rgba(255,255,255,0.2)',
                            textStyle: { color: '#fff', fontSize: 13 },
                            axisPointer: {
                              type: 'cross',
                              label: { backgroundColor: '#6a7985' }
                            }
                          },
                          legend: {
                            data: ['Gerçek Veri', 'Optimistik Senaryo', 'Realistik Senaryo', 'Pesimistik Senaryo'],
                            textStyle: { color: '#9ca3af', fontSize: 12 },
                            top: 10,
                            itemGap: 20
                          },
                          series: [
                            {
                              name: 'Gerçek Veri',
                              type: 'line',
                              data: [24.2, 35.8, null, null, null, null, null],
                              itemStyle: { color: '#3b82f6' },
                              lineStyle: { width: 4 },
                              symbol: 'circle',
                              symbolSize: 10,
                              label: {
                                show: true,
                                formatter: '₺{c}K',
                                position: 'top',
                                color: '#3b82f6',
                                fontSize: 12,
                                fontWeight: 'bold'
                              }
                            },
                            {
                              name: 'Optimistik Senaryo',
                              type: 'line',
                              data: [null, 35.8, 48.5, 62.8, 78.2, 95.8, 115.2],
                              itemStyle: { color: '#10b981' },
                              lineStyle: { type: 'dashed', width: 3 },
                              areaStyle: { 
                                opacity: 0.15,
                                color: {
                                  type: 'linear',
                                  x: 0, y: 0, x2: 0, y2: 1,
                                  colorStops: [
                                    { offset: 0, color: '#10b981' },
                                    { offset: 1, color: 'transparent' }
                                  ]
                                }
                              },
                              symbol: 'diamond',
                              symbolSize: 8,
                              label: {
                                show: true,
                                formatter: '₺{c}K',
                                position: 'top',
                                color: '#10b981',
                                fontSize: 11
                              }
                            },
                            {
                              name: 'Realistik Senaryo',
                              type: 'line',
                              data: [null, 35.8, 44.2, 52.8, 61.5, 70.8, 80.5],
                              itemStyle: { color: '#f59e0b' },
                              lineStyle: { type: 'dashed', width: 3 },
                              areaStyle: { 
                                opacity: 0.15,
                                color: {
                                  type: 'linear',
                                  x: 0, y: 0, x2: 0, y2: 1,
                                  colorStops: [
                                    { offset: 0, color: '#f59e0b' },
                                    { offset: 1, color: 'transparent' }
                                  ]
                                }
                              },
                              symbol: 'circle',
                              symbolSize: 8,
                              label: {
                                show: true,
                                formatter: '₺{c}K',
                                position: 'top',
                                color: '#f59e0b',
                                fontSize: 11,
                                fontWeight: 'bold'
                              }
                            },
                            {
                              name: 'Pesimistik Senaryo',
                              type: 'line',
                              data: [null, 35.8, 40.2, 44.5, 48.2, 51.8, 55.2],
                              itemStyle: { color: '#ef4444' },
                              lineStyle: { type: 'dashed', width: 3 },
                              areaStyle: { 
                                opacity: 0.15,
                                color: {
                                  type: 'linear',
                                  x: 0, y: 0, x2: 0, y2: 1,
                                  colorStops: [
                                    { offset: 0, color: '#ef4444' },
                                    { offset: 1, color: 'transparent' }
                                  ]
                                }
                              },
                              symbol: 'triangle',
                              symbolSize: 8,
                              label: {
                                show: true,
                                formatter: '₺{c}K',
                                position: 'bottom',
                                color: '#ef4444',
                                fontSize: 11
                              }
                            }
                          ]
                        }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
                      <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                        <p className="text-green-400 text-xs font-medium mb-1">Optimistik (2030)</p>
                        <p className="text-white text-lg font-bold">₺115.2K</p>
                        <p className="text-green-400 text-xs">+%322 artış</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                        <p className="text-orange-400 text-xs font-medium mb-1">Realistik (2030)</p>
                        <p className="text-white text-lg font-bold">₺80.5K</p>
                        <p className="text-orange-400 text-xs">+%225 artış</p>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                        <p className="text-red-400 text-xs font-medium mb-1">Pesimistik (2030)</p>
                        <p className="text-white text-lg font-bold">₺55.2K</p>
                        <p className="text-red-400 text-xs">+%154 artış</p>
                      </div>
                    </div>
                  </div>

                  {/* Diğer Grafikler - 3'lü Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Yatırım Enstrümanları 5 Yıllık Karşılaştırma */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5 lg:col-span-2">
                      <h3 className="text-white text-lg font-semibold mb-4">Yatırım Enstrümanları Karşılaştırması (Son 5 Yıl)</h3>
                      <div className="h-80">
                        <ReactECharts
                          option={{
                            grid: { top: 60, right: 40, bottom: 50, left: 60 },
                            xAxis: {
                              type: 'category',
                              data: ['2020', '2021', '2022', '2023', '2024', '2025'],
                              axisLabel: { color: '#9ca3af', fontSize: 12 }
                            },
                            yAxis: {
                              type: 'value',
                              name: 'Değer Artışı',
                              axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '%{value}' },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                            },
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0,0,0,0.9)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' },
                              axisPointer: { type: 'cross' }
                            },
                            legend: {
                              data: ['Konut', 'Altın', 'Dolar', 'Mevduat', 'BIST 100'],
                              textStyle: { color: '#9ca3af', fontSize: 12 },
                              top: 10
                            },
                            series: [
                              {
                                name: 'Konut',
                                type: 'line',
                                data: [100, 128, 168, 210, 285, 410],
                                itemStyle: { color: '#3b82f6' },
                                smooth: true,
                                lineStyle: { width: 3 },
                                emphasis: { focus: 'series' }
                              },
                              {
                                name: 'Altın',
                                type: 'line',
                                data: [100, 115, 145, 178, 220, 285],
                                itemStyle: { color: '#f59e0b' },
                                smooth: true,
                                lineStyle: { width: 3 },
                                emphasis: { focus: 'series' }
                              },
                              {
                                name: 'Dolar',
                                type: 'line',
                                data: [100, 110, 128, 145, 168, 192],
                                itemStyle: { color: '#10b981' },
                                smooth: true,
                                lineStyle: { width: 3 },
                                emphasis: { focus: 'series' }
                              },
                              {
                                name: 'Mevduat',
                                type: 'line',
                                data: [100, 118, 142, 172, 210, 258],
                                itemStyle: { color: '#8b5cf6' },
                                smooth: true,
                                lineStyle: { width: 3 },
                                emphasis: { focus: 'series' }
                              },
                              {
                                name: 'BIST 100',
                                type: 'line',
                                data: [100, 145, 198, 268, 385, 520],
                                itemStyle: { color: '#ef4444' },
                                smooth: true,
                                lineStyle: { width: 3 },
                                emphasis: { focus: 'series' }
                              }
                            ]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* ROI Simülatörü */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-4 overflow-hidden">
                      <h3 className="text-white text-base font-semibold mb-3">ROI Simülatörü</h3>
                      
                      <div className="space-y-2.5">
                        {/* Yatırım Tutarı */}
                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                          <label className="text-white/70 text-xs mb-1.5 block">Yatırım Tutarı</label>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="text" 
                              value="5,000,000" 
                              readOnly
                              className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm font-semibold min-w-0"
                            />
                            <span className="text-white/60 text-xs flex-shrink-0">₺</span>
                          </div>
                        </div>

                        {/* Yatırım Süresi */}
                        <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                          <label className="text-white/70 text-xs mb-1.5 block">Yatırım Süresi</label>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="text" 
                              value="3" 
                              readOnly
                              className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm font-semibold min-w-0"
                            />
                            <span className="text-white/60 text-xs flex-shrink-0">Yıl</span>
                          </div>
                        </div>

                        {/* Sonuçlar */}
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-3 border border-blue-500/30">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white/70 text-xs">Beklenen Değer:</span>
                              <span className="text-white text-sm font-bold truncate">₺11,045,000</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white/70 text-xs">Kazanç:</span>
                              <span className="text-green-400 text-sm font-bold truncate">+₺6,045,000</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/20">
                              <span className="text-white text-xs font-medium">ROI:</span>
                              <span className="text-green-400 text-xl font-bold">%121</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-white/50 text-[10px] text-center leading-tight">
                          * Hesaplama konut yatırımı ortalama getirisine göre yapılmıştır
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* En İyi Yatırım Bölgeleri */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* En Yüksek Getiri Potansiyeli */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-base font-semibold">En Yüksek Getiri Potansiyeli</h3>
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md">5 Yıllık</span>
                      </div>
                      <div className="h-[500px]">
                        <ReactECharts
                          option={{
                            grid: { top: 10, right: 80, bottom: 30, left: 80 },
                            xAxis: {
                              type: 'value',
                              axisLabel: { color: '#9ca3af', fontSize: 11, formatter: '%{value}' },
                              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                            },
                            yAxis: {
                              type: 'category',
                              data: ['Trabzon', 'Samsun', 'Kocaeli', 'Bursa', 'Tekirdağ', 'Mersin', 'Aydın', 'Balıkesir', 'Antalya', 'Muğla'],
                              axisLabel: { color: '#9ca3af', fontSize: 11 }
                            },
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              textStyle: { color: '#fff' },
                              formatter: '{b}: %{c} beklenen getiri'
                            },
                            series: [{
                              type: 'bar',
                              data: [152, 168, 178, 185, 192, 208, 218, 228, 245, 268],
                              itemStyle: {
                                color: {
                                  type: 'linear',
                                  x: 0, y: 0, x2: 1, y2: 0,
                                  colorStops: [
                                    { offset: 0, color: '#10b981' },
                                    { offset: 1, color: '#22c55e' }
                                  ]
                                },
                                borderRadius: [0, 4, 4, 0]
                              },
                              barWidth: '70%',
                              label: {
                                show: true,
                                position: 'right',
                                color: '#10b981',
                                fontSize: 11,
                                formatter: '%{c}'
                              }
                            }]
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* AI Yatırım Önerileri */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M12 2L13.5 6.5L18 8L13.5 9.5L12 14L10.5 9.5L6 8L10.5 6.5L12 2Z" fill="#8b5cf6" stroke="#a78bfa" strokeWidth="1.5"/>
                          <path d="M18 4L18.7 5.3L20 6L18.7 6.7L18 8L17.3 6.7L16 6L17.3 5.3L18 4Z" fill="#c4b5fd"/>
                          <path d="M7 16L7.7 17.3L9 18L7.7 18.7L7 20L6.3 18.7L5 18L6.3 17.3L7 16Z" fill="#c4b5fd"/>
                        </svg>
                        <h3 className="text-white text-base font-semibold">AI Yatırım Önerileri</h3>
                      </div>

                      <div className="space-y-3">
                        {/* Öneri 1 */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-4 border border-purple-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">Muğla - Bodrum</h4>
                              <p className="text-white/60 text-xs">Deniz manzaralı konut</p>
                            </div>
                            <span className="text-purple-400 text-lg font-bold">98</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">%268 Potansiyel</span>
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Turizm Bölgesi</span>
                          </div>
                          <p className="text-white/70 text-xs">
                            Yüksek turizm talebi, sınırlı arsa, marina projeleri
                          </p>
                        </div>

                        {/* Öneri 2 */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-4 border border-blue-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">Antalya - Kepez</h4>
                              <p className="text-white/60 text-xs">Dönüşüm bölgesi</p>
                            </div>
                            <span className="text-blue-400 text-lg font-bold">95</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">%245 Potansiyel</span>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">Kentsel Dönüşüm</span>
                          </div>
                          <p className="text-white/70 text-xs">
                            Kentsel dönüşüm, yeni metro hattı, nüfus artışı
                          </p>
                        </div>

                        {/* Öneri 3 */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-lg p-4 border border-emerald-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">Tekirdağ - Çorlu</h4>
                              <p className="text-white/60 text-xs">Sanayi + Lojistik</p>
                            </div>
                            <span className="text-emerald-400 text-lg font-bold">92</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">%228 Potansiyel</span>
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Sanayi Merkezi</span>
                          </div>
                          <p className="text-white/70 text-xs">
                            Sanayi gelişimi, İstanbul'a yakınlık, göç alımı
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detaylı Yatırım Analiz Tablosu */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5">
                    <h3 className="text-white text-lg font-semibold mb-4">Detaylı Yatırım Analizi (İl Bazında)</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-white/60 font-medium py-3 px-2">#</th>
                            <th className="text-left text-white/60 font-medium py-3 px-2">İl</th>
                            <th className="text-right text-white/60 font-medium py-3 px-2">Mevcut<br/>m² Fiyat</th>
                            <th className="text-right text-white/60 font-medium py-3 px-2">3 Yıl<br/>Projeksiyon</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">Beklenen<br/>Getiri</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">Risk<br/>Seviyesi</th>
                            <th className="text-center text-white/60 font-medium py-3 px-2">Yatırım<br/>Skoru</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { rank: 1, city: 'Muğla', currentPrice: 38.2, futurePrice: 102.5, roi: 268, risk: 'Düşük', score: 98 },
                            { rank: 2, city: 'Antalya', currentPrice: 34.7, futurePrice: 84.9, roi: 245, risk: 'Düşük', score: 95 },
                            { rank: 3, city: 'Balıkesir', currentPrice: 22.1, futurePrice: 50.4, roi: 228, risk: 'Orta', score: 92 },
                            { rank: 4, city: 'Aydın', currentPrice: 21.3, futurePrice: 46.8, roi: 220, risk: 'Düşük', score: 90 },
                            { rank: 5, city: 'Mersin', currentPrice: 18.9, futurePrice: 39.7, roi: 210, risk: 'Orta', score: 87 },
                            { rank: 6, city: 'Tekirdağ', currentPrice: 20.5, futurePrice: 40.2, roi: 196, risk: 'Düşük', score: 85 },
                            { rank: 7, city: 'Bursa', currentPrice: 21.9, futurePrice: 40.5, roi: 185, risk: 'Düşük', score: 83 },
                            { rank: 8, city: 'Kocaeli', currentPrice: 19.8, futurePrice: 35.6, roi: 180, risk: 'Orta', score: 80 },
                            { rank: 9, city: 'İzmir', currentPrice: 32.1, futurePrice: 54.8, roi: 171, risk: 'Düşük', score: 78 },
                            { rank: 10, city: 'İstanbul', currentPrice: 45.8, futurePrice: 72.5, roi: 158, risk: 'Düşük', score: 75 }
                          ].map((item) => (
                            <tr key={item.city} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-2 text-white/40 font-mono">{item.rank}</td>
                              <td className="py-3 px-2 text-white font-medium">{item.city}</td>
                              <td className="py-3 px-2 text-white text-right">{item.currentPrice}K ₺</td>
                              <td className="py-3 px-2 text-green-400 font-semibold text-right">{item.futurePrice}K ₺</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`text-lg font-bold ${
                                  item.roi >= 250 ? 'text-green-400' :
                                  item.roi >= 200 ? 'text-blue-400' :
                                  item.roi >= 180 ? 'text-yellow-400' :
                                  'text-orange-400'
                                }`}>
                                  %{item.roi}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  item.risk === 'Düşük' ? 'bg-green-500/20 text-green-400' :
                                  item.risk === 'Orta' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {item.risk}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`text-lg font-bold ${
                                    item.score >= 95 ? 'text-purple-400' :
                                    item.score >= 85 ? 'text-blue-400' :
                                    item.score >= 75 ? 'text-green-400' :
                                    'text-yellow-400'
                                  }`}>
                                    {item.score}
                                  </span>
                                  {item.score >= 95 && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                      <path d="M12 2L13.5 6.5L18 8L13.5 9.5L12 14L10.5 9.5L6 8L10.5 6.5L12 2Z" fill="#a78bfa"/>
                                    </svg>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Resize Handle - Ortada */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/10 cursor-col-resize hover:bg-white/30 transition-colors z-10"
          style={{ left: `${splitPosition}%` }}
          onMouseDown={handleMouseDown}
        />

        {/* Sağ Panel - Harita */}
        <div 
          className="absolute top-0 right-0 bottom-0 overflow-hidden"
          style={{ width: `${100 - splitPosition}%` }}
        >
          {/* Harita Kontrol Barı */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 max-w-[95%]">
            {/* Katmanlar Dropdown */}
            <div ref={layersDropdownRef} className="relative">
              <button 
                onClick={() => setIsLayersDropdownOpen(!isLayersDropdownOpen)}
                className="px-3 py-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 outline-none focus:outline-none"
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
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={imarBaskisi}
                        onChange={(e) => setImarBaskisi(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
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
                    <span className="text-white text-xs font-medium">İmar Baskısı</span>
                  </label>

                  {/* İl Sınırları */}
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={ilSinirlari}
                        onChange={(e) => setIlSinirlari(e.target.checked)}
                        className="sr-only peer"
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
                  </label>

                  {/* İlçe Sınırları */}
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={ilceSinirlari}
                        onChange={(e) => setIlceSinirlari(e.target.checked)}
                        className="sr-only peer"
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
                  </label>
                </div>
              )}
            </div>
            
            {/* Adres Arama Barı */}
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <input
                type="text"
                placeholder="Adres ara..."
                className="w-full pl-3 pr-9 py-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-white/40 transition-all duration-200"
              />
              <button 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Konumumu Bul"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="12" y1="2" x2="12" y2="9"></line>
                  <line x1="12" y1="15" x2="12" y2="22"></line>
                  <line x1="2" y1="12" x2="9" y2="12"></line>
                  <line x1="15" y1="12" x2="22" y2="12"></line>
                </svg>
              </button>
            </div>
            
            {/* Filtreler Butonu */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="px-3 py-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 outline-none focus:outline-none"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.95301 2.25C4.96862 2.25 4.98429 2.25 5.00001 2.25L19.047 2.25C19.7139 2.24997 20.2841 2.24994 20.7398 2.30742C21.2231 2.36839 21.6902 2.50529 22.0738 2.86524C22.4643 3.23154 22.6194 3.68856 22.6875 4.16405C22.7501 4.60084 22.7501 5.14397 22.75 5.76358L22.75 6.54012C22.75 7.02863 22.75 7.45095 22.7136 7.80311C22.6743 8.18206 22.5885 8.5376 22.3825 8.87893C22.1781 9.2177 21.9028 9.4636 21.5854 9.68404C21.2865 9.8917 20.9045 10.1067 20.4553 10.3596L17.5129 12.0159C16.8431 12.393 16.6099 12.5288 16.4542 12.6639C16.0966 12.9744 15.8918 13.3188 15.7956 13.7504C15.7545 13.9349 15.75 14.1672 15.75 14.8729L15.75 17.605C15.7501 18.5062 15.7501 19.2714 15.6574 19.8596C15.5587 20.4851 15.3298 21.0849 14.7298 21.4602C14.1434 21.827 13.4975 21.7933 12.8698 21.6442C12.2653 21.5007 11.5203 21.2094 10.6264 20.8599L10.5395 20.826C10.1208 20.6623 9.75411 20.519 9.46385 20.3691C9.1519 20.208 8.8622 20.0076 8.64055 19.6957C8.41641 19.3803 8.32655 19.042 8.28648 18.6963C8.24994 18.381 8.24997 18.0026 8.25 17.5806L8.25 14.8729C8.25 14.1672 8.24555 13.9349 8.20442 13.7504C8.1082 13.3188 7.90342 12.9744 7.54584 12.6639C7.39014 12.5288 7.15692 12.393 6.48714 12.0159L3.54471 10.3596C3.09549 10.1067 2.71353 9.8917 2.41458 9.68404C2.09724 9.4636 1.82191 9.2177 1.61747 8.87893C1.41148 8.5376 1.32571 8.18206 1.28645 7.80311C1.24996 7.45094 1.24998 7.02863 1.25 6.54012L1.25001 5.81466C1.25001 5.79757 1.25 5.78054 1.25 5.76357C1.24996 5.14396 1.24991 4.60084 1.31251 4.16405C1.38064 3.68856 1.53576 3.23154 1.92618 2.86524C2.30983 2.50529 2.77695 2.36839 3.26024 2.30742C3.71592 2.24994 4.28607 2.24997 4.95301 2.25ZM3.44796 3.79563C3.1143 3.83772 3.0082 3.90691 2.95251 3.95916C2.90359 4.00505 2.83904 4.08585 2.79734 4.37683C2.75181 4.69454 2.75001 5.12868 2.75001 5.81466V6.50448C2.75001 7.03869 2.75093 7.38278 2.77846 7.64854C2.8041 7.89605 2.84813 8.01507 2.90174 8.10391C2.9569 8.19532 3.0485 8.298 3.27034 8.45209C3.50406 8.61444 3.82336 8.79508 4.30993 9.06899L7.22296 10.7088C7.25024 10.7242 7.2771 10.7393 7.30357 10.7542C7.86227 11.0685 8.24278 11.2826 8.5292 11.5312C9.12056 12.0446 9.49997 12.6682 9.66847 13.424C9.75036 13.7913 9.75022 14.2031 9.75002 14.7845C9.75002 14.8135 9.75 14.843 9.75 14.8729V17.5424C9.75 18.0146 9.75117 18.305 9.77651 18.5236C9.79942 18.7213 9.83552 18.7878 9.8633 18.8269C9.89359 18.8695 9.95357 18.9338 10.152 19.0363C10.3644 19.146 10.6571 19.2614 11.1192 19.442C12.0802 19.8177 12.7266 20.0685 13.2164 20.1848C13.695 20.2985 13.8527 20.2396 13.9343 20.1885C14.0023 20.146 14.1073 20.0597 14.1757 19.626C14.2478 19.1686 14.25 18.5234 14.25 17.5424V14.8729C14.25 14.843 14.25 14.8135 14.25 14.7845C14.2498 14.2031 14.2496 13.7913 14.3315 13.424C14.5 12.6682 14.8794 12.0446 15.4708 11.5312C15.7572 11.2826 16.1377 11.0685 16.6964 10.7542C16.7229 10.7393 16.7498 10.7242 16.7771 10.7088L19.6901 9.06899C20.1767 8.79508 20.496 8.61444 20.7297 8.45209C20.9515 8.298 21.0431 8.19532 21.0983 8.10391C21.1519 8.01507 21.1959 7.89605 21.2215 7.64854C21.2491 7.38278 21.25 7.03869 21.25 6.50448V5.81466C21.25 5.12868 21.2482 4.69454 21.2027 4.37683C21.161 4.08585 21.0964 4.00505 21.0475 3.95916C20.9918 3.90691 20.8857 3.83772 20.5521 3.79563C20.2015 3.75141 19.727 3.75 19 3.75H5.00001C4.27297 3.75 3.79854 3.75141 3.44796 3.79563Z"/>
              </svg>
              Filtreler
            </button>
          </div>
          
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
          `}</style>
          <MapContainer
            center={[39.0, 35.0]} // Türkiye merkez koordinatları
            zoom={6}
            style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
            className="z-0"
            zoomControl={false}
            attributionControl={false}
          >
            <ZoomControl position="bottomleft" />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            
            {/* İl Sınırları */}
            {ilSinirlari && illerGeoJSON && (
              <GeoJSON
                key="il-sinirlari"
                data={illerGeoJSON}
                style={(feature) => ({
                  color: selectedIl === feature?.properties?.NAME_1 ? '#3b82f6' : '#10b981',
                  weight: selectedIl === feature?.properties?.NAME_1 ? 3 : 2,
                  opacity: 0.8,
                  fillColor: selectedIl === feature?.properties?.NAME_1 ? '#3b82f6' : '#10b981',
                  fillOpacity: selectedIl === feature?.properties?.NAME_1 ? 0.2 : 0.1
                })}
                onEachFeature={(feature: any, layer: any) => {
                  if (feature.properties && feature.properties.NAME_1) {
                    const ilAdi = feature.properties.NAME_1;
                    
                    layer.bindPopup(`<strong>${ilAdi}</strong><br/><small>Tıklayın: İlçeleri görüntüle</small>`);
                    
                    layer.on('click', () => {
                      handleIlClick(ilAdi, layer);
                    });
                    
                    layer.on('mouseover', () => {
                      layer.setStyle({
                        fillOpacity: 0.3,
                        weight: 3
                      });
                    });
                    
                    layer.on('mouseout', () => {
                      layer.setStyle({
                        fillOpacity: selectedIl === ilAdi ? 0.2 : 0.1,
                        weight: selectedIl === ilAdi ? 3 : 2
                      });
                    });
                  }
                }}
              />
            )}
            
            {/* İlçe Sınırları */}
            {ilceSinirlari && ilcelerGeoJSON && selectedIl && (
              <GeoJSON
                key={`ilce-sinirlari-${selectedIl}`}
                data={{
                  ...ilcelerGeoJSON,
                  features: ilcelerGeoJSON.features.filter((f: any) => 
                    f.properties?.NAME_1 === selectedIl
                  )
                }}
                style={{
                  color: '#06b6d4',
                  weight: 2,
                  opacity: 0.8,
                  fillColor: '#06b6d4',
                  fillOpacity: 0.15
                }}
                onEachFeature={(feature: any, layer: any) => {
                  if (feature.properties && feature.properties.NAME_2) {
                    layer.bindPopup(`<strong>${feature.properties.NAME_2}</strong><br/>${feature.properties.NAME_1}`);
                    
                    layer.on('mouseover', () => {
                      layer.setStyle({
                        fillOpacity: 0.3,
                        weight: 3
                      });
                    });
                    
                    layer.on('mouseout', () => {
                      layer.setStyle({
                        fillOpacity: 0.15,
                        weight: 2
                      });
                    });
                  }
                }}
              />
            )}
            
            {/* Marker - Sadece il seçildiğinde veya arama yapıldığında */}
            {selectedIl && selectedIlCenter && (
              <Marker position={selectedIlCenter}>
                <Popup>
                  <strong>{selectedIl}</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>
          
          {/* Fiyat Skalası */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[70%] max-w-md">
            <div 
              className="rounded-lg px-4 py-1.5"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 className="text-white/70 text-[10px] font-medium mb-1 text-center">Konut m² Birim Fiyatı</h3>
              <div className="flex items-center gap-2.5">
                <span className="text-white text-xs font-medium whitespace-nowrap">16.329 ₺/m²</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(to right, #10b981, #22c55e, #84cc16, #eab308, #f59e0b, #f97316, #ef4444, #dc2626)'
                }}>
                </div>
                <span className="text-white text-xs font-medium whitespace-nowrap">77.319 ₺/m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* MOBILE LAYOUT */}
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
        `}</style>
        <MapContainer
          center={[39.0, 35.0]}
          zoom={6}
          style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
          className="z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <ZoomControl position="bottomleft" />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          
          {/* İl Sınırları */}
          {ilSinirlari && illerGeoJSON && (
            <GeoJSON
              key="il-sinirlari-mobile"
              data={illerGeoJSON}
              style={(feature) => ({
                color: selectedIl === feature?.properties?.NAME_1 ? '#3b82f6' : '#10b981',
                weight: selectedIl === feature?.properties?.NAME_1 ? 3 : 2,
                opacity: 0.8,
                fillColor: selectedIl === feature?.properties?.NAME_1 ? '#3b82f6' : '#10b981',
                fillOpacity: selectedIl === feature?.properties?.NAME_1 ? 0.2 : 0.1
              })}
              onEachFeature={(feature: any, layer: any) => {
                if (feature.properties && feature.properties.NAME_1) {
                  const ilAdi = feature.properties.NAME_1;
                  
                  layer.bindPopup(`<strong>${ilAdi}</strong><br/><small>Tıklayın: İlçeleri görüntüle</small>`);
                  
                  layer.on('click', () => {
                    handleIlClick(ilAdi, layer);
                  });
                  
                  layer.on('mouseover', () => {
                    layer.setStyle({
                      fillOpacity: 0.3,
                      weight: 3
                    });
                  });
                  
                  layer.on('mouseout', () => {
                    layer.setStyle({
                      fillOpacity: selectedIl === ilAdi ? 0.2 : 0.1,
                      weight: selectedIl === ilAdi ? 3 : 2
                    });
                  });
                }
              }}
            />
          )}
          
          {/* İlçe Sınırları */}
          {ilceSinirlari && ilcelerGeoJSON && selectedIl && (
            <GeoJSON
              key={`ilce-sinirlari-mobile-${selectedIl}`}
              data={{
                ...ilcelerGeoJSON,
                features: ilcelerGeoJSON.features.filter((f: any) => 
                  f.properties?.NAME_1 === selectedIl
                )
              }}
              style={{
                color: '#06b6d4',
                weight: 2,
                opacity: 0.8,
                fillColor: '#06b6d4',
                fillOpacity: 0.15
              }}
              onEachFeature={(feature: any, layer: any) => {
                if (feature.properties && feature.properties.NAME_2) {
                  layer.bindPopup(`<strong>${feature.properties.NAME_2}</strong><br/>${feature.properties.NAME_1}`);
                  
                  layer.on('mouseover', () => {
                    layer.setStyle({
                      fillOpacity: 0.3,
                      weight: 3
                    });
                  });
                  
                  layer.on('mouseout', () => {
                    layer.setStyle({
                      fillOpacity: 0.15,
                      weight: 2
                    });
                  });
                }
              }}
            />
          )}
          
          {/* Marker - Sadece il seçildiğinde veya arama yapıldığında */}
          {selectedIl && selectedIlCenter && (
            <Marker position={selectedIlCenter}>
              <Popup>
                <strong>{selectedIl}</strong>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {/* Fiyat Skalası - Mobile */}
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <div 
            className="rounded-lg px-3 py-1.5"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 className="text-white/70 text-[9px] font-medium mb-0.5 text-center">Konut m² Birim Fiyatı</h3>
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] font-medium whitespace-nowrap">16.329 ₺</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{
                background: 'linear-gradient(to right, #10b981, #22c55e, #84cc16, #eab308, #f59e0b, #f97316, #ef4444, #dc2626)'
              }}>
              </div>
              <span className="text-white text-[10px] font-medium whitespace-nowrap">77.319 ₺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      {/* Filter Popup */}
      <FilterPopup isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

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
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Adres ara..."
            className="w-full pl-3 pr-9 py-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-white/40"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
              <line x1="12" y1="2" x2="12" y2="9"></line>
              <line x1="12" y1="15" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="9" y2="12"></line>
              <line x1="15" y1="12" x2="22" y2="12"></line>
            </svg>
          </button>
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
            <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={imarBaskisi}
                  onChange={(e) => setImarBaskisi(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded-full border-2 border-white/30 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
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
              <span className="text-white text-xs font-medium">İmar Baskısı</span>
            </label>

            {/* İl Sınırları */}
            <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={ilSinirlari}
                  onChange={(e) => setIlSinirlari(e.target.checked)}
                  className="sr-only peer"
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
            </label>

            {/* İlçe Sınırları */}
            <label className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={ilceSinirlari}
                  onChange={(e) => setIlceSinirlari(e.target.checked)}
                  className="sr-only peer"
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
              {propertyType}
            </span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
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
                <div className="grid grid-cols-2 gap-3">
                  {scoreCards.map((card, index) => (
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
            {activeTab === 'talep' && (
              <div className="space-y-4">
                {/* En Çok İlgi Gören İller - Mobile */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex flex-col gap-2 mb-3">
                    <h3 className="text-white text-base font-semibold">En Çok İlgi Gören İller</h3>
                    <span className="text-blue-400 text-[10px] font-semibold bg-blue-500/10 px-2 py-1 rounded-full self-start">
                      Son 30 Günde
                    </span>
                  </div>
                  <div className="h-72">
                    {typeof window !== 'undefined' && (
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
                          legend: {
                            data: ['Yerli', 'Yabancı'],
                            textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
                            top: 0,
                            itemWidth: 15,
                            itemHeight: 10
                          },
                          grid: {
                            left: '20%',
                            right: '4%',
                            bottom: '3%',
                            top: '12%',
                            containLabel: false
                          },
                          xAxis: {
                            type: 'value',
                            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                            axisLabel: { 
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: 9,
                              formatter: (value: number) => `${(value / 1000).toFixed(0)}K`
                            },
                            splitLine: {
                              lineStyle: {
                                color: 'rgba(255,255,255,0.1)',
                                type: 'dashed'
                              }
                            }
                          },
                          yAxis: {
                            type: 'category',
                            data: ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Kocaeli', 'Adana', 'Muğla', 'Mersin', 'Konya'],
                            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                            axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
                            splitLine: { show: false }
                          },
                          series: [
                            {
                              name: 'Yerli',
                              type: 'bar',
                              data: [2500, 850, 620, 450, 380, 320, 285, 240, 215, 190],
                              itemStyle: {
                                color: {
                                  type: 'linear',
                                  x: 0,
                                  y: 0,
                                  x2: 1,
                                  y2: 0,
                                  colorStops: [
                                    { offset: 0, color: '#3b82f6' },
                                    { offset: 1, color: '#60a5fa' }
                                  ]
                                },
                                borderRadius: [0, 3, 3, 0]
                              }
                            },
                            {
                              name: 'Yabancı',
                              type: 'bar',
                              data: [450, 180, 320, 520, 85, 95, 70, 310, 60, 45],
                              itemStyle: {
                                color: {
                                  type: 'linear',
                                  x: 0,
                                  y: 0,
                                  x2: 1,
                                  y2: 0,
                                  colorStops: [
                                    { offset: 0, color: '#f59e0b' },
                                    { offset: 1, color: '#fbbf24' }
                                  ]
                                },
                                borderRadius: [0, 3, 3, 0]
                              }
                            }
                          ]
                        }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    )}
                  </div>
                </div>

                  {/* Piyasa Metrikleri - Mobile (2x2) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Ortalama Satış Süresi */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Ort. Satış Süresi</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">32 Gün</p>
                    <span className="text-green-500 text-[10px] font-semibold">↓ %15</span>
                  </div>

                  {/* Ortalama m² Fiyat */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="10" height="10" viewBox="0 0 440 440" fill="#10b981" className="flex-shrink-0 mt-1">
                        <path d="M344.33,212.5c0,103.857-80.577,189.248-182.5,196.936V197.361l151.76-55.236l-10.26-28.191l-141.5,51.502V121.38l151.76-55.236l-10.26-28.191l-141.5,51.502V0h-30v100.374l-66.16,24.08l10.261,28.191L131.83,132.3v44.055l-66.16,24.08l10.261,28.191l55.899-20.346V440h15c60.813,0,117.957-23.651,160.902-66.597c42.946-42.946,66.598-100.089,66.598-160.903H344.33z"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Ort. m² Fiyat</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">35.8K ₺</p>
                    <span className="text-green-500 text-[10px] font-semibold">↑ %6.2</span>
                  </div>

                  {/* Stok Değişimi */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="14" height="14" viewBox="0 0 50.8 50.8" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <path d="M7.854 33.546 16 22.893l7.52 16.293 6.267-27.572 3.76 8.773 5.64-6.893 3.76 8.146"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Stok Değişimi</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">+8.5%</p>
                    <span className="text-orange-500 text-[10px] font-semibold">↑ Artış</span>
                  </div>

                  {/* Talep/Arz Oranı */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-1.5 mb-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p className="text-white/60 text-[10px] font-medium leading-tight">Talep/Arz Oranı</p>
                    </div>
                    <p className="text-white text-2xl font-bold mb-1">1.8</p>
                    <span className="text-blue-500 text-[10px] font-semibold">Dengeli</span>
                  </div>
                </div>

                {/* En Yüksek İşlem Hacmi - Mobile */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex flex-col gap-2 mb-3">
                    <h3 className="text-white text-base font-semibold">En Yüksek İşlem Hacmi</h3>
                    <span className="text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-2 py-1 rounded-full self-start">
                      3 Ayın en yüksek seviyesinde
                    </span>
                  </div>
                  <div className="h-72">
                    {typeof window !== 'undefined' && (
                      <ReactECharts 
                        option={{
                          backgroundColor: 'transparent',
                          tooltip: {
                            trigger: 'axis',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                            textStyle: { color: '#fff', fontSize: 10 },
                            axisPointer: { type: 'shadow' },
                            formatter: (params: any) => {
                              const data = params[0];
                              return `${data.name}<br/><strong>${data.value}M ₺</strong>`;
                            }
                          },
                          grid: {
                            left: '20%',
                            right: '4%',
                            bottom: '3%',
                            top: '3%',
                            containLabel: false
                          },
                          xAxis: {
                            type: 'value',
                            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                            axisLabel: { 
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: 9,
                              formatter: (value: number) => `${value}M`
                            },
                            splitLine: {
                              lineStyle: {
                                color: 'rgba(255,255,255,0.1)',
                                type: 'dashed'
                              }
                            }
                          },
                          yAxis: {
                            type: 'category',
                            data: ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Kocaeli', 'Adana', 'Mersin', 'Muğla', 'Gaziantep'],
                            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                            axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
                            splitLine: { show: false }
                          },
                          series: [
                            {
                              name: 'İşlem Hacmi',
                              type: 'bar',
                              data: [1850, 650, 480, 420, 385, 340, 310, 285, 260, 245],
                              itemStyle: {
                                color: {
                                  type: 'linear',
                                  x: 0,
                                  y: 0,
                                  x2: 1,
                                  y2: 0,
                                  colorStops: [
                                    { offset: 0, color: '#10b981' },
                                    { offset: 1, color: '#34d399' }
                                  ]
                                },
                                borderRadius: [0, 3, 3, 0]
                              },
                              barWidth: '50%'
                            }
                          ]
                        }}
                        style={{ height: '100%', width: '100%' }}
                      />
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
