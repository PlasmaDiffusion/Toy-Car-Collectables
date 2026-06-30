/**
 * scripts/backup-db.ts
 *
 * Snapshots all cars + categories from the live Neon database into
 * data/offline-backup.json. lib/api.ts falls back to this file whenever
 * a query against Neon fails, so the site can keep serving (read-only,
 * possibly stale) listings instead of erroring out or showing nothing.
 *
 * Run manually (or on a schedule / pre-deploy) whenever the catalogue
 * changes:   npx tsx scripts/backup-db.ts
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCar(row: any) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    description: row.description,
    productionYear: row.production_year,
    modelYear: row.model_year,
    scale: row.scale,
    condition: row.condition,
    vehicleType: row.vehicle_type,
    material: row.material,
    price: row.price !== null ? Number(row.price) : null,
    images: row.images ?? [],
    tags: row.tags ?? [],
    featured: row.featured,
    facebookMarketplaceUrl: row.facebook_marketplace_url ?? null,
    categoryIds: row.category_ids ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    description: row.description,
    imageUrl: row.image_url,
    count: row.count,
  };
}

async function main() {
  console.log("📡 Reading cars + categories from Neon…");

  const carRows = await sql`
    SELECT
      c.*,
      COALESCE(array_agg(cc.category_id) FILTER (WHERE cc.category_id IS NOT NULL), '{}') AS category_ids
    FROM cars c
    LEFT JOIN car_categories cc ON cc.car_id = c.id
    GROUP BY c.id
    ORDER BY c.name
  `;
  const categoryRows = await sql`SELECT * FROM categories ORDER BY name`;

  const backup = {
    generatedAt: new Date().toISOString(),
    cars: carRows.map(rowToCar),
    categories: categoryRows.map(rowToCategory),
  };

  const outPath = path.resolve(process.cwd(), "data/offline-backup.json");
  fs.writeFileSync(outPath, JSON.stringify(backup, null, 2) + "\n");

  console.log(
    `✅ Wrote ${backup.cars.length} cars and ${backup.categories.length} categories to ${outPath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
