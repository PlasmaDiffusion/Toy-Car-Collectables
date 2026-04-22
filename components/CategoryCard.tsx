import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

const typeLabel: Record<string, string> = {
  era:         "Era",
  brand:       "Brand",
  scale:       "Scale",
  vehicleType: "Type",
  condition:   "Condition",
  material:    "Material",
};

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border border-surface-border bg-surface-card transition-all hover:border-brand-600"
    >
      {/* Background image */}
      <Image
        src={category.imageUrl}
        alt={category.name}
        fill
        className="object-contain p-4 opacity-30 transition-all duration-300 group-hover:opacity-50 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, 25vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/60 to-transparent" />

      {/* Text content */}
      <div className="relative p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
          {typeLabel[category.type] ?? category.type}
        </div>
        <div className="text-sm font-bold text-white leading-snug">
          {category.name}
        </div>
        <div className="text-[11px] text-gray-400">
          {category.count} listing{category.count !== 1 ? "s" : ""}
        </div>
      </div>
    </Link>
  );
}
