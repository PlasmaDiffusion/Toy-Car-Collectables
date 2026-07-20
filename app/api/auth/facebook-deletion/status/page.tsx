import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion — LaSalle Collectibles",
  robots: { index: false },
};

export default function FacebookDeletionStatusPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        ✅
      </span>
      <h1 className="mt-4 text-2xl font-bold text-white">
        Your data has been deleted
      </h1>
      <p className="mt-3 text-sm text-gray-400">
        Your LaSalle Collectibles account and all associated data has been
        permanently removed from our systems in response to your request via
        Facebook.
      </p>
      <p className="mt-4 text-sm text-gray-400">
        If you have any questions, email{" "}
        <a
          href="mailto:ScottCooperDeveloper@gmail.com"
          className="text-brand-500 hover:underline"
        >
          ScottCooperDeveloper@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
