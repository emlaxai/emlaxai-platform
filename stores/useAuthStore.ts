'use client';

import { create } from 'zustand';
import type { UserPlan, UserProfile, UsageRecord, FeatureName, FeatureLimits } from '@/types';
import { PLAN_LIMITS } from '@/types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  usage: UsageRecord[];

  setUser: (user: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setUsage: (usage: UsageRecord[]) => void;
  incrementUsage: (feature: FeatureName) => void;

  isPro: () => boolean;
  getPlan: () => UserPlan;
  getLimits: () => FeatureLimits;
  canUseFeature: (feature: FeatureName) => boolean;
  getRemainingUsage: (feature: FeatureName) => number;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  usage: [],

  setUser: (user) => set({ user }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setUsage: (usage) => set({ usage }),
  incrementUsage: (feature) =>
    set((state) => ({
      usage: state.usage.map((u) =>
        u.feature === feature ? { ...u, usedCount: u.usedCount + 1 } : u
      ),
    })),

  isPro: () => {
    const plan = get().user?.subscription?.plan;
    return plan === 'pro' || plan === 'enterprise';
  },

  getPlan: () => get().user?.subscription?.plan || 'free',

  getLimits: () => PLAN_LIMITS[get().getPlan()],

  canUseFeature: (feature) => {
    const limits = get().getLimits();
    const limit = limits[feature];
    if (typeof limit === 'boolean') return limit;
    const record = get().usage.find((u) => u.feature === feature);
    return !record || record.usedCount < limit;
  },

  getRemainingUsage: (feature) => {
    const limits = get().getLimits();
    const limit = limits[feature];
    if (typeof limit === 'boolean') return limit ? Infinity : 0;
    const record = get().usage.find((u) => u.feature === feature);
    return Math.max(0, limit - (record?.usedCount || 0));
  },
}));
