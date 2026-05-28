import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://diecastvault.com"),
  title: {
    default: "DieCast Vault — Toy Car Collectibles Marketplace",
    template: "%s | DieCast Vault",
  },
  description:
    "Browse vintage and modern toy car die-casts: Hot Wheels Redlines, Matchbox Lesney, Corgi, Johnny Lightning, and more. Each listing links directly to Facebook Marketplace.",
  keywords: [
    "toy car collectibles",
    "die-cast cars",
    "hot wheels redline",
    "matchbox lesney",
    "corgi",
    "vintage toy cars",
    "diecast marketplace",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DieCast Vault",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-white">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
