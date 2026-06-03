"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/** Renders an Edit button on a car detail page only for admins. */
export default function AdminEditButton({ carId }: { carId: string }) {
  const { data: session } = useSession();
  // @ts-expect-error — isAdmin is our custom field
  if (!session?.user?.isAdmin) return null;

  return (
    <Link
      href={`/admin/edit/${carId}`}
      className="inline-flex items-center gap-1.5 rounded-md border border-brand-700 bg-brand-900/50 px-3 py-1.5 text-xs font-semibold text-brand-400 transition hover:bg-brand-900 hover:text-brand-300"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit listing
    </Link>
  );
}
