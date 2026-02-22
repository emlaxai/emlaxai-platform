'use client';
import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function NufusTab() {
  return (
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
  );
}
