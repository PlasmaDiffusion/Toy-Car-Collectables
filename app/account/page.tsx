import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getWishlistCars } from "@/lib/api";
import CarCard from "@/components/CarCard";
import DeleteAccountModal from "@/components/DeleteAccountModal";

export const metadata: Metadata = {
  title: "My Account — DieCast Vault",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const user = session.user;
  const wishlist = await getWishlistCars(user.id!);

  // Derive a display username — fall back to email prefix or "collector"
  const username =
    (user as { username?: string }).username ??
    user.name?.toLowerCase().replace(/\s+/g, "") ??
    user.email?.split("@")[0] ??
    "collector";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="mb-10 flex items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Profile picture"}
            width={56}
            height={56}
            className="rounded-full ring-2 ring-brand-600"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {(user.name ?? username)[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {user.name ?? username}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Wishlist section */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">
          My Wishlist
          <span className="ml-2 text-base font-normal text-gray-500">
            ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
          </span>
        </h2>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-card py-20 text-center">
            <span className="text-5xl" aria-hidden>
              🚗
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">
              Your wishlist is empty
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Browse the shop and save cars you&apos;re interested in.
            </p>
            <a
              href="/shop"
              className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Browse shop
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {wishlist.map((car) => (
              <CarCard key={car.id} car={car} wishlisted={true} />
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="mt-16 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-base font-bold text-red-400">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Permanently delete your account and all saved wishlist data. This
          cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteAccountModal username={username} />
        </div>
      </section>
    </div>
  );
}
