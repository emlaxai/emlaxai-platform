// @ts-nocheck
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface GenelTabProps {
  selectedParcel: any;
  parcelLoading: boolean;
  scoreCards: any[];
  chartOption: any;
  chartKey: number;
  selectedMetric: string;
  setSelectedMetric: (v: string) => void;
  trendKategori: string;
  setTrendKategori: (v: string) => void;
  selectedIl: string | null;
  selectedIlce: string | null;
  ilTrendLoading: boolean;
  imarBaskisi: boolean;
}

export default function GenelTab({
  selectedParcel, parcelLoading, scoreCards, chartOption, chartKey,
  selectedMetric, setSelectedMetric, trendKategori, setTrendKategori,
  selectedIl, selectedIlce, ilTrendLoading, imarBaskisi
}: GenelTabProps) {
  const [showImarInfo, setShowImarInfo] = useState(false);
  return (
    <>
                  {/* Line Chart Kartı - Üstte */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-sm font-medium">
                        {selectedIlce ? `${selectedIl} / ${selectedIlce} m² Fiyat Trendi` : selectedIl ? `${selectedIl} m² Fiyat Trendi` : `Türkiye ${imarBaskisi ? 'Arsa' : ''} m² Fiyat Trendi`}
                        {ilTrendLoading && selectedIl && <span className="text-white/40 text-xs ml-2">yükleniyor...</span>}
                      </h3>
                      <div className="flex items-center gap-2">
                        {selectedIl && (
                          <select
                            value={trendKategori}
                            onChange={(e) => setTrendKategori(e.target.value)}
                            className="bg-white/10 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
                          >
                            <option value="konut">Konut</option>
                            <option value="arsa">Arsa (İmarlı)</option>
                            <option value="arazi">Arazi (Tarla)</option>
                            <option value="ticari">Ticari</option>
                          </select>
                        )}
                        {!imarBaskisi && (
                          <select 
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="bg-white/10 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
                          >
                            <option value="m2">m² Fiyatı</option>
                            <option value="satis">Satış Fiyatı</option>
                            <option value="kira">Kira Getirisi</option>
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="h-80">
                      <ReactECharts 
                        key={`chart-${chartKey}`}
                        option={chartOption} 
                        notMerge={true}
                        lazyUpdate={false}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                      />
                    </div>
                  </div>

                  {/* Üst Satır: Arazi Özellikleri (sol) + exAI Değerleme (sağ) */}
                  {imarBaskisi && selectedParcel && !parcelLoading && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Sol: Arazi Özellikleri */}
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col">
                        <span className="text-white/60 text-xs font-semibold mb-3">Arazi Özellikleri</span>

                        {/* En Yakın Yol */}
                        {(() => {
                          const yol = selectedParcel.mesafeler.yol;
                          const displayDist = yol != null ? Math.max(1, Math.round(yol)) : null;
                          const dist = yol != null ? yol : 9999;
                          const zone = dist < 100 ? 0 : dist < 300 ? 1 : dist < 700 ? 2 : 3;
                          const zoneColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
                          const zoneLabels = ['Çok Yakın', 'Yakın', 'Orta', 'Uzak'];
                          const activeColor = zoneColors[zone];
                          return (
                            <div className="rounded-lg p-3 mb-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="text-white/40 text-[10px] font-medium mb-1">En Yakın Yol</div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-white text-[22px] font-bold leading-none">
                                  {displayDist != null ? (displayDist < 1000 ? displayDist : (displayDist / 1000).toFixed(1)) : '—'}
                                </span>
                                <span className="text-white/40 text-xs font-medium">{displayDist != null ? (displayDist < 1000 ? 'm' : 'km') : ''}</span>
                                <span className="text-[10px] font-semibold ml-auto" style={{ color: activeColor }}>{zoneLabels[zone]}</span>
                              </div>
                              <div className="flex gap-1 mt-2.5">
                                {zoneLabels.map((_, i) => (
                                  <div key={i} className="h-[5px] flex-1 rounded-full" style={{
                                    background: i <= zone ? zoneColors[i] : 'rgba(255,255,255,0.06)',
                                    opacity: i <= zone ? 1 : 0.4,
                                  }} />
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Arazi Eğimi */}
                        {(() => {
                          const egimi = selectedParcel.arazi_egimi;
                          const pct = egimi ? egimi.egim_pct : 0;
                          const deg = egimi ? egimi.egim_derece : 0;
                          const clampedDeg = Math.min(deg, 30);
                          const slopeColor = pct < 2 ? '#22c55e' : pct < 6 ? '#eab308' : pct < 12 ? '#f97316' : '#ef4444';
                          const w = 110, h = 70;
                          const slopeRad = (clampedDeg * Math.PI) / 180;
                          const endY = h - 6;
                          const startX = 6;
                          const endX = w - 6;
                          const startY = endY - Math.tan(slopeRad) * (endX - startX);
                          const midX = (startX + endX) / 2;
                          const midY = (startY + endY) / 2 - 2;
                          return (
                            <div className="rounded-lg p-3 flex-1 flex flex-col" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="text-white/40 text-[10px] font-medium mb-1">Arazi Eğimi</div>
                              {egimi ? (
                                <div className="flex items-center flex-1">
                                  <div className="min-w-0" style={{ width: '45%' }}>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-white text-[22px] font-bold leading-none">%{egimi.egim_pct}</span>
                                    </div>
                                    <div className="text-white/40 text-xs mt-0.5">{egimi.egim_derece}°</div>
                                    <div className="text-[10px] font-semibold mt-2" style={{ color: slopeColor }}>{egimi.seviye}</div>
                                    <div className="text-white/30 text-[10px] mt-0.5">{egimi.min_rakım}–{egimi.max_rakım} m</div>
                                  </div>
                                  <div className="flex-1">
                                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 'auto' }}>
                                      <defs>
                                        <linearGradient id="slopeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                          <stop offset="0%" stopColor={slopeColor} stopOpacity="0.35" />
                                          <stop offset="100%" stopColor={slopeColor} stopOpacity="0.03" />
                                        </linearGradient>
                                      </defs>
                                      <line x1={startX} y1={endY} x2={endX} y2={endY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                                      <polygon points={`${startX},${endY} ${endX},${endY} ${endX},${Math.max(startY, 6)}`} fill="url(#slopeGrad)" />
                                      <line x1={startX} y1={endY} x2={endX} y2={Math.max(startY, 6)} stroke={slopeColor} strokeWidth="2.5" strokeLinecap="round" />
                                      <circle cx={midX} cy={midY + 1} r="3.5" fill={slopeColor} />
                                      {clampedDeg > 1 && (
                                        <path
                                          d={`M ${endX - 16},${endY} A 16,16 0 0,0 ${endX - 16 * Math.cos(slopeRad)},${endY - 16 * Math.sin(slopeRad)}`}
                                          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="2,2"
                                        />
                                      )}
                                    </svg>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-white/30 text-xs flex-1 flex items-center">Hesaplanıyor...</div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Sağ: exAI Değerleme + İmar Baskısı */}
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/60 text-xs font-semibold">exAI Değerleme</span>
                          {selectedParcel.fiyat_tahmini && (
                            <div className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                              selectedParcel.fiyat_tahmini.guvenilirlik === 'cok_dusuk' ? 'text-orange-400 bg-orange-500/15' :
                              selectedParcel.fiyat_tahmini.guvenilirlik === 'dusuk' ? 'text-yellow-400 bg-yellow-500/15' :
                              'text-emerald-400 bg-emerald-500/15'
                            }`}>
                              {selectedParcel.fiyat_tahmini.guvenilirlik === 'yuksek' ? 'Yüksek' :
                               selectedParcel.fiyat_tahmini.guvenilirlik === 'orta' ? 'Orta' :
                               selectedParcel.fiyat_tahmini.guvenilirlik === 'dusuk' ? 'Düşük' : 'Tahmini'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex gap-3">
                          {/* Sol: Parsel bilgileri + fiyat */}
                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            {selectedParcel.fiyat_tahmini ? (
                              <>
                                <div>
                                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Toplam Değer</div>
                                  <div className="text-white text-lg font-bold tracking-tight leading-tight">
                                    {Number(selectedParcel.fiyat_tahmini.tahmini_toplam).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                                  </div>
                                </div>
                                <div>
                                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">m² Fiyat</div>
                                  <div className="text-white text-[13px] font-bold">
                                    {Number(selectedParcel.fiyat_tahmini.arazi_m2 || selectedParcel.fiyat_tahmini.tahmini_m2).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                                  </div>
                                </div>
                                <div>
                                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Alan</div>
                                  <div className="text-white text-[13px] font-bold">
                                    {Math.round(selectedParcel.parsel.alan).toLocaleString('tr-TR')} m²
                                  </div>
                                </div>
                                <div>
                                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Cins</div>
                                  <div className="text-white text-[13px] font-bold">{selectedParcel.parsel.cins}</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Cins</div>
                                  <div className="text-white text-[13px] font-bold">{selectedParcel.parsel.cins}</div>
                                </div>
                                <div>
                                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Alan</div>
                                  <div className="text-white text-[13px] font-bold">{Math.round(selectedParcel.parsel.alan).toLocaleString('tr-TR')} m²</div>
                                </div>
                                <div>
                                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Gerçek Alan</div>
                                  <div className="text-white text-[13px] font-bold">{Math.round(selectedParcel.parsel.gercek_alan_m2).toLocaleString('tr-TR')} m²</div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Sağ: İmar Potansiyeli Apple Gauge */}
                          {(() => {
                            const skor = selectedParcel.imar_baskisi?.skor || 0;
                            const pct = Math.min(100, Math.max(0, skor));
                            const gaugeColor = skor >= 75 ? '#ef4444' : skor >= 50 ? '#f97316' : skor >= 25 ? '#eab308' : '#22c55e';
                            const seviyeLabel = skor >= 75 ? 'Çok Yüksek' : skor >= 50 ? 'Yüksek' : skor >= 25 ? 'Orta' : 'Düşük';
                            const size = 120;
                            const strokeW = 10;
                            const r = (size - strokeW) / 2;
                            const cx = size / 2;
                            const cy = size / 2;
                            const circumference = 2 * Math.PI * r;
                            const dashOffset = circumference - (pct / 100) * circumference;

                            const ilAdi = selectedParcel.parsel?.il || selectedIl || 'İlgili il';

                            return (
                              <div className="flex flex-col items-center justify-center flex-shrink-0 relative" style={{ width: 130, marginLeft: -20 }}>
                                <div className="flex items-center gap-1 mb-1.5">
                                  <span className="text-white/40 text-[10px] font-medium">İmar Potansiyeli</span>
                                  <button
                                    onClick={() => setShowImarInfo(!showImarInfo)}
                                    className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/10 transition-colors"
                                    style={{ border: '1px solid rgba(255,255,255,0.15)', fontSize: '9px', fontWeight: 600, lineHeight: 1 }}
                                  >?</button>
                                </div>
                                <div className="relative" style={{ width: size, height: size }}>
                                  <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
                                    <circle cx={cx} cy={cy} r={r} fill="none"
                                      stroke={gaugeColor}
                                      strokeWidth={strokeW}
                                      strokeDasharray={circumference}
                                      strokeDashoffset={dashOffset}
                                      strokeLinecap="round"
                                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-white text-2xl font-bold leading-none">{skor}</div>
                                    <div className="text-white/25 text-[9px] mt-0.5">/ 100</div>
                                    <div className="text-[9px] font-semibold mt-1" style={{ color: gaugeColor }}>{seviyeLabel}</div>
                                  </div>
                                </div>

                                {showImarInfo && (
                                  <div className="absolute z-50 rounded-xl p-3.5 shadow-2xl" style={{
                                    top: -8, right: -8,
                                    width: 260,
                                    background: 'rgba(15,23,42,0.97)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(20px)',
                                  }}>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-white/70 text-[11px] font-semibold">İmar Potansiyeli Hakkında</span>
                                      <button onClick={() => setShowImarInfo(false)} className="text-white/30 hover:text-white/60 transition-colors text-xs leading-none">&times;</button>
                                    </div>
                                    <p className="text-white/50 text-[10px] leading-relaxed">
                                      Bu skor, <span className="text-white/70 font-medium">{ilAdi}</span> Büyükşehir / İl Belediyesi'nden temin edilen 1/1.000 ve 1/5.000 ölçekli imar planları verileri, Tapu ve Kadastro Genel Müdürlüğü (TKGM) kadastro verileri ve çevre parsel analizleri kullanılarak emlaXAI yapay zekâ algoritmaları ile hesaplanmıştır.
                                    </p>
                                    <p className="text-white/35 text-[9px] leading-relaxed mt-1.5">
                                      Skor 0-100 arasında olup parselin imar planı değişikliğine maruz kalma olasılığını ifade eder. Kesin imar durumu için ilgili belediyeye başvurunuz.
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* İmar Modu - Parsel Detay Kartı (Chart altında) */}
                  {imarBaskisi && (selectedParcel || parcelLoading) && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                      {parcelLoading ? (
                        <div className="p-6 flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          <span className="text-white/50 text-sm">Parsel analiz ediliyor...</span>
                        </div>
                      ) : selectedParcel ? (
                        <>
                          {/* 3. AI İmar Potansiyel Analizi */}
                          {selectedParcel.parsel.imar_potansiyel > 0 && (
                            <div className="px-4 py-3 border-b border-white/5">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
                                  <span className="text-amber-300 text-xs font-semibold">AI İmar Potansiyel Analizi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="relative w-10 h-10">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                                        stroke={selectedParcel.parsel.imar_potansiyel >= 75 ? '#ef4444' : selectedParcel.parsel.imar_potansiyel >= 50 ? '#f97316' : selectedParcel.parsel.imar_potansiyel >= 25 ? '#eab308' : '#22c55e'}
                                        strokeWidth="3.5" strokeDasharray={`${selectedParcel.parsel.imar_potansiyel}, 100`} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-white text-[10px] font-bold">%{selectedParcel.parsel.imar_potansiyel}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-bold ${
                                      selectedParcel.parsel.imar_potansiyel >= 75 ? 'text-red-400' :
                                      selectedParcel.parsel.imar_potansiyel >= 50 ? 'text-orange-400' :
                                      selectedParcel.parsel.imar_potansiyel >= 25 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                      {selectedParcel.parsel.imar_potansiyel >= 75 ? 'Çok Yüksek' :
                                       selectedParcel.parsel.imar_potansiyel >= 50 ? 'Yüksek' :
                                       selectedParcel.parsel.imar_potansiyel >= 25 ? 'Orta' : 'Düşük'}
                                    </div>
                                    <div className="text-white/40 text-[9px]">İmar Olasılığı</div>
                                  </div>
                                </div>
                              </div>
                              {/* Tahmin Detayları */}
                              <div className="grid grid-cols-3 gap-2">
                                {selectedParcel.parsel.imar_tipi_tahmini && (
                                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-2 py-1.5 text-center">
                                    <div className="text-white/30 text-[8px]">Olası İmar Tipi</div>
                                    <div className="text-purple-300 text-[12px] font-bold">{selectedParcel.parsel.imar_tipi_tahmini}</div>
                                    {selectedParcel.parsel.imar_tipi_guven > 0 && (
                                      <div className="text-white/20 text-[8px]">%{Math.round(selectedParcel.parsel.imar_tipi_guven * 100)} güven</div>
                                    )}
                                  </div>
                                )}
                                {selectedParcel.parsel.tahmini_kat_imar > 0 && (
                                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1.5 text-center">
                                    <div className="text-white/30 text-[8px]">Tahmini Kat</div>
                                    <div className="text-blue-300 text-[12px] font-bold">{selectedParcel.parsel.tahmini_kat_imar} Kat</div>
                                    {selectedParcel.parsel.tahmini_taks_imar > 0 && (
                                      <div className="text-white/20 text-[8px]">TAKS %{Math.round(selectedParcel.parsel.tahmini_taks_imar * 100)}</div>
                                    )}
                                  </div>
                                )}
                                {selectedParcel.parsel.imar_sure_tahmini && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1.5 text-center">
                                    <div className="text-white/30 text-[8px]">Tahmini Süre</div>
                                    <div className="text-emerald-300 text-[12px] font-bold">{selectedParcel.parsel.imar_sure_tahmini} Yıl</div>
                                    <div className="text-white/20 text-[8px]">açılma süresi</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* TKGM Yapı Bilgileri (Orijinal Veri) */}
                          {(selectedParcel.parsel.max_kat > 0 || selectedParcel.parsel.toplam_bb > 0) && (
                            <div className="px-4 py-3 border-b border-white/5">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-white/50 text-xs font-medium">Yapı Bilgileri</span>
                                <span className="text-[8px] text-emerald-400/60 bg-emerald-500/10 px-1.5 py-0.5 rounded">TKGM</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {selectedParcel.parsel.max_kat > 0 && (
                                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">Kat Sayısı</div>
                                    <div className="text-emerald-400 text-[13px] font-bold">{selectedParcel.parsel.max_kat}</div>
                                  </div>
                                )}
                                {selectedParcel.parsel.toplam_bb > 0 && (
                                  <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">Bağımsız Bölüm</div>
                                    <div className="text-white text-[13px] font-bold">{selectedParcel.parsel.toplam_bb}</div>
                                  </div>
                                )}
                                {selectedParcel.parsel.mesken_sayisi > 0 && (
                                  <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">Mesken</div>
                                    <div className="text-white text-[13px] font-bold">{selectedParcel.parsel.mesken_sayisi}</div>
                                  </div>
                                )}
                              </div>
                              {selectedParcel.parsel.isyeri_sayisi > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">İşyeri</div>
                                    <div className="text-white text-[13px] font-bold">{selectedParcel.parsel.isyeri_sayisi}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Bina & Yoğunluk Analizi (MS Footprints + Hesaplama) */}
                          {(selectedParcel.parsel.taks > 0 || selectedParcel.parsel.bina_sayisi_ms > 0) && (
                            <div className="px-4 py-3 border-b border-white/5">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-white/50 text-xs font-medium">Yoğunluk Analizi</span>
                                <span className="text-[8px] text-blue-400/60 bg-blue-500/10 px-1.5 py-0.5 rounded">Hesaplama</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {selectedParcel.parsel.bina_sayisi_ms > 0 && (
                                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">Bina Sayısı</div>
                                    <div className="text-indigo-400 text-[13px] font-bold">{selectedParcel.parsel.bina_sayisi_ms}</div>
                                    <div className="text-white/20 text-[7px]">Uydu Tespiti</div>
                                  </div>
                                )}
                                {selectedParcel.parsel.bina_alan_ms > 0 && (
                                  <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">Bina Alanı</div>
                                    <div className="text-white text-[13px] font-bold">{Math.round(selectedParcel.parsel.bina_alan_ms).toLocaleString('tr-TR')}<span className="text-[9px] text-white/30 font-normal"> m²</span></div>
                                  </div>
                                )}
                                {selectedParcel.parsel.max_kat === 0 && selectedParcel.parsel.tahmini_kat > 0 && (
                                  <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">Tahmini Kat</div>
                                    <div className="text-white/70 text-[13px] font-bold">~{selectedParcel.parsel.tahmini_kat}</div>
                                    <div className="text-white/20 text-[7px]">Çevre Ort.</div>
                                  </div>
                                )}
                              </div>
                              {(selectedParcel.parsel.taks > 0 || selectedParcel.parsel.kaks > 0) && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">TAKS</div>
                                    <div className="text-amber-400 text-[13px] font-bold">%{(selectedParcel.parsel.taks * 100).toFixed(0)}</div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                                      <div className="h-full rounded-full bg-amber-500/60" style={{ width: `${Math.min(100, selectedParcel.parsel.taks * 100)}%` }} />
                                    </div>
                                  </div>
                                  <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-2.5 py-2">
                                    <div className="text-white/30 text-[9px]">KAKS</div>
                                    <div className="text-cyan-400 text-[13px] font-bold">{selectedParcel.parsel.kaks?.toFixed(2)}</div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                                      <div className="h-full rounded-full bg-cyan-500/60" style={{ width: `${Math.min(100, (selectedParcel.parsel.kaks || 0) / 3 * 100)}%` }} />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Konum Analizi */}
                          {selectedParcel.poi_mesafeler && (
                            <div className="px-4 py-3 border-b border-white/5">
                              <span className="text-white/50 text-xs font-medium block mb-3">Konum Analizi</span>
                              {(() => {
                                const distColor = (d: number | null, thresholds: number[]) => {
                                  if (d == null) return 'rgba(255,255,255,0.15)';
                                  if (d <= thresholds[0]) return '#22c55e';
                                  if (d <= thresholds[1]) return '#eab308';
                                  return '#ef4444';
                                };
                                const distLabel = (d: number | null) => {
                                  if (d == null) return '—';
                                  return d < 1000 ? `${d} m` : `${(d / 1000).toFixed(1)} km`;
                                };
                                const pois = [
                                  {
                                    label: 'Sanayi / OSB', data: selectedParcel.poi_mesafeler.sanayi, radius: '15 km',
                                    thresholds: [5000, 15000], color: '#f97316',
                                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 22V8l5-6 5 6v14M7 2v4M14 22V11l4-4 4 4v11M18 7v4M2 22h20M6 12h2M6 16h2M16 14h2M16 18h2" /></svg>,
                                  },
                                  {
                                    label: 'Havalimanı', data: selectedParcel.poi_mesafeler.havalimani, radius: '80 km',
                                    thresholds: [20000, 50000], color: '#3b82f6',
                                    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512"><path d="M496.079,15.928C485.804,5.652,472.131,0,457.581,0c-0.005,0-0.005,0-0.005,0c-14.561,0-28.244,5.658-38.524,15.942l-77.59,77.582L88.678,30.329c-3.701-0.909-7.636,0.16-10.344,2.866L39.832,71.697c-2.51,2.505-3.637,6.079-3.031,9.573c0.612,3.494,2.882,6.472,6.095,7.982l205.926,96.911l-91.848,91.848L34.354,295.869c-2.324,0.34-4.473,1.42-6.132,3.079L3.19,323.975c-2.712,2.712-3.797,6.653-2.856,10.37c0.941,3.723,3.771,6.674,7.445,7.77l107.063,31.903l20.778,20.772l34.312,109.573c1.138,3.637,4.095,6.414,7.791,7.323c0.862,0.213,1.734,0.314,2.601,0.314c2.856,0,5.637-1.122,7.701-3.191l25.027-25.032c1.659-1.659,2.739-3.808,3.079-6.132l17.858-122.618l91.226-91.231l89.769,197.475c1.479,3.255,4.456,5.573,7.972,6.212c3.489,0.633,7.121-0.489,9.642-3.016l38.508-38.508c2.654-2.654,3.755-6.488,2.914-10.152l-56.403-244.407l78.447-78.449C517.303,71.71,517.313,37.156,496.079,15.928z" /></svg>,
                                  },
                                  {
                                    label: 'Otobüs / Ulaşım', data: (selectedParcel.poi_mesafeler as any).otobus, radius: '5 km',
                                    thresholds: [1000, 3000], color: '#8b5cf6',
                                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h17.25M6 3h12a3 3 0 013 3v5.25H3V6a3 3 0 013-3z" /></svg>,
                                  },
                                  {
                                    label: 'Hastane', data: selectedParcel.poi_mesafeler.hastane, radius: '10 km',
                                    thresholds: [3000, 8000], color: '#ec4899',
                                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                  },
                                  {
                                    label: 'Okul', data: selectedParcel.poi_mesafeler.okul, radius: '5 km',
                                    thresholds: [1500, 4000], color: '#06b6d4',
                                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>,
                                  },
                                  {
                                    label: 'Market', data: (selectedParcel.poi_mesafeler as any).market, radius: '5 km',
                                    thresholds: [1000, 3000], color: '#10b981',
                                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
                                  },
                                  {
                                    label: 'Eczane', data: (selectedParcel.poi_mesafeler as any).eczane, radius: '5 km',
                                    thresholds: [1500, 4000], color: '#14b8a6',
                                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>,
                                  },
                                  {
                                    label: 'Cami', data: selectedParcel.poi_mesafeler.cami, radius: '5 km',
                                    thresholds: [500, 2000], color: '#64748b',
                                    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
                                  },
                                ];

                                return (
                                  <div className="space-y-1">
                                    {pois.map((item, i) => {
                                      const dist = item.data?.distance_m ?? null;
                                      const barColor = distColor(dist, item.thresholds);
                                      const maxBar = item.thresholds[1] * 1.2;
                                      const barPct = dist != null ? Math.min(100, Math.max(3, (1 - dist / maxBar) * 100)) : 0;

                                      return (
                                        <div key={i} className="flex items-center gap-2.5 py-1.5 group">
                                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, color: item.color }}>
                                            {item.icon}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                              <span className="text-white/50 text-[10px] font-medium">{item.label}</span>
                                              <span className="text-white text-[11px] font-semibold">{item.data ? distLabel(dist) : <span className="text-white/20 font-normal">{item.radius} içinde yok</span>}</span>
                                            </div>
                                            <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barPct}%`, background: barColor }} />
                                            </div>
                                            {item.data?.name && <div className="text-white/20 text-[8px] truncate mt-0.5">{item.data.name}</div>}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Bölge Dağılımı */}
                          {selectedParcel.bolge_dagilim && selectedParcel.bolge_dagilim.length > 0 && (
                            <div className="px-4 py-3">
                              <span className="text-white/50 text-xs font-medium block mb-2">Çevre Parsel Dağılımı (~500m)</span>
                              <div className="space-y-1.5">
                                {selectedParcel.bolge_dagilim.map((d, i) => {
                                  const total = selectedParcel.bolge_dagilim.reduce((sum, x) => sum + x.sayi, 0);
                                  const pct = total > 0 ? (d.sayi / total) * 100 : 0;
                                  const colors: Record<string, string> = {
                                    'Arsa': '#f59e0b', 'Konut': '#3b82f6', 'Ticari': '#8b5cf6',
                                    'Tarim': '#22c55e', 'Orman': '#065f46', 'HamToprak': '#78716c',
                                    'Yol': '#6b7280', 'Diger': '#a78bfa',
                                  };
                                  return (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className="w-14 text-[10px] text-white/40 truncate">{d.kategori}</div>
                                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500" style={{
                                          width: `${pct}%`,
                                          backgroundColor: colors[d.kategori] || '#a78bfa',
                                        }} />
                                      </div>
                                      <div className="w-8 text-[10px] text-white/40 text-right">{d.sayi}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Skor Kartları - Altta (sadece il seçilince görünür, piyasa modunda) */}
                  {selectedIl && !imarBaskisi && (
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
                  )}


                  {/* Disclaimer */}
                  <div className="pt-3 border-t border-white/10">
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
    </>
  );
}
