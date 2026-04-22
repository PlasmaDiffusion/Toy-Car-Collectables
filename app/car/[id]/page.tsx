import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarById, getCars } from "@/lib/api";
import CarCard from "@/components/CarCard";

// SSR: always fresh.
// ISR alternative: export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) return { title: "Not Found" };

  return {
    title: car.name,
    description: `${car.brand} ${car.name} (${car.productionYear}) — ${car.condition} condition. Scale: ${car.scale}. ${car.description.slice(0, 140)}…`,
    openGraph: {
      title: car.name,
      description: car.description,
      images: [{ url: car.images[0], width: 400, height: 200, alt: car.name }],
    },
  };
}

const conditionColors: Record<string, string> = {
  "Mint in Box": "bg-emerald-900 text-emerald-300 border-emerald-700",
  "Near Mint":   "bg-sky-900 text-sky-300 border-sky-700",
  "Excellent":   "bg-violet-900 text-violet-300 border-violet-700",
  "Good":        "bg-amber-900 text-amber-300 border-amber-700",
  "Fair":        "bg-gray-800 text-gray-300 border-gray-600",
};

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) notFound();

  // Related: same vehicleType, exclude self
  const allCars = await getCars({ vehicleType: car.vehicleType });
  const related = allCars.filter((c) => c.id !== car.id).slice(0, 4);

  const isAvailable = car.facebookMarketplaceUrl !== null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white">Shop</Link>
        <span>/</span>
        <span className="text-gray-300 truncate max-w-xs">{car.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── Images ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Primary image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
            <Image
              src={car.images[0]}
              alt={car.name}
              fill
              priority
              className="object-contain p-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnail strip */}
          {car.images.length > 1 && (
            <div className="flex gap-3">
              {car.images.map((img, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-surface-border bg-surface-card"
                >
                  <Image
                    src={img}
                    alt={`${car.name} view ${i + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Brand + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-surface-border bg-surface-card px-3 py-1 text-xs font-semibold text-gray-400">
              {car.brand}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                conditionColors[car.condition] ?? "bg-gray-700 text-gray-300 border-gray-600"
              }`}
            >
              {car.condition}
            </span>
            {car.featured && (
              <span className="rounded-full border border-brand-700 bg-brand-900/50 px-3 py-1 text-xs font-semibold text-brand-400">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold leading-tight text-white">{car.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-white">
              {car.price !== null ? `$${car.price.toLocaleString()}` : "POR"}
            </span>
            {car.price === null && (
              <span className="text-sm text-gray-500">Price on request</span>
            )}
          </div>

          {/* Availability CTA */}
          {isAvailable ? (
            <a
              href={car.facebookMarketplaceUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1877f2] px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/40 transition hover:bg-[#1465d8]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              View on Facebook Marketplace
            </a>
          ) : (
            <div className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-card px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Coming Soon to Facebook Marketplace
              </div>
              <p className="text-xs text-gray-500">
                This listing is being prepared. Check back soon or browse similar cars below.
              </p>
            </div>
          )}

          {/* Spec table */}
          <div className="rounded-xl border border-surface-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-surface-border">
                {[
                  { label: "Brand",           value: car.brand },
                  { label: "Production Year", value: car.productionYear },
                  { label: "Model Year",      value: car.modelYear },
                  { label: "Scale",           value: car.scale },
                  { label: "Vehicle Type",    value: car.vehicleType },
                  { label: "Material",        value: car.material },
                  { label: "Condition",       value: car.condition },
                ].map(({ label, value }) => (
                  <tr key={label} className="bg-surface-card even:bg-surface">
                    <td className="px-4 py-2.5 font-medium text-gray-500">{label}</td>
                    <td className="px-4 py-2.5 text-white">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Listing Details
            </h2>
            <p className="text-sm leading-relaxed text-gray-300">{car.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {car.tags.map((tag) => (
              <Link
                key={tag}
                href={`/shop?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-surface-border bg-surface-card px-2.5 py-0.5 text-[11px] text-gray-500 hover:border-gray-500 hover:text-white"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Related listings */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-white">
            More {car.vehicleType}s
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => (
              <CarCard key={c.id} car={c} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
