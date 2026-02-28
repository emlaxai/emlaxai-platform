// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';
import { geoNameToDbName } from '../../utils/constants';
import type { YasanilabilirlikData } from '@/lib/api';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const TT = { backgroundColor: 'rgba(0,0,0,0.88)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#fff', fontSize: 12 } };
const AL = { color: '#9ca3af', fontSize: 10 };
const SL = { lineStyle: { color: 'rgba(255,255,255,0.05)' } };

interface RiskTabProps {
  selectedIl: string | null;
  disasterRisk: any;
  economicData: any;
  economicDataLoading: boolean;
  yasanilabilirlik?: YasanilabilirlikData | null;
  yasanilabilirlikLoading?: boolean;
  isPro?: boolean;
  formatNumber: (n: number, decimals?: number) => string;
  formatChange: (n: number) => string;
  getChangeColor: (n: number) => string;
  getRiskColor: (score: number) => string;
  getRiskGradient: (score: number) => string;
}

export default function RiskTab({
  selectedIl, disasterRisk, economicData, economicDataLoading,
  yasanilabilirlik, yasanilabilirlikLoading, isPro = false,
  formatNumber, formatChange, getChangeColor, getRiskColor, getRiskGradient
}: RiskTabProps) {

  const fmtN = (n: number) => n?.toLocaleString('tr-TR') ?? '—';

  const yasanilabilirlikSection = !isPro && yasanilabilirlik ? (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
        <h3 className="text-white text-base font-semibold">Yaşanılabilirlik Endeksi</h3>
      </div>
      <p className="text-white/40 text-xs mb-4 ml-3">{yasanilabilirlik.il}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Güvenlik Skoru</p>
          <p className="text-white text-xl font-bold mt-1">{yasanilabilirlik.guvenlik_skoru}<span className="text-white/30 text-sm">/100</span></p>
          <p className={`text-[10px] mt-0.5 ${yasanilabilirlik.guvenlik_skoru >= 70 ? 'text-green-400' : yasanilabilirlik.guvenlik_skoru >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{yasanilabilirlik.seviye}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Suç Oranı (10K)</p>
          <p className="text-white text-xl font-bold mt-1">{yasanilabilirlik.suc_orani_10k.toFixed(1)}</p>
          <p className="text-white/30 text-[10px] mt-0.5">TR Ort: {yasanilabilirlik.tr_suc_orani_10k.toFixed(1)}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Güvenlik Sırası</p>
          <p className="text-white text-xl font-bold mt-1">{yasanilabilirlik.guvenlik_sira}<span className="text-white/30 text-sm">/{yasanilabilirlik.toplam_il}</span></p>
          <p className="text-white/30 text-[10px] mt-0.5">İller arası</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Toplam Hükümlü</p>
          <p className="text-white text-xl font-bold mt-1">{fmtN(yasanilabilirlik.toplam_hukumlu)}</p>
          <p className="text-white/30 text-[10px] mt-0.5">Nüfus: {fmtN(yasanilabilirlik.nufus)}</p>
        </div>
      </div>

      {yasanilabilirlik.suc_turleri?.length > 0 && (
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
          <h4 className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-3">Suç Türü Dağılımı</h4>
          <div className="h-56">
            <ReactECharts option={{
              grid: { top: 5, right: 55, bottom: 5, left: 100 }, tooltip: { ...TT, trigger: 'axis' },
              yAxis: { type: 'category', data: [...yasanilabilirlik.suc_turleri].reverse().map(s => s.tur), axisLabel: AL },
              xAxis: { type: 'value', show: false },
              series: [{
                type: 'bar', data: [...yasanilabilirlik.suc_turleri].reverse().map(s => s.sayi),
                itemStyle: { color: 'rgba(16,185,129,0.5)', borderRadius: [0, 4, 4, 0] }, barWidth: '55%',
                label: { show: true, position: 'right', color: 'rgba(255,255,255,0.5)', fontSize: 9, formatter: (p: any) => fmtN(p.value) },
              }],
            }} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div>
                  {/* Bölgelens: Yaşanılabilirlik en üstte */}
                  {yasanilabilirlikSection}

                  {/* Doğal Afet Riskleri */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all duration-200 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-4 bg-red-500 rounded-full" />
                      <h3 className="text-white text-base font-semibold">Doğal Afet Risk Haritası</h3>
                    </div>
                    <p className="text-white/40 text-xs mb-4 ml-3">{disasterRisk?.il || (selectedIl ? geoNameToDbName(selectedIl) : 'Türkiye Geneli')}</p>
                      {!disasterRisk ? (
                        <div className="text-white/40 text-sm text-center py-4">İl seçerek doğal afet risklerini görüntüleyin</div>
                      ) : (
                      <div className="space-y-3">
                        {disasterRisk.deprem && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 32 32" fill={disasterRisk.deprem.risk_color} className="flex-shrink-0">
                                <path d="M16.6123,2.2139a1.0094,1.0094,0,0,0-1.2427,0L1,13.4194l1.2427,1.5718L4,13.6211V26a2.0041,2.0041,0,0,0,2,2H26a2.0037,2.0037,0,0,0,2-2V13.63L29.7573,15,31,13.4282ZM6,12.0615,15,5.05v7.3638l3.458,3.458-6.7344,4.8105L14.3818,26H6ZM26,26H16.6182l-2.3418-4.6826,7.2656-5.1895L17,11.5859V5.0518l9,7.02Z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Deprem Riski</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: disasterRisk.deprem.risk_color }}>{disasterRisk.deprem.risk_label}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${disasterRisk.deprem.risk_pct}%`, background: `linear-gradient(to right, ${disasterRisk.deprem.risk_color}, ${disasterRisk.deprem.risk_color}cc)` }}></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">PGA (%2)</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.deprem.pga_2.toFixed(3)}g</div>
                            </div>
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">PGA (%10)</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.deprem.pga_10.toFixed(3)}g</div>
                            </div>
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">Ss (%2)</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.deprem.ss_2.toFixed(3)}g</div>
                            </div>
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">S1 (%2)</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.deprem.s1_2.toFixed(3)}g</div>
                            </div>
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">PGV (%2)</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.deprem.pgv_2.toFixed(1)} cm/s</div>
                            </div>
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">Ss (%10)</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.deprem.ss_10.toFixed(3)}g</div>
                            </div>
                          </div>
                          <div className="mt-2 text-white/30 text-[10px]">Kaynak: AFAD TDTH · 50 yılda aşılma olasılığı</div>
                        </div>
                        )}
                        {disasterRisk.yangin && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill={disasterRisk.yangin.risk_color} className="flex-shrink-0">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12.4803 2.76059C13.2315 2.30898 14.208 2.28697 15.0418 2.88997C17.7027 4.81436 20.75 8.2447 20.75 13.1111C20.75 16.9175 19.1146 19.3652 17.0325 20.835C15.7533 21.738 14.3232 22.2609 13.0331 22.5258C12.5577 22.6872 12.1 22.75 11.7333 22.75C11.6306 22.75 11.521 22.746 11.4058 22.7374C11.242 22.746 11.0843 22.75 10.9333 22.75C9.47245 22.75 7.31363 22.2658 5.50409 20.806C3.6625 19.3203 2.25 16.8771 2.25 13.1111C2.25 10.0344 3.87536 7.9652 5.40507 6.79826C6.04192 6.31244 6.80509 6.30435 7.40898 6.63407C7.99302 6.95295 8.40231 7.56762 8.47627 8.28958L8.5621 9.12741C8.59508 9.44943 8.75974 9.71671 8.93177 9.84683C9.0125 9.90789 9.07802 9.92706 9.12163 9.93034C9.15843 9.93311 9.21562 9.92815 9.30063 9.8729C9.95369 9.44849 10.4496 8.68506 10.7833 7.78664C11.1138 6.89653 11.25 5.96663 11.25 5.33336V5.00973C11.25 4.03696 11.7444 3.20294 12.4803 2.76059ZM15.5176 20.0225C15.7384 19.8964 15.9557 19.759 16.1675 19.6095C17.8631 18.4126 19.25 16.4159 19.25 13.1111C19.25 8.92389 16.6279 5.88822 14.1627 4.10543C13.838 3.8706 13.5133 3.88975 13.2531 4.04619C12.9775 4.21188 12.75 4.5528 12.75 5.00973V5.33336C12.75 6.14196 12.5831 7.24891 12.1894 8.30886C11.7988 9.3605 11.1494 10.4604 10.118 11.1306C9.38388 11.6077 8.59212 11.4706 8.02694 11.0432C7.49344 10.6397 7.14144 9.97856 7.0699 9.28027L6.98408 8.44244C6.95826 8.19039 6.82167 8.02241 6.69016 7.95061C6.5785 7.88965 6.45645 7.88284 6.31484 7.99087C5.04758 8.9576 3.75 10.6247 3.75 13.1111C3.75 16.4562 4.98195 18.4575 6.44591 19.6385C6.84345 19.9592 7.263 20.2233 7.68701 20.4381C7.41384 19.8888 7.25 19.2282 7.25 18.4445C7.25 16.341 8.57017 14.8717 9.69806 14.0521C10.2109 13.6795 10.8273 13.6907 11.2979 13.9755C11.7522 14.2504 12.0441 14.7589 12.0441 15.3334C12.0441 15.5682 12.0448 15.8335 12.0763 16.0969C12.0815 16.14 12.0873 16.1814 12.0938 16.221C12.254 15.8525 12.5484 15.5666 12.897 15.4155C13.3152 15.2342 13.847 15.2379 14.2912 15.5719C14.9907 16.098 15.75 17.0424 15.75 18.4445C15.75 19.0383 15.666 19.5627 15.5176 20.0225Z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Yangın Riski</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: disasterRisk.yangin.risk_color }}>{disasterRisk.yangin.risk_label}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${disasterRisk.yangin.risk_pct}%`, background: `linear-gradient(to right, ${disasterRisk.yangin.risk_color}, ${disasterRisk.yangin.risk_color}cc)` }}></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">FWI Max</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.yangin.fwi_max.toFixed(1)}</div>
                            </div>
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">FWI Ort.</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.yangin.fwi_ortalama.toFixed(1)}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-white/30 text-[10px]">Kaynak: Copernicus EFFIS · Haz-Eyl 2024 dönemi</div>
                        </div>
                        )}
                        {disasterRisk.sel && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 32 32" fill={disasterRisk.sel.risk_color} className="flex-shrink-0">
                                <path d="M2.884 8.884l2.933-2.933c3.246 4.352 6.929 4.429 10.184 0.24 3.256 4.187 6.936 4.111 10.184-0.24l2.932 2.933c0.226 0.227 0.539 0.367 0.885 0.367 0.691 0 1.251-0.56 1.251-1.251 0-0.345-0.14-0.658-0.366-0.884v0l-4-4c-0.226-0.226-0.539-0.366-0.885-0.366-0.445 0-0.836 0.232-1.058 0.582l-0.003 0.005c-1.395 2.232-2.758 3.413-3.939 3.413s-2.545-1.181-3.94-3.413c-0.238-0.333-0.624-0.548-1.059-0.548s-0.822 0.215-1.057 0.545l-0.003 0.004c-1.396 2.231-2.758 3.412-3.94 3.412s-2.545-1.181-3.94-3.412c-0.199-0.316-0.529-0.534-0.912-0.579l-0.006-0.001c-0.040-0.005-0.087-0.007-0.135-0.007-0.347 0-0.662 0.14-0.891 0.366l-4 4c-0.225 0.226-0.363 0.537-0.363 0.881 0 0.69 0.56 1.25 1.25 1.25 0.344 0 0.655-0.139 0.881-0.363z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Sel/Taşkın Riski</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: disasterRisk.sel.risk_color }}>{disasterRisk.sel.risk_label}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${disasterRisk.sel.risk_pct}%`, background: `linear-gradient(to right, ${disasterRisk.sel.risk_color}, ${disasterRisk.sel.risk_color}cc)` }}></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">Nehir Seli</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.sel.sel_nehir}</div>
                            </div>
                            <div className="bg-black/20 rounded-md px-2.5 py-1.5">
                              <div className="text-white/40 text-[10px] uppercase tracking-wider">Kentsel Sel</div>
                              <div className="text-white text-sm font-semibold">{disasterRisk.sel.sel_kentsel}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-white/30 text-[10px]">Kaynak: World Bank ThinkHazard / GFDRR</div>
                        </div>
                        )}
                        {disasterRisk.heyelan && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 304.428 304.428" fill={disasterRisk.heyelan.risk_color} className="flex-shrink-0">
                                <polygon points="304.428,290.78 192.408,216.411 166.649,216.995 159.753,189.147 122.766,167.54 124.503,117.125 66.696,89.945 56.025,41.215 0,13.648 0,290.78"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Heyelan Riski</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: disasterRisk.heyelan.risk_color }}>{disasterRisk.heyelan.risk_label}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${disasterRisk.heyelan.risk_pct}%`, background: `linear-gradient(to right, ${disasterRisk.heyelan.risk_color}, ${disasterRisk.heyelan.risk_color}cc)` }}></div>
                          </div>
                          <div className="mt-2 text-white/30 text-[10px]">Kaynak: World Bank ThinkHazard / GFDRR</div>
                        </div>
                        )}
                        {disasterRisk.tsunami && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill={disasterRisk.tsunami.risk_color} className="flex-shrink-0">
                                <path d="M2 16c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4zm16 0c0-2 2-4 4-4v8c-2 0-4-2-4-4zM12 4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2V6c0-1.1.9-2 2-2zm-6 8c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2s-2-.9-2-2v-2c0-1.1.9-2 2-2zm12-2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4c0-1.1.9-2 2-2z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Tsunami Riski</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: disasterRisk.tsunami.risk_color }}>{disasterRisk.tsunami.risk_label}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${disasterRisk.tsunami.risk_pct}%`, background: `linear-gradient(to right, ${disasterRisk.tsunami.risk_color}, ${disasterRisk.tsunami.risk_color}cc)` }}></div>
                          </div>
                          <div className="mt-2 text-white/30 text-[10px]">Kaynak: World Bank ThinkHazard / GFDRR</div>
                        </div>
                        )}
                      </div>
                      )}
                    </div>

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
                                data: ((economicData as any).historical_inflation_housing?.inflation || []).map((d: any) => d.month?.split(' ')[0]),
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
                                  data: ((economicData as any).historical_inflation_housing?.inflation || []).map((d: any) => d.value),
                                  itemStyle: { color: '#ef4444' },
                                  smooth: true,
                                  areaStyle: { opacity: 0.1 }
                                },
                                {
                                  name: 'Emlak Fiyat Artışı',
                                  type: 'line',
                                  data: ((economicData as any).historical_inflation_housing?.housing_price_increase || []).map((d: any) => d.value),
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

                  </div>

                  {/* Ekonomik Risk Değerlendirmesi */}
                  <div className="grid grid-cols-1 gap-4 mb-4">
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

                  </div>
    </div>
  );
}
