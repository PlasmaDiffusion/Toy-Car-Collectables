"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { handleSignOut } from "@/app/auth/actions";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-surface-card" />
    );
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
      >
        Sign in
      </Link>
    );
  }

  const user = session.user;

  return (
    <div className="flex items-center gap-2">
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name ?? "avatar"}
          width={32}
          height={32}
          className="rounded-full border border-surface-border"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      )}
      <Link
        href="/account"
        className="text-xs text-gray-400 hover:text-white"
      >
        Account
      </Link>
      <form action={handleSignOut}>
        <button
          type="submit"
          className="text-xs text-gray-500 hover:text-white"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
