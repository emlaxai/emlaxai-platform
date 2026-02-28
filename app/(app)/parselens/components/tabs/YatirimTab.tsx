// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const fmtNum = (v: number) => Math.round(v).toLocaleString('tr-TR');

interface YatirimTabProps {
  selectedIl: string | null;
  selectedIlce: string | null;
  isPro?: boolean;
}

export default function YatirimTab({ selectedIl, selectedIlce, isPro = false }: YatirimTabProps) {
  if (!isPro) return null;

  return (
    <div>
      {/* Yatırım Araçları Karşılaştırması */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Konut', value: '%48.2', sub: 'Yıllık Getiri', color: 'blue', tag: 'En yüksek', tagColor: 'green', up: true },
          { label: 'Altın', value: '%38.5', sub: 'Yıllık Getiri', color: 'yellow', tag: 'Güvenli', tagColor: 'green', up: true },
          { label: 'Dolar', value: '%20.3', sub: 'Yıllık Getiri', color: 'green', tag: 'Orta', tagColor: 'orange', up: false },
          { label: 'Mevduat', value: '%50.0', sub: 'Yıllık Faiz', color: 'purple', tag: 'Kayıp', tagColor: 'red', up: false },
          { label: 'BIST 100', value: '%52.8', sub: 'Yıllık Getiri', color: 'red', tag: 'Volatil', tagColor: 'green', up: true },
        ].map(item => (
          <div key={item.label} className={`bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/5 backdrop-blur-sm border border-${item.color}-500/20 hover:border-${item.color}-500/40 transition-all duration-200 rounded-xl p-3 overflow-hidden min-w-0`}>
            <p className="text-white text-xs font-semibold truncate mb-1">{item.label}</p>
            <p className={`text-${item.color}-400 text-xl font-bold mb-0.5`}>{item.value}</p>
            <p className="text-white/60 text-[10px] mb-1">{item.sub}</p>
            <div className={`flex items-center gap-1 text-${item.tagColor}-400 text-[10px]`}>
              {item.up ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              )}
              <span>{item.tag}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gelecek Fiyat Projeksiyonu */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white text-lg font-bold">Gelecek Fiyat Projeksiyonu</h3>
            <p className="text-white/60 text-xs">exAI destekli arsa fiyat tahmini — {selectedIl}{selectedIlce ? ` / ${selectedIlce}` : ''}</p>
          </div>
          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded-lg font-medium">3 Senaryo</span>
        </div>
        <div className="h-80">
          <ReactECharts option={{
            grid: { top: 50, right: 50, bottom: 50, left: 65 },
            xAxis: { type: 'category', data: ['2024','2025','2026','2027','2028','2029','2030'], axisLabel: { color: '#9ca3af', fontSize: 11, fontWeight: 'bold' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
            yAxis: { type: 'value', name: 'Ort. Arsa m² (₺)', nameTextStyle: { color: '#9ca3af', fontSize: 10 }, axisLabel: { color: '#9ca3af', fontSize: 10, formatter: (v: number) => fmtNum(v) }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
            tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.15)', textStyle: { color: '#fff', fontSize: 12 }, axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
            legend: { data: ['Gerçek Veri','Optimistik','Realistik','Pesimistik'], textStyle: { color: '#9ca3af', fontSize: 10 }, top: 5, itemGap: 16 },
            series: [
              { name: 'Gerçek Veri', type: 'line', data: [2420,3580,null,null,null,null,null], itemStyle: { color: '#3b82f6' }, lineStyle: { width: 3 }, symbol: 'circle', symbolSize: 8, label: { show: true, formatter: (p: any) => fmtNum(p.value) + ' ₺', position: 'top', color: '#3b82f6', fontSize: 10, fontWeight: 'bold' } },
              { name: 'Optimistik', type: 'line', data: [null,3580,4850,6280,7820,9580,11520], itemStyle: { color: '#10b981' }, lineStyle: { type: 'dashed', width: 2.5 }, areaStyle: { opacity: 0.1, color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#10b981' },{ offset: 1, color: 'transparent' }] } }, symbol: 'diamond', symbolSize: 6 },
              { name: 'Realistik', type: 'line', data: [null,3580,4420,5280,6150,7080,8050], itemStyle: { color: '#f59e0b' }, lineStyle: { type: 'dashed', width: 2.5 }, areaStyle: { opacity: 0.1, color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#f59e0b' },{ offset: 1, color: 'transparent' }] } }, symbol: 'circle', symbolSize: 6 },
              { name: 'Pesimistik', type: 'line', data: [null,3580,4020,4450,4820,5180,5520], itemStyle: { color: '#ef4444' }, lineStyle: { type: 'dashed', width: 2.5 }, areaStyle: { opacity: 0.1, color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ef4444' },{ offset: 1, color: 'transparent' }] } }, symbol: 'triangle', symbolSize: 6 },
            ],
          }} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
          <div className="bg-green-500/10 rounded-lg p-2.5 border border-green-500/20"><p className="text-green-400 text-[10px] font-medium mb-0.5">Optimistik (2030)</p><p className="text-white text-base font-bold">11.520 ₺/m²</p><p className="text-green-400 text-[10px]">+%222 artış</p></div>
          <div className="bg-orange-500/10 rounded-lg p-2.5 border border-orange-500/20"><p className="text-orange-400 text-[10px] font-medium mb-0.5">Realistik (2030)</p><p className="text-white text-base font-bold">8.050 ₺/m²</p><p className="text-orange-400 text-[10px]">+%125 artış</p></div>
          <div className="bg-red-500/10 rounded-lg p-2.5 border border-red-500/20"><p className="text-red-400 text-[10px] font-medium mb-0.5">Pesimistik (2030)</p><p className="text-white text-base font-bold">5.520 ₺/m²</p><p className="text-red-400 text-[10px]">+%54 artış</p></div>
        </div>
      </div>

      {/* ROI Simülatörü + Enstrüman Karşılaştırma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 lg:col-span-2">
          <h3 className="text-white text-sm font-semibold mb-3">Yatırım Enstrümanları Karşılaştırması (Son 5 Yıl)</h3>
          <div className="h-64">
            <ReactECharts option={{
              grid: { top: 45, right: 30, bottom: 40, left: 55 },
              xAxis: { type: 'category', data: ['2020','2021','2022','2023','2024','2025'], axisLabel: { color: '#9ca3af', fontSize: 10 } },
              yAxis: { type: 'value', name: 'Değer Artışı', axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '%{value}' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
              tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.15)', textStyle: { color: '#fff', fontSize: 11 }, axisPointer: { type: 'cross' } },
              legend: { data: ['Arsa','Altın','Dolar','Mevduat','BIST'], textStyle: { color: '#9ca3af', fontSize: 10 }, top: 5 },
              series: [
                { name: 'Arsa', type: 'line', data: [100,135,180,240,330,470], itemStyle: { color: '#3b82f6' }, smooth: true, lineStyle: { width: 2.5 } },
                { name: 'Altın', type: 'line', data: [100,115,145,178,220,285], itemStyle: { color: '#f59e0b' }, smooth: true, lineStyle: { width: 2 } },
                { name: 'Dolar', type: 'line', data: [100,110,128,145,168,192], itemStyle: { color: '#10b981' }, smooth: true, lineStyle: { width: 2 } },
                { name: 'Mevduat', type: 'line', data: [100,118,142,172,210,258], itemStyle: { color: '#8b5cf6' }, smooth: true, lineStyle: { width: 2 } },
                { name: 'BIST', type: 'line', data: [100,145,198,268,385,520], itemStyle: { color: '#ef4444' }, smooth: true, lineStyle: { width: 2 } },
              ],
            }} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 overflow-hidden">
          <h3 className="text-white text-sm font-semibold mb-3">ROI Simülatörü</h3>
          <div className="space-y-2">
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <label className="text-white/70 text-[10px] mb-1 block">Yatırım Tutarı</label>
              <div className="flex items-center gap-1.5"><input type="text" value="5.000.000" readOnly className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm font-semibold min-w-0"/><span className="text-white/60 text-xs flex-shrink-0">₺</span></div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <label className="text-white/70 text-[10px] mb-1 block">Yatırım Süresi</label>
              <div className="flex items-center gap-1.5"><input type="text" value="3" readOnly className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm font-semibold min-w-0"/><span className="text-white/60 text-xs flex-shrink-0">Yıl</span></div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-3 border border-blue-500/30">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2"><span className="text-white/70 text-[10px]">Beklenen Değer:</span><span className="text-white text-sm font-bold truncate">11.045.000 ₺</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-white/70 text-[10px]">Kazanç:</span><span className="text-green-400 text-sm font-bold truncate">+6.045.000 ₺</span></div>
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/20"><span className="text-white text-[10px] font-medium">ROI:</span><span className="text-green-400 text-lg font-bold">%121</span></div>
              </div>
            </div>
            <p className="text-white/40 text-[9px] text-center leading-tight">* Hesaplama arsa yatırımı ortalama getirisine göre yapılmıştır</p>
          </div>
        </div>
      </div>

      {/* AI Yatırım Önerileri + En Yüksek Getiri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="text-white text-sm font-semibold">En Yüksek Getiri Potansiyeli</h3><span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md">5 Yıllık</span></div>
          <div className="h-72">
            <ReactECharts option={{
              grid: { top: 5, right: 65, bottom: 20, left: 75 },
              xAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '%{value}' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
              yAxis: { type: 'category', data: ['Trabzon','Samsun','Kocaeli','Bursa','Tekirdağ','Mersin','Aydın','Balıkesir','Antalya','Muğla'], axisLabel: { color: '#9ca3af', fontSize: 10 } },
              tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.15)', textStyle: { color: '#fff' }, formatter: '{b}: %{c} beklenen getiri' },
              series: [{ type: 'bar', data: [152,168,178,185,192,208,218,228,245,268], itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#10b981' },{ offset: 1, color: '#22c55e' }] }, borderRadius: [0,4,4,0] }, barWidth: '65%', label: { show: true, position: 'right', color: '#10b981', fontSize: 10, formatter: '%{c}' } }],
            }} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><path d="M12 2L13.5 6.5L18 8L13.5 9.5L12 14L10.5 9.5L6 8L10.5 6.5L12 2Z" fill="#8b5cf6" stroke="#a78bfa" strokeWidth="1.5"/></svg>
            <h3 className="text-white text-sm font-semibold">exAI Yatırım Önerileri</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { city: 'Muğla - Bodrum', desc: 'Deniz manzaralı arsa', score: 98, pot: '%268', tag: 'Turizm Bölgesi', note: 'Yüksek turizm talebi, sınırlı arsa, marina projeleri' },
              { city: 'Antalya - Kepez', desc: 'Dönüşüm bölgesi', score: 95, pot: '%245', tag: 'Kentsel Dönüşüm', note: 'Kentsel dönüşüm, yeni metro hattı, nüfus artışı' },
              { city: 'Tekirdağ - Çorlu', desc: 'Sanayi + Lojistik', score: 92, pot: '%228', tag: 'Sanayi Merkezi', note: 'Sanayi gelişimi, İstanbul\'a yakınlık, göç alımı' },
            ].map(r => (
              <div key={r.city} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/8 transition-all">
                <div className="flex items-start justify-between mb-1.5"><div className="flex-1"><h4 className="text-white text-xs font-semibold">{r.city}</h4><p className="text-white/50 text-[10px]">{r.desc}</p></div><span className="text-purple-400 text-base font-bold">{r.score}</span></div>
                <div className="flex items-center gap-1.5 mb-1.5"><span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">{r.pot} Potansiyel</span><span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">{r.tag}</span></div>
                <p className="text-white/50 text-[10px]">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detaylı Analiz Tablosu */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="text-white text-sm font-semibold mb-3">Detaylı Yatırım Analizi (İl Bazında)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10">
              <th className="text-left text-white/60 font-medium py-2 px-2 text-[10px]">#</th>
              <th className="text-left text-white/60 font-medium py-2 px-2 text-[10px]">İl</th>
              <th className="text-right text-white/60 font-medium py-2 px-2 text-[10px]">Mevcut m² Fiyat</th>
              <th className="text-right text-white/60 font-medium py-2 px-2 text-[10px]">3 Yıl Proj.</th>
              <th className="text-center text-white/60 font-medium py-2 px-2 text-[10px]">Getiri</th>
              <th className="text-center text-white/60 font-medium py-2 px-2 text-[10px]">Risk</th>
              <th className="text-center text-white/60 font-medium py-2 px-2 text-[10px]">Skor</th>
            </tr></thead>
            <tbody>
              {[
                { rank: 1, city: 'Muğla', currentPrice: 38200, futurePrice: 102500, roi: 268, risk: 'Düşük', score: 98 },
                { rank: 2, city: 'Antalya', currentPrice: 34700, futurePrice: 84900, roi: 245, risk: 'Düşük', score: 95 },
                { rank: 3, city: 'Balıkesir', currentPrice: 22100, futurePrice: 50400, roi: 228, risk: 'Orta', score: 92 },
                { rank: 4, city: 'Aydın', currentPrice: 21300, futurePrice: 46800, roi: 220, risk: 'Düşük', score: 90 },
                { rank: 5, city: 'Mersin', currentPrice: 18900, futurePrice: 39700, roi: 210, risk: 'Orta', score: 87 },
                { rank: 6, city: 'Tekirdağ', currentPrice: 20500, futurePrice: 40200, roi: 196, risk: 'Düşük', score: 85 },
                { rank: 7, city: 'Bursa', currentPrice: 21900, futurePrice: 40500, roi: 185, risk: 'Düşük', score: 83 },
                { rank: 8, city: 'Kocaeli', currentPrice: 19800, futurePrice: 35600, roi: 180, risk: 'Orta', score: 80 },
                { rank: 9, city: 'İzmir', currentPrice: 32100, futurePrice: 54800, roi: 171, risk: 'Düşük', score: 78 },
                { rank: 10, city: 'İstanbul', currentPrice: 45800, futurePrice: 72500, roi: 158, risk: 'Düşük', score: 75 },
              ].map(item => (
                <tr key={item.city} className={`border-b border-white/5 ${item.city.toUpperCase() === (selectedIl || '').toUpperCase() ? 'bg-amber-500/10' : 'hover:bg-white/5'} transition-colors`}>
                  <td className="py-2 px-2 text-white/40 font-mono text-xs">{item.rank}</td>
                  <td className={`py-2 px-2 text-xs font-medium ${item.city.toUpperCase() === (selectedIl || '').toUpperCase() ? 'text-amber-400' : 'text-white'}`}>{item.city}</td>
                  <td className="py-2 px-2 text-white text-right text-xs">{fmtNum(item.currentPrice)} ₺</td>
                  <td className="py-2 px-2 text-green-400 font-semibold text-right text-xs">{fmtNum(item.futurePrice)} ₺</td>
                  <td className="py-2 px-2 text-center"><span className={`text-sm font-bold ${item.roi >= 250 ? 'text-green-400' : item.roi >= 200 ? 'text-blue-400' : item.roi >= 180 ? 'text-yellow-400' : 'text-orange-400'}`}>%{item.roi}</span></td>
                  <td className="py-2 px-2 text-center"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${item.risk === 'Düşük' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{item.risk}</span></td>
                  <td className="py-2 px-2 text-center"><span className={`text-sm font-bold ${item.score >= 95 ? 'text-purple-400' : item.score >= 85 ? 'text-blue-400' : item.score >= 75 ? 'text-green-400' : 'text-yellow-400'}`}>{item.score}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
