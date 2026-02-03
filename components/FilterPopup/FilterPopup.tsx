'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'konut' | 'ticari' | 'arsa';
type Tip = 'satilik' | 'kiralik';

export default function FilterPopup({ isOpen, onClose }: FilterPopupProps) {
  const [category, setCategory] = useState<Category>('konut');
  const [tip, setTip] = useState<Tip>('satilik');
  const [odaSayisi, setOdaSayisi] = useState('');
  const [binaYasi, setBinaYasi] = useState('');
  const [segment, setSegment] = useState('');
  const [bolumSayisi, setBolumSayisi] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setCategory('konut');
    setTip('satilik');
    setOdaSayisi('');
    setBinaYasi('');
    setSegment('');
    setBolumSayisi('');
  };

  const handleApply = () => {
    // Burada filtre verilerini parent component'e gönderebilirsiniz
    console.log('Filters:', {
      category,
      tip,
      odaSayisi,
      binaYasi,
      segment,
      bolumSayisi
    });
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const popupContent = (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={onClose}
      />

      {/* Popup */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[80vh] bg-zinc-900/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl z-50 flex flex-col"
        style={{ animation: 'popupAppear 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Filtreler</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all outline-none focus:outline-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Emlak Kategorisi */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-white/80 mb-2">Emlak Kategorisi</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCategory('konut')}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all outline-none focus:outline-none ${
                  category === 'konut'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20'
                }`}
              >
                Konut
              </button>
              <button
                onClick={() => setCategory('ticari')}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all outline-none focus:outline-none ${
                  category === 'ticari'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20'
                }`}
              >
                Ticari
              </button>
              <button
                onClick={() => setCategory('arsa')}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all outline-none focus:outline-none ${
                  category === 'arsa'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20'
                }`}
              >
                Arsa
              </button>
            </div>
          </div>

          {/* Tip */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-white/80 mb-2">Tip</label>
            <div className="relative inline-flex items-center bg-white/10 rounded-full p-1 w-full">
              <button
                type="button"
                onClick={() => setTip('satilik')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 outline-none focus:outline-none ${
                  tip === 'satilik'
                    ? 'bg-white text-zinc-900 shadow-md'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Satılık
              </button>
              <button
                type="button"
                onClick={() => setTip('kiralik')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 outline-none focus:outline-none ${
                  tip === 'kiralik'
                    ? 'bg-white text-zinc-900 shadow-md'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Kiralık
              </button>
            </div>
          </div>

          {/* KONUT FİLTRELERİ */}
          {category === 'konut' && (
            <>
              {/* Oda Sayısı */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-white/80 mb-2">Oda Sayısı</label>
                <select
                  value={odaSayisi}
                  onChange={(e) => setOdaSayisi(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                >
                  <option value="">Tümü</option>
                  <option value="1">1+0</option>
                  <option value="1.5">1+1</option>
                  <option value="2">2+0</option>
                  <option value="2.5">2+1</option>
                  <option value="3">3+0</option>
                  <option value="3.5">3+1</option>
                  <option value="4">4+0</option>
                  <option value="4.5">4+1</option>
                  <option value="5">5+1</option>
                </select>
              </div>

              {/* Bina Yaşı */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-white/80 mb-2">Bina Yaşı</label>
                <select
                  value={binaYasi}
                  onChange={(e) => setBinaYasi(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                >
                  <option value="">Tümü</option>
                  <option value="0">0 (Yeni)</option>
                  <option value="1-5">1-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-15">11-15</option>
                  <option value="16-20">16-20</option>
                  <option value="21+">21+</option>
                </select>
              </div>

              {/* Segment */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-white/80 mb-2">Segment</label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                >
                  <option value="">Tümü</option>
                  <option value="daire">Daire</option>
                  <option value="mustakil">Müstakil</option>
                </select>
              </div>
            </>
          )}

          {/* TİCARİ FİLTRELERİ */}
          {category === 'ticari' && (
            <>
              {/* Bölüm Sayısı */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-white/80 mb-2">Bölüm Sayısı</label>
                <select
                  value={bolumSayisi}
                  onChange={(e) => setBolumSayisi(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                >
                  <option value="">Tümü</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              {/* Bina Yaşı */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-white/80 mb-2">Bina Yaşı</label>
                <select
                  value={binaYasi}
                  onChange={(e) => setBinaYasi(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                >
                  <option value="">Tümü</option>
                  <option value="0">0 (Yeni)</option>
                  <option value="1-5">1-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-15">11-15</option>
                  <option value="16-20">16-20</option>
                  <option value="21+">21+</option>
                </select>
              </div>

              {/* Segment */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-white/80 mb-2">Segment</label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                >
                  <option value="">Tümü</option>
                  <option value="ofis">Ofis/Büro</option>
                  <option value="dukkan">Dükkan/Mağaza</option>
                  <option value="endustriyel">Endüstriyel</option>
                  <option value="otel">Otel/Turistik İşletme</option>
                  <option value="akaryakit">Akaryakıt İstasyonu</option>
                  <option value="imalathane">İmalathane/Atölye</option>
                  <option value="depo">Depo/Antrepo</option>
                  <option value="fabrika">Fabrika</option>
                </select>
              </div>
            </>
          )}

          {/* ARSA FİLTRELERİ */}
          {category === 'arsa' && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-zinc-800 mb-2">Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/50 border border-black/10 text-sm text-zinc-700 outline-none focus:border-blue-500 focus:bg-white/70 transition-all"
              >
                <option value="">Tümü</option>
                <option value="arsa">Arsa</option>
                <option value="arazi">Arazi</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-white/10">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/20 transition-all outline-none focus:outline-none"
          >
            Temizle
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 outline-none focus:outline-none"
          >
            Uygula
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(popupContent, document.body);
}
