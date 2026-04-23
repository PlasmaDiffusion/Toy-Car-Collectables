/**
 * Supabase API layer.
 *
 * Drop-in replacement for lib/api.ts — every function has the same signature.
 * To switch the whole app to Supabase, change the import path in each page/
 * component from "@/lib/api" to "@/lib/supabase-api".
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
 * .env.local. See .env.local.example for setup instructions.
 */

import { supabase } from "@/lib/supabase";
import type {
  ToyCarProduct,
  Category,
  FilterState,
  Scale,
  Condition,
  VehicleType,
  Material,
  CategoryType,
} from "@/types";

// ---------------------------------------------------------------------------
// DB row types (snake_case columns returned by PostgREST / Supabase)
// ---------------------------------------------------------------------------

interface ToyCarRow {
  id: string;
  name: string;
  brand: string;
  production_year: number;
  model_year: number;
  scale: string;
  condition: string;
  vehicle_type: string;
  material: string;
  price: number | null;
  images: string[];
  description: string;
  facebook_marketplace_url: string | null;
  featured: boolean;
  tags: string[];
  car_categories?: { category_id: string }[];
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  image_url: string;
}

// ---------------------------------------------------------------------------
// Row → domain model mappers
// ---------------------------------------------------------------------------

function rowToProduct(row: ToyCarRow): ToyCarProduct {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    productionYear: row.production_year,
    modelYear: row.model_year,
    scale: row.scale as Scale,
    condition: row.condition as Condition,
    vehicleType: row.vehicle_type as VehicleType,
    material: row.material as Material,
    price: row.price,
    images: row.images,
    description: row.description,
    facebookMarketplaceUrl: row.facebook_marketplace_url,
    featured: row.featured,
    categoryIds: row.car_categories?.map((cc) => cc.category_id) ?? [],
    tags: row.tags,
  };
}

function rowToCategory(row: CategoryRow, count = 0): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type as CategoryType,
    description: row.description,
    imageUrl: row.image_url,
    count,
  };
}

// ---------------------------------------------------------------------------
// Cars
// ---------------------------------------------------------------------------

export async function getCars(filters?: FilterState): Promise<ToyCarProduct[]> {
  let query = supabase
    .from("toy_cars")
    .select("*, car_categories(category_id)");

  if (filters?.brand) {
    query = query.ilike("brand", filters.brand);
  }

  if (filters?.scale) {
    query = query.eq("scale", filters.scale);
  }

  if (filters?.condition) {
    query = query.eq("condition", filters.condition);
  }

  if (filters?.vehicleType) {
    query = query.eq("vehicle_type", filters.vehicleType);
  }

  if (filters?.material) {
    query = query.eq("material", filters.material);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters?.query) {
    const q = filters.query.trim();
    // Full-text search across name, brand, description, and tags
    query = query.or(
      `name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`
    );
  }

  const { data, error } = await query.order("featured", { ascending: false });

  if (error) throw new Error(`getCars: ${error.message}`);

  let results = (data as ToyCarRow[]).map(rowToProduct);

  // Era filter: resolve the era category slug → id, then filter in app layer
  if (filters?.era) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("type", "era")
      .eq("slug", filters.era)
      .single();

    if (catData) {
      results = results.filter((c) => c.categoryIds.includes(catData.id));
    }
  }

  return results;
}

export async function getFeaturedCars(): Promise<ToyCarProduct[]> {
  const { data, error } = await supabase
    .from("toy_cars")
    .select("*, car_categories(category_id)")
    .eq("featured", true);

  if (error) throw new Error(`getFeaturedCars: ${error.message}`);
  return (data as ToyCarRow[]).map(rowToProduct);
}

export async function getCarById(id: string): Promise<ToyCarProduct | null> {
  const { data, error } = await supabase
    .from("toy_cars")
    .select("*, car_categories(category_id)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // row not found
    throw new Error(`getCarById: ${error.message}`);
  }

  return rowToProduct(data as ToyCarRow);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(type?: string): Promise<Category[]> {
  let query = supabase.from("categories").select("*");

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query.order("name");
  if (error) throw new Error(`getCategories: ${error.message}`);

  // Compute live counts from the junction table
  const { data: counts, error: countErr } = await supabase
    .from("car_categories")
    .select("category_id");

  if (countErr) throw new Error(`getCategories counts: ${countErr.message}`);

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1;
  }

  return (data as CategoryRow[]).map((row) =>
    rowToCategory(row, countMap[row.id] ?? 0)
  );
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getCategoryBySlug: ${error.message}`);
  }

  const { count } = await supabase
    .from("car_categories")
    .select("*", { count: "exact", head: true })
    .eq("category_id", data.id);

  return rowToCategory(data as CategoryRow, count ?? 0);
}

export async function getCarsByCategory(
  categoryId: string
): Promise<ToyCarProduct[]> {
  // Get car IDs in this category, then fetch those cars
  const { data: junctionRows, error: jErr } = await supabase
    .from("car_categories")
    .select("car_id")
    .eq("category_id", categoryId);

  if (jErr) throw new Error(`getCarsByCategory: ${jErr.message}`);
  if (!junctionRows?.length) return [];

  const carIds = junctionRows.map((r) => r.car_id);

  const { data, error } = await supabase
    .from("toy_cars")
    .select("*, car_categories(category_id)")
    .in("id", carIds);

  if (error) throw new Error(`getCarsByCategory cars: ${error.message}`);
  return (data as ToyCarRow[]).map(rowToProduct);
}

// ---------------------------------------------------------------------------
// Search suggestions (for autocomplete)
// ---------------------------------------------------------------------------

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from("toy_cars")
    .select("name, brand, tags")
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .limit(20);

  if (error) throw new Error(`getSearchSuggestions: ${error.message}`);

  const q = query.toLowerCase();
  const suggestions = new Set<string>();

  for (const row of data ?? []) {
    if (row.name.toLowerCase().includes(q)) suggestions.add(row.name);
    if (row.brand.toLowerCase().includes(q)) suggestions.add(row.brand);
    for (const tag of row.tags ?? []) {
      if (tag.toLowerCase().includes(q)) suggestions.add(tag);
    }
  }

  return Array.from(suggestions).slice(0, 8);
}
