import Image from "next/image";
import Link from "next/link";
import type { ToyCarProduct } from "@/types";

const conditionColors: Record<string, string> = {
  "Mint in Box":  "bg-emerald-900 text-emerald-300",
  "Near Mint":    "bg-sky-900 text-sky-300",
  "Excellent":    "bg-violet-900 text-violet-300",
  "Good":         "bg-amber-900 text-amber-300",
  "Fair":         "bg-gray-700 text-gray-300",
};

interface Props {
  car: ToyCarProduct;
  /** Show a more compact layout when rendering inside a category list. */
  compact?: boolean;
}

export default function CarCard({ car, compact = false }: Props) {
  const isAvailable = car.facebookMarketplaceUrl !== null;

  return (
    <Link
      href={`/car/${car.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-card transition-all hover:border-brand-600 hover:shadow-lg hover:shadow-brand-900/40"
    >
      {/* Image */}
      <div className={`relative w-full overflow-hidden bg-surface ${compact ? "h-36" : "h-48"}`}>
        <Image
          src={car.images[0]}
          alt={car.name}
          fill
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Featured badge */}
        {car.featured && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Featured
          </span>
        )}

        {/* FB available indicator */}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isAvailable
              ? "bg-blue-700 text-blue-100"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {isAvailable ? "On FB Marketplace" : "Coming Soon"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {/* Brand + year */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span>{car.brand}</span>
          <span aria-hidden>·</span>
          <span>{car.productionYear}</span>
          <span aria-hidden>·</span>
          <span>{car.scale}</span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold leading-snug text-white group-hover:text-brand-400">
          {car.name}
        </h3>

        {/* Condition pill */}
        <span
          className={`mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${
            conditionColors[car.condition] ?? "bg-gray-700 text-gray-300"
          }`}
        >
          {car.condition}
        </span>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-white">
            {car.price !== null ? `$${car.price.toLocaleString()}` : "POR"}
          </span>

          {isAvailable ? (
            <span className="rounded-md bg-[#1877f2] px-3 py-1 text-[11px] font-semibold text-white">
              View on Facebook
            </span>
          ) : (
            <span className="rounded-md border border-surface-border px-3 py-1 text-[11px] text-gray-500">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
