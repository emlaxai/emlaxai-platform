'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import type { UserPlan, FeatureName } from '@/types';

interface SubscriptionData {
  plan: UserPlan;
  subscription: {
    id: string;
    plan_id: string;
    status: string;
    current_period_end: string;
    plans: {
      name: string;
      plan_type: UserPlan;
      features: Record<string, number | boolean>;
    };
  } | null;
  usage: Array<{ feature: string; used_count: number }>;
  plans: Array<{
    id: string;
    name: string;
    description: string;
    plan_type: UserPlan;
    price_monthly: number;
    price_yearly: number;
    features: Record<string, number | boolean>;
  }>;
}

async function fetchSubscription(): Promise<SubscriptionData> {
  const res = await fetch('/api/subscription');
  if (!res.ok) {
    if (res.status === 401) {
      return { plan: 'free', subscription: null, usage: [], plans: [] };
    }
    throw new Error('Subscription fetch failed');
  }
  return res.json();
}

export function useSubscription() {
  const { setUser, user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data && user) {
      setUser({
        ...user,
        subscription: query.data.subscription
          ? {
              id: query.data.subscription.id,
              userId: user.id,
              plan: query.data.subscription.plans?.plan_type || query.data.plan,
              status: query.data.subscription.status as 'active' | 'cancelled' | 'past_due' | 'trialing',
              currentPeriodStart: '',
              currentPeriodEnd: query.data.subscription.current_period_end,
              createdAt: '',
            }
          : null,
      });
    }
  }, [query.data]);

  return {
    ...query,
    plan: query.data?.plan || 'free',
    subscription: query.data?.subscription || null,
    usage: query.data?.usage || [],
    availablePlans: query.data?.plans || [],
    isPro: query.data?.plan === 'pro' || query.data?.plan === 'enterprise',
    refresh: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  };
}

export function useTrackUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feature: FeatureName) => {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
