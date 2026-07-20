"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/account/actions";
import { trackEvent } from "@/lib/analytics";

interface Props {
  carId: string;
  initialWishlisted: boolean;
  /** "icon" = small badge for CarCard, "full" = larger button for car detail page */
  variant?: "icon" | "full";
}

export default function WishlistButton({
  carId,
  initialWishlisted,
  variant = "icon",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Optimistic state derived from pending — keep current until server responds
  function handleClick(e: React.MouseEvent) {
    e.preventDefault(); // stop CarCard <Link> from navigating
    e.stopPropagation();
    startTransition(async () => {
      await toggleWishlist(carId, initialWishlisted);
      trackEvent(initialWishlisted ? "wishlist_remove" : "wishlist_add", {
        carId,
      });
      router.refresh();
    });
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={
          initialWishlisted ? "Remove from wishlist" : "Save to wishlist"
        }
        className={`flex items-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-semibold transition disabled:opacity-50 ${
          initialWishlisted
            ? "border-brand-600 bg-brand-900/40 text-brand-400 hover:bg-brand-900/60"
            : "border-surface-border bg-surface-card text-gray-300 hover:border-brand-600 hover:text-brand-400"
        }`}
      >
        <HeartIcon filled={initialWishlisted} className="h-5 w-5" />
        {initialWishlisted ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    );
  }

  // icon variant — sits in the corner of CarCard
  return (
    <div className="group/tip relative">
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={initialWishlisted ? "un-wishlist" : "Wish list"}
        className={`flex h-7 w-7 items-center justify-center rounded-full border transition disabled:opacity-50 ${
          initialWishlisted
            ? "border-brand-600 bg-brand-900/60 text-brand-400"
            : "border-surface-border bg-surface-card/80 text-gray-400 hover:border-brand-600 hover:text-brand-400"
        }`}
      >
        <HeartIcon filled={initialWishlisted} className="h-3.5 w-3.5" />
      </button>
      {/* Tooltip */}
      <span className="pointer-events-none absolute bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-[11px] text-gray-200 opacity-0 ring-1 ring-white/10 transition-opacity group-hover/tip:opacity-100">
        {initialWishlisted ? "Un-wishlist" : "Wishlist"}
      </span>
    </div>
  );
}

function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
