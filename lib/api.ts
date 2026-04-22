/**
 * Mock API layer.
 *
 * All functions simulate async server fetches so the signatures are identical
 * to what a real REST/GraphQL call would look like. Swap the import source
 * when you wire up a real backend — no page/component code needs to change.
 *
 * SSR note: these are called inside `async` Server Components, which means
 * Next.js re-fetches them on every request. If you want ISR instead, add
 *   { next: { revalidate: 60 } }
 * to each fetch() call (or export `revalidate = 60` from the page file).
 */

import type { ToyCarProduct, Category, FilterState } from "@/types";

// Resolve relative to this file so it works at build time and runtime
import carsRaw from "@/data/cars.json";
import categoriesRaw from "@/data/categories.json";

const allCars = carsRaw as ToyCarProduct[];
const allCategories = categoriesRaw as Category[];

/** Simulate a small network delay in dev so loading states are visible. */
const delay = (ms = 40) =>
  process.env.NODE_ENV === "development"
    ? new Promise((r) => setTimeout(r, ms))
    : Promise.resolve();

// ---------------------------------------------------------------------------
// Cars
// ---------------------------------------------------------------------------

export async function getCars(filters?: FilterState): Promise<ToyCarProduct[]> {
  await delay();

  let results = [...allCars];

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

  if (filters?.brand) {
    results = results.filter(
      (c) => c.brand.toLowerCase() === filters.brand!.toLowerCase()
    );
  }

  if (filters?.era) {
    const eraCategory = allCategories.find(
      (cat) => cat.type === "era" && cat.slug === filters.era
    );
    if (eraCategory) {
      results = results.filter((c) => c.categoryIds.includes(eraCategory.id));
    }
  }

  if (filters?.scale) {
    results = results.filter((c) => c.scale === filters.scale);
  }

  if (filters?.condition) {
    results = results.filter((c) => c.condition === filters.condition);
  }

  if (filters?.vehicleType) {
    results = results.filter((c) => c.vehicleType === filters.vehicleType);
  }

  if (filters?.material) {
    results = results.filter((c) => c.material === filters.material);
  }

  if (filters?.minPrice !== undefined) {
    results = results.filter(
      (c) => c.price !== null && c.price >= filters.minPrice!
    );
  }

  if (filters?.maxPrice !== undefined) {
    results = results.filter(
      (c) => c.price !== null && c.price <= filters.maxPrice!
    );
  }

  return results;
}

export async function getFeaturedCars(): Promise<ToyCarProduct[]> {
  await delay();
  return allCars.filter((c) => c.featured);
}

export async function getCarById(id: string): Promise<ToyCarProduct | null> {
  await delay();
  return allCars.find((c) => c.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(type?: string): Promise<Category[]> {
  await delay();
  if (type) {
    return allCategories.filter((c) => c.type === type);
  }
  return allCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await delay();
  return allCategories.find((c) => c.slug === slug) ?? null;
}

export async function getCarsByCategory(
  categoryId: string
): Promise<ToyCarProduct[]> {
  await delay();
  return allCars.filter((c) => c.categoryIds.includes(categoryId));
}

// ---------------------------------------------------------------------------
// Search suggestions (for autocomplete)
// ---------------------------------------------------------------------------

export async function getSearchSuggestions(query: string): Promise<string[]> {
  await delay(20);
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const suggestions = new Set<string>();

  for (const car of allCars) {
    if (car.name.toLowerCase().includes(q)) suggestions.add(car.name);
    if (car.brand.toLowerCase().includes(q)) suggestions.add(car.brand);
    for (const tag of car.tags) {
      if (tag.includes(q)) suggestions.add(tag);
    }
  }

  return Array.from(suggestions).slice(0, 8);
}
