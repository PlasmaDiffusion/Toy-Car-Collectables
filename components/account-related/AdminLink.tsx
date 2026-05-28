"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/** Renders an Admin nav link only when the signed-in user has isAdmin = true. */
export default function AdminLink() {
  const { data: session } = useSession();
  // @ts-expect-error — isAdmin is our custom field on the session
  if (!session?.user?.isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="rounded-md bg-brand-900/60 px-2.5 py-1 text-brand-400 ring-1 ring-brand-700 hover:bg-brand-900 hover:text-brand-300"
    >
      Admin
    </Link>
  );
}
