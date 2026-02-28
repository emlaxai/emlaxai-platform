import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: usage } = await supabase
      .rpc('get_daily_usage', { p_user_id: user.id } as any);

    return NextResponse.json({ usage: usage || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { feature } = body;

    if (!feature) {
      return NextResponse.json({ error: 'feature gerekli' }, { status: 400 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = (userData as any)?.plan || 'free';

    const { data: planData } = await (supabase
      .from('plans') as any)
      .select('features')
      .eq('plan_type', plan)
      .eq('is_active', true)
      .limit(1)
      .single();

    const limits = (planData?.features as Record<string, number | boolean>) || {};
    const limit = limits[feature];

    if (limit === false) {
      return NextResponse.json({
        allowed: false,
        reason: 'Bu özellik planınızda mevcut değil.',
      }, { status: 403 });
    }

    if (typeof limit === 'number' && limit !== -1) {
      const { data: currentUsage } = await (supabase
        .from('usage_tracking') as any)
        .select('used_count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const usedCount = currentUsage?.used_count || 0;
      if (usedCount >= limit) {
        return NextResponse.json({
          allowed: false,
          used: usedCount,
          limit,
          reason: `Günlük ${feature} limitinize ulaştınız (${limit}). Pro'ya yükseltin.`,
        }, { status: 429 });
      }
    }

    const { data: newCount } = await supabase
      .rpc('increment_usage', { p_user_id: user.id, p_feature: feature } as any);

    return NextResponse.json({
      allowed: true,
      used: newCount,
      limit: typeof limit === 'number' ? limit : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
