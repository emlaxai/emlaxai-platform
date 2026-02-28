// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  getIlceFiyatlari, getMahalleFiyatlari, getTapuIslemStats,
  getTapuIslemMahalle, getTapuIslemIlce,
  type TapuIslemStats, type TapuIslemMahalle, type TapuIslemIlce,
  type TalepIlgiData, type YapiBelgesiData, type ArsaPazarData,
} from '@/lib/api';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

function fmtTL(v: number): string {
  return Math.round(v).toLocaleString('tr-TR') + ' ₺';
}
function fmtNum(v: number): string {
  return Math.round(v).toLocaleString('tr-TR');
}

const TT2 = { backgroundColor: 'rgba(0,0,0,0.88)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#fff', fontSize: 12 } };
const AL2 = { color: '#9ca3af', fontSize: 10 };
const SL2 = { lineStyle: { color: 'rgba(255,255,255,0.05)' } };

interface TalepTabProps {
  tapuIslemToplam: any;
  tapuIslemLoading: boolean;
  ilFiyatlari: any;
  ilFiyatlariLoading: boolean;
  ilFiyatlariError: string | null;
  showAll81Cities: boolean;
  setShowAll81Cities: (v: boolean) => void;
  selectedParcel: any;
  selectedIl: string | null;
  selectedIlce: string | null;
  trendKategori: string;
  talepIlgi?: TalepIlgiData | null;
  talepIlgiLoading?: boolean;
  isPro?: boolean;
  yapiBelgesi?: YapiBelgesiData | null;
  yapiBelgesiLoading?: boolean;
  arsaPazar?: ArsaPazarData | null;
  arsaPazarLoading?: boolean;
}

