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

-- ── Users ────────────────────────────────────────────────────────────────────

CREATE TYPE login_provider_enum AS ENUM ('google', 'facebook', 'email');

CREATE TABLE IF NOT EXISTS users (
  id               TEXT PRIMARY KEY,               -- e.g. UUID or OAuth sub
  username         TEXT NOT NULL UNIQUE,
  email            TEXT NOT NULL UNIQUE,
  login_provider   login_provider_enum NOT NULL,
  avatar_url       TEXT,
  is_admin         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Wishlist ─────────────────────────────────────────────────────────────────
-- A user can save many cars; a car can be saved by many users.

CREATE TABLE IF NOT EXISTS wishlist_cars (
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id    TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, car_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_cars_user_id ON wishlist_cars(user_id);

-- ── Auth.js Tables ─────────────────────────────────────────────────────────────

-- Alter users table to match Auth.js expectations
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMPTZ,
  ALTER COLUMN username DROP NOT NULL;

-- Auth.js accounts table (OAuth tokens per provider)
CREATE TABLE IF NOT EXISTS accounts (
  id                  TEXT PRIMARY KEY,
  "userId"            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE(provider, "providerAccountId")
);

-- Auth.js sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId"       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires        TIMESTAMPTZ NOT NULL
);

-- Auth.js verification tokens (for email magic links)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  UNIQUE(identifier, token)
);

-- ── Fixes for Auth.js pg-adapter compatibility ────────────────────────────────
-- 2026-05-27: pg-adapter generates the user row without supplying an id — the DB
--             must generate it. Also login_provider is unknown to the adapter so
--             it must be nullable (populate it via the signIn callback if needed).
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN login_provider DROP NOT NULL;
ALTER TABLE accounts ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2026-05-28: is_admin was defined in the original CREATE TABLE but never
--             applied to the live DB via migration. Add it explicitly.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;