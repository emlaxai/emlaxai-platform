import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createCheckoutForm, type IyzicoBuyer } from '@/lib/iyzico/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId gerekli' }, { status: 400 });
    }

    const { data: planRaw } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    const plan = planRaw as Record<string, unknown> | null;
    if (!plan) {
      return NextResponse.json({ error: 'Plan bulunamadı' }, { status: 404 });
    }

    const { data: userDataRaw } = await supabase
      .from('users')
      .select('full_name, phone, city, country')
      .eq('id', user.id)
      .single();

    const userData = userDataRaw as Record<string, string | null> | null;
    const priceMonthly = Number(plan.price_monthly) || 0;
    const priceYearly = Number(plan.price_yearly) || 0;
    const price = priceMonthly > 0 ? priceMonthly : priceYearly;
    const basketId = `emx_${user.id.slice(0, 8)}_${Date.now()}`;

    const nameParts = (String(userData?.full_name || '') || user.email?.split('@')[0] || 'User').split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const buyer: IyzicoBuyer = {
      id: user.id,
      name: firstName,
      surname: lastName,
      email: user.email || '',
      gsmNumber: userData?.phone || undefined,
      city: userData?.city || 'Istanbul',
      country: userData?.country || 'Turkey',
      registrationAddress: userData?.city || 'Istanbul, Türkiye',
      ip,
    };

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const checkoutForm = await createCheckoutForm({
      price: price.toString(),
      paidPrice: price.toString(),
      currency: (plan as any).currency || 'TRY',
      basketId,
      paymentGroup: 'SUBSCRIPTION',
      callbackUrl: `${origin}/api/webhooks/iyzico/callback`,
      buyer,
      billingAddress: {
        contactName: `${firstName} ${lastName}`,
        city: userData?.city || 'Istanbul',
        country: userData?.country || 'Turkey',
        address: userData?.city || 'Istanbul, Türkiye',
      },
      basketItems: [
        {
          id: plan.id as string,
          name: plan.name as string,
          category1: 'Abonelik',
          itemType: 'VIRTUAL',
          price: price.toString(),
        },
      ],
    });

    await (supabase.from('iyzico_subscriptions') as any).insert({
      user_id: user.id,
      plan_id: planId,
      iyzico_order_id: basketId,
      status: 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: (plan as any).price_monthly > 0
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { iyzico_token: checkoutForm.token },
    });

    return NextResponse.json({
      checkoutFormContent: checkoutForm.checkoutFormContent,
      token: checkoutForm.token,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Checkout hatası:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
