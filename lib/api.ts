/**
 * lib/api.ts — Neon PostgreSQL data layer
 *
 * All functions are async Server-Component-safe.
 * The SQL client is HTTP-based (no persistent connections) — safe for
 * Next.js serverless / edge runtimes.
 */

import { sql } from "@/lib/db";
import type { ToyCarProduct, Category, FilterState } from "@/types";
import offlineBackup from "@/data/offline-backup.json";

// ---------------------------------------------------------------------------
// Offline backup — used whenever a live Neon query throws (DB unreachable,
// connection limit, etc.) so the site degrades to read-only cached data
// instead of erroring out or rendering empty. Refresh the snapshot with
// `npx tsx scripts/backup-db.ts`.
// ---------------------------------------------------------------------------

function getOfflineCars(): ToyCarProduct[] {
  return offlineBackup.cars as ToyCarProduct[];
}

function getOfflineCategories(): Category[] {
  return offlineBackup.categories as Category[];
}

// ---------------------------------------------------------------------------
// Row → TypeScript mappers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCar(row: any): ToyCarProduct {
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
function rowToCategory(row: any): Category {
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

// ---------------------------------------------------------------------------
// Cars
// ---------------------------------------------------------------------------

function applyFilters(
  cars: ToyCarProduct[],
  filters?: FilterState
): ToyCarProduct[] {
  let results = cars;

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q)) ||
        c.description.toLowerCase().includes(q)
    );
  }
  if (filters?.brand)
    results = results.filter(
      (c) => c.brand.toLowerCase() === filters.brand!.toLowerCase()
    );
  if (filters?.scale)
    results = results.filter((c) => c.scale === filters.scale);
  if (filters?.condition)
    results = results.filter((c) => c.condition === filters.condition);
  if (filters?.vehicleType)
    results = results.filter((c) => c.vehicleType === filters.vehicleType);
  if (filters?.material)
    results = results.filter((c) => c.material === filters.material);
  if (filters?.minPrice !== undefined)
    results = results.filter(
      (c) => c.price !== null && c.price >= filters.minPrice!
    );
  if (filters?.maxPrice !== undefined)
    results = results.filter(
      (c) => c.price !== null && c.price <= filters.maxPrice!
    );

  return results;
}

export async function getCars(filters?: FilterState): Promise<ToyCarProduct[]> {
  try {
    // Pull cars + their category IDs in one query via array_agg
    const rows = await sql`
      SELECT
        c.*,
        COALESCE(array_agg(cc.category_id) FILTER (WHERE cc.category_id IS NOT NULL), '{}') AS category_ids
      FROM cars c
      LEFT JOIN car_categories cc ON cc.car_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `;
    return applyFilters(rows.map(rowToCar), filters);
  } catch (err) {
    console.error("getCars: Neon query failed, using offline backup", err);
    return applyFilters(getOfflineCars(), filters);
  }
}

export async function getFeaturedCars(): Promise<ToyCarProduct[]> {
  try {
    const rows = await sql`
      SELECT
        c.*,
        COALESCE(array_agg(cc.category_id) FILTER (WHERE cc.category_id IS NOT NULL), '{}') AS category_ids
      FROM cars c
      LEFT JOIN car_categories cc ON cc.car_id = c.id
      WHERE c.featured = TRUE
      GROUP BY c.id
      ORDER BY c.name
    `;
    return rows.map(rowToCar);
  } catch (err) {
    console.error("getFeaturedCars: Neon query failed, using offline backup", err);
    return getOfflineCars().filter((c) => c.featured);
  }
}

export async function getCarById(id: string): Promise<ToyCarProduct | null> {
  try {
    const rows = await sql`
      SELECT
        c.*,
        COALESCE(array_agg(cc.category_id) FILTER (WHERE cc.category_id IS NOT NULL), '{}') AS category_ids
      FROM cars c
      LEFT JOIN car_categories cc ON cc.car_id = c.id
      WHERE c.id = ${id}
      GROUP BY c.id
    `;
    return rows.length > 0 ? rowToCar(rows[0]) : null;
  } catch (err) {
    console.error("getCarById: Neon query failed, using offline backup", err);
    return getOfflineCars().find((c) => c.id === id) ?? null;
  }
}

