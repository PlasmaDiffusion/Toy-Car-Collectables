import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — DieCast Vault",
};

// Page for outlining the privacy policy of DieCast Vault, especially regarding data collection from Facebook login via AuthJS.
export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: May 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-400">
        <p>
          DieCast Vault collects your name, email address, and profile picture
          when you sign in with Google or Facebook. This data is used solely to
          authenticate your account and save products you're interested in to
          your wishlist (be them available on the marketplace or available in
          the future).
        </p>
        <p>
          We do not sell your data to third parties. We do not share your
          personal information with anyone outside of the authentication
          providers (Google, Facebook) used to log you in.
        </p>
        <p>
          We do not collect payment information. DieCast Vault does not
          facilitate sales directly — all listings link to Facebook Marketplace.
        </p>
        <p>
          To request deletion of your account and associated data, email{" "}
          <a
            href="mailto:MarkECooperJ2@hotmail.com"
            className="text-brand-500 hover:underline"
          >
            MarkECooperJ2@hotmail.com
          </a>
          . We will process your request within 30 days.
        </p>
      </div>
    </main>
  );
}
