// @ts-nocheck
'use client';
import dynamic from 'next/dynamic';
import type { NufusData, NufusDataTurkiye, NufusDataIl, NufusDataIlce, DemografiData } from '@/lib/api';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface NufusTabProps {
  nufusData: NufusData | null;
  nufusLoading: boolean;
  selectedIl: string | null;
  selectedIlce: string | null;
  selectedMahalle?: string | null;
  demografiData?: DemografiData | null;
  isPro?: boolean;
  formatNumber: (v: number, d?: number) => string;
}

const TT = { backgroundColor: 'rgba(0,0,0,0.88)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#fff', fontSize: 12 } };
const AL = { color: '#9ca3af', fontSize: 10 };
const SL = { lineStyle: { color: 'rgba(255,255,255,0.05)' } };

function Skel() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white/5 rounded-xl p-3 h-20"><div className="h-3 bg-white/10 rounded w-2/3 mb-2"/><div className="h-5 bg-white/10 rounded w-1/2"/></div>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="bg-white/5 rounded-xl p-4 h-56"><div className="h-3 bg-white/10 rounded w-1/3 mb-3"/><div className="h-40 bg-white/8 rounded"/></div>)}
      </div>
    </div>
  );
}

function SC({ icon, label, value, sub, subColor }: { icon: React.ReactNode; label: string; value: string; sub?: string; subColor?: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all rounded-xl p-3 overflow-hidden min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">{icon}<p className="text-white/50 text-[10px] font-medium truncate">{label}</p></div>
      <p className="text-white text-base font-bold leading-tight">{value}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${subColor || 'text-white/40'}`}>{sub}</p>}
    </div>
  );
}

function CC({ title, children, badge, h = 'h-56' }: { title: string; children: React.ReactNode; badge?: React.ReactNode; h?: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/8 transition-all rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-xs font-semibold">{title}</h3>
        {badge}
      </div>
      <div className={h}>{children}</div>
    </div>
  );
}

const fmtK = (v: number) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : String(v);
const trimName = (s: string, max = 12) => { const n = s.replace(' MAHALLESİ', '').replace(' MH.', ''); return n.length > max ? n.slice(0, max - 1) + '…' : n; };

const IconPeople = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconGender = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="12 15 12 21"/><polyline points="8 21 16 21"/></svg>;
const IconYoung = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>;
const IconOld = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconRank = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

// ════════════════════════════════════════════════
// TÜRKİYE GENELİ
// ════════════════════════════════════════════════
function TurkiyeView({ data, fmt }: { data: NufusDataTurkiye; fmt: NufusTabProps['formatNumber'] }) {
  const top10 = data.iller.slice(0, 10);
  const yt = data.yillik_trend;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <SC icon={IconPeople} label="Toplam Nüfus" value={fmt(data.toplam_nufus)}
          sub={data.yillik_degisim != null ? `${data.yillik_degisim > 0 ? '↑' : '↓'} %${Math.abs(data.yillik_degisim)} yıllık` : undefined}
          subColor={data.yillik_degisim && data.yillik_degisim > 0 ? 'text-green-400' : 'text-red-400'} />
        <SC icon={IconGender} label="Kadın / Erkek" value={`${data.kadin_yuzde}% / ${data.erkek_yuzde}%`} sub={`${fmt(data.kadin_nufus)} / ${fmt(data.erkek_nufus)}`} />
        <SC icon={IconYoung} label="Genç (0-14)" value={`%${data.genc_yuzde}`} sub={`${fmt(data.genc_0_14)} kişi`} />
        <SC icon={IconOld} label="Yaşlı (65+)" value={`%${data.yasli_yuzde}`} sub={`${fmt(data.yasli_65_plus)} kişi`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {yt.length > 0 && <CC title="Türkiye Nüfus Trendi (2007-2024)">
          <ReactECharts option={{ grid: { top: 25, right: 15, bottom: 25, left: 55 }, tooltip: { ...TT, trigger: 'axis' },
            xAxis: { type: 'category', data: yt.map(y => y.yil), axisLabel: AL, boundaryGap: false },
            yAxis: { type: 'value', axisLabel: { ...AL, formatter: (v:number) => fmtK(v) }, splitLine: SL },
            series: [{ type: 'line', data: yt.map(y => y.toplam), smooth: true, symbol: 'none', lineStyle: { color: '#3b82f6', width: 2 },
              areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.25)' }, { offset: 1, color: 'rgba(59,130,246,0.01)' }] } } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
        <CC title="En Kalabalık 10 İl" badge={<span className="text-[9px] text-white/25">{data.il_sayisi} il</span>}>
          <ReactECharts option={{ grid: { top: 0, right: 50, bottom: 0, left: 70 }, tooltip: { ...TT, trigger: 'axis' },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...top10].reverse().map(i => i.il), axisLabel: AL },
            series: [{ type: 'bar', data: [...top10].reverse().map(i => i.toplam),
              itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#60a5fa' }] }, borderRadius: [0, 3, 3, 0] },
              barWidth: '60%', label: { show: true, position: 'right', color: '#93c5fd', fontSize: 9, formatter: (p:any) => fmtK(p.value) } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>
        {yt.length > 0 && <CC title="Erkek / Kadın Nüfus Trendi">
          <ReactECharts option={{ grid: { top: 25, right: 15, bottom: 30, left: 55 }, tooltip: { ...TT, trigger: 'axis' },
            legend: { data: ['Erkek', 'Kadın'], textStyle: { color: '#9ca3af', fontSize: 10 }, bottom: 0, itemWidth: 10, itemHeight: 10 },
            xAxis: { type: 'category', data: yt.map(y => y.yil), axisLabel: AL, boundaryGap: false },
            yAxis: { type: 'value', axisLabel: { ...AL, formatter: (v:number) => fmtK(v) }, splitLine: SL },
            series: [
              { name: 'Erkek', type: 'line', data: yt.map(y => y.erkek), smooth: true, symbol: 'none', lineStyle: { color: '#3b82f6', width: 1.5 }, areaStyle: { color: 'rgba(59,130,246,0.08)' } },
              { name: 'Kadın', type: 'line', data: yt.map(y => y.kadin), smooth: true, symbol: 'none', lineStyle: { color: '#ec4899', width: 1.5 }, areaStyle: { color: 'rgba(236,72,153,0.08)' } },
            ],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
        <CC title="Nüfus Büyüklüğüne Göre İl Dağılımı">
          <ReactECharts option={{ tooltip: { ...TT, trigger: 'item', formatter: '{b}: {c} il ({d}%)' },
            series: [{ type: 'pie', radius: ['40%', '68%'], center: ['50%', '48%'], data: [
              { value: data.buyuk_il, name: '1M+ (Büyük)', itemStyle: { color: '#3b82f6' } },
              { value: data.orta_il, name: '300K-1M (Orta)', itemStyle: { color: '#f59e0b' } },
              { value: data.kucuk_il, name: '<300K (Küçük)', itemStyle: { color: '#10b981' } },
            ], label: { show: true, color: '#d1d5db', fontSize: 10, formatter: '{b}\n{c} il' } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>
        {data.genc_iller?.length > 0 && <CC title="En Genç Nüfuslu İller (0-14 yaş %)">
          <ReactECharts option={{ grid: { top: 0, right: 35, bottom: 0, left: 75 },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...data.genc_iller].reverse().map(i => i.il), axisLabel: AL },
            series: [{ type: 'bar', data: [...data.genc_iller].reverse().map(i => i.yuzde),
              itemStyle: { color: '#22c55e', borderRadius: [0, 3, 3, 0] }, barWidth: '55%',
              label: { show: true, position: 'right', color: '#6ee7b7', fontSize: 9, formatter: '%{c}' } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
        {data.yasli_iller?.length > 0 && <CC title="En Yaşlı Nüfuslu İller (65+ yaş %)">
          <ReactECharts option={{ grid: { top: 0, right: 35, bottom: 0, left: 75 },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...data.yasli_iller].reverse().map(i => i.il), axisLabel: AL },
            series: [{ type: 'bar', data: [...data.yasli_iller].reverse().map(i => i.yuzde),
              itemStyle: { color: '#f59e0b', borderRadius: [0, 3, 3, 0] }, barWidth: '55%',
              label: { show: true, position: 'right', color: '#fcd34d', fontSize: 9, formatter: '%{c}' } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════
// İL DETAY
// ════════════════════════════════════════════════
function IlView({ data, fmt, isPro = false }: { data: NufusDataIl; fmt: NufusTabProps['formatNumber']; isPro?: boolean }) {
  const yt = data.yillik_trend || [];
  const ilceler = data.ilceler || [];
  const topIlce = ilceler.slice(0, 15);
  const topMah = (data.top_mahalleler || []).slice(0, 15);
  const ses = data.ses_data || [];
  const degisimler = data.yillik_degisimler || [];
  const icCinsiyet = data.ilce_cinsiyet || [];
  const trOrt = data.turkiye_ort || {};

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <SC icon={IconPeople} label="Toplam Nüfus" value={fmt(data.toplam)}
          sub={data.yillik_degisim != null ? `${data.yillik_degisim > 0 ? '↑' : '↓'} %${Math.abs(data.yillik_degisim)} · Türkiye ${data.turkiye_sira}.` : `${data.ilce_sayisi || ilceler.length} ilçe`}
          subColor={data.yillik_degisim && data.yillik_degisim > 0 ? 'text-green-400' : 'text-red-400'} />
        <SC icon={IconGender} label="Kadın / Erkek" value={`${data.kadin_yuzde}% / ${data.erkek_yuzde}%`} sub={`${fmt(data.kadin)} / ${fmt(data.erkek)}`} />
        <SC icon={IconYoung} label="Genç (0-14)" value={`%${data.genc_yuzde}`}
          sub={trOrt.ort_genc ? `TR ort: %${trOrt.ort_genc.toFixed(1)}` : fmt(data.genc_0_14) + ' kişi'}
          subColor={data.genc_yuzde > (trOrt.ort_genc || 0) ? 'text-green-400' : 'text-orange-400'} />
        <SC icon={IconOld} label="Yaşlı (65+)" value={`%${data.yasli_yuzde}`}
          sub={trOrt.ort_yasli ? `TR ort: %${trOrt.ort_yasli.toFixed(1)}` : fmt(data.yasli_65_plus) + ' kişi'}
          subColor={data.yasli_yuzde < (trOrt.ort_yasli || 0) ? 'text-green-400' : 'text-orange-400'} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {yt.length > 0 && <CC title="Yıllara Göre Nüfus Trendi">
          <ReactECharts option={{ grid: { top: 25, right: 15, bottom: 30, left: 50 }, tooltip: { ...TT, trigger: 'axis' },
            legend: { data: ['Erkek', 'Kadın'], textStyle: { color: '#9ca3af', fontSize: 10 }, bottom: 0, itemWidth: 10, itemHeight: 10 },
            xAxis: { type: 'category', data: yt.map((y:any) => y.yil), axisLabel: AL, boundaryGap: false },
            yAxis: { type: 'value', axisLabel: { ...AL, formatter: (v:number) => fmtK(v) }, splitLine: SL },
            series: [
              { name: 'Erkek', type: 'line', data: yt.map((y:any) => y.erkek_nufus), smooth: true, symbol: 'none', lineStyle: { color: '#3b82f6', width: 1.5 }, areaStyle: { color: 'rgba(59,130,246,0.08)' } },
              { name: 'Kadın', type: 'line', data: yt.map((y:any) => y.kadin_nufus), smooth: true, symbol: 'none', lineStyle: { color: '#ec4899', width: 1.5 }, areaStyle: { color: 'rgba(236,72,153,0.08)' } },
            ],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
        {topIlce.length > 0 && <CC title="İlçe Nüfus Sıralaması" badge={<span className="text-[9px] text-white/25">{ilceler.length} ilçe</span>}>
          <ReactECharts option={{ grid: { top: 0, right: 45, bottom: 0, left: 75 },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...topIlce].reverse().map(i => trimName(i.ilce)), axisLabel: { ...AL, fontSize: 9 } },
            series: [{ type: 'bar', data: [...topIlce].reverse().map(i => i.toplam),
              itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#818cf8' }] }, borderRadius: [0, 3, 3, 0] },
              barWidth: '55%', label: { show: true, position: 'right', color: '#a5b4fc', fontSize: 8, formatter: (p:any) => fmtK(p.value) } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
        {degisimler.length > 0 && <CC title="Yıllık Nüfus Değişimi (%)">
          <ReactECharts option={{ grid: { top: 15, right: 15, bottom: 25, left: 40 }, tooltip: { ...TT, trigger: 'axis' },
            xAxis: { type: 'category', data: degisimler.map(y => y.yil), axisLabel: AL },
            yAxis: { type: 'value', axisLabel: { ...AL, formatter: '{value}%' }, splitLine: SL },
            series: [{ type: 'bar', data: degisimler.map(y => y.degisim),
              itemStyle: { color: (p:any) => p.value >= 0 ? '#22c55e' : '#ef4444', borderRadius: [3, 3, 0, 0] }, barWidth: '45%',
              label: { show: true, position: 'top', color: '#d1d5db', fontSize: 8, formatter: (p:any) => `%${p.value}` } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
        {ses.length > 0 && <CC title="Sosyoekonomik Skor (SES)" badge={<span className="text-[9px] text-white/25">{ses.length} ilçe</span>}>
          <ReactECharts option={{ grid: { top: 0, right: 35, bottom: 0, left: 75 },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...ses].reverse().slice(0, 15).map(s => trimName(s.ilce)), axisLabel: { ...AL, fontSize: 9 } },
            series: [{ type: 'bar', data: [...ses].reverse().slice(0, 15).map(s => Math.round(s.skor)),
              itemStyle: { color: (p:any) => p.value >= 150 ? '#22c55e' : p.value >= 100 ? '#84cc16' : p.value >= 70 ? '#f59e0b' : '#ef4444', borderRadius: [0, 3, 3, 0] },
              barWidth: '50%', label: { show: true, position: 'right', color: '#d1d5db', fontSize: 8 } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
        {topMah.length > 0 && <CC title="En Kalabalık Mahalleler" badge={<span className="text-[9px] text-white/25">Top {topMah.length}</span>} h="h-64">
          <ReactECharts option={{ grid: { top: 0, right: 40, bottom: 0, left: 90 },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...topMah].reverse().map(m => trimName(m.mahalle_adi, 14)), axisLabel: { ...AL, fontSize: 8 } },
            series: [{ type: 'bar', data: [...topMah].reverse().map(m => m.toplam_nufus),
              itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#34d399' }] }, borderRadius: [0, 3, 3, 0] },
              barWidth: '50%', label: { show: true, position: 'right', color: '#6ee7b7', fontSize: 8, formatter: (p:any) => fmtK(p.value) } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {!isPro && data.erkek > 0 && (
          <CC title="Cinsiyet Dağılımı">
            <ReactECharts option={{ tooltip: { ...TT, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              series: [{ type: 'pie', radius: ['42%', '68%'], center: ['50%', '48%'], data: [
                { value: data.erkek, name: 'Erkek', itemStyle: { color: '#3b82f6' } },
                { value: data.kadin, name: 'Kadın', itemStyle: { color: '#ec4899' } },
              ], label: { show: true, color: '#d1d5db', fontSize: 11, formatter: '{b}\n{d}%' } }],
            }} style={{ height: '100%', width: '100%' }} />
          </CC>
        )}

        {!isPro && icCinsiyet.length > 0 && (
          <CC title="İlçe Bazlı Cinsiyet Dağılımı" h="h-64" badge={<span className="text-[9px] text-white/25">{icCinsiyet.length} ilçe</span>}>
            <ReactECharts option={{ grid: { top: 10, right: 10, bottom: 25, left: 70 }, tooltip: { ...TT, trigger: 'axis' },
              legend: { data: ['Erkek', 'Kadın'], textStyle: { color: '#9ca3af', fontSize: 9 }, bottom: 0, itemWidth: 8, itemHeight: 8 },
              xAxis: { type: 'value', axisLabel: { ...AL, formatter: (v:number) => fmtK(v) }, splitLine: SL },
              yAxis: { type: 'category', data: [...icCinsiyet].reverse().slice(0, 15).map(i => trimName(i.ilce)), axisLabel: { ...AL, fontSize: 8 } },
              series: [
                { name: 'Erkek', type: 'bar', stack: 'c', data: [...icCinsiyet].reverse().slice(0, 15).map(i => i.erkek), itemStyle: { color: '#3b82f6' }, barWidth: '55%' },
                { name: 'Kadın', type: 'bar', stack: 'c', data: [...icCinsiyet].reverse().slice(0, 15).map(i => i.kadin), itemStyle: { color: '#ec4899' }, barWidth: '55%' },
              ],
            }} style={{ height: '100%', width: '100%' }} />
          </CC>
        )}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════
// İLÇE DETAY
// ════════════════════════════════════════════════
function IlceView({ data, fmt, selectedMahalle }: { data: NufusDataIlce; fmt: NufusTabProps['formatNumber']; selectedMahalle?: string | null }) {
  const mah = (data.mahalleler || []).slice(0, 20);
  const toplam = data.toplam || 0;
  const erkek = data.erkek || 0;
  const kadin = data.kadin || 0;
  const eY = toplam > 0 ? ((erkek / toplam) * 100).toFixed(1) : '0';
  const kY = toplam > 0 ? ((kadin / toplam) * 100).toFixed(1) : '0';
  const ilYt = data.il_yillik_trend || [];
  const tumIlce = data.tum_ilceler || [];
  const sesTum = data.ses_tum_ilceler || [];
  const ilD = data.il_detay;

  const normMah = (s: string) => s.toUpperCase().replace(' MAHALLESİ', '').replace(' MH.', '').trim();
  const selMah = mah.find(m => selectedMahalle && normMah(m.mahalle_adi) === normMah(selectedMahalle));
  const mahSira = selMah ? mah.indexOf(selMah) + 1 : 0;
  const mahToplam = selMah?.toplam_nufus || 0;
  const mahErkek = selMah?.erkek_nufus || 0;
  const mahKadin = selMah?.kadin_nufus || 0;
  const mahEY = mahToplam > 0 ? ((mahErkek / mahToplam) * 100).toFixed(1) : '0';
  const mahKY = mahToplam > 0 ? ((mahKadin / mahToplam) * 100).toFixed(1) : '0';
  const mahPay = toplam > 0 ? ((mahToplam / toplam) * 100).toFixed(1) : '0';
  const isMatch = (name: string) => selectedMahalle ? normMah(name) === normMah(selectedMahalle) : false;

  return (
    <>
      {/* Seçili Mahalle Özet Kartı */}
      {selMah && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-[11px] font-semibold tracking-wide">SEÇİLİ MAHALLE</span>
            <span className="text-white text-[11px] font-bold">{trimName(selMah.mahalle_adi, 30)}</span>
            <span className="ml-auto text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{mahSira}. / {mah.length} mahalle</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div>
              <p className="text-white/40 text-[9px]">Nüfus</p>
              <p className="text-white text-sm font-bold">{fmt(mahToplam)}</p>
              <p className="text-amber-400/70 text-[9px]">İlçe'nin %{mahPay}'i</p>
            </div>
            <div>
              <p className="text-white/40 text-[9px]">Erkek</p>
              <p className="text-blue-400 text-sm font-bold">{fmt(mahErkek)}</p>
              <p className="text-white/30 text-[9px]">%{mahEY}</p>
            </div>
            <div>
              <p className="text-white/40 text-[9px]">Kadın</p>
              <p className="text-pink-400 text-sm font-bold">{fmt(mahKadin)}</p>
              <p className="text-white/30 text-[9px]">%{mahKY}</p>
            </div>
            <div>
              <p className="text-white/40 text-[9px]">İlçe İçi Sıra</p>
              <p className="text-amber-400 text-sm font-bold">{mahSira}.</p>
              <p className="text-white/30 text-[9px]">{mah.length} mahalle içinde</p>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all" style={{ width: `${Math.min(parseFloat(mahPay), 100)}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <SC icon={IconPeople} label="İlçe Nüfusu" value={fmt(toplam)}
          sub={data.nufus_yuzdesi ? `İl'in %${data.nufus_yuzdesi}'i · ${data.ilce_sira}. sıra` : undefined}
          subColor="text-blue-400" />
        <SC icon={IconGender} label="Kadın / Erkek" value={`${kY}% / ${eY}%`} sub={`${fmt(kadin)} / ${fmt(erkek)}`} />
        <SC icon={IconRank} label="Mahalle Sayısı" value={String(mah.length)}
          sub={ilD ? `${data.il} · ${ilD.ilce_sayisi} ilçe` : data.il} />
        <SC icon={IconOld} label="SES Skoru" value={data.ses_skor != null ? String(data.ses_skor) : '—'}
          sub={data.ses_skor != null ? (data.ses_skor >= 150 ? 'Yüksek' : data.ses_skor >= 100 ? 'Orta-Üst' : data.ses_skor >= 70 ? 'Orta' : 'Düşük') : 'Veri yok'}
          subColor={data.ses_skor != null ? (data.ses_skor >= 150 ? 'text-green-400' : data.ses_skor >= 100 ? 'text-yellow-300' : 'text-orange-400') : 'text-white/30'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Mahalle erkek/kadın bar chart - seçili mahalle vurgulu */}
        {mah.length > 0 && <CC title="Mahalle Nüfus Dağılımı (Erkek/Kadın)" badge={<span className="text-[9px] text-white/25">{mah.length} mah.</span>} h="h-72">
          <ReactECharts option={{ grid: { top: 10, right: 10, bottom: 25, left: 85 }, tooltip: { ...TT, trigger: 'axis' },
            legend: { data: ['Erkek', 'Kadın'], textStyle: { color: '#9ca3af', fontSize: 9 }, bottom: 0, itemWidth: 8, itemHeight: 8 },
            xAxis: { type: 'value', axisLabel: { ...AL, formatter: (v:number) => fmtK(v) }, splitLine: SL },
            yAxis: { type: 'category', data: [...mah].reverse().map(m => trimName(m.mahalle_adi, 13)),
              axisLabel: { fontSize: 8, color: (v:string, i:number) => { const idx = mah.length - 1 - i; return isMatch(mah[idx]?.mahalle_adi || '') ? '#fbbf24' : '#9ca3af'; }, fontWeight: (v:string, i:number) => { const idx = mah.length - 1 - i; return isMatch(mah[idx]?.mahalle_adi || '') ? 'bold' : 'normal'; } } },
            series: [
              { name: 'Erkek', type: 'bar', stack: 't', data: [...mah].reverse().map(m => ({ value: m.erkek_nufus || 0, itemStyle: isMatch(m.mahalle_adi) ? { color: '#2563eb', borderColor: '#fbbf24', borderWidth: 1 } : {} })), itemStyle: { color: '#3b82f6' }, barWidth: '55%' },
              { name: 'Kadın', type: 'bar', stack: 't', data: [...mah].reverse().map(m => ({ value: m.kadin_nufus || 0, itemStyle: isMatch(m.mahalle_adi) ? { color: '#db2777', borderColor: '#fbbf24', borderWidth: 1 } : {} })), itemStyle: { color: '#ec4899' }, barWidth: '55%' },
            ],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* İlçeler arası karşılaştırma */}
        {tumIlce.length > 0 && <CC title={`${data.il} İlçe Karşılaştırması`} badge={<span className="text-[9px] text-white/25">{tumIlce.length} ilçe</span>} h="h-72">
          <ReactECharts option={{ grid: { top: 0, right: 45, bottom: 0, left: 80 },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...tumIlce].reverse().map(i => trimName(i.ilce)), axisLabel: { ...AL, fontSize: 9 } },
            series: [{ type: 'bar', data: [...tumIlce].reverse().map(i => ({ value: i.toplam, itemStyle: { color: i.ilce.toUpperCase() === (data.ilce || '').toUpperCase() ? '#f59e0b' : '#6366f1' } })),
              itemStyle: { borderRadius: [0, 3, 3, 0] }, barWidth: '55%',
              label: { show: true, position: 'right', color: '#a5b4fc', fontSize: 8, formatter: (p:any) => fmtK(p.value) } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* Cinsiyet dağılımı - mahalle varsa mahalle + ilçe karşılaştırmalı */}
        <CC title={selMah ? `Cinsiyet: ${trimName(selMah.mahalle_adi, 16)} vs İlçe` : 'Cinsiyet Dağılımı'}>
          {selMah ? (
            <ReactECharts option={{ tooltip: { ...TT, trigger: 'item', formatter: '{b}: {d}%' },
              series: [
                { type: 'pie', radius: ['15%', '40%'], center: ['50%', '48%'], data: [
                  { value: mahErkek, name: 'Mah. Erkek', itemStyle: { color: '#2563eb' } },
                  { value: mahKadin, name: 'Mah. Kadın', itemStyle: { color: '#db2777' } },
                ], label: { show: false }, emphasis: { label: { show: true, color: '#fff', fontSize: 10 } } },
                { type: 'pie', radius: ['50%', '68%'], center: ['50%', '48%'], data: [
                  { value: erkek, name: 'İlçe Erkek', itemStyle: { color: 'rgba(59,130,246,0.4)' } },
                  { value: kadin, name: 'İlçe Kadın', itemStyle: { color: 'rgba(236,72,153,0.4)' } },
                ], label: { show: true, color: '#d1d5db', fontSize: 10, formatter: '{b}\n{d}%' } },
              ],
            }} style={{ height: '100%', width: '100%' }} />
          ) : (
            <ReactECharts option={{ tooltip: { ...TT, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
              series: [{ type: 'pie', radius: ['42%', '68%'], center: ['50%', '48%'], data: [
                { value: erkek, name: 'Erkek', itemStyle: { color: '#3b82f6' } },
                { value: kadin, name: 'Kadın', itemStyle: { color: '#ec4899' } },
              ], label: { show: true, color: '#d1d5db', fontSize: 11, formatter: '{b}\n{d}%' } }],
            }} style={{ height: '100%', width: '100%' }} />
          )}
        </CC>

        {/* İl nüfus trendi */}
        {ilYt.length > 0 && <CC title={`${data.il} İl Nüfus Trendi (2007-2024)`}>
          <ReactECharts option={{ grid: { top: 20, right: 15, bottom: 25, left: 50 }, tooltip: { ...TT, trigger: 'axis' },
            xAxis: { type: 'category', data: ilYt.map((y:any) => y.yil), axisLabel: AL, boundaryGap: false },
            yAxis: { type: 'value', axisLabel: { ...AL, formatter: (v:number) => fmtK(v) }, splitLine: SL },
            series: [{ type: 'line', data: ilYt.map((y:any) => y.toplam_nufus), smooth: true, symbol: 'none', lineStyle: { color: '#3b82f6', width: 2 },
              areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0.01)' }] } } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* SES karşılaştırma */}
        {sesTum.length > 0 && <CC title={`${data.il} SES Skorları`} badge={<span className="text-[9px] text-white/25">{sesTum.length} ilçe</span>}>
          <ReactECharts option={{ grid: { top: 0, right: 35, bottom: 0, left: 75 },
            xAxis: { type: 'value', show: false }, yAxis: { type: 'category', data: [...sesTum].reverse().map(s => trimName(s.ilce)), axisLabel: { ...AL, fontSize: 9 } },
            series: [{ type: 'bar', data: [...sesTum].reverse().map(s => ({ value: Math.round(s.skor), itemStyle: { color: s.ilce.toUpperCase() === (data.ilce || '').toUpperCase() ? '#f59e0b' : (s.skor >= 150 ? '#22c55e' : s.skor >= 100 ? '#84cc16' : s.skor >= 70 ? '#eab308' : '#ef4444') } })),
              itemStyle: { borderRadius: [0, 3, 3, 0] }, barWidth: '50%',
              label: { show: true, position: 'right', color: '#d1d5db', fontSize: 8 } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* İl demografik profili */}
        {ilD && <CC title={`${data.il} Demografik Profil`}>
          <div className="space-y-3 pt-1">
            {[
              { label: 'Toplam Nüfus', value: fmt(ilD.toplam), color: 'text-white' },
              { label: 'Genç Oranı (0-14)', value: `%${ilD.genc_yuzde}`, color: ilD.genc_yuzde > 20 ? 'text-green-400' : 'text-yellow-400' },
              { label: 'Yaşlı Oranı (65+)', value: `%${ilD.yasli_yuzde}`, color: ilD.yasli_yuzde > 15 ? 'text-orange-400' : 'text-green-400' },
              { label: 'Erkek / Kadın', value: `%${ilD.erkek_yuzde} / %${ilD.kadin_yuzde}`, color: 'text-white' },
              { label: 'İlçe Sayısı', value: String(ilD.ilce_sayisi || 0), color: 'text-white' },
              { label: 'Mahalle Sayısı', value: String(ilD.mahalle_sayisi || 0), color: 'text-white' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white/50 text-[11px]">{r.label}</span>
                <span className={`text-[12px] font-semibold ${r.color}`}>{r.value}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[11px]">Seçili İlçe Payı</span>
                <span className="text-yellow-400 text-[12px] font-semibold">%{data.nufus_yuzdesi || 0}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400" style={{ width: `${Math.min(data.nufus_yuzdesi || 0, 100)}%` }} />
              </div>
            </div>
          </div>
        </CC>}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════
// ════════════════════════════════════════════════
// DEMOGRAFİ + GÖÇ PANELİ
// ════════════════════════════════════════════════
function DemografiPanel({ data, fmt, isPro = false }: { data: DemografiData; fmt: NufusTabProps['formatNumber']; isPro?: boolean }) {
  const demo = data.ilce_demografi || data.il_demografi || data.mahalle_demografi;
  const goc = data.goc || [];
  const gocOzet = data.goc_ozet;
  const sesDetay = data.ses_detay || [];

  if (!demo && goc.length === 0) return null;

  const haneGeliri = demo?.hane_geliri;
  const sesA = (demo?.ses_a_plus || 0) + (demo?.ses_a || 0);
  const sesB = demo?.ses_b || 0;
  const sesC = demo?.ses_c || 0;
  const sesD = demo?.ses_d || 0;
  const sesToplam = sesA + sesB + sesC + sesD;
  const lisans = demo?.egitim_lisans || 0;
  const lisansustu = demo?.egitim_lisansustu || 0;
  const lise = demo?.egitim_lise || 0;
  const nufus = demo?.nufus_toplam || 1;
  const aracOrani = demo?.arac_orani;

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-purple-500 rounded-full" />
        <h3 className="text-white/70 text-[11px] font-semibold tracking-wider uppercase">Demografik Analiz & Göç</h3>
      </div>

      {demo && (
        <div className={`grid grid-cols-2 ${isPro ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-3 mb-3`}>
          {haneGeliri && <SC icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="12" cy="14" r="3"/></svg>}
            label="Ort. Hane Geliri" value={`₺${fmt(haneGeliri)}`} sub="Aylık" subColor="text-purple-400" />}
          {gocOzet && <SC icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gocOzet.net_goc > 0 ? '#22c55e' : '#ef4444'} strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
            label={`Net Göç (${gocOzet.son_yil})`} value={`${gocOzet.net_goc > 0 ? '+' : ''}${fmt(gocOzet.net_goc)}`}
            sub={`Hız: ‰${gocOzet.net_goc_hizi?.toFixed?.(1) || 0}`}
            subColor={gocOzet.net_goc > 0 ? 'text-green-400' : 'text-red-400'} />}
          {sesToplam > 0 && <SC icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>}
            label="SES A+A Oranı" value={`%${sesToplam > 0 ? ((sesA / sesToplam) * 100).toFixed(1) : 0}`}
            sub={`${fmt(sesA)} hane (A sınıfı)`} subColor="text-amber-400" />}
          {!isPro && aracOrani != null && <SC icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-5h9l4 5h3v6h-2"/></svg>}
            label="Araç Sahipliği" value={`%${aracOrani.toFixed?.(1) || aracOrani}`} sub="100 kişi başına" subColor="text-cyan-400" />}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* SES Dağılımı */}
        {sesToplam > 0 && <CC title="Sosyoekonomik Sınıf Dağılımı (SES)">
          <ReactECharts option={{ tooltip: { ...TT, trigger: 'item', formatter: '{b}: {c} hane ({d}%)' },
            series: [{ type: 'pie', radius: ['35%', '65%'], center: ['50%', '48%'], data: [
              { value: sesA, name: 'A+ / A (Üst)', itemStyle: { color: '#22c55e' } },
              { value: sesB, name: 'B (Üst-Orta)', itemStyle: { color: '#3b82f6' } },
              { value: sesC, name: 'C (Orta)', itemStyle: { color: '#f59e0b' } },
              { value: sesD, name: 'D (Alt)', itemStyle: { color: '#ef4444' } },
            ], label: { show: true, color: '#d1d5db', fontSize: 9, formatter: '{b}\n{d}%' } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* Göç Trendi */}
        {goc.length > 0 && <CC title="Göç Trendi (Alınan / Verilen / Net)">
          <ReactECharts option={{ grid: { top: 25, right: 10, bottom: 30, left: 45 }, tooltip: { ...TT, trigger: 'axis' },
            legend: { data: ['Alınan', 'Verilen', 'Net'], textStyle: { color: '#9ca3af', fontSize: 9 }, bottom: 0, itemWidth: 8, itemHeight: 8 },
            xAxis: { type: 'category', data: goc.map(g => g.yil), axisLabel: AL, boundaryGap: false },
            yAxis: { type: 'value', axisLabel: { ...AL, formatter: (v:number) => fmtK(v) }, splitLine: SL },
            series: [
              { name: 'Alınan', type: 'line', data: goc.map(g => g.alinan_goc), smooth: true, symbol: 'none', lineStyle: { color: '#22c55e', width: 1.5 } },
              { name: 'Verilen', type: 'line', data: goc.map(g => g.verilen_goc), smooth: true, symbol: 'none', lineStyle: { color: '#ef4444', width: 1.5 } },
              { name: 'Net', type: 'bar', data: goc.map(g => g.net_goc), itemStyle: { color: (p:any) => p.value >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)', borderRadius: [2, 2, 0, 0] }, barWidth: '35%' },
            ],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* Net Göç Hızı */}
        {goc.length > 0 && <CC title="Net Göç Hızı (‰)">
          <ReactECharts option={{ grid: { top: 15, right: 10, bottom: 25, left: 40 }, tooltip: { ...TT, trigger: 'axis' },
            xAxis: { type: 'category', data: goc.map(g => g.yil), axisLabel: AL },
            yAxis: { type: 'value', axisLabel: { ...AL, formatter: '‰{value}' }, splitLine: SL },
            visualMap: { show: false, pieces: [{ min: 0, color: '#22c55e' }, { max: 0, color: '#ef4444' }] },
            series: [{ type: 'bar', data: goc.map(g => parseFloat(String(g.net_goc_hizi || 0))),
              itemStyle: { borderRadius: [3, 3, 0, 0] }, barWidth: '45%',
              label: { show: goc.length <= 20, position: 'top', color: '#d1d5db', fontSize: 7, formatter: (p:any) => `‰${p.value?.toFixed?.(1)}` } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* Eğitim Düzeyi - Bölgelens */}
        {!isPro && (lisans + lisansustu + lise) > 0 && <CC title="Eğitim Düzeyi Dağılımı">
          <ReactECharts option={{ tooltip: { ...TT, trigger: 'item', formatter: '{b}: {c} kişi ({d}%)' },
            series: [{ type: 'pie', roseType: 'radius', radius: ['20%', '65%'], center: ['50%', '48%'], data: [
              { value: lisansustu, name: 'Lisansüstü', itemStyle: { color: '#8b5cf6' } },
              { value: lisans, name: 'Lisans', itemStyle: { color: '#3b82f6' } },
              { value: lise, name: 'Lise', itemStyle: { color: '#f59e0b' } },
            ].filter(d => d.value > 0), label: { show: true, color: '#d1d5db', fontSize: 9, formatter: '{b}\n{d}%' } }],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}

        {/* SES Detay İlçe Karşılaştırma */}
        {sesDetay.length > 0 && <CC title="SES Sınıf Dağılımı (İlçe Bazlı)" h="h-64">
          <ReactECharts option={{ grid: { top: 10, right: 10, bottom: 25, left: 70 }, tooltip: { ...TT, trigger: 'axis' },
            legend: { data: ['A', 'B', 'C', 'D', 'E'], textStyle: { color: '#9ca3af', fontSize: 8 }, bottom: 0, itemWidth: 8, itemHeight: 8 },
            xAxis: { type: 'value', axisLabel: { ...AL, formatter: '{value}%' }, splitLine: SL, max: 100 },
            yAxis: { type: 'category', data: [...sesDetay].reverse().map(s => trimName(s.ilce || s.il)), axisLabel: { ...AL, fontSize: 8 } },
            series: [
              { name: 'A', type: 'bar', stack: 's', data: [...sesDetay].reverse().map(s => +(s.ust_seviye_a || 0).toFixed(1)), itemStyle: { color: '#22c55e' }, barWidth: '50%' },
              { name: 'B', type: 'bar', stack: 's', data: [...sesDetay].reverse().map(s => +(s.ust_alti_b || 0).toFixed(1)), itemStyle: { color: '#3b82f6' } },
              { name: 'C', type: 'bar', stack: 's', data: [...sesDetay].reverse().map(s => +(s.orta_c || 0).toFixed(1)), itemStyle: { color: '#f59e0b' } },
              { name: 'D', type: 'bar', stack: 's', data: [...sesDetay].reverse().map(s => +(s.alt_d || 0).toFixed(1)), itemStyle: { color: '#ef4444' } },
              { name: 'E', type: 'bar', stack: 's', data: [...sesDetay].reverse().map(s => +(s.en_alt_e || 0).toFixed(1)), itemStyle: { color: '#991b1b' } },
            ],
          }} style={{ height: '100%', width: '100%' }} />
        </CC>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════
export default function NufusTab({ nufusData, nufusLoading, selectedIl, selectedIlce, selectedMahalle, demografiData, isPro = false, formatNumber: fmt }: NufusTabProps) {
  if (nufusLoading) return <Skel />;

  if (!nufusData || ('error' in nufusData)) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <p className="text-white/25 text-xs mt-3">Nüfus verisi yükleniyor...</p>
      </div>
    );
  }

  const seviye = (nufusData as any).seviye;
  const badge = (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
        {seviye === 'turkiye' ? 'Türkiye Geneli' : seviye === 'il' ? (nufusData as NufusDataIl).il : `${(nufusData as NufusDataIlce).il} / ${(nufusData as NufusDataIlce).ilce}`}
      </span>
      <span className="text-[10px] text-white/25">
        {seviye === 'turkiye' ? '81 İl' : seviye === 'il' ? 'İl Detay' : 'İlçe Detay'}
      </span>
    </div>
  );

  return (
    <>
      {badge}
      {seviye === 'turkiye' && <TurkiyeView data={nufusData as NufusDataTurkiye} fmt={fmt} />}
      {seviye === 'il' && <IlView data={nufusData as NufusDataIl} fmt={fmt} isPro={isPro} />}
      {seviye === 'ilce' && <IlceView data={nufusData as NufusDataIlce} fmt={fmt} selectedMahalle={selectedMahalle} />}
      {demografiData && <DemografiPanel data={demografiData} fmt={fmt} isPro={isPro} />}
    </>
  );
}
