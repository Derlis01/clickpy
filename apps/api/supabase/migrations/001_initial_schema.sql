-- ============================================
-- ClickPy API - Initial PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ─── Commerces ───

CREATE TABLE commerces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_name TEXT NOT NULL,
  commerce_slug TEXT UNIQUE NOT NULL,
  commerce_phone TEXT DEFAULT '',
  commerce_address TEXT DEFAULT '',
  commerce_logo TEXT DEFAULT '',
  commerce_banner TEXT DEFAULT '',
  commerce_primary_color TEXT DEFAULT '#000000',
  commerce_category TEXT DEFAULT '',
  products_count INTEGER DEFAULT 0,
  ask_payment_method BOOLEAN DEFAULT FALSE,
  payment_methods JSONB DEFAULT '{"cash": false, "qr": false, "transfer": false, "paymentLink": false}'::jsonb,
  shipping_methods JSONB DEFAULT '{"pickup": false, "delivery": false, "dinein": false}'::jsonb,
  commerce_schedule JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Profiles (linked to auth.users) ───

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'entrepreneur', 'business', 'enterprise')),
  commerce_id UUID REFERENCES commerces(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Products ───

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id UUID NOT NULL REFERENCES commerces(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  category TEXT DEFAULT '',
  is_deleted BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,
  options JSONB DEFAULT '[]'::jsonb,
  addons JSONB DEFAULT '[]'::jsonb,
  has_addon_limits BOOLEAN DEFAULT FALSE,
  min_addons INTEGER,
  max_addons INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_commerce_id ON products(commerce_id);
CREATE INDEX idx_products_active ON products(commerce_id, is_deleted, is_active, is_hidden);

-- ─── Customers ───

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id UUID NOT NULL REFERENCES commerces(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(commerce_id, customer_phone)
);

CREATE INDEX idx_customers_commerce_id ON customers(commerce_id);

-- ─── Orders ───

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id UUID NOT NULL REFERENCES commerces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'PYG',
  order_status TEXT DEFAULT 'pending',
  order_type TEXT DEFAULT 'delivery',
  payment_method TEXT DEFAULT '',
  order_timestamp BIGINT,
  order_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_commerce_id ON orders(commerce_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- ─── 1. Auto-update updated_at ───

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_commerces_updated_at
  BEFORE UPDATE ON commerces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. Auto-update products_count ───

CREATE OR REPLACE FUNCTION update_products_count()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT of a non-deleted product
  IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
    UPDATE commerces
    SET products_count = products_count + 1
    WHERE id = NEW.commerce_id;
    RETURN NEW;
  END IF;

  -- On UPDATE: product was soft-deleted
  IF TG_OP = 'UPDATE' THEN
    IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
      UPDATE commerces
      SET products_count = GREATEST(products_count - 1, 0)
      WHERE id = NEW.commerce_id;
    END IF;
    -- Product was un-deleted
    IF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
      UPDATE commerces
      SET products_count = products_count + 1
      WHERE id = NEW.commerce_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_count
  AFTER INSERT OR UPDATE OF is_deleted ON products
  FOR EACH ROW EXECUTE FUNCTION update_products_count();

-- ─── 3. Handle new user signup ───
-- This trigger creates a commerce and profile when a user signs up via Supabase Auth.
-- The frontend should pass metadata: { commerce_name, commerce_slug, commerce_category, commerce_phone }

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_commerce_id UUID;
  meta JSONB;
BEGIN
  meta := NEW.raw_user_meta_data;

  -- Create the commerce
  INSERT INTO commerces (
    commerce_name,
    commerce_slug,
    commerce_category,
    commerce_phone
  ) VALUES (
    COALESCE(meta->>'commerce_name', ''),
    COALESCE(meta->>'commerce_slug', ''),
    COALESCE(meta->>'commerce_category', ''),
    COALESCE(meta->>'commerce_phone', '')
  )
  RETURNING id INTO new_commerce_id;

  -- Create the profile
  INSERT INTO profiles (id, commerce_id, current_plan)
  VALUES (NEW.id, new_commerce_id, 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE commerces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so the backend (using service_role key) has full access.
-- These policies are for direct client access if needed in the future.

-- Profiles: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Commerces: public read for storefront
CREATE POLICY "Public can read commerces"
  ON commerces FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products: public read for active non-deleted products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_deleted = false AND is_active = true AND is_hidden = false);

-- Orders: public can insert (customer-facing)
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Customers: public can insert (created during order)
CREATE POLICY "Public can create customers"
  ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
