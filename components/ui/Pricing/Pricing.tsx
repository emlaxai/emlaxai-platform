'use client';

import Button from '@/components/ui/Button';
import LogoCloud from '@/components/ui/LogoCloud';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  // Mock data for testing when no products exist
  const mockProducts: ProductWithPrices[] = products.length > 0 ? products : [
    {
      id: 'mock-free',
      name: 'Ücretsiz',
      description: 'Başlamak için ideal',
      metadata: {
        features: JSON.stringify([
          'Günde 10 exa sorgusu',
          'Ücretsiz 5 değerleme',
          'Temel parsel analizi',
          'Ortalama m² fiyat trendleri',
          'Demografik nüfus bilgileri',
          '7/24 canlı destek'
        ])
      },
      active: true,
      prices: [
        {
          id: 'mock-free-price',
          product_id: 'mock-free',
          active: true,
          currency: 'try',
          unit_amount: 0,
          interval: 'month',
          type: 'recurring'
        } as Price
      ]
    } as ProductWithPrices,
    {
      id: 'mock-basic',
      name: 'Basic',
      description: 'Bireysel kullanıcılar için',
      metadata: {
        features: JSON.stringify([
          'Günde 50 exa sorgusu',
          'Aylık 10 değerleme',
          'Detaylı parsel analizi',
          'Tüm piyasa trendleri',
          'Detaylı demografik veriler',
          'İmar plan görüntüleme',
          'PDF rapor indirme',
          '7/24 canlı destek'
        ])
      },
      active: true,
      prices: [
        {
          id: 'mock-basic-price',
          product_id: 'mock-basic',
          active: true,
          currency: 'try',
          unit_amount: 79900,
          interval: 'month',
          type: 'recurring'
        } as Price
      ]
    } as ProductWithPrices,
    {
      id: 'mock-pro',
      name: 'Pro',
      description: 'Profesyoneller için',
      metadata: {
        features: JSON.stringify([
          'Sınırsız exa sorgusu',
          'Sınırsız değerleme',
          'Tam detaylı analiz paketi',
          'Gelecek fiyat tahminleri',
          'İmar durumu analizi',
          'Devlet yatırımları',
          'Yaşam olanakları',
          'Yaşanılabilirlik endeksi',
          'Yatırım getirisi hesaplama',
          'API erişimi',
          'Çoklu parsel karşılaştırma',
          'Özel raporlama',
          '7/24 öncelikli destek'
        ])
      },
      active: true,
      prices: [
        {
          id: 'mock-pro-price',
          product_id: 'mock-pro',
          active: true,
          currency: 'try',
          unit_amount: 249900,
          interval: 'month',
          type: 'recurring'
        } as Price
      ]
    } as ProductWithPrices
  ];

  const intervals = Array.from(
    new Set(
      mockProducts.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  return (
    <section className="bg-black min-h-screen">
      <div className="max-w-7xl px-6 py-16 mx-auto sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-medium text-white mb-6">
            Fiyatlandırma
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-zinc-400">
            Ücretsiz başlayın, ihtiyacınıza göre yükseltin.
          </p>
        </div>

        {/* Billing Toggle */}
        {intervals.length > 1 && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
              {intervals.includes('month') && (
                <button
                  onClick={() => setBillingInterval('month')}
                  type="button"
                  className={cn(
                    'px-6 py-2 text-sm font-medium rounded-full transition-all outline-none focus:outline-none',
                    billingInterval === 'month'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Aylık
                </button>
              )}
              {intervals.includes('year') && (
                <button
                  onClick={() => setBillingInterval('year')}
                  type="button"
                  className={cn(
                    'px-6 py-2 text-sm font-medium rounded-full transition-all outline-none focus:outline-none',
                    billingInterval === 'year'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Yıllık
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {mockProducts.map((product) => {
              const price = product?.prices?.find(
                (price) => price.interval === billingInterval
              );
              if (!price) return null;
              const priceString = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: price.currency!,
                minimumFractionDigits: 0
              }).format((price?.unit_amount || 0) / 100);
              
              const isCurrentPlan = subscription
                ? product.name === subscription?.prices?.products?.name
                : false;

              // Parse features from metadata
              const features = product.metadata?.features 
                ? JSON.parse(product.metadata.features) 
                : [];

              return (
                <div
                  key={product.id}
                  className={cn(
                    'relative flex flex-col rounded-2xl p-8 bg-zinc-900/50 border transition-all hover:bg-zinc-900/70',
                    isCurrentPlan
                      ? 'border-white'
                      : 'border-zinc-800 hover:border-zinc-700'
                  )}
                >
                  {/* Plan Name */}
                  <h3 className="text-xl font-medium text-white mb-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 mb-4">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-medium text-white">
                      {priceString}
                    </span>
                    <span className="text-sm text-zinc-400 ml-1">
                      /{billingInterval === 'month' ? 'ay' : 'yıl'}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 text-sm mb-8 flex-grow">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-zinc-300">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleStripeCheckout(price)}
                    disabled={priceIdLoading === price.id}
                    className={cn(
                      'w-full py-2.5 px-6 rounded-full text-sm font-medium transition-colors outline-none focus:outline-none',
                      isCurrentPlan
                        ? 'bg-zinc-800 text-zinc-400 cursor-default'
                        : 'bg-white text-black hover:bg-zinc-100'
                    )}
                  >
                    {priceIdLoading === price.id
                      ? 'Yükleniyor...'
                      : isCurrentPlan
                        ? 'Mevcut Plan'
                        : subscription
                          ? 'Değiştir'
                          : 'Başla'}
                  </button>
                </div>
              );
            })}
        </div>

        <LogoCloud />
      </div>
    </section>
  );
}
