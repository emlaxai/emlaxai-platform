import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    const { data: subscription } = await (supabase
      .from('iyzico_subscriptions') as any)
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: usage } = await supabase
      .rpc('get_daily_usage', { p_user_id: user.id } as any);

    const { data: plans } = await (supabase
      .from('plans') as any)
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    return NextResponse.json({
      plan: (userData as any)?.plan || 'free',
      subscription: subscription || null,
      usage: usage || [],
      plans: plans || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
