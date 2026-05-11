-- DieCast Vault — Neon PostgreSQL schema
-- Run once: npx tsx db/migrate.ts

CREATE TYPE scale_enum AS ENUM ('1:18','1:24','1:43','1:64','1:87','Other');
CREATE TYPE condition_enum AS ENUM ('Mint in Box','Near Mint','Excellent','Good','Fair');
CREATE TYPE vehicle_type_enum AS ENUM ('Muscle Car','Sports Car','Race Car','Movie & TV','Truck & Van','Emergency Vehicle','Motorcycle','Classic');
CREATE TYPE material_enum AS ENUM ('Diecast','Plastic','Tin','Resin');
CREATE TYPE category_type_enum AS ENUM ('era','brand','scale','vehicleType','condition','material');

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  type        category_type_enum NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  count       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cars (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  brand                 TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  production_year       INTEGER NOT NULL,
  model_year            INTEGER NOT NULL,
  scale                 scale_enum NOT NULL,
  condition             condition_enum NOT NULL,
  vehicle_type          vehicle_type_enum NOT NULL,
  material              material_enum NOT NULL,
  price                 NUMERIC(10,2),
  images                TEXT[] NOT NULL DEFAULT '{}',
  tags                  TEXT[] NOT NULL DEFAULT '{}',
  featured              BOOLEAN NOT NULL DEFAULT FALSE,
  facebook_marketplace_url TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS car_categories (
  car_id      TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (car_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_cars_brand      ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_scale      ON cars(scale);
CREATE INDEX IF NOT EXISTS idx_cars_condition  ON cars(condition);
CREATE INDEX IF NOT EXISTS idx_cars_featured   ON cars(featured);
CREATE INDEX IF NOT EXISTS idx_cars_vehicle_type ON cars(vehicle_type);
