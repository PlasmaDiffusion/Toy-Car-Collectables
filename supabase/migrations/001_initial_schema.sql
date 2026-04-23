-- ============================================================
-- DieCast Vault — initial schema
-- Run via: supabase db push  (or paste into the Supabase SQL editor)
-- ============================================================

-- ----------------------------------------------------------------
-- toy_cars
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS toy_cars (
  id                      TEXT        PRIMARY KEY,
  name                    TEXT        NOT NULL,
  brand                   TEXT        NOT NULL,
  -- Year this specific toy was manufactured
  production_year         SMALLINT    NOT NULL,
  -- Year of the real vehicle being modelled
  model_year              SMALLINT    NOT NULL,
  scale                   TEXT        NOT NULL CHECK (scale IN ('1:18', '1:24', '1:43', '1:64', '1:87', 'Other')),
  condition               TEXT        NOT NULL CHECK (condition IN ('Mint in Box', 'Near Mint', 'Excellent', 'Good', 'Fair')),
  vehicle_type            TEXT        NOT NULL CHECK (vehicle_type IN (
                                        'Muscle Car', 'Sports Car', 'Race Car', 'Movie & TV',
                                        'Truck & Van', 'Emergency Vehicle', 'Motorcycle', 'Classic'
                                      )),
  material                TEXT        NOT NULL CHECK (material IN ('Diecast', 'Plastic', 'Tin', 'Resin')),
  -- Asking price in USD; NULL means price on request
  price                   NUMERIC(10, 2),
  images                  TEXT[]      NOT NULL DEFAULT '{}',
  description             TEXT        NOT NULL,
  -- Direct link to a Facebook Marketplace listing; NULL means coming soon
  facebook_marketplace_url TEXT,
  featured                BOOLEAN     NOT NULL DEFAULT FALSE,
  tags                    TEXT[]      NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  type        TEXT        NOT NULL CHECK (type IN ('era', 'brand', 'scale', 'vehicleType', 'condition', 'material')),
  description TEXT        NOT NULL,
  image_url   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- car_categories  (many-to-many junction)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS car_categories (
  car_id      TEXT NOT NULL REFERENCES toy_cars(id)  ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (car_id, category_id)
);

-- ----------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_toy_cars_brand         ON toy_cars(brand);
CREATE INDEX IF NOT EXISTS idx_toy_cars_condition      ON toy_cars(condition);
CREATE INDEX IF NOT EXISTS idx_toy_cars_vehicle_type   ON toy_cars(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_toy_cars_scale          ON toy_cars(scale);
CREATE INDEX IF NOT EXISTS idx_toy_cars_material       ON toy_cars(material);
CREATE INDEX IF NOT EXISTS idx_toy_cars_featured       ON toy_cars(featured);
CREATE INDEX IF NOT EXISTS idx_toy_cars_price          ON toy_cars(price);
CREATE INDEX IF NOT EXISTS idx_car_categories_car      ON car_categories(car_id);
CREATE INDEX IF NOT EXISTS idx_car_categories_category ON car_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug         ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_type         ON categories(type);

-- ----------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_toy_cars_updated_at ON toy_cars;
CREATE TRIGGER trg_toy_cars_updated_at
  BEFORE UPDATE ON toy_cars
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- Row-Level Security (RLS)
-- Public read access; writes restricted to authenticated users.
-- ----------------------------------------------------------------
ALTER TABLE toy_cars      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read listings
CREATE POLICY "public read toy_cars"
  ON toy_cars FOR SELECT USING (true);

CREATE POLICY "public read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "public read car_categories"
  ON car_categories FOR SELECT USING (true);

-- Only authenticated users can insert / update / delete
CREATE POLICY "auth insert toy_cars"
  ON toy_cars FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth update toy_cars"
  ON toy_cars FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "auth delete toy_cars"
  ON toy_cars FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "auth write categories"
  ON categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth write car_categories"
  ON car_categories FOR ALL USING (auth.role() = 'authenticated');
