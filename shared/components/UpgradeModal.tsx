'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, number | boolean>;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  currentPlan: string;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
}

const FEATURE_LABELS: Record<string, string> = {
  parcel_query: 'Parsel Sorgu',
  parcel_imar: 'Parsel İmar Analizi',
  exai_limited: 'exAI Analiz',
  exai_deep_limited: 'exAI Derin Analiz',
  exai_deep: 'exAI Derin Analiz',
  '3d_map': '3D Harita Görünümü',
  standard_map: 'Standart Harita Görünümü',
  trend_years: 'Trend Analizi',
  demographic: 'Demografik Analiz',
  demographic_limited: 'Demografik Analiz',
  disaster_risk: 'Doğal Afet Risk Analizi',
  disaster_risk_limited: 'Doğal Afet Risk Analizi',
  export_pdf: 'PDF Rapor Dışa Aktarma',
  roi_suggestion: 'Yatırım Önerisi ROI',
  roi_suggestion_limited: 'Yatırım Önerisi ROI',
  standard_filters: 'Standart Filtreler',
  advanced_filters: 'Gelişmiş Filtreler',
};

function formatFeatureValue(key: string, value: number | boolean): string {
  if (typeof value === 'boolean') return value ? '✓' : '—';
  if (value === -1) return 'Sınırsız';
  if (key === 'trend_years') return `${value} Yıllık`;
  if (key === 'export_pdf') return `${value} adet`;
  if (key === 'exai_limited') return `${value} Sorgu/Gün`;
  return `${value}/gün`;
}

export function UpgradeModal({
  isOpen,
  onClose,
  plans,
  currentPlan,
  onSelectPlan,
  loading = false,
}: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      setClosing(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setVisible(false);
    setTimeout(() => { setClosing(false); onClose(); }, 280);
  };

  if ((!isOpen && !closing) || !mounted) return null;

  const displayPlans = plans.filter((p) =>
    billingCycle === 'monthly' ? p.price_monthly > 0 || p.price_yearly === 0 : p.price_yearly > 0 || p.price_monthly === 0
  );

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          backgroundColor: visible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
          backdropFilter: visible ? 'blur(10px)' : 'blur(0px)',
          WebkitBackdropFilter: visible ? 'blur(10px)' : 'blur(0px)',
        }}
      />

      {/* Modal */}
      <div
        className="relative transition-all duration-300 ease-out"
        style={{
          width: '820px',
          maxWidth: '94vw',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#0a0a0f',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 80px -16px rgba(0,0,0,0.8)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '28px 32px 0' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Planını Seç
              </h2>
              <button
                onClick={handleClose}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              >
                <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 3L3 11M3 3l8 8" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '24px' }}>
              İhtiyacınıza uygun planı seçin. İstediğiniz zaman yükseltin veya iptal edin.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center" style={{ gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: billingCycle === 'monthly' ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>
                Aylık
              </span>
              <button
                onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: billingCycle === 'yearly' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: billingCycle === 'yearly' ? '23px' : '3px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                />
              </button>
              <span className="flex items-center" style={{ gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: billingCycle === 'yearly' ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>
                  Yıllık
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#34d399',
                  background: 'rgba(52,211,153,0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}>
                  2 ay bedava
                </span>
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', margin: '0 32px', background: 'rgba(255,255,255,0.06)' }} />

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '24px 32px 28px' }}>
            {displayPlans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
              const isCurrent = plan.id.includes(currentPlan);
              const isPaid = plan.price_monthly > 0 || plan.price_yearly > 0;
              const isPlus = plan.id === 'plus';
              const isPro = plan.id === 'pro';

              return (
                <div
                  key={plan.id}
                  className="relative"
                  style={{
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: isPro
                      ? 'linear-gradient(135deg, #2563eb, #7c3aed, #0ea5e9, #f59e0b)'
                      : isPlus
                      ? 'linear-gradient(160deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))'
                      : 'rgba(255,255,255,0.02)',
                    border: isPro
                      ? '1px solid rgba(255,255,255,0.2)'
                      : isPlus
                      ? '1px solid rgba(139,92,246,0.2)'
                      : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isPro
                      ? '0 4px 24px -4px rgba(37,99,235,0.4), 0 0 16px rgba(124,58,237,0.15)'
                      : 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Plan Name */}
                  <div className="flex items-center" style={{ gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{plan.name}</span>
                    {isPlus && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        color: '#fff',
                      }}>
                        PLUS
                      </span>
                    )}
                    {isPro && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed, #0ea5e9)',
                        color: '#fff',
                      }}>
                        PRO
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                    {price > 0 ? (
                      <div className="flex items-baseline" style={{ gap: '4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                          ₺{price.toLocaleString('tr-TR')}
                        </span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
                          /{billingCycle === 'monthly' ? 'ay' : 'yıl'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        ₺0
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', flex: 1 }}>
                    {Object.entries(plan.features || {}).map(([key, value]) => {
                      const on = typeof value === 'boolean' ? value : true;
                      const isLimited = key.endsWith('_limited');
                      return (
                        <li key={key} className="flex items-center" style={{ gap: '8px', fontSize: '12px' }}>
                          {on ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                              <circle cx="7" cy="7" r="7" fill={isLimited ? 'rgba(251,191,36,0.12)' : 'rgba(37,99,235,0.12)'} />
                              <path d="M4.5 7L6.5 9L9.5 5.5" stroke={isLimited ? '#f59e0b' : '#3b82f6'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                              <circle cx="7" cy="7" r="7" fill="rgba(255,255,255,0.04)" />
                              <path d="M5 7h4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                          <span style={{ color: on ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>
                            {isLimited && (
                              <span style={{ color: '#fbbf24', fontWeight: 500 }}>Sınırlı </span>
                            )}
                            {typeof value === 'number' && value !== -1 && (
                              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{formatFeatureValue(key, value)} </span>
                            )}
                            {typeof value === 'number' && value === -1 && (
                              <span style={{ color: '#60a5fa', fontWeight: 500 }}>Sınırsız </span>
                            )}
                            {FEATURE_LABELS[key] || key}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => !isCurrent && price > 0 && onSelectPlan(plan.id)}
                    disabled={isCurrent || loading || price === 0}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isCurrent || price === 0 ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      ...(isCurrent
                        ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }
                        : isPro
                        ? { background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }
                        : isPlus
                        ? { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', boxShadow: '0 2px 12px -3px rgba(139,92,246,0.5)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }),
                    }}
                    onMouseEnter={e => { if (!isCurrent && isPaid) e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { if (!isCurrent && isPaid) e.currentTarget.style.opacity = '1'; }}
                  >
                    {loading ? 'Yükleniyor...' : isCurrent ? 'Mevcut Plan' : isPlus ? "Plus'a Geç" : isPro ? "Pro'ya Geç" : 'Mevcut Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
