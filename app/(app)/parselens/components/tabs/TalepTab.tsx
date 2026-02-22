'use client';
import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface TalepTabProps {
  tapuIslemToplam: any;
  tapuIslemLoading: boolean;
  ilFiyatlari: any[];
  ilFiyatlariLoading: boolean;
  ilFiyatlariError: string | null;
  showAll81Cities: boolean;
  setShowAll81Cities: (v: boolean) => void;
}

export default function TalepTab({
  tapuIslemToplam, tapuIslemLoading,
  ilFiyatlari, ilFiyatlariLoading, ilFiyatlariError,
  showAll81Cities, setShowAll81Cities
}: TalepTabProps) {
  return (
    <div>
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

                  {/* TKGM Tapu İşlem Hacmi - En Çok İşlem Gören İller */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white text-lg font-semibold">TKGM Tapu İşlem Hacmi</h3>
                      <span className="text-blue-400 text-xs font-semibold bg-blue-500/10 px-3 py-1 rounded-full">
                        Kaynak: TKGM
                      </span>
                    </div>
                    <div className="h-96">
                      {tapuIslemLoading ? (
                        <div className="flex items-center justify-center h-full text-white/60 text-sm animate-pulse">
                          TKGM tapu verileri yükleniyor...
                        </div>
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
                                textStyle: { color: '#fff' },
                                axisPointer: { type: 'shadow' },
                                formatter: (params: any) => {
                                  const d = params[0];
                                  const il = tapuIslemToplam.iller.find(i => i.il === d.name);
                                  return `<strong>${d.name}</strong><br/>Toplam İşlem: <strong>${Number(d.value).toLocaleString('tr-TR')}</strong><br/>Parsel Sayısı: ${il ? il.parsel_sayisi.toLocaleString('tr-TR') : '-'}<br/>Ort. İşlem/Parsel: ${il ? il.ort_islem : '-'}`;
                                }
                              },
                              legend: {
                                data: ['Toplam İşlem', 'Yoğun Parsel'],
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
                                  formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : `${value}`
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
                                data: tapuIslemToplam.iller.slice(0, 15).reverse().map(i => i.il),
                                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                                axisLabel: { color: 'rgba(255,255,255,0.8)' },
                                splitLine: { show: false }
                              },
                              series: [
                                {
                                  name: 'Toplam İşlem',
                                  type: 'bar',
                                  data: tapuIslemToplam.iller.slice(0, 15).reverse().map(i => i.toplam_islem),
                                  itemStyle: {
                                    color: {
                                      type: 'linear',
                                      x: 0, y: 0, x2: 1, y2: 0,
                                      colorStops: [
                                        { offset: 0, color: '#3b82f6' },
                                        { offset: 1, color: '#60a5fa' }
                                      ]
                                    },
                                    borderRadius: [0, 4, 4, 0]
                                  }
                                },
                                {
                                  name: 'Yoğun Parsel',
                                  type: 'bar',
                                  data: tapuIslemToplam.iller.slice(0, 15).reverse().map(i => i.yogun_parsel),
                                  itemStyle: {
                                    color: {
                                      type: 'linear',
                                      x: 0, y: 0, x2: 1, y2: 0,
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
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full text-red-400 text-sm">
                          TKGM verileri yüklenemedi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Piyasa Metrikleri - 4'lü (Gerçek Veri) */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {/* Toplam Tapu İşlemi */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Toplam İşlem</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">
                        {tapuIslemToplam ? `${(tapuIslemToplam.genel.toplam_islem / 1000000).toFixed(1)}M` : '...'}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400 text-xs font-semibold">TKGM</span>
                        <span className="text-white/40 text-xs">81 İl</span>
                      </div>
                    </div>

                    {/* Ort. m² Fiyat */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="14" height="14" viewBox="0 0 440 440" fill="#10b981" className="flex-shrink-0 mt-1">
                          <path d="M344.33,212.5c0,103.857-80.577,189.248-182.5,196.936V197.361l151.76-55.236l-10.26-28.191l-141.5,51.502V121.38l151.76-55.236l-10.26-28.191l-141.5,51.502V0h-30v100.374l-66.16,24.08l10.261,28.191L131.83,132.3v44.055l-66.16,24.08l10.261,28.191l55.899-20.346V440h15c60.813,0,117.957-23.651,160.902-66.597c42.946-42.946,66.598-100.089,66.598-160.903H344.33z"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Ort. m² Fiyat</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">
                        {ilFiyatlari ? `${(ilFiyatlari.iller.reduce((a, b) => a + b.m2_fiyat, 0) / ilFiyatlari.iller.length / 1000).toFixed(1)}K ₺` : '...'}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500 text-xs font-semibold">TR Ort.</span>
                        <span className="text-white/40 text-xs">Güncel</span>
                      </div>
                    </div>

                    {/* Toplam Parsel */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Toplam Parsel</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">
                        {tapuIslemToplam ? `${(tapuIslemToplam.genel.toplam_parsel / 1000000).toFixed(1)}M` : '...'}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400 text-xs font-semibold">TKGM</span>
                        <span className="text-white/40 text-xs">Kayıtlı</span>
                      </div>
                    </div>

                    {/* Ort. İşlem/Parsel */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex items-start gap-2 mb-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        <p className="text-white/60 text-xs font-medium leading-tight">Ort. İşlem/Parsel</p>
                      </div>
                      <p className="text-white text-3xl font-bold mb-1">
                        {tapuIslemToplam ? tapuIslemToplam.genel.ort_islem_per_parsel.toFixed(2) : '...'}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs font-semibold">Likidite</span>
                        <span className="text-white/40 text-xs">Ort.</span>
                      </div>
                    </div>
                  </div>

                  {/* En Yüksek İşlem Yoğunluğu (ort. işlem/parsel bazında) */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white text-lg font-semibold">En Yüksek İşlem Yoğunluğu</h3>
                      <span className="text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
                        Ort. İşlem / Parsel
                      </span>
                    </div>
                    <div className="h-96">
                      {tapuIslemLoading ? (
                        <div className="flex items-center justify-center h-full text-white/60 text-sm animate-pulse">
                          Yoğunluk verileri yükleniyor...
                        </div>
                      ) : tapuIslemToplam ? (
                        typeof window !== 'undefined' && (() => {
                          const sorted = [...tapuIslemToplam.iller].sort((a, b) => b.ort_islem - a.ort_islem).slice(0, 15);
                          return (
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
                                    const d = params[0];
                                    const il = sorted.find(i => i.il === d.name);
                                    return `<strong>${d.name}</strong><br/>Ort. İşlem/Parsel: <strong>${d.value}</strong><br/>Toplam İşlem: ${il ? il.toplam_islem.toLocaleString('tr-TR') : '-'}<br/>Parsel: ${il ? il.parsel_sayisi.toLocaleString('tr-TR') : '-'}`;
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
                                  axisLabel: { color: 'rgba(255,255,255,0.6)' },
                                  splitLine: {
                                    lineStyle: {
                                      color: 'rgba(255,255,255,0.1)',
                                      type: 'dashed'
                                    }
                                  }
                                },
                                yAxis: {
                                  type: 'category',
                                  data: sorted.reverse().map(i => i.il),
                                  axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                                  axisLabel: { color: 'rgba(255,255,255,0.8)' },
                                  splitLine: { show: false }
                                },
                                series: [
                                  {
                                    name: 'Ort. İşlem/Parsel',
                                    type: 'bar',
                                    data: sorted.map(i => i.ort_islem),
                                    itemStyle: {
                                      color: {
                                        type: 'linear',
                                        x: 0, y: 0, x2: 1, y2: 0,
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
                          );
                        })()
                      ) : (
                        <div className="flex items-center justify-center h-full text-red-400 text-sm">
                          Veriler yüklenemedi
                        </div>
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
                                const trendScore = Math.min((item.trend_12ay || 0) / 2, 40); // Max 40 puan
                                const momentumScore = ((item as any).momentum || 0) * 4; // Max 20 puan
                                const aiScore = Math.round(priceScore + trendScore + momentumScore);
                                
                                return (
                                  <tr key={item.il} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-2 text-white/40 font-mono">{index + 1}</td>
                                    <td className="py-3 px-2 text-white font-medium capitalize">{item.il}</td>
                                    <td className="py-3 px-2 text-white text-right">{(item.m2_fiyat / 1000).toFixed(1)}K ₺</td>
                                    <td className="py-3 px-2 text-right">
                                      <span className={`font-semibold ${
                                        (item.trend_12ay ?? 0) >= 50 ? 'text-red-400' : 
                                        (item.trend_12ay ?? 0) >= 30 ? 'text-orange-400' : 
                                        'text-green-400'
                                      }`}>
                                        +{(item.trend_12ay ?? 0).toFixed(1)}%
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <div className="flex justify-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => {
                                          const m = (item as any).momentum || 0;
                                          const barColor = m >= 4 ? 'bg-green-500' : m >= 3 ? 'bg-blue-500' : m >= 2 ? 'bg-yellow-500' : m >= 1 ? 'bg-orange-500' : 'bg-white/10';
                                          return (
                                            <div 
                                              key={i} 
                                              className={`w-1.5 h-4 rounded-sm ${i < m ? barColor : 'bg-white/10'}`}
                                            ></div>
                                          );
                                        })}
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
    </div>
  );
}
