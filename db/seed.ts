/**
 * db/seed.ts
 *
 * Creates tables and seeds them from the existing JSON files.
 * Run once:  npx tsx db/seed.ts
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// __dirname is unreliable with tsx — resolve from process.cwd() instead
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

const carsRaw = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "data/cars.json"), "utf-8")
);
const categoriesRaw = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "data/categories.json"), "utf-8")
);

async function main() {
  console.log("📦 Running schema migrations…");

  await sql`
    DO $$ BEGIN
      CREATE TYPE scale_enum AS ENUM ('1:18','1:24','1:43','1:64','1:87','Other');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  await sql`
    DO $$ BEGIN
      CREATE TYPE condition_enum AS ENUM ('Mint in Box','Near Mint','Excellent','Good','Fair');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  await sql`
    DO $$ BEGIN
      CREATE TYPE vehicle_type_enum AS ENUM ('Muscle Car','Sports Car','Race Car','Movie & TV','Truck & Van','Emergency Vehicle','Motorcycle','Classic');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  await sql`
    DO $$ BEGIN
      CREATE TYPE material_enum AS ENUM ('Diecast','Plastic','Tin','Resin');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  await sql`
    DO $$ BEGIN
      CREATE TYPE category_type_enum AS ENUM ('era','brand','scale','vehicleType','condition','material');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      type        category_type_enum NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url   TEXT NOT NULL DEFAULT '',
      count       INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cars (
      id                       TEXT PRIMARY KEY,
      name                     TEXT NOT NULL,
      brand                    TEXT NOT NULL,
      description              TEXT NOT NULL DEFAULT '',
      production_year          INTEGER NOT NULL,
      model_year               INTEGER NOT NULL,
      scale                    scale_enum NOT NULL,
      condition                condition_enum NOT NULL,
      vehicle_type             vehicle_type_enum NOT NULL,
      material                 material_enum NOT NULL,
      price                    NUMERIC(10,2),
      images                   TEXT[] NOT NULL DEFAULT '{}',
      tags                     TEXT[] NOT NULL DEFAULT '{}',
      featured                 BOOLEAN NOT NULL DEFAULT FALSE,
      facebook_marketplace_url TEXT,
      created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS car_categories (
      car_id      TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (car_id, category_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_cars_brand        ON cars(brand)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cars_scale        ON cars(scale)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cars_condition    ON cars(condition)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cars_featured     ON cars(featured)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cars_vehicle_type ON cars(vehicle_type)`;

  await sql`
    DO $$ BEGIN
      CREATE TYPE login_provider_enum AS ENUM ('google', 'facebook', 'email');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id             TEXT PRIMARY KEY,
      username       TEXT NOT NULL UNIQUE,
      email          TEXT NOT NULL UNIQUE,
      login_provider login_provider_enum NOT NULL,
      avatar_url     TEXT,
      is_admin       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

  await sql`
    CREATE TABLE IF NOT EXISTS wishlist_cars (
      user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      car_id   TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, car_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_cars_user_id ON wishlist_cars(user_id)`;

  console.log("✅ Schema ready.");

  // --- Seed categories ---
  console.log(`🌱 Seeding ${categoriesRaw.length} categories…`);
  for (const c of categoriesRaw) {
    await sql`
      INSERT INTO categories (id, name, slug, type, description, image_url, count)
      VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.type}, ${
      c.description ?? ""
    }, ${c.imageUrl ?? ""}, ${c.count ?? 0})
      ON CONFLICT (id) DO UPDATE SET
        name        = EXCLUDED.name,
        slug        = EXCLUDED.slug,
        type        = EXCLUDED.type,
        description = EXCLUDED.description,
        image_url   = EXCLUDED.image_url,
        count       = EXCLUDED.count
    `;
  }
  console.log("✅ Categories seeded.");

  // --- Seed cars ---
  console.log(`🌱 Seeding ${carsRaw.length} cars…`);
  for (const car of carsRaw) {
    await sql`
      INSERT INTO cars (
        id, name, brand, description, production_year, model_year,
        scale, condition, vehicle_type, material, price,
        images, tags, featured, facebook_marketplace_url
      ) VALUES (
        ${car.id}, ${car.name}, ${car.brand}, ${car.description ?? ""},
        ${car.productionYear}, ${car.modelYear},
        ${car.scale}, ${car.condition}, ${car.vehicleType}, ${car.material},
        ${car.price ?? null},
        ${car.images}, ${car.tags},
        ${car.featured ?? false},
        ${car.facebookMarketplaceUrl ?? null}
      )
      ON CONFLICT (id) DO UPDATE SET
        name                     = EXCLUDED.name,
        brand                    = EXCLUDED.brand,
        description              = EXCLUDED.description,
        production_year          = EXCLUDED.production_year,
        model_year               = EXCLUDED.model_year,
        scale                    = EXCLUDED.scale,
        condition                = EXCLUDED.condition,
        vehicle_type             = EXCLUDED.vehicle_type,
        material                 = EXCLUDED.material,
        price                    = EXCLUDED.price,
        images                   = EXCLUDED.images,
        tags                     = EXCLUDED.tags,
        featured                 = EXCLUDED.featured,
        facebook_marketplace_url = EXCLUDED.facebook_marketplace_url,
        updated_at               = NOW()
    `;

    // car_categories join rows
    for (const catId of car.categoryIds ?? []) {
      await sql`
        INSERT INTO car_categories (car_id, category_id)
        VALUES (${car.id}, ${catId})
        ON CONFLICT DO NOTHING
      `;
    }
  }
  console.log("✅ Cars seeded.");

  // --- Seed test user + wishlist ---
  console.log("🌱 Seeding test user…");
  await sql`
    INSERT INTO users (id, username, email, login_provider, avatar_url, is_admin)
    VALUES (
      'user-test-001',
      'collector_scott',
      'scott@example.com',
      'email',
      NULL,
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      username       = EXCLUDED.username,
      email          = EXCLUDED.email,
      login_provider = EXCLUDED.login_provider,
      is_admin       = EXCLUDED.is_admin,
      updated_at     = NOW()
  `;

  const wishlistCars = [
    "hw-1969-mustang-boss-redline",
    "corgi-1966-aston-db5",
    "hw-1979-firebird-ta",
    "hw-2003-ferrari-360",
  ];
  for (const carId of wishlistCars) {
    await sql`
      INSERT INTO wishlist_cars (user_id, car_id)
      VALUES ('user-test-001', ${carId})
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`✅ Test user seeded with ${wishlistCars.length} wishlist cars.`);

  console.log("🎉 Done! Database is ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
