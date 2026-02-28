import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface GuardResult {
  allowed: boolean;
  userId: string | null;
  plan: string;
  response?: NextResponse;
}

/**
 * API route'larını plan bazlı korur.
 * Free kullanıcılar için günlük limit kontrolü yapar.
 */
export async function apiGuard(
  feature: string,
  options: { requirePro?: boolean } = {}
): Promise<GuardResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      allowed: false,
      userId: null,
      plan: 'free',
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = (userData as any)?.plan || 'free';

  if (options.requirePro && plan === 'free') {
    return {
      allowed: false,
      userId: user.id,
      plan,
      response: NextResponse.json({
        error: 'Pro plan gerekli',
        upgrade: true,
      }, { status: 403 }),
    };
  }

  if (plan === 'free' && feature) {
    const { data: planData } = await (supabase
      .from('plans') as any)
      .select('features')
      .eq('plan_type', 'free')
      .eq('is_active', true)
      .limit(1)
      .single();

    const limits = planData?.features as Record<string, number | boolean> | null;
    const limit = limits?.[feature];

    if (limit === false) {
      return {
        allowed: false,
        userId: user.id,
        plan,
        response: NextResponse.json({
          error: 'Bu özellik Free planda mevcut değil',
          upgrade: true,
        }, { status: 403 }),
      };
    }

    if (typeof limit === 'number' && limit !== -1) {
      const today = new Date().toISOString().split('T')[0];
      const { data: usage } = await (supabase
        .from('usage_tracking') as any)
        .select('used_count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('date', today)
        .single();

      if (usage && usage.used_count >= limit) {
        return {
          allowed: false,
          userId: user.id,
          plan,
          response: NextResponse.json({
            error: `Günlük ${feature} limitine ulaştınız (${limit})`,
            upgrade: true,
            used: usage.used_count,
            limit,
          }, { status: 429 }),
        };
      }
    }
  }

  return { allowed: true, userId: user.id, plan };
}
