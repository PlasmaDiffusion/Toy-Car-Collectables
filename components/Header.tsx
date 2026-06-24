"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "@/components/account-related/AuthButton";
import AdminLink from "@/components/account-related/AdminLink";
import SearchBar from "@/components/search-related/SearchBar";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-surface-border">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="text-2xl leading-none" aria-hidden>
              🏎
            </span>
            <span className="hidden font-bold tracking-tight text-white sm:block">
              Lasalle<span className="text-brand-500">Collectibles </span>
            </span>
          </Link>

          {/* Search */}
          <SearchBar />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-300 md:flex">
            <Link href="/shop" className="hover:text-white">
              Shop
            </Link>
            <Link
              href="/shop?condition=Mint+in+Box"
              className="hover:text-white"
            >
              MIB
            </Link>
            <Link href="/category/type-movie-tv" className="hover:text-white">
              Movie Cars
            </Link>
            <AdminLink />
          </nav>

          {/* Auth */}
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="ml-auto text-gray-400 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Category ribbon */}
      <div className="hidden border-t border-surface-border bg-surface-card md:block">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-8 py-2 text-xs font-medium text-gray-400">
          {[
            { label: "Hot Wheels", href: "/shop?brand=Hot+Wheels" },
            { label: "Matchbox", href: "/shop?brand=Matchbox" },
            { label: "Corgi", href: "/shop?brand=Corgi" },
            { label: "Johnny Lightning", href: "/shop?brand=Johnny+Lightning" },
            { label: "Dinky Toys", href: "/shop?brand=Dinky+Toys" },
            { label: "1960s", href: "/category/era-1950s-60s" },
            { label: "1970s", href: "/category/era-1970s" },
            { label: "1980s", href: "/category/era-1980s" },
            { label: "Muscle Cars", href: "/shop?vehicleType=Muscle+Car" },
            { label: "Movie & TV", href: "/shop?vehicleType=Movie+%26+TV" },
            { label: "Mint in Box", href: "/shop?condition=Mint+in+Box" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="shrink-0 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-surface-border bg-surface-card md:hidden">
          <nav className="flex flex-col divide-y divide-surface-border text-sm text-gray-300">
            {[
              { label: "All Cars", href: "/shop" },
              { label: "Hot Wheels", href: "/shop?brand=Hot+Wheels" },
              { label: "Matchbox", href: "/shop?brand=Matchbox" },
              { label: "Muscle Cars", href: "/shop?vehicleType=Muscle+Car" },
              { label: "Movie & TV", href: "/shop?vehicleType=Movie+%26+TV" },
              { label: "Mint in Box", href: "/shop?condition=Mint+in+Box" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 hover:bg-surface hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="px-6 py-4">
              <AuthButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
