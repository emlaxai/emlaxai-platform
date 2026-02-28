// @ts-nocheck
'use client';

import Image from 'next/image';
interface ImarProPanelProps {
  imarActiveTab: string;
  setImarActiveTab: (tab: string) => void;
  imarDetailTabs: { id: string; label: string }[];
  selectedParcel: any;
  parcelLoading: boolean;
  selectedIl: string | null;
  selectedIlce: string | null;
  searchQuery: string;
  handleSearchInput: (value: string) => void;
  searchAddress: (query: string) => void;
  searchResults: any[];
  searchLoading: boolean;
  showSearchResults: boolean;
  handleSearchSelect: (result: any) => void;
  setShowSearchResults: (show: boolean) => void;
  formatNumber: (n: number) => string;
}

function ImarDurumTab({ selectedParcel, parcelLoading, selectedIl, formatNumber }: any) {
  if (parcelLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-white/40 text-sm">Parsel bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!selectedParcel) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h3 className="text-white/80 text-sm font-medium mb-2">Parsel Seçin</h3>
        <p className="text-white/40 text-xs leading-relaxed max-w-[260px]">
          {selectedIl
            ? 'Haritada bir parsele tıklayın veya yukarıdaki arama çubuğunu kullanarak ada/parsel numarası ile arayın.'
            : 'Önce bir il seçin, ardından haritada zoom yaparak parselleri görüntüleyin.'}
        </p>
      </div>
    );
  }

  const p = selectedParcel.parsel;
  const ib = selectedParcel.imar_baskisi;

  const skorRenk = ib?.skor >= 70 ? '#ef4444' : ib?.skor >= 40 ? '#f59e0b' : '#22c55e';
  const skorLabel = ib?.skor >= 70 ? 'Yüksek' : ib?.skor >= 40 ? 'Orta' : 'Düşük';

  return (
    <div className="space-y-4">
      {/* Parsel Kimlik */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/90 text-sm font-semibold">Parsel Bilgileri</h4>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40">{p?.tapu_kimlik_no}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40">Ada / Parsel</span>
            <p className="text-white font-medium">{p?.ada} / {p?.parsel}</p>
          </div>
          <div>
            <span className="text-white/40">Alan</span>
            <p className="text-white font-medium">{formatNumber(Math.round(p?.alan || 0))} m²</p>
          </div>
          <div>
            <span className="text-white/40">Cins</span>
            <p className="text-white font-medium">{p?.cins || '—'}</p>
          </div>
          <div>
            <span className="text-white/40">Mahalle</span>
            <p className="text-white font-medium">{p?.mahalle || '—'}</p>
          </div>
          <div>
            <span className="text-white/40">İlçe / İl</span>
            <p className="text-white font-medium">{p?.ilce} / {p?.il}</p>
          </div>
          <div>
            <span className="text-white/40">Mevkii</span>
            <p className="text-white font-medium">{p?.mevkii || '—'}</p>
          </div>
        </div>
      </div>

      {/* İmar Potansiyel Skoru */}
      {ib && (
        <div className="rounded-xl p-4" style={{
          background: `linear-gradient(135deg, ${skorRenk}10, ${skorRenk}05)`,
          border: `1px solid ${skorRenk}25`,
        }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white/90 text-sm font-semibold">İmar Potansiyel Skoru</h4>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${skorRenk}20`, color: skorRenk }}>
              {skorLabel}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke={skorRenk} strokeWidth="3"
                  strokeDasharray={`${ib.skor}, 100`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{ib.skor}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Baz Skor</span>
                <span className="text-white font-medium">{ib.base_skor || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Tapu Bonus</span>
                <span className="text-white font-medium">+{ib.tapu_bonus || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Seviye</span>
                <span className="font-medium" style={{ color: skorRenk }}>{ib.seviye}</span>
              </div>
            </div>
          </div>

          {ib.aciklama && (
            <p className="text-white/50 text-xs leading-relaxed border-t border-white/5 pt-3">{ib.aciklama}</p>
          )}
        </div>
      )}

      {/* Tapu İşlem Verileri */}
      {selectedParcel.tapu_islem && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 className="text-white/90 text-sm font-semibold mb-3">Tapu İşlem Verileri</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-white/40">Bu Parsel İşlem</span>
              <p className="text-white font-medium">{selectedParcel.tapu_islem.parsel_islem}</p>
            </div>
            <div>
              <span className="text-white/40">Çevre Ort.</span>
              <p className="text-white font-medium">{selectedParcel.tapu_islem.cevre_ort}</p>
            </div>
            <div>
              <span className="text-white/40">Çevre Max</span>
              <p className="text-white font-medium">{selectedParcel.tapu_islem.cevre_max}</p>
            </div>
            <div>
              <span className="text-white/40">Çevre Toplam</span>
              <p className="text-white font-medium">{selectedParcel.tapu_islem.cevre_toplam || 0} ({selectedParcel.tapu_islem.cevre_parsel} parsel)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PotansiyelTab({ selectedParcel, selectedIl, formatNumber }: any) {
  if (!selectedParcel) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-white/80 text-sm font-medium mb-2">Potansiyel Analizi</h3>
        <p className="text-white/40 text-xs max-w-[260px]">Bir parsel seçin ve imar potansiyelinin detaylı analizini görün.</p>
      </div>
    );
  }

  const p = selectedParcel.parsel;
  const ib = selectedParcel.imar_baskisi;

  const factors = [
    { label: 'Şehir Merkezine Yakınlık', value: ib?.mesafe_skor || 0 },
    { label: 'Nüfus Yoğunluğu', value: ib?.nufus_skor || 0 },
    { label: 'Arazi Uygunluğu', value: ib?.arazi_skor || 0 },
    { label: 'Ulaşım Erişimi', value: ib?.ulasim_skor || 0 },
    { label: 'Altyapı Yakınlığı', value: ib?.altyapi_skor || 0 },
  ];

  const hasFactor = factors.some(f => f.value > 0);

  return (
    <div className="space-y-4">
      {/* Potansiyel Faktörleri */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="text-white/90 text-sm font-semibold mb-4">Potansiyel Faktörleri</h4>
        {hasFactor ? (
          <div className="space-y-3">
            {factors.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">{f.label}</span>
                  <span className="text-white font-medium">{f.value}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${f.value}%`,
                      background: f.value >= 70 ? '#ef4444' : f.value >= 40 ? '#f59e0b' : '#22c55e',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-white/40 text-center py-4">
              <p>Bu parsel için detaylı faktör verisi</p>
              <p>backend imar_potansiyel hesaplamasından alınır.</p>
              <p className="mt-2 text-blue-400/60">Skor: {ib?.skor || '—'} / 100</p>
            </div>
          </div>
        )}
      </div>

      {/* Arazi Bilgileri */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="text-white/90 text-sm font-semibold mb-3">Arazi Detayları</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40">Toplam Alan</span>
            <p className="text-white font-medium">{formatNumber(Math.round(p?.alan || 0))} m²</p>
          </div>
          <div>
            <span className="text-white/40">Bina Sayısı (MS)</span>
            <p className="text-white font-medium">{p?.bina_sayisi_ms ?? '—'}</p>
          </div>
          <div>
            <span className="text-white/40">Arazi Cinsi</span>
            <p className="text-white font-medium">{p?.cins || '—'}</p>
          </div>
          <div>
            <span className="text-white/40">Nitelik</span>
            <p className="text-white font-medium">{p?.nitelik || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CevreselTab({ selectedParcel, selectedIl, disasterRisk, formatNumber }: any) {
  return (
    <div className="space-y-4">
      {/* Afet Risk Bilgileri */}
      {disasterRisk && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 className="text-white/90 text-sm font-semibold mb-3">
            {selectedIl ? `${selectedIl} Afet Riskleri` : 'Bölgesel Afet Riskleri'}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {disasterRisk.deprem_riski != null && (
              <div>
                <span className="text-white/40">Deprem Riski</span>
                <p className="text-white font-medium">{disasterRisk.deprem_riski}</p>
              </div>
            )}
            {disasterRisk.sel_riski != null && (
              <div>
                <span className="text-white/40">Sel Riski</span>
                <p className="text-white font-medium">{disasterRisk.sel_riski}</p>
              </div>
            )}
            {disasterRisk.heyelan_riski != null && (
              <div>
                <span className="text-white/40">Heyelan Riski</span>
                <p className="text-white font-medium">{disasterRisk.heyelan_riski}</p>
              </div>
            )}
            {disasterRisk.yangin_riski != null && (
              <div>
                <span className="text-white/40">Yangın Riski</span>
                <p className="text-white font-medium">{disasterRisk.yangin_riski}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Çevresel Bilgiler */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="text-white/90 text-sm font-semibold mb-3">Çevresel Değerlendirme</h4>
        {selectedParcel ? (
          <div className="text-xs text-white/60 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p>Seçilen parsel {selectedParcel.parsel?.ilce}/{selectedParcel.parsel?.il} bölgesinde yer almaktadır.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p>Arazi cinsi: <span className="text-white/80">{selectedParcel.parsel?.cins || 'Bilinmiyor'}</span></p>
            </div>
            {selectedParcel.parsel?.bina_sayisi_ms > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <p>Parselde mevcut yapı bulunmaktadır ({selectedParcel.parsel.bina_sayisi_ms} adet).</p>
              </div>
            )}
            {selectedParcel.imar_baskisi?.skor >= 60 && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p>İmar potansiyeli yüksek — çevredeki yapılaşma baskısı güçlü.</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/40 text-xs text-center py-4">Çevresel analiz için bir parsel seçin.</p>
        )}
      </div>

      {!selectedParcel && !disasterRisk && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <h3 className="text-white/80 text-sm font-medium mb-2">Çevresel Analiz</h3>
          <p className="text-white/40 text-xs max-w-[260px]">Bölgesel afet riskleri ve çevresel değerlendirme için bir konum seçin.</p>
        </div>
      )}
    </div>
  );
}

export default function ImarProPanel(props: ImarProPanelProps) {
  const {
    imarActiveTab, setImarActiveTab, imarDetailTabs,
    selectedParcel, parcelLoading, selectedIl, selectedIlce,
    formatNumber,
  } = props;

  return (
    <div className="p-6 pt-4">
      {/* İmar Tab Navigation */}
      <div className="flex border-b border-white/10 mb-5">
        {imarDetailTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setImarActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-all duration-200 relative text-center outline-none focus:outline-none ${
              imarActiveTab === tab.id ? 'text-blue-400' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
            {imarActiveTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {imarActiveTab === 'durum' && (
        <ImarDurumTab selectedParcel={selectedParcel} parcelLoading={parcelLoading} selectedIl={selectedIl} formatNumber={formatNumber} />
      )}
      {imarActiveTab === 'potansiyel' && (
        <PotansiyelTab selectedParcel={selectedParcel} selectedIl={selectedIl} formatNumber={formatNumber} />
      )}
      {imarActiveTab === 'cevresel' && (
        <CevreselTab selectedParcel={selectedParcel} selectedIl={selectedIl} disasterRisk={props.disasterRisk} formatNumber={formatNumber} />
      )}
    </div>
  );
}
