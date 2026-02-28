'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import type { FeatureName } from '@/types';

export function useFeatureGate() {
  const { isPro, canUseFeature, getRemainingUsage, getPlan, incrementUsage } =
    useAuthStore();

  const checkAndConsume = useCallback(
    (feature: FeatureName): boolean => {
      if (!canUseFeature(feature)) return false;
      incrementUsage(feature);
      return true;
    },
    [canUseFeature, incrementUsage]
  );

  const requirePro = useCallback(
    (feature: FeatureName): { allowed: boolean; reason?: string } => {
      const plan = getPlan();
      if (plan === 'pro' || plan === 'enterprise') {
        return { allowed: true };
      }

      const remaining = getRemainingUsage(feature);
      if (remaining > 0) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: `Bu özellik için günlük kullanım limitinize ulaştınız. Pro'ya yükseltin.`,
      };
    },
    [getPlan, getRemainingUsage]
  );

  return {
    isPro: isPro(),
    plan: getPlan(),
    canUseFeature,
    getRemainingUsage,
    checkAndConsume,
    requirePro,
  };
}
