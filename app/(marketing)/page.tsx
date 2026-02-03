import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-black overflow-hidden pt-20 md:pt-32 pb-32 md:pb-48">
        <div className="relative flex justify-center px-6">
          <div className="w-full max-w-5xl px-8">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-medium text-white mb-6 leading-tight max-w-3xl">
              Yapay zeka ile emlak
              <br />
              analizi artık çok kolay
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mb-10 leading-relaxed">
              Parsel analizi, piyasa verileri ve AI destekli tahminler. Tek platformda.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="/signin/signup"
                className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-100 transition-colors duration-200"
              >
                Ücretsiz Başla
              </a>
              <a
                href="/nasil-calisir"
                className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-full border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-colors duration-200"
              >
                Nasıl Çalışır?
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing
        user={user}
        products={products ?? []}
        subscription={subscription}
      />
    </>
  );
}
