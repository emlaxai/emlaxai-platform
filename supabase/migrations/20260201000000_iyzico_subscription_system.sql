-- ============================================================
-- EmlaXAI Subscription System - iyzico Entegrasyonu
-- ============================================================

-- Plan enum tipi
DO $$ BEGIN
  CREATE TYPE user_plan AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- users tablosuna plan kolonu ekle
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan user_plan DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'TR';

-- ============================================================
-- PLANS: Plan tanımları (iyzico ürün karşılığı)
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  plan_type user_plan NOT NULL,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_yearly numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'TRY',
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON plans FOR SELECT USING (true);

-- Varsayılan planlar
INSERT INTO plans (id, name, description, plan_type, price_monthly, price_yearly, features, sort_order) VALUES
  ('free', 'Ücretsiz', 'Temel emlak analizi', 'free', 0, 0, '{
    "parcel_detail": 5,
    "exa_chat": 10,
    "3d_map": false,
    "trend_months": 12,
    "disaster_risk": true,
    "export_pdf": false,
    "imar_analysis": 3,
    "advanced_filters": false
  }', 1),
  ('pro_monthly', 'Pro Aylık', 'Sınırsız emlak analizi + AI', 'pro', 299.99, 0, '{
    "parcel_detail": -1,
    "exa_chat": -1,
    "3d_map": true,
    "trend_months": 120,
    "disaster_risk": true,
    "export_pdf": true,
    "imar_analysis": -1,
    "advanced_filters": true
  }', 2),
  ('pro_yearly', 'Pro Yıllık', 'Sınırsız emlak analizi + AI (yıllık)', 'pro', 0, 2999.99, '{
    "parcel_detail": -1,
    "exa_chat": -1,
    "3d_map": true,
    "trend_months": 120,
    "disaster_risk": true,
    "export_pdf": true,
    "imar_analysis": -1,
    "advanced_filters": true
  }', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- IYZICO_CUSTOMERS: iyzico müşteri eşleştirmesi
-- ============================================================
CREATE TABLE IF NOT EXISTS iyzico_customers (
  id uuid REFERENCES auth.users PRIMARY KEY,
  iyzico_key text,
  card_token text,
  card_last_four text,
  card_brand text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE iyzico_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own iyzico data" ON iyzico_customers
  FOR SELECT USING (auth.uid() = id);

-- ============================================================
-- IYZICO_SUBSCRIPTIONS: Abonelik kayıtları
-- ============================================================
CREATE TABLE IF NOT EXISTS iyzico_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  plan_id text REFERENCES plans NOT NULL,
  iyzico_subscription_ref text,
  iyzico_order_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'expired')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  trial_end timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE iyzico_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON iyzico_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_iyzico_subs_user ON iyzico_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_iyzico_subs_status ON iyzico_subscriptions(status);

-- ============================================================
-- USAGE_TRACKING: Günlük kullanım takibi
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  feature text NOT NULL,
  used_count integer DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature, date)
);
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_tracking(user_id, date);

-- ============================================================
-- PAYMENT_HISTORY: Ödeme geçmişi
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  subscription_id uuid REFERENCES iyzico_subscriptions,
  iyzico_payment_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'TRY',
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed', 'refunded', 'pending')),
  payment_type text DEFAULT 'subscription' CHECK (payment_type IN ('subscription', 'one_time', 'refund')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payment_history(user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Kullanıcı planını al
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id uuid)
RETURNS user_plan AS $$
DECLARE
  v_plan user_plan;
BEGIN
  SELECT u.plan INTO v_plan FROM users u WHERE u.id = p_user_id;
  RETURN COALESCE(v_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının aktif aboneliğini al
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id uuid)
RETURNS TABLE(
  subscription_id uuid,
  plan_id text,
  plan_type user_plan,
  status text,
  current_period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.plan_id,
    p.plan_type,
    s.status,
    s.current_period_end
  FROM iyzico_subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Günlük kullanım sayacını artır
CREATE OR REPLACE FUNCTION increment_usage(p_user_id uuid, p_feature text)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO usage_tracking (user_id, feature, used_count, date)
  VALUES (p_user_id, p_feature, 1, CURRENT_DATE)
  ON CONFLICT (user_id, feature, date)
  DO UPDATE SET used_count = usage_tracking.used_count + 1, updated_at = now()
  RETURNING used_count INTO v_count;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Günlük kullanım bilgisini al
CREATE OR REPLACE FUNCTION get_daily_usage(p_user_id uuid)
RETURNS TABLE(feature text, used_count integer) AS $$
BEGIN
  RETURN QUERY
  SELECT ut.feature, ut.used_count
  FROM usage_tracking ut
  WHERE ut.user_id = p_user_id AND ut.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Abonelik oluşturulduğunda users.plan'ı güncelle
CREATE OR REPLACE FUNCTION sync_user_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_type user_plan;
BEGIN
  SELECT plan_type INTO v_plan_type FROM plans WHERE id = NEW.plan_id;
  IF NEW.status IN ('active', 'trialing') THEN
    UPDATE users SET plan = COALESCE(v_plan_type, 'free') WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('cancelled', 'expired') THEN
    UPDATE users SET plan = 'free' WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON iyzico_subscriptions
  FOR EACH ROW EXECUTE FUNCTION sync_user_plan();
