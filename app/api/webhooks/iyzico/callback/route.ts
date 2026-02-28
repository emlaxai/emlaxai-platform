import { NextRequest, NextResponse } from 'next/server';
import { retrieveCheckoutResult } from '@/lib/iyzico/client';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 400 });
    }

    const result = await retrieveCheckoutResult(token) as Record<string, unknown>;
    const supabase = createClient();

    const { data: pendingSub } = await (supabase
      .from('iyzico_subscriptions') as any)
      .select('*')
      .eq('metadata->>iyzico_token', token)
      .single();

    if (!pendingSub) {
      console.error('Bekleyen abonelik bulunamadı:', token);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      await (supabase.from('iyzico_subscriptions') as any)
        .update({
          status: 'active',
          iyzico_subscription_ref: result.paymentId as string,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pendingSub.id);

      await (supabase.from('payment_history') as any).insert({
        user_id: pendingSub.user_id,
        subscription_id: pendingSub.id,
        iyzico_payment_id: result.paymentId as string,
        amount: parseFloat(result.paidPrice as string || '0'),
        currency: result.currency as string || 'TRY',
        status: 'success',
        payment_type: 'subscription',
        metadata: { iyzico_result: result },
      });

      return NextResponse.redirect(`${origin}/parselens?subscription=success`);
    } else {
      await (supabase.from('iyzico_subscriptions') as any)
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pendingSub.id);

      await (supabase.from('payment_history') as any).insert({
        user_id: pendingSub.user_id,
        subscription_id: pendingSub.id,
        amount: 0,
        status: 'failed',
        payment_type: 'subscription',
        metadata: { iyzico_result: result },
      });

      return NextResponse.redirect(`${origin}/parselens?subscription=failed`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('iyzico callback hatası:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
