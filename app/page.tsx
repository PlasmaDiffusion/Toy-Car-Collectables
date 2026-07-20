import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedCars, getCategories, getHomePageStats } from "@/lib/api";
import CarCard from "@/components/CarCard";
import CategoryCard from "@/components/CategoryCard";

// ISR — revalidate every 5 minutes; Vercel serves cached HTML between rebuilds
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Lasalle Collectibles — Toy Car Collectibles Marketplace",
};

export default async function HomePage() {
  const [featured, eraCategories, typeCategories, stats] = await Promise.all([
    getFeaturedCars(),
    getCategories("era"),
    getCategories("vehicleType"),
    getHomePageStats(),
  ]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-card">
        {/* Decorative speed lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent"
              style={{
                width: `${60 + i * 8}%`,
                left: `${-10 + i * 5}%`,
                transform: `translateY(${(i - 4) * 22}px) rotate(-6deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-700 bg-brand-900/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              New listings added regularly
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              The collector&apos;s vault for{" "}
              <span className="text-brand-500">toy cars</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-gray-400 sm:text-lg">
              Browse curated vintage and modern toy car listings. Contact the
              seller for what you're interested in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/50 transition hover:bg-brand-500"
              >
                Browse All Cars
              </Link>
              <Link
                href="/shop?condition=Mint+in+Box"
                className="rounded-lg border border-surface-border bg-surface-card px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
              >
                Mint in Box Only
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────── */}
      <section className="border-y border-surface-border bg-surface-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 divide-x divide-surface-border md:grid-cols-4">
            {[
              { stat: `${stats.carCount}`, label: "Curated listings" },
              { stat: `${stats.brandCount}`, label: "Iconic brands" },
              { stat: `${stats.oldestYear}`, label: "Oldest year covered" },
              {
                stat: "Wishlist",
                label: "Save a list of cars you'd like to buy",
              },
            ].map(({ stat, label }) => (
              <div key={label} className="px-6 py-5 text-center">
                <dt className="text-xl font-extrabold text-white sm:text-2xl">
                  {stat}
                </dt>
                <dd className="mt-0.5 text-xs text-gray-400">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Featured listings ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Featured Listings
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Hand-picked collector highlights
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* ── Shop by era ──────────────────────────────────────── */}
      <section className="bg-surface-card border-y border-surface-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-7 text-2xl font-extrabold text-white">
            Shop by Era
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {eraCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by type ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-7 text-2xl font-extrabold text-white">
          Shop by Vehicle Type
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {typeCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-t border-surface-border bg-surface-card">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-white">
            How Lasalle Collectibles Works
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Browse our curated listings, read the details, contact the seller,
            and meet up to buy it.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🔍",
                title: "Browse & Filter",
                body: "Search our catalogue by brand, era, scale, condition, and more.",
              },
              {
                icon: "📋",
                title: "Read the Details",
                body: "Every listing has a full description, condition grade, photos, and even AR previews.",
              },
              {
                icon: "📘",
                title: "Contact the Seller",
                body: "Click on an item to see how to buy it.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center gap-3"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-3xl">
                  {step.icon}
                </span>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
