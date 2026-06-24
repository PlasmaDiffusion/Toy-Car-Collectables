import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-surface-border bg-surface-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                🏎
              </span>
              <span className="font-bold text-white">
                Lasalle<span className="text-brand-500">Collectibles</span>
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              The collector&apos;s destination for vintage and modern toy car
              die-casts. All listings link to Facebook Marketplace.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Shop by Brand
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              {[
                "Hot Wheels",
                "Matchbox",
                "Corgi",
                "Johnny Lightning",
                "Dinky Toys",
              ].map((b) => (
                <li key={b}>
                  <Link
                    href={`/shop?brand=${encodeURIComponent(b)}`}
                    className="hover:text-white"
                  >
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Shop by Era
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              {[
                { label: "1950s & 1960s", slug: "era-1950s-60s" },
                { label: "1970s", slug: "era-1970s" },
                { label: "1980s", slug: "era-1980s" },
                { label: "1990s", slug: "era-1990s" },
                { label: "2000s & Newer", slug: "era-2000s-plus" },
              ].map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/category/${e.slug}`}
                    className="hover:text-white"
                  >
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Browse
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              {[
                { label: "Muscle Cars", href: "/shop?vehicleType=Muscle+Car" },
                { label: "Sports Cars", href: "/shop?vehicleType=Sports+Car" },
                { label: "Movie & TV", href: "/shop?vehicleType=Movie+%26+TV" },
                { label: "Mint in Box", href: "/shop?condition=Mint+in+Box" },
                { label: "All Cars", href: "/shop" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-border pt-6 text-center text-xs text-gray-600">
          <p>
            Lasalle Collectibles links to Facebook Marketplace listings but does
            not facilitate sales directly. All product images are placeholder
            illustrations.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} Lasalle Collectibles. Collector-made
            with ❤️
          </p>
          {/* Link to privacy policy page for facebook login with AuthJS */}
          <p className="mt-2">
            <Link href="/privacy-policy" className="hover:text-white underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
