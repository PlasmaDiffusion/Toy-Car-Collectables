import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/account-related/Providers";
import DbStatusBanner from "@/components/DbStatusBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { isDatabaseOnline } from "@/lib/db-status";

export const metadata: Metadata = {
  metadataBase: new URL("https://diecastvault.com"),
  title: {
    default: "Lasalle Collectibles — Toy Car Collectibles Marketplace",
    template: "%s | Lasalle Collectibles",
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
    siteName: "Lasalle Collectibles",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const online = await isDatabaseOnline();

  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-white">
        <ServiceWorkerRegister />
        <Providers>
          {!online && <DbStatusBanner />}
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