export default function TalepTab({
  tapuIslemToplam, tapuIslemLoading,
  ilFiyatlari, ilFiyatlariLoading, ilFiyatlariError,
  showAll81Cities, setShowAll81Cities,
  selectedParcel, selectedIl, selectedIlce, trendKategori,
  talepIlgi, talepIlgiLoading,
  isPro = false,
  yapiBelgesi, yapiBelgesiLoading,
  arsaPazar, arsaPazarLoading,
}: TalepTabProps) {
  const hasParcel = !!selectedParcel;
  const parcelIl = selectedParcel?.parsel?.il || selectedIl;
  const parcelIlce = selectedParcel?.parsel?.ilce || selectedIlce;

  // Deep analysis state
  const [ilceFiyatlari, setIlceFiyatlari] = useState<any>(null);
  const [ilceFiyatlariLoading, setIlceFiyatlariLoading] = useState(false);
  const [mahalleFiyatlari, setMahalleFiyatlari] = useState<any>(null);
  const [mahalleFiyatlariLoading, setMahalleFiyatlariLoading] = useState(false);
  const [tapuIslemStatsData, setTapuIslemStatsData] = useState<TapuIslemStats | null>(null);
  const [tapuIslemStatsLoading, setTapuIslemStatsLoading] = useState(false);
  const [tapuMahalle, setTapuMahalle] = useState<TapuIslemMahalle | null>(null);
  const [tapuMahalleLoading, setTapuMahalleLoading] = useState(false);
  const [tapuIlce, setTapuIlce] = useState<TapuIslemIlce | null>(null);
  const [tapuIlceLoading, setTapuIlceLoading] = useState(false);

  useEffect(() => {
    if (!hasParcel || !parcelIl) return;
    const kat = trendKategori || 'arsa';

    setIlceFiyatlariLoading(true);
    setTapuIslemStatsLoading(true);
    setTapuIlceLoading(true);
    if (parcelIlce) {
      setMahalleFiyatlariLoading(true);
      setTapuMahalleLoading(true);
    }

    const fetches: Promise<void>[] = [
      getIlceFiyatlari(parcelIl, kat)
        .then(d => setIlceFiyatlari(d)).catch(() => setIlceFiyatlari(null))
        .finally(() => setIlceFiyatlariLoading(false)),
      getTapuIslemStats(parcelIl)
        .then(d => setTapuIslemStatsData(d)).catch(() => setTapuIslemStatsData(null))
        .finally(() => setTapuIslemStatsLoading(false)),
      getTapuIslemIlce(parcelIl)
        .then(d => setTapuIlce(d)).catch(() => setTapuIlce(null))
        .finally(() => setTapuIlceLoading(false)),
    ];

    if (parcelIlce) {
      fetches.push(
        getMahalleFiyatlari(parcelIl, parcelIlce, kat)
          .then(d => setMahalleFiyatlari(d)).catch(() => setMahalleFiyatlari(null))
          .finally(() => setMahalleFiyatlariLoading(false)),
        getTapuIslemMahalle(parcelIl, parcelIlce)
          .then(d => setTapuMahalle(d)).catch(() => setTapuMahalle(null))
          .finally(() => setTapuMahalleLoading(false)),
      );
    }

    Promise.allSettled(fetches);
  }, [hasParcel, parcelIl, parcelIlce, trendKategori]);

  const yerli = talepIlgi?.yerli_ilgi;
  const yabanci = talepIlgi?.yabanci_ilgi;
  const satisTrend = talepIlgi?.satis_trend || [];
  const ilceKarsilastirma = talepIlgi?.ilce_karsilastirma || [];

  const gaugeOpt = (val: number, color: string, label: string) => ({
    series: [{
      type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100, center: ['50%', '62%'], radius: '95%',
      pointer: { show: false },
      progress: { show: true, width: 14, roundCap: true, itemStyle: { color } },
      axisLine: { lineStyle: { width: 14, color: [[1, 'rgba(255,255,255,0.04)']] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      detail: {
        offsetCenter: [0, '-5%'], fontSize: 28, fontWeight: 'bold', color: '#fff',
        formatter: `{value}`,
      },
      title: { offsetCenter: [0, '25%'], color: 'rgba(255,255,255,0.4)', fontSize: 10 },
      data: [{ value: val, name: label }],
    }],
  });

  const yb = yapiBelgesi;
  const ap = arsaPazar;
  const ruhsatTrend = yb?.ruhsat_trend || [];
  const iskanTrend = yb?.iskan_trend || [];
  const apOzet = ap?.ozet;
  const imarDag = ap?.imar_dagilimi || [];
  const fiyatSeg = ap?.fiyat_segmentleri || [];
  const ilceKarsilastirmaAP = ap?.ilce_karsilastirma || [];

  let ruhsatBuyume = 0;
  const son5Ruhsat = ruhsatTrend.slice(-5);
  if (son5Ruhsat.length >= 2) {
    const ilk = son5Ruhsat[0].daire_sayisi || 1;
    const son = son5Ruhsat[son5Ruhsat.length - 1].daire_sayisi || 0;
    ruhsatBuyume = Math.round((son - ilk) / ilk * 100);
  }

  const bolgeselPazarPanel = isPro && selectedIl && (yb || ap) ? (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
        <h3 className="text-white/70 text-[11px] font-semibold tracking-wider uppercase">Bölgesel Pazar Verileri</h3>
        <span className="text-[9px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded">{selectedIl}{selectedIlce ? ` / ${selectedIlce}` : ''}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <p className="text-white/50 text-[10px] mb-1">Son 5 Yılda İnşaat</p>
          <p className={`text-xl font-bold ${ruhsatBuyume >= 0 ? 'text-green-400' : 'text-red-400'}`}>{ruhsatBuyume > 0 ? '+' : ''}{ruhsatBuyume}%</p>
          <p className="text-white/30 text-[9px]">{ruhsatBuyume > 30 ? 'Bölgede inşaat çok artmış' : ruhsatBuyume > 0 ? 'Bölgede inşaat artmış' : ruhsatBuyume === 0 ? 'Değişim yok' : 'Bölgede inşaat azalmış'}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          {(() => {
            const oran = yb?.ruhsat_iskan_orani || 0;
            const yuzde = oran > 0 ? Math.round((oran - 1) * 100) : 0;
            const renk = oran > 1.5 ? 'text-orange-400' : oran > 1 ? 'text-green-400' : oran > 0 ? 'text-blue-400' : 'text-white';
            const aciklama = oran > 1.5 ? 'Bitenden çok daha fazla inşaat başlamış' : oran > 1 ? 'Başlayan ve biten inşaatlar dengeli' : oran > 0 ? 'Yeni inşaat az, bölge olgunlaşmış' : '';
            return (<>
              <p className="text-white/50 text-[10px] mb-1">İnşaat Yoğunluğu</p>
              <p className={`text-xl font-bold ${renk}`}>{oran > 0 ? (yuzde > 0 ? `+%${yuzde}` : yuzde === 0 ? 'Dengeli' : `%${yuzde}`) : '—'}</p>
              <p className="text-white/30 text-[9px]">{aciklama}</p>
            </>);
          })()}
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <p className="text-white/50 text-[10px] mb-1">Satılık Arsa Sayısı</p>
          <p className="text-white text-xl font-bold">{apOzet ? fmtNum(apOzet.toplam_ilan) : '—'}</p>
          <p className="text-white/30 text-[9px]">{apOzet ? (apOzet.toplam_ilan > 500 ? 'Çok sayıda arsa satılık' : apOzet.toplam_ilan > 100 ? 'Orta düzey ilan' : 'Az sayıda arsa satılık') : ''}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <p className="text-white/50 text-[10px] mb-1">Ortalama Arsa m² Fiyatı</p>
          <p className="text-white text-xl font-bold">{apOzet ? `${fmtNum(apOzet.ort_m2_fiyat)} ₺` : '—'}</p>
          <p className="text-white/30 text-[9px]">{apOzet?.medyan_m2_fiyat ? `Ortanca fiyat: ${fmtNum(apOzet.medyan_m2_fiyat)} ₺` : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {ruhsatTrend.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-3">Yıllara Göre İnşaat Başlama ve Bitiş Sayıları</h4>
            <div className="h-52">
              <ReactECharts option={{
                grid: { top: 25, right: 10, bottom: 28, left: 45 },
                tooltip: { ...TT2, trigger: 'axis' },
                legend: { data: ['Başlayan', 'Biten'], textStyle: { color: '#9ca3af', fontSize: 9 }, bottom: 0, itemWidth: 10, itemHeight: 8 },
                xAxis: { type: 'category', data: ruhsatTrend.map(r => r.yil), axisLabel: AL2 },
                yAxis: { type: 'value', axisLabel: { ...AL2, formatter: (v: number) => fmtNum(v) }, splitLine: SL2 },
                series: [
                  { name: 'Başlayan', type: 'bar', data: ruhsatTrend.map(r => r.daire_sayisi), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.8)' }, { offset: 1, color: 'rgba(99,102,241,0.2)' }] }, borderRadius: [3, 3, 0, 0] }, barWidth: '35%' },
                  { name: 'Biten', type: 'bar', data: iskanTrend.map(r => r.daire_sayisi), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.8)' }, { offset: 1, color: 'rgba(16,185,129,0.2)' }] }, borderRadius: [3, 3, 0, 0] }, barWidth: '35%' },
                ],
              }} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        )}
        {imarDag.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-3">Arsaların Kullanım Durumu</h4>
            <div className="h-52">
              <ReactECharts option={{
                tooltip: { ...TT2, trigger: 'item', formatter: '{b}: {c} ilan ({d}%)' },
                series: [{ type: 'pie', radius: ['30%', '65%'], center: ['50%', '50%'],
                  data: imarDag.slice(0, 7).map((d, i) => ({
                    value: d.sayi, name: d.imar,
                    itemStyle: { color: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i] }
                  })),
                  label: { show: true, color: '#d1d5db', fontSize: 9, formatter: '{b}\n{d}%' },
                }],
              }} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        )}
        {fiyatSeg.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-3">Fiyat Aralıklarına Göre Arsalar</h4>
            <div className="h-52">
              <ReactECharts option={{
                grid: { top: 10, right: 40, bottom: 25, left: 90 },
                xAxis: { type: 'value', axisLabel: AL2, splitLine: SL2 },
                yAxis: { type: 'category', data: fiyatSeg.map(s => s.aralik), axisLabel: { ...AL2, fontSize: 9 } },
                series: [{ type: 'bar', data: fiyatSeg.map((s, i) => ({ value: s.sayi, itemStyle: { color: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'][i] } })), itemStyle: { borderRadius: [0, 3, 3, 0] }, barWidth: '55%', label: { show: true, position: 'right', color: '#d1d5db', fontSize: 9, formatter: (p: any) => fmtNum(p.value) + ' ilan' } }],
              }} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        )}
        {ilceKarsilastirmaAP.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-3">İlçelere Göre Arsa Fiyatları</h4>
            <div className="overflow-x-auto" style={{ maxHeight: 220 }}>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-medium py-1.5 px-2 text-[10px]">#</th>
                  <th className="text-left text-white/60 font-medium py-1.5 px-2 text-[10px]">İlçe</th>
                  <th className="text-right text-white/60 font-medium py-1.5 px-2 text-[10px]">Ort. m²</th>
                  <th className="text-right text-white/60 font-medium py-1.5 px-2 text-[10px]">İlan</th>
                </tr></thead>
                <tbody>
                  {ilceKarsilastirmaAP.slice(0, 8).map((item, idx) => (
                    <tr key={item.ilce} className={`border-b border-white/5 ${item.ilce.toUpperCase() === (selectedIlce || '').toUpperCase() ? 'bg-amber-500/10' : ''}`}>
                      <td className="py-1 px-2 text-white/40 text-[10px]">{idx + 1}</td>
                      <td className={`py-1 px-2 text-[10px] font-medium ${item.ilce.toUpperCase() === (selectedIlce || '').toUpperCase() ? 'text-amber-400' : 'text-white'}`}>{item.ilce}</td>
                      <td className="py-1 px-2 text-right text-white text-[10px] font-semibold">{fmtNum(item.ort_m2_fiyat)} ₺</td>
                      <td className="py-1 px-2 text-right text-white/60 text-[10px]">{fmtNum(item.ilan_sayisi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const ilgiPanel = selectedIl && !isPro && (yerli || yabanci || satisTrend.length > 0) ? (
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {yerli && (
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <span className="text-white/80 text-[11px] font-semibold">Yerli İlgisi</span>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${yerli.skor >= 60 ? 'bg-green-500/15 text-green-400 border border-green-500/20' : yerli.skor >= 40 ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>{yerli.seviye}</span>
              </div>
              <div className="h-[140px] -mt-1">
                <ReactECharts option={gaugeOpt(yerli.skor, yerli.skor >= 60 ? '#3b82f6' : yerli.skor >= 40 ? '#eab308' : '#ef4444', 'Puan')} style={{ height: '100%', width: '100%' }} />
              </div>
              <div className="grid grid-cols-3 border-t border-white/[0.04] divide-x divide-white/[0.04]">
                <div className="px-3 py-2.5 text-center"><p className="text-white/30 text-[8px] uppercase tracking-wider">Satış</p><p className="text-white text-[11px] font-bold mt-0.5">{fmtNum(yerli.son_yil_satis)}</p></div>
                <div className="px-3 py-2.5 text-center"><p className="text-white/30 text-[8px] uppercase tracking-wider">Değişim</p><p className={`text-[11px] font-bold mt-0.5 ${yerli.degisim >= 0 ? 'text-green-400' : 'text-red-400'}`}>{yerli.degisim > 0 ? '+' : ''}{yerli.degisim}%</p></div>
                <div className="px-3 py-2.5 text-center"><p className="text-white/30 text-[8px] uppercase tracking-wider">İpotekli</p><p className="text-blue-400 text-[11px] font-bold mt-0.5">%{yerli.ipotekli_oran}</p></div>
              </div>
            </div>
          )}
          {yabanci && (
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span className="text-white/80 text-[11px] font-semibold">Yabancı İlgisi</span>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${yabanci.skor >= 60 ? 'bg-green-500/15 text-green-400 border border-green-500/20' : yabanci.skor >= 15 ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'bg-white/5 text-white/30 border border-white/10'}`}>{yabanci.seviye}</span>
              </div>
              <div className="h-[140px] -mt-1">
                <ReactECharts option={gaugeOpt(yabanci.skor, yabanci.skor >= 60 ? '#f59e0b' : yabanci.skor >= 15 ? '#eab308' : 'rgba(255,255,255,0.12)', 'Puan')} style={{ height: '100%', width: '100%' }} />
              </div>
              <div className="grid grid-cols-3 border-t border-white/[0.04] divide-x divide-white/[0.04]">
                <div className="px-3 py-2.5 text-center"><p className="text-white/30 text-[8px] uppercase tracking-wider">Yabancı Satış</p><p className="text-white text-[11px] font-bold mt-0.5">{fmtNum(yabanci.son_yil || 0)}</p></div>
                <div className="px-3 py-2.5 text-center"><p className="text-white/30 text-[8px] uppercase tracking-wider">Değişim</p><p className={`text-[11px] font-bold mt-0.5 ${yabanci.degisim > 0 ? 'text-green-400' : yabanci.degisim < 0 ? 'text-red-400' : 'text-white/20'}`}>{yabanci.degisim !== 0 ? `${yabanci.degisim > 0 ? '+' : ''}${yabanci.degisim}%` : '—'}</p></div>
                <div className="px-3 py-2.5 text-center"><p className="text-white/30 text-[8px] uppercase tracking-wider">TR Payı</p><p className="text-amber-400/60 text-[11px] font-bold mt-0.5">{yabanci.skor > 0 ? `%${yabanci.skor}` : '—'}</p></div>
              </div>
            </div>
          )}
        </div>
        {satisTrend.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4">
              <h4 className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-3">Konut Satış Trendi</h4>
              <div className="h-44">
                <ReactECharts option={{ grid: { top: 15, right: 8, bottom: 22, left: 40 }, tooltip: { ...TT2, trigger: 'axis' },
                  xAxis: { type: 'category', data: satisTrend.map(s => s.yil), axisLabel: { ...AL2, fontSize: 9 } },
                  yAxis: { type: 'value', axisLabel: { ...AL2, formatter: (v:number) => fmtNum(v) }, splitLine: SL2 },
                  series: [
                    { type: 'bar', data: satisTrend.map(s => s.toplam_satis),
                      itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.7)' }, { offset: 1, color: 'rgba(99,102,241,0.15)' }] }, borderRadius: [3, 3, 0, 0] },
                      barWidth: '50%' },
                    { type: 'line', data: satisTrend.map(s => s.toplam_satis), smooth: true, symbol: 'none',
                      lineStyle: { color: '#818cf8', width: 1.5 }, z: 5 },
                  ],
                }} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
            {ilceKarsilastirma.length > 0 && (
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4">
                <h4 className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-3">İlçe Satış Karşılaştırması</h4>
                <div className="h-44">
                  <ReactECharts option={{ grid: { top: 0, right: 40, bottom: 0, left: 65 },
                    xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...ilceKarsilastirma].reverse().map(i => i.ilce), axisLabel: { ...AL2, fontSize: 9 } },
                    series: [{ type: 'bar', data: [...ilceKarsilastirma].reverse().map(i => ({ value: i.toplam_satis, itemStyle: { color: i.ilce.toUpperCase() === (selectedIlce || '').toUpperCase() ? '#f59e0b' : 'rgba(99,102,241,0.5)' } })),
                      itemStyle: { borderRadius: [0, 3, 3, 0] }, barWidth: '55%',
                      label: { show: true, position: 'right', color: 'rgba(255,255,255,0.4)', fontSize: 8, formatter: (p:any) => fmtNum(p.value) } }],
                  }} style={{ height: '100%', width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  ) : null;

  if (hasParcel) {
    return <>{bolgeselPazarPanel}{ilgiPanel}<ParcelDeepAnalysis
      selectedParcel={selectedParcel}
      parcelIl={parcelIl} parcelIlce={parcelIlce}
      ilceFiyatlari={ilceFiyatlari} ilceFiyatlariLoading={ilceFiyatlariLoading}
      mahalleFiyatlari={mahalleFiyatlari} mahalleFiyatlariLoading={mahalleFiyatlariLoading}
      tapuIslemStatsData={tapuIslemStatsData} tapuIslemStatsLoading={tapuIslemStatsLoading}
      tapuMahalle={tapuMahalle} tapuMahalleLoading={tapuMahalleLoading}
      tapuIlce={tapuIlce} tapuIlceLoading={tapuIlceLoading}
    /></>;
  }

  return <>{bolgeselPazarPanel}{ilgiPanel}<DefaultTurkeyView
    tapuIslemToplam={tapuIslemToplam} tapuIslemLoading={tapuIslemLoading}
    ilFiyatlari={ilFiyatlari} ilFiyatlariLoading={ilFiyatlariLoading}
    ilFiyatlariError={ilFiyatlariError}
    showAll81Cities={showAll81Cities} setShowAll81Cities={setShowAll81Cities}
  /></>;
}

// =====================================================================
// PARSEL SECILMIS - DERIN ANALIZ
// =====================================================================
function ParcelDeepAnalysis({
  selectedParcel, parcelIl, parcelIlce,
  ilceFiyatlari, ilceFiyatlariLoading,
  mahalleFiyatlari, mahalleFiyatlariLoading,
  tapuIslemStatsData, tapuIslemStatsLoading,
  tapuMahalle, tapuMahalleLoading,
  tapuIlce, tapuIlceLoading,
}: any) {
  const tapuIslem = selectedParcel?.tapu_islem;
  const ilStats = tapuIslemStatsData?.il_stats;
  const ilSiralama = tapuIslemStatsData?.il_siralama;

  return (
    <div className="space-y-4">
      {/* Hero: Parsel TKGM + İl Sıralama */}
      <div className="grid grid-cols-2 gap-4">
        {/* Parsel İşlem Detayı */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Parsel Tapu İşlemleri</h3>
          {tapuIslem ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Parsel İşlem Sayısı</span>
                <span className="text-white text-xl font-bold">{tapuIslem.parsel_islem || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Çevre Ort. İşlem</span>
                <span className="text-white text-lg font-semibold">{tapuIslem.cevre_ort?.toFixed(1) || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Çevre Max İşlem</span>
                <span className="text-white text-lg font-semibold">{tapuIslem.cevre_max || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Çevre Parsel Sayısı</span>
                <span className="text-white/70 text-sm">{tapuIslem.cevre_parsel?.toLocaleString('tr-TR') || 0}</span>
              </div>
            </div>
          ) : (
            <div className="text-white/40 text-xs text-center py-4">Tapu işlem verisi bulunamadı</div>
          )}
        </div>

        {/* İl Sıralama */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">{parcelIl} İl İstatistikleri</h3>
          {tapuIslemStatsLoading ? (
            <div className="text-white/40 text-xs text-center py-4 animate-pulse">Yükleniyor...</div>
          ) : ilStats ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Türkiye Sıralaması</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-amber-400 text-xl font-bold">{ilSiralama}</span>
                  <span className="text-white/30 text-xs">/ 81</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Toplam İşlem</span>
                <span className="text-white text-lg font-semibold">{ilStats.toplam_islem?.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Ort. İşlem/Parsel</span>
                <span className="text-white text-lg font-semibold">{ilStats.ort_islem}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Kayıtlı Parsel</span>
                <span className="text-white/70 text-sm">{ilStats.parsel_sayisi?.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          ) : (
            <div className="text-white/40 text-xs text-center py-4">İl verisi yüklenemedi</div>
          )}
        </div>
      </div>

      {/* İlçe Arsa Fiyat Karşılaştırması */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-sm font-semibold">İlçe Bazlı Arsa m² Fiyatları - {parcelIl}</h3>
          <span className="text-blue-400 text-[10px] font-semibold bg-blue-500/10 px-2.5 py-0.5 rounded-full">Arsa</span>
        </div>
        <div style={{ height: ilceFiyatlari?.ilceler?.length ? Math.max(200, ilceFiyatlari.ilceler.length * 28) : 200 }}>
          {ilceFiyatlariLoading ? (
            <div className="flex items-center justify-center h-full text-white/40 text-xs animate-pulse">İlçe fiyatları yükleniyor...</div>
          ) : ilceFiyatlari?.ilceler?.length ? (
            <ReactECharts option={buildHBarOption(
              ilceFiyatlari.ilceler.map(i => i.ilce),
              ilceFiyatlari.ilceler.map(i => i.m2_fiyat),
              '#3b82f6', '#60a5fa',
              parcelIlce,
              fmtTL
            )} style={{ height: '100%', width: '100%' }} />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40 text-xs">Veri bulunamadı</div>
          )}
        </div>
      </div>

      {/* Mahalle Arsa Fiyat Karşılaştırması */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-sm font-semibold">Mahalle Bazlı Arsa m² Fiyatları - {parcelIlce}</h3>
          <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Arsa</span>
        </div>
        <div style={{ height: mahalleFiyatlari?.mahalleler?.length ? Math.max(200, Math.min(mahalleFiyatlari.mahalleler.length * 24, 500)) : 200 }}>
          {mahalleFiyatlariLoading ? (
            <div className="flex items-center justify-center h-full text-white/40 text-xs animate-pulse">Mahalle fiyatları yükleniyor...</div>
          ) : mahalleFiyatlari?.mahalleler?.length ? (
            <ReactECharts option={buildHBarOption(
              mahalleFiyatlari.mahalleler.slice(0, 20).map(m => m.mahalle),
              mahalleFiyatlari.mahalleler.slice(0, 20).map(m => m.m2_fiyat),
              '#10b981', '#34d399',
              null,
              fmtTL
            )} style={{ height: '100%', width: '100%' }} />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40 text-xs">Veri bulunamadı</div>
          )}
        </div>
      </div>

      {/* TKGM İlçe Bazlı İşlem Hacmi */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-sm font-semibold">İlçe Bazlı Tapu İşlem Hacmi - {parcelIl}</h3>
          <span className="text-blue-400 text-[10px] font-semibold bg-blue-500/10 px-2.5 py-0.5 rounded-full">TKGM</span>
        </div>
        <div style={{ height: tapuIlce?.ilceler?.length ? Math.max(200, tapuIlce.ilceler.length * 28) : 200 }}>
          {tapuIlceLoading ? (
            <div className="flex items-center justify-center h-full text-white/40 text-xs animate-pulse">İlçe işlem verileri yükleniyor...</div>
          ) : (tapuIlce as any)?.enrichment_pending ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M12 2v4m0 12v4m-8-10H2m20 0h-2m-2.93-6.07l-1.41 1.41M7.05 16.95l-1.41 1.41m0-11.31l1.41 1.41m9.9 9.9l1.41 1.41"/></svg>
              <span className="text-white/40 text-xs">Veri işleniyor, lütfen biraz sonra tekrar deneyin</span>
            </div>
          ) : tapuIlce?.ilceler?.length ? (
            <ReactECharts option={buildHBarOption(
              tapuIlce.ilceler.map(i => i.ilce),
              tapuIlce.ilceler.map(i => i.toplam_islem),
              '#8b5cf6', '#a78bfa',
              parcelIlce?.toUpperCase(),
              fmtNum
            )} style={{ height: '100%', width: '100%' }} />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40 text-xs">Veri bulunamadı</div>
          )}
        </div>
      </div>

      {/* TKGM Mahalle Bazlı İşlem Haritası */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-sm font-semibold">Mahalle Bazlı Tapu İşlem Hacmi - {parcelIlce}</h3>
          <span className="text-purple-400 text-[10px] font-semibold bg-purple-500/10 px-2.5 py-0.5 rounded-full">TKGM Spatial</span>
        </div>
        <div style={{ height: tapuMahalle?.mahalleler?.length ? Math.max(200, Math.min(tapuMahalle.mahalleler.slice(0, 20).length * 24, 500)) : 200 }}>
          {tapuMahalleLoading ? (
            <div className="flex items-center justify-center h-full text-white/40 text-xs animate-pulse">Mahalle işlem verileri yükleniyor...</div>
          ) : tapuMahalle?.mahalleler?.length ? (
            <ReactECharts option={buildHBarOption(
              tapuMahalle.mahalleler.slice(0, 20).map(m => m.mahalle),
              tapuMahalle.mahalleler.slice(0, 20).map(m => m.toplam_islem),
              '#f59e0b', '#fbbf24',
              null,
              fmtNum
            )} style={{ height: '100%', width: '100%' }} />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40 text-xs">Veri bulunamadı</div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// VARSAYILAN - TURKIYE GENELI
// =====================================================================
function DefaultTurkeyView({
  tapuIslemToplam, tapuIslemLoading,
  ilFiyatlari, ilFiyatlariLoading, ilFiyatlariError,
  showAll81Cities, setShowAll81Cities,
}: any) {
  return (
    <div>
      {/* Fiyat Ligi */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-4">
        <h3 className="text-white text-lg font-semibold mb-5">Fiyat Ligi: En Pahalı vs En Uygun İller</h3>
        {ilFiyatlariLoading ? (
          <div className="flex items-center justify-center h-64 text-white/60 text-sm animate-pulse">İl fiyatları yükleniyor...</div>
        ) : ilFiyatlari ? (
          <>
            <div className="grid grid-cols-2 gap-6">
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
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${(item.m2_fiyat / maxPrice) * 100}px` }}></div>
                          <span className="text-white font-semibold text-sm">{fmtTL(item.m2_fiyat)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${(item.m2_fiyat / maxPriceInCheap) * 100}px` }}></div>
                          <span className="text-white font-semibold text-sm">{fmtTL(item.m2_fiyat)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/60">
              <span>Fark:</span>
              <span className="text-white font-semibold">
                {(ilFiyatlari.iller[0].m2_fiyat / ilFiyatlari.iller[ilFiyatlari.iller.length - 1].m2_fiyat).toFixed(1)}x
              </span>
              <span>({ilFiyatlari.iller[0].il} / {ilFiyatlari.iller[ilFiyatlari.iller.length - 1].il})</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-red-400 text-sm">{ilFiyatlariError || 'İl fiyatları yüklenemedi'}</div>
        )}
      </div>

      {/* TKGM Bar Chart */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">TKGM Tapu İşlem Hacmi</h3>
          <span className="text-blue-400 text-xs font-semibold bg-blue-500/10 px-3 py-1 rounded-full">Kaynak: TKGM</span>
        </div>
        <div className="h-96">
          {tapuIslemLoading ? (
            <div className="flex items-center justify-center h-full text-white/60 text-sm animate-pulse">TKGM tapu verileri yükleniyor...</div>
          ) : tapuIslemToplam ? (
            typeof window !== 'undefined' && (
              <ReactECharts option={{
                backgroundColor: 'transparent',
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, textStyle: { color: '#fff' }, axisPointer: { type: 'shadow' },
                  formatter: (params: any) => { const d = params[0]; const il = tapuIslemToplam.iller.find(i => i.il === d.name); return `<strong>${d.name}</strong><br/>Toplam İşlem: <strong>${Number(d.value).toLocaleString('tr-TR')}</strong><br/>Parsel Sayısı: ${il ? il.parsel_sayisi.toLocaleString('tr-TR') : '-'}<br/>Ort. İşlem/Parsel: ${il ? il.ort_islem : '-'}`; }
                },
                legend: { data: ['Toplam İşlem', 'Yoğun Parsel'], textStyle: { color: 'rgba(255,255,255,0.8)' }, top: 0 },
                grid: { left: '15%', right: '4%', bottom: '3%', top: '12%', containLabel: false },
                xAxis: { type: 'value', axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }, axisLabel: { color: 'rgba(255,255,255,0.6)', formatter: (v: number) => fmtNum(v) }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' } } },
                yAxis: { type: 'category', data: tapuIslemToplam.iller.slice(0, 15).reverse().map(i => i.il), axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }, axisLabel: { color: 'rgba(255,255,255,0.8)' }, splitLine: { show: false } },
                series: [
                  { name: 'Toplam İşlem', type: 'bar', data: tapuIslemToplam.iller.slice(0, 15).reverse().map(i => i.toplam_islem), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#60a5fa' }] }, borderRadius: [0, 4, 4, 0] } },
                  { name: 'Yoğun Parsel', type: 'bar', data: tapuIslemToplam.iller.slice(0, 15).reverse().map(i => i.yogun_parsel), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#fbbf24' }] }, borderRadius: [0, 4, 4, 0] } }
                ]
              }} style={{ height: '100%', width: '100%' }} />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-red-400 text-sm">TKGM verileri yüklenemedi</div>
          )}
        </div>
      </div>

      {/* 4'lü Metrikler */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <MetricCard icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          label="Toplam İşlem" value={tapuIslemToplam ? fmtNum(tapuIslemToplam.genel.toplam_islem) : '...'} badge="TKGM" badgeColor="text-blue-400" sub="81 İl" />
        <MetricCard icon={<svg width="14" height="14" viewBox="0 0 440 440" fill="#10b981"><path d="M344.33,212.5c0,103.857-80.577,189.248-182.5,196.936V197.361l151.76-55.236l-10.26-28.191l-141.5,51.502V121.38l151.76-55.236l-10.26-28.191l-141.5,51.502V0h-30v100.374l-66.16,24.08l10.261,28.191L131.83,132.3v44.055l-66.16,24.08l10.261,28.191l55.899-20.346V440h15c60.813,0,117.957-23.651,160.902-66.597c42.946-42.946,66.598-100.089,66.598-160.903H344.33z"/></svg>}
          label="Ort. m² Fiyat" value={ilFiyatlari ? fmtTL(ilFiyatlari.iller.reduce((a, b) => a + b.m2_fiyat, 0) / ilFiyatlari.iller.length) : '...'} badge="TR Ort." badgeColor="text-green-500" sub="Güncel" />
        <MetricCard icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
          label="Toplam Parsel" value={tapuIslemToplam ? fmtNum(tapuIslemToplam.genel.toplam_parsel) : '...'} badge="TKGM" badgeColor="text-purple-400" sub="Kayıtlı" />
        <MetricCard icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          label="Ort. İşlem/Parsel" value={tapuIslemToplam ? tapuIslemToplam.genel.ort_islem_per_parsel.toFixed(2) : '...'} badge="Likidite" badgeColor="text-amber-400" sub="Ort." />
      </div>

      {/* Momentum Tablosu */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mt-4">
        <h3 className="text-white text-lg font-semibold mb-4">Türkiye Piyasa Momentum Tablosu</h3>
        {ilFiyatlariLoading ? (
          <div className="flex items-center justify-center h-64 text-white/60 text-sm animate-pulse">Momentum verileri yükleniyor...</div>
        ) : ilFiyatlari ? (
          <>
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
                    const priceScore = (item.m2_fiyat / ilFiyatlari.iller[0].m2_fiyat) * 40;
                    const trendScore = Math.min((item.trend_12ay || 0) / 2, 40);
                    const momentumScore = ((item as any).momentum || 0) * 4;
                    const aiScore = Math.round(priceScore + trendScore + momentumScore);
                    return (
                      <tr key={item.il} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 text-white/40 font-mono">{index + 1}</td>
                        <td className="py-3 px-2 text-white font-medium capitalize">{item.il}</td>
                        <td className="py-3 px-2 text-white text-right">{fmtTL(item.m2_fiyat)}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`font-semibold ${(item.trend_12ay ?? 0) >= 50 ? 'text-red-400' : (item.trend_12ay ?? 0) >= 30 ? 'text-orange-400' : 'text-green-400'}`}>
                            +{(item.trend_12ay ?? 0).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex justify-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const m = (item as any).momentum || 0;
                              const barColor = m >= 4 ? 'bg-green-500' : m >= 3 ? 'bg-blue-500' : m >= 2 ? 'bg-yellow-500' : m >= 1 ? 'bg-orange-500' : 'bg-white/10';
                              return <div key={i} className={`w-1.5 h-4 rounded-sm ${i < m ? barColor : 'bg-white/10'}`}></div>;
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-bold text-base ${aiScore >= 85 ? 'text-purple-400' : aiScore >= 70 ? 'text-blue-400' : 'text-gray-400'}`}>{aiScore}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-1.5 h-3 rounded-sm bg-blue-500"></div>)}</div>
                  <span>Çok Güçlü</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="w-1.5 h-3 rounded-sm bg-blue-500"></div>)}</div>
                  <span>Orta</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5"><div className="w-1.5 h-3 rounded-sm bg-blue-500"></div></div>
                  <span>Zayıf</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>{showAll81Cities ? `Tüm ${ilFiyatlari.total} İl` : 'Top 20 İl'} Gösteriliyor</span>
                <button onClick={() => setShowAll81Cities(!showAll81Cities)} className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 transition-colors outline-none focus:outline-none group" title={showAll81Cities ? 'Daha Az Göster' : `Tümünü Göster (${ilFiyatlari.total} İl)`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-white/60 group-hover:text-white transition-all duration-200 ${showAll81Cities ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-red-400 text-sm">{ilFiyatlariError || 'Momentum verileri yüklenemedi'}</div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// YARDIMCI KOMPONENTLER
// =====================================================================
function MetricCard({ icon, label, value, badge, badgeColor, sub }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <p className="text-white/60 text-xs font-medium leading-tight">{label}</p>
      </div>
      <p className="text-white text-3xl font-bold mb-1">{value}</p>
      <div className="flex items-center gap-1">
        <span className={`${badgeColor} text-xs font-semibold`}>{badge}</span>
        <span className="text-white/40 text-xs">{sub}</span>
      </div>
    </div>
  );
}

function buildHBarOption(labels: string[], values: number[], colorStart: string, colorEnd: string, highlightLabel?: string | null, valueFormatter?: (v: number) => string) {
  const reversed = [...labels].reverse();
  const reversedVals = [...values].reverse();
  const maxVal = Math.max(...values, 1);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, textStyle: { color: '#fff' }, axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const d = params[0];
        const formatted = valueFormatter ? valueFormatter(d.value) : d.value;
        return `<strong>${d.name}</strong><br/>${formatted}`;
      }
    },
    grid: { left: '2%', right: '12%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, formatter: valueFormatter || ((v: number) => `${v}`) },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: reversed,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: {
        color: (value: string) => {
          if (highlightLabel && value.toUpperCase() === highlightLabel.toUpperCase()) return '#60a5fa';
          return 'rgba(255,255,255,0.7)';
        },
        fontSize: 10,
        fontWeight: (value: string) => {
          if (highlightLabel && value.toUpperCase() === highlightLabel.toUpperCase()) return 'bold' as any;
          return 'normal' as any;
        },
      },
      splitLine: { show: false },
    },
    series: [{
      type: 'bar',
      data: reversedVals.map((v, i) => ({
        value: v,
        itemStyle: {
          color: highlightLabel && reversed[i].toUpperCase() === highlightLabel.toUpperCase()
            ? { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#93c5fd' }] }
            : { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: colorStart }, { offset: 1, color: colorEnd }] },
          borderRadius: [0, 4, 4, 0],
          opacity: highlightLabel && reversed[i].toUpperCase() !== highlightLabel.toUpperCase() ? 0.5 : 1,
        }
      })),
      barWidth: '60%',
      label: {
        show: true, position: 'right', color: 'rgba(255,255,255,0.6)', fontSize: 10,
        formatter: (p: any) => valueFormatter ? valueFormatter(p.value) : p.value,
      }
    }],
  };
}
