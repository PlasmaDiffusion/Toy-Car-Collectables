import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — LaSalle Collectibles",
};

// Page for outlining the privacy policy of DieCast Vault, especially regarding data collection from Facebook login via AuthJS.
export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-1 text-base text-gray-300">LaSalle Collectibles</p>
      <p className="mt-2 text-sm text-gray-500">Last updated: May 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-400">
        <p>
          LaSalle Collectibles ("we", "us", "our") operates the DieCast Vault
          website. This policy explains what personal data we collect, how we
          use it, and your rights regarding that data.
        </p>
        <p>
          We collect your name, email address, and profile picture when you
          sign in with Google or Facebook. This data is used solely to
          authenticate your account and save products you&apos;re interested in
          to your wishlist.
        </p>
        <p>
          We do not sell your data to third parties. We do not share your
          personal information with anyone outside of the infrastructure
          providers required to operate this service: Vercel Inc. (application
          hosting) and Neon Inc. (database hosting), both located in the United
          States.
        </p>
        <p>
          We do not collect payment information. LaSalle Collectibles does not
          facilitate sales directly — all listings link to Facebook Marketplace.
        </p>
        <p>
          To request deletion of your account and associated data, email{" "}
          <a
            href="mailto:ScottCooperDeveloper@gmail.com"
            className="text-brand-500 hover:underline"
          >
            ScottCooperDeveloper@gmail.com
          </a>
          . We will process your request within 30 days.
        </p>
      </div>
    </main>
  );
}
