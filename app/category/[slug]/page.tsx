import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCarsByCategory, getCategories } from "@/lib/api";
import CarCard from "@/components/CarCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };

  return {
    title: `${category.name} Die-Cast Cars — DieCast Vault`,
    description: category.description,
  };
}

const typeLabel: Record<string, string> = {
  era: "Era",
  brand: "Brand",
  scale: "Scale",
  vehicleType: "Type",
  condition: "Condition",
  material: "Material",
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const cars = category ? await getCarsByCategory(category.id) : [];

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white">
          Shop
        </Link>
        <span>/</span>
        <span className="text-gray-300">{category.name}</span>
      </nav>

      {/* Category header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            priority
            className="object-contain p-4 opacity-60"
            sizes="112px"
          />
        </div>

        <div className="flex-1">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-400">
            {typeLabel[category.type] ?? category.type}
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {category.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">
            {category.description}
          </p>
          <p className="mt-3 text-sm text-gray-500">
            {cars.length} listing{cars.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Listings grid */}
      {cars.length === 0 ? (
        <EmptyState categoryName={category.name} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-card py-20 text-center">
      <span className="text-5xl" aria-hidden>
        🔍
      </span>
      <h2 className="mt-4 text-lg font-semibold text-white">
        No listings in {categoryName} yet
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Check back soon, or browse all cars.
      </p>
      <Link
        href="/shop"
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
      >
        Browse All Cars
      </Link>
    </div>
  );
}
