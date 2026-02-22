'use client';
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
  return (
    <>
                  {/* İmar Modu - Parsel Detay Kartı */}
                  {imarBaskisi && (selectedParcel || parcelLoading) && (
                    <div className="bg-gradient-to-br from-amber-500/5 to-red-500/5 backdrop-blur-sm border border-amber-500/20 rounded-xl overflow-hidden">
                      {parcelLoading ? (
                        <div className="p-6 flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                          <span className="text-white/50 text-sm">Parsel analiz ediliyor...</span>
                        </div>
                      ) : selectedParcel ? (
                        <>
                          {/* Parsel Başlık */}
                          <div className="px-4 pt-4 pb-3 border-b border-white/5">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <img src="/icons/map-point-rotate.svg" alt="Parsel" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                                  <div>
                                    <h3 className="text-white text-sm font-semibold">Ada {selectedParcel.parsel.ada} / Parsel {selectedParcel.parsel.parsel}</h3>
                                    <p className="text-white/40 text-[10px]">{selectedParcel.parsel.mahalle} • {selectedParcel.parsel.ilce} / {selectedParcel.parsel.il}</p>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => setSelectedParcel(null)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* AI İmar Potansiyel Analizi */}
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

                          {/* Tahmini Fiyat - Arazi + Yapı ayrı */}
                          {selectedParcel.fiyat_tahmini && (
                            <div className="px-4 py-3 border-b border-white/5">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-600" />
                                <span className="text-emerald-300 text-xs font-semibold">AI Fiyat Tahmini</span>
                                <span className="ml-auto text-[9px] text-white/25">Ada Bazlı v3</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-2">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                                  <div className="text-white/30 text-[9px] mb-1">Arazi m²</div>
                                  <div className="text-emerald-400 text-lg font-bold">
                                    {Number(selectedParcel.fiyat_tahmini.arazi_m2 || selectedParcel.fiyat_tahmini.tahmini_m2).toLocaleString('tr-TR', {maximumFractionDigits: 0})} ₺
                                  </div>
                                </div>
                                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
                                  <div className="text-white/30 text-[9px] mb-1">Toplam Değer</div>
                                  <div className="text-cyan-400 text-lg font-bold">
                                    {Number(selectedParcel.fiyat_tahmini.tahmini_toplam) >= 1000000
                                      ? `${(Number(selectedParcel.fiyat_tahmini.tahmini_toplam) / 1000000).toFixed(1)}M ₺`
                                      : `${(Number(selectedParcel.fiyat_tahmini.tahmini_toplam) / 1000).toFixed(0)}K ₺`
                                    }
                                  </div>
                                </div>
                              </div>
                              {Number(selectedParcel.fiyat_tahmini.yapi_degeri || 0) > 0 && (
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center">
                                    <div className="text-white/30 text-[8px] mb-0.5">Arazi Değeri</div>
                                    <div className="text-amber-400 text-sm font-bold">
                                      {Number(selectedParcel.fiyat_tahmini.arazi_toplam || 0) >= 1000000
                                        ? `${(Number(selectedParcel.fiyat_tahmini.arazi_toplam || 0) / 1000000).toFixed(1)}M ₺`
                                        : `${(Number(selectedParcel.fiyat_tahmini.arazi_toplam || 0) / 1000).toFixed(0)}K ₺`
                                      }
                                    </div>
                                  </div>
                                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-2.5 text-center">
                                    <div className="text-white/30 text-[8px] mb-0.5">Yapı Değeri</div>
                                    <div className="text-violet-400 text-sm font-bold">
                                      {Number(selectedParcel.fiyat_tahmini.yapi_degeri) >= 1000000
                                        ? `${(Number(selectedParcel.fiyat_tahmini.yapi_degeri) / 1000000).toFixed(1)}M ₺`
                                        : `${(Number(selectedParcel.fiyat_tahmini.yapi_degeri) / 1000).toFixed(0)}K ₺`
                                      }
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-[9px]">
                                <span className="text-white/25">Güvenilirlik:</span>
                                <span className={`font-medium ${
                                  selectedParcel.fiyat_tahmini.guvenilirlik === 'cok_dusuk' ? 'text-orange-400' : 'text-emerald-400'
                                }`}>
                                  {selectedParcel.fiyat_tahmini.guvenilirlik === 'yuksek' ? 'Yüksek' :
                                   selectedParcel.fiyat_tahmini.guvenilirlik === 'orta' ? 'Orta' :
                                   selectedParcel.fiyat_tahmini.guvenilirlik === 'dusuk' ? 'Orta' : 'Tahmini'}
                                </span>
                                <span className="text-white/15 ml-auto">Kategori: {selectedParcel.fiyat_tahmini.kategori}</span>
                              </div>
                            </div>
                          )}

                          {/* Tapu İşlem Hacmi */}
                          {selectedParcel.tapu_islem && (
                            <div className="px-4 py-3 border-b border-white/5">
                              <span className="text-white/50 text-xs font-medium block mb-2">TKGM Tapu İşlem Hacmi</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-2.5 py-2">
                                  <div className="text-white/30 text-[9px]">Bu Parsel</div>
                                  <div className="text-blue-400 text-[13px] font-bold">{selectedParcel.tapu_islem.parsel_islem} <span className="text-[9px] text-white/30 font-normal">işlem</span></div>
                                </div>
                                <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                  <div className="text-white/30 text-[9px]">Çevre Ort. (500m)</div>
                                  <div className="text-white text-[13px] font-bold">{selectedParcel.tapu_islem.cevre_ort} <span className="text-[9px] text-white/30 font-normal">işlem</span></div>
                                </div>
                                <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                  <div className="text-white/30 text-[9px]">Çevre Max</div>
                                  <div className="text-white text-[13px] font-bold">{selectedParcel.tapu_islem.cevre_max} <span className="text-[9px] text-white/30 font-normal">işlem</span></div>
                                </div>
                                <div className="bg-white/5 rounded-lg px-2.5 py-2">
                                  <div className="text-white/30 text-[9px]">Çevre Toplam ({selectedParcel.tapu_islem.cevre_parsel} parsel)</div>
                                  <div className="text-white text-[13px] font-bold">{selectedParcel.tapu_islem.cevre_toplam || 0} <span className="text-[9px] text-white/30 font-normal">işlem</span></div>
                                </div>
                              </div>
                              <div className="text-white/20 text-[8px] mt-1.5 text-center">Kaynak: Tapu ve Kadastro Genel Müdürlüğü (TKGM)</div>
                            </div>
                          )}

                          {/* Parsel Bilgileri */}
                          <div className="px-4 py-3 border-b border-white/5">
                            <span className="text-white/50 text-xs font-medium block mb-2">Parsel Bilgileri</span>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { label: 'Cins', value: selectedParcel.parsel.cins },
                                { label: 'Alan', value: `${Math.round(selectedParcel.parsel.alan).toLocaleString('tr-TR')} m²` },
                                { label: 'Gerçek Alan', value: `${Math.round(selectedParcel.parsel.gercek_alan_m2).toLocaleString('tr-TR')} m²` },
                              ].map((item, i) => (
                                <div key={i} className="bg-white/5 rounded-lg px-2.5 py-2">
                                  <div className="text-white/30 text-[9px]">{item.label}</div>
                                  <div className="text-white text-[11px] font-medium truncate">{item.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>

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

                          {/* Kadastro Mesafeleri */}
                          <div className="px-4 py-3 border-b border-white/5">
                            <span className="text-white/50 text-xs font-medium block mb-2">Kadastro Mesafeleri</span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: 'En Yakın Yol', value: selectedParcel.mesafeler.yol, icon: '🛤️', color: '#6b7280' },
                                { label: 'En Yakın Arsa', value: selectedParcel.mesafeler.arsa, icon: '🏗️', color: '#f59e0b' },
                                { label: 'En Yakın Konut', value: selectedParcel.mesafeler.konut, icon: '🏠', color: '#3b82f6' },
                                { label: 'En Yakın Ticari', value: selectedParcel.mesafeler.ticari, icon: '🏢', color: '#8b5cf6' },
                              ].map((item, i) => (
                                <div key={i} className="bg-white/5 rounded-lg px-2.5 py-2 flex items-center gap-2">
                                  <span className="text-sm">{item.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white/30 text-[9px]">{item.label}</div>
                                    <div className="text-white text-[11px] font-medium">
                                      {item.value != null ? (item.value < 1000 ? `${Math.round(item.value)} m` : `${(item.value / 1000).toFixed(1)} km`) : '—'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* POI Mesafeleri (PostGIS) */}
                          {selectedParcel.poi_mesafeler && (
                            <div className="px-4 py-3 border-b border-white/5">
                              <span className="text-white/50 text-xs font-medium block mb-2">Çevre Mesafeleri</span>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { label: 'Okul', data: selectedParcel.poi_mesafeler.okul, icon: '🏫', radius: '5 km' },
                                  { label: 'Hastane', data: selectedParcel.poi_mesafeler.hastane, icon: '🏥', radius: '10 km' },
                                  { label: 'Cami', data: selectedParcel.poi_mesafeler.cami, icon: '🕌', radius: '5 km' },
                                  { label: 'Market', data: (selectedParcel.poi_mesafeler as any).market, icon: '🛒', radius: '5 km' },
                                  { label: 'Eczane', data: (selectedParcel.poi_mesafeler as any).eczane, icon: '💊', radius: '5 km' },
                                  { label: 'Otobüs', data: (selectedParcel.poi_mesafeler as any).otobus, icon: '🚌', radius: '5 km' },
                                  { label: 'Sanayi / OSB', data: selectedParcel.poi_mesafeler.sanayi, icon: '🏭', radius: '15 km' },
                                  { label: 'Havalimanı', data: selectedParcel.poi_mesafeler.havalimani, icon: '✈️', radius: '80 km' },
                                ].map((item, i) => (
                                  <div key={i} className="bg-white/5 rounded-lg px-2.5 py-2 flex items-center gap-2">
                                    <span className="text-sm">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white/30 text-[9px]">{item.label}</div>
                                      {item.data ? (
                                        <>
                                          <div className="text-white text-[11px] font-medium">
                                            {item.data.distance_m < 1000 ? `${item.data.distance_m} m` : `${(item.data.distance_m / 1000).toFixed(1)} km`}
                                          </div>
                                          {item.data.name && <div className="text-white/25 text-[8px] truncate">{item.data.name}</div>}
                                        </>
                                      ) : (
                                        <div className="text-white/20 text-[10px]">{item.radius} içinde yok</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
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

                  {/* Line Chart Kartı - Üstte */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-sm font-medium">
                        {selectedIlce ? `${selectedIl} / ${selectedIlce} m² Fiyat Trendi` : selectedIl ? `${selectedIl} m² Fiyat Trendi` : 'Türkiye m² Fiyat Trendi'}
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

                  {/* Skor Kartları - Altta (sadece il seçilince görünür) */}
                  {selectedIl && (
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

                  {/* Skor Açıklama Kartı (sadece il seçilince görünür) */}
                  {selectedIl && (
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
