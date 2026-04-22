import type { Metadata } from "next";
import { Suspense } from "react";
import { getCars } from "@/lib/api";
import type { FilterState, Scale, Condition, VehicleType, Material } from "@/types";
import CarCard from "@/components/CarCard";
import FilterSidebar from "@/components/FilterSidebar";

// SSR: renders fresh on every request (reflects URL filter params immediately).
// ISR alternative: export const revalidate = 60;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const brand = typeof sp.brand === "string" ? sp.brand : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const title = brand
    ? `${brand} Die-Cast Cars`
    : q
    ? `Search: "${q}"`
    : "Shop All Toy Cars";

  return {
    title,
    description: `Browse ${title.toLowerCase()} on DieCast Vault — die-cast collectibles linked directly to Facebook Marketplace.`,
  };
}

function buildFilters(sp: Record<string, string | string[] | undefined>): FilterState {
  const s = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);
  return {
    query:       s("q"),
    brand:       s("brand"),
    era:         s("era"),
    scale:       s("scale") as Scale | undefined,
    condition:   s("condition") as Condition | undefined,
    vehicleType: s("vehicleType") as VehicleType | undefined,
    material:    s("material") as Material | undefined,
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = buildFilters(sp);
  const available = sp.available === "true" ? true : sp.available === "false" ? false : undefined;

  let cars = await getCars(filters);

  if (available !== undefined) {
    cars = cars.filter((c) =>
      available ? c.facebookMarketplaceUrl !== null : c.facebookMarketplaceUrl === null
    );
  }

  const activeLabel =
    filters.brand ??
    filters.vehicleType ??
    filters.condition ??
    (filters.query ? `"${filters.query}"` : null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          {activeLabel ? activeLabel : "Shop All Cars"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {cars.length} listing{cars.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar — wrapped in Suspense because it uses useSearchParams */}
        <Suspense fallback={<div className="w-56 shrink-0" />}>
          <FilterSidebar />
        </Suspense>

        {/* Results grid */}
        <div className="flex-1">
          {cars.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-card py-20 text-center">
      <span className="text-5xl" aria-hidden>🔍</span>
      <h2 className="mt-4 text-lg font-semibold text-white">No listings match these filters</h2>
      <p className="mt-1 text-sm text-gray-500">Try removing some filters or broadening your search.</p>
    </div>
  );
}