export async function getCarsByCategory(
  categoryId: string
): Promise<ToyCarProduct[]> {
  try {
    const rows = await sql`
      SELECT
        c.*,
        COALESCE(array_agg(cc2.category_id) FILTER (WHERE cc2.category_id IS NOT NULL), '{}') AS category_ids
      FROM cars c
      JOIN car_categories cc  ON cc.car_id  = c.id AND cc.category_id = ${categoryId}
      LEFT JOIN car_categories cc2 ON cc2.car_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `;
    return rows.map(rowToCar);
  } catch (err) {
    console.error("getCarsByCategory: Neon query failed, using offline backup", err);
    return getOfflineCars().filter((c) => c.categoryIds.includes(categoryId));
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(type?: string): Promise<Category[]> {
  try {
    const rows = type
      ? await sql`SELECT * FROM categories WHERE type = ${type} ORDER BY name`
      : await sql`SELECT * FROM categories ORDER BY name`;
    return rows.map(rowToCategory);
  } catch (err) {
    console.error("getCategories: Neon query failed, using offline backup", err);
    const categories = getOfflineCategories();
    return type ? categories.filter((c) => c.type === type) : categories;
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const rows = await sql`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`;
    return rows.length > 0 ? rowToCategory(rows[0]) : null;
  } catch (err) {
    console.error("getCategoryBySlug: Neon query failed, using offline backup", err);
    return getOfflineCategories().find((c) => c.slug === slug) ?? null;
  }
}

// ---------------------------------------------------------------------------
// Search suggestions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export async function getWishlistCars(
  userId: string
): Promise<ToyCarProduct[]> {
  const rows = await sql`
    SELECT
      c.*,
      COALESCE(array_agg(cc.category_id) FILTER (WHERE cc.category_id IS NOT NULL), '{}') AS category_ids
    FROM wishlist_cars w
    JOIN cars c ON c.id = w.car_id
    LEFT JOIN car_categories cc ON cc.car_id = c.id
    WHERE w.user_id = ${userId}
    GROUP BY c.id, w.added_at
    ORDER BY w.added_at DESC
  `;
  return rows.map(rowToCar);
}

export async function addToWishlist(userId: string, carId: string): Promise<void> {
  await sql`
    INSERT INTO wishlist_cars (user_id, car_id)
    VALUES (${userId}, ${carId})
    ON CONFLICT DO NOTHING
  `;
}

export async function removeFromWishlist(userId: string, carId: string): Promise<void> {
  await sql`DELETE FROM wishlist_cars WHERE user_id = ${userId} AND car_id = ${carId}`;
}

export async function isInWishlist(userId: string, carId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM wishlist_cars WHERE user_id = ${userId} AND car_id = ${carId} LIMIT 1
  `;
  return rows.length > 0;
}

export async function getWishlistCount(carId: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) AS count FROM wishlist_cars WHERE car_id = ${carId}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function deleteUserAccount(userId: string): Promise<void> {
  // Cascade deletes wishlist_cars + accounts + sessions automatically via FK constraints
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

// ---------------------------------------------------------------------------
// Search suggestions
// ---------------------------------------------------------------------------

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];
  const q = `%${query.toLowerCase()}%`;
  try {
    const rows = await sql`
      SELECT DISTINCT name AS suggestion FROM cars WHERE LOWER(name) LIKE ${q}
      UNION
      SELECT DISTINCT brand FROM cars WHERE LOWER(brand) LIKE ${q}
      LIMIT 8
    `;
    return rows.map((r) => r.suggestion as string);
  } catch (err) {
    console.error("getSearchSuggestions: Neon query failed, using offline backup", err);
    const needle = query.toLowerCase();
    const suggestions = new Set<string>();
    for (const car of getOfflineCars()) {
      if (car.name.toLowerCase().includes(needle)) suggestions.add(car.name);
      if (car.brand.toLowerCase().includes(needle)) suggestions.add(car.brand);
      if (suggestions.size >= 8) break;
    }
    return Array.from(suggestions).slice(0, 8);
  }
}
