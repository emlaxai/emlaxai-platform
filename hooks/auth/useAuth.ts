'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { createBrowserClient } from '@supabase/ssr';
import type { UserProfile } from '@/types';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAuth() {
  const { user, isLoading, setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*, subscriptions(*)')
            .eq('id', authUser.id)
            .single();

          const sub = (profile as any)?.subscriptions?.[0];
          const userProfile: UserProfile = {
            id: authUser.id,
            email: authUser.email || '',
            fullName: profile?.name || profile?.full_name || undefined,
            avatarUrl: profile?.avatar_url || undefined,
            subscription: sub
              ? {
                  id: sub.id,
                  userId: authUser.id,
                  plan: sub.plan,
                  status: sub.status,
                  currentPeriodStart: sub.current_period_start,
                  currentPeriodEnd: sub.current_period_end,
                  createdAt: sub.created_at,
                }
              : null,
          };

          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user?: unknown } | null) => {
        if (!session?.user) {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setIsLoading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
}
