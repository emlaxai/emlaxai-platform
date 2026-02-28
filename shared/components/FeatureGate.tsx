'use client';

import { type ReactNode } from 'react';
import { useFeatureGate } from '@/hooks/auth/useFeatureGate';
import type { FeatureName } from '@/types';

interface FeatureGateProps {
  feature: FeatureName;
  children: ReactNode;
  fallback?: ReactNode;
}

function DefaultFallback() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm" />
      <div className="relative text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1.5 text-xs font-semibold text-white mb-3">
          PRO
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Pro Özellik
        </h3>
        <p className="text-sm text-white/60 mb-4">
          Bu özelliği kullanmak için Pro plana yükseltmeniz gerekiyor.
        </p>
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
          Pro&apos;ya Yükselt
        </button>
      </div>
    </div>
  );
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canUseFeature } = useFeatureGate();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  return <>{fallback || <DefaultFallback />}</>;
}

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className = '' }: ProBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase ${className}`}
    >
      PRO
    </span>
  );
}
