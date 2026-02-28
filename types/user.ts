export type UserPlan = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  userId: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  iyzicoSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscription: Subscription | null;
}

export type FeatureName =
  | 'parcel_detail'
  | 'exa_chat'
  | '3d_map'
  | 'trend_months'
  | 'disaster_risk'
  | 'export_pdf'
  | 'imar_analysis';

export interface FeatureLimits {
  parcel_detail: number;
  exa_chat: number;
  '3d_map': boolean;
  trend_months: number;
  disaster_risk: boolean;
  export_pdf: boolean;
  imar_analysis: boolean;
}

export const PLAN_LIMITS: Record<UserPlan, FeatureLimits> = {
  free: {
    parcel_detail: 3,
    exa_chat: 5,
    '3d_map': false,
    trend_months: 12,
    disaster_risk: true,
    export_pdf: false,
    imar_analysis: false,
  },
  pro: {
    parcel_detail: Infinity,
    exa_chat: Infinity,
    '3d_map': true,
    trend_months: 120,
    disaster_risk: true,
    export_pdf: true,
    imar_analysis: true,
  },
  enterprise: {
    parcel_detail: Infinity,
    exa_chat: Infinity,
    '3d_map': true,
    trend_months: 120,
    disaster_risk: true,
    export_pdf: true,
    imar_analysis: true,
  },
};

export interface UsageRecord {
  feature: FeatureName;
  usedCount: number;
  resetAt: string;
}
