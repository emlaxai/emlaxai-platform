// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function YatirimTab() {
  return (
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
  );
}
