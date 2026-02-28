'use client';

import { useState, useCallback, useRef } from 'react';
import { useFeatureGate } from '@/hooks/auth/useFeatureGate';
import { UpgradeModal } from '@/shared/components/UpgradeModal';

interface ModeSwitchProps {
  pageMode: 'market' | 'imar';
  onModeChange: (mode: 'market' | 'imar') => void;
}

const DEFAULT_PLANS: { id: string; name: string; description: string; price_monthly: number; price_yearly: number; features: Record<string, number | boolean> }[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    description: 'Temel piyasa analizi ve harita özellikleri',
    price_monthly: 0,
    price_yearly: 0,
    features: {
      parcel_query: true,
      exai_limited: 5,
      standard_map: true,
      trend_years: 4,
      demographic_limited: true,
      disaster_risk_limited: true,
      export_pdf: 1,
      standard_filters: true,
    },
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'Parsel sorgu, trend analizi ve yatırım önerisi',
    price_monthly: 899,
    price_yearly: 8990,
    features: {
      parcel_query: true,
      exai_deep_limited: true,
      standard_map: true,
      trend_years: 4,
      demographic: true,
      disaster_risk: true,
      export_pdf: 10,
      roi_suggestion_limited: true,
      standard_filters: true,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Sınırsız analiz, 3D harita, yatırım önerisi ve AI raporlama',
    price_monthly: 3499,
    price_yearly: 34990,
    features: {
      parcel_imar: -1,
      exai_deep: -1,
      '3d_map': true,
      trend_years: 12,
      demographic: true,
      disaster_risk: true,
      export_pdf: true,
      roi_suggestion: true,
      advanced_filters: true,
    },
  },
];

export default function ModeSwitch({ pageMode, onModeChange }: ModeSwitchProps) {
  const { isPro, plan } = useFeatureGate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImarClick = useCallback(() => {
    if (pageMode === 'imar') return;
    if (!isPro) {
      onModeChange('imar');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowUpgrade(true), 900);
      return;
    }
    onModeChange('imar');
  }, [pageMode, isPro, onModeChange]);

  const handleUpgradeClose = useCallback(() => {
    setShowUpgrade(false);
    if (!isPro) {
      setTimeout(() => onModeChange('market'), 150);
    }
  }, [isPro, onModeChange]);

  const isMarket = pageMode === 'market';
  const isImar = pageMode === 'imar';

  return (
    <>
      <div
        className="flex items-center"
        style={{
          padding: '3px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(99,52,235,0.1), rgba(14,165,233,0.08))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        {/* Bölgelens */}
        <button
          onClick={() => onModeChange('market')}
          className="outline-none focus:outline-none"
          style={{
            padding: '6px 16px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: isMarket ? '#fff' : 'rgba(255,255,255,0.4)',
            background: isMarket ? 'linear-gradient(135deg, #2563eb, #6366f1, #0ea5e9)' : 'transparent',
            boxShadow: isMarket ? '0 2px 8px rgba(37,99,235,0.4), 0 0 12px rgba(99,102,241,0.15)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          Bölgelens
        </button>

        {/* Parselens */}
        <button
          onClick={handleImarClick}
          className="flex items-center outline-none focus:outline-none"
          style={{
            gap: '5px',
            padding: '6px 16px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: isImar ? '#fff' : 'rgba(255,255,255,0.4)',
            background: isImar ? 'linear-gradient(135deg, #2563eb, #7c3aed, #0ea5e9, #f59e0b)' : 'transparent',
            boxShadow: isImar ? '0 2px 8px rgba(37,99,235,0.4), 0 0 12px rgba(124,58,237,0.15)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          Parselens
          <span style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.03em',
            padding: '1px 5px',
            borderRadius: '999px',
            background: isImar ? 'rgba(255,255,255,0.2)' : 'rgba(37,99,235,0.5)',
            color: '#fff',
            lineHeight: '14px',
          }}>
            PRO
          </span>
        </button>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={handleUpgradeClose}
        plans={DEFAULT_PLANS}
        currentPlan={plan}
        onSelectPlan={() => setShowUpgrade(false)}
      />
    </>
  );
}
