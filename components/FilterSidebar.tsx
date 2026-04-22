"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const BRANDS = ["Hot Wheels", "Matchbox", "Corgi", "Johnny Lightning", "Dinky Toys", "Majorette"];
const SCALES = ["1:18", "1:24", "1:43", "1:64", "1:87"];
const CONDITIONS = ["Mint in Box", "Near Mint", "Excellent", "Good", "Fair"];
const VEHICLE_TYPES = ["Muscle Car", "Sports Car", "Race Car", "Movie & TV", "Truck & Van", "Classic"];
const ERAS = [
  { label: "1950s & 1960s", value: "era-1950s-60s" },
  { label: "1970s",         value: "era-1970s" },
  { label: "1980s",         value: "era-1980s" },
  { label: "1990s",         value: "era-1990s" },
  { label: "2000s & Newer", value: "era-2000s-plus" },
];

export default function FilterSidebar() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || next.get(key) === value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      router.push(`/shop?${next.toString()}`);
    },
    [params, router]
  );

  function isActive(key: string, value: string) {
    return params.get(key) === value;
  }

  function clearAll() {
    router.push("/shop");
  }

  const hasFilters = [...params.keys()].some((k) => k !== "q");

  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-400 hover:text-brand-300 underline"
          >
            Clear all filters
          </button>
        )}

        <FilterGroup title="Brand">
          {BRANDS.map((b) => (
            <FilterChip
              key={b}
              label={b}
              active={isActive("brand", b)}
              onClick={() => update("brand", b)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Era">
          {ERAS.map((e) => (
            <FilterChip
              key={e.value}
              label={e.label}
              active={isActive("era", e.value)}
              onClick={() => update("era", e.value)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Scale">
          {SCALES.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={isActive("scale", s)}
              onClick={() => update("scale", s)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Condition">
          {CONDITIONS.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={isActive("condition", c)}
              onClick={() => update("condition", c)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Vehicle Type">
          {VEHICLE_TYPES.map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={isActive("vehicleType", t)}
              onClick={() => update("vehicleType", t)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Availability">
          <FilterChip
            label="On FB Marketplace"
            active={params.get("available") === "true"}
            onClick={() => update("available", "true")}
          />
          <FilterChip
            label="Coming Soon"
            active={params.get("available") === "false"}
            onClick={() => update("available", "false")}
          />
        </FilterGroup>
      </div>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active
          ? "border-brand-500 bg-brand-600 text-white"
          : "border-surface-border bg-surface-card text-gray-400 hover:border-gray-500 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
