"use client";

import { useState } from "react";

const PAGES = [
  {
    title: "Adding a Collectable",
    icon: "➕",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Use the{" "}
          <span className="font-semibold text-white">Add Collectable</span> form
          to list a new toy car. The only required field is the{" "}
          <span className="font-semibold text-brand-400">Name</span> —
          everything else is optional and can be filled in later.
        </p>
        <p>
          That said, the more detail you add upfront the better the listing
          looks to buyers. Try to fill in at minimum:
        </p>
        <ul className="flex flex-col gap-1.5 pl-4">
          {[
            "Name — the full model name",
            "Price — leave blank to show 'Price on Request'",
            "Condition — buyers rely on this heavily",
            "Photos — ideally all 5 sides (see next page)",
            "Facebook Marketplace URL — key to enter when the listing is live on the marketplace for customers to buy",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>Once submitted you'll get a link to view the item on this site.</p>
        <p className="text-brand-400">
          Remember to always enter the marketplace URL in the field when it's
          ready and put on the facebook marketplace. If it's not ready yet, an
          edit button will appear on the car's page to add the link in later.
        </p>
      </div>
    ),
  },
  {
    title: "Uploading & Ordering Photos",
    icon: "📷",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Click or drag files onto the{" "}
          <span className="font-semibold text-white">Images</span> dropzone —
          uploads start automatically. You can add up to{" "}
          <span className="font-semibold text-white">8 photos</span> per
          listing.
        </p>
        <p>
          Photos are shown to buyers in the order you upload them, and the AR
          preview maps each slot to a specific side of the car. The recommended
          order is:
        </p>
        <ol className="flex flex-col gap-1.5 pl-4">
          {["Left side", "Front", "Right side", "Back", "Top"].map(
            (side, i) => (
              <li key={side} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-900 text-[10px] font-bold text-brand-300">
                  {i + 1}
                </span>
                <span>{side}</span>
              </li>
            )
          )}
        </ol>
        <p>
          If you upload out of order, just{" "}
          <span className="font-semibold text-white">drag the thumbnails</span>{" "}
          to rearrange them. Each thumbnail shows its current slot label at the
          bottom so you can see at a glance whether the order is correct.
        </p>
      </div>
    ),
  },
  {
    title: "Scale & Extra Fields",
    icon: "⚙️",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          <span className="font-semibold text-white">Scale</span> is a core
          field — always visible in the form. It powers the AR to-scale preview,
          so set it for every listing. A 1:64 Hot Wheels is ~7 cm; a 1:18 is ~25
          cm.
        </p>
        <p>
          The{" "}
          <span className="font-semibold text-white">Show Extra fields</span>{" "}
          toggle reveals extra metadata:
        </p>
        <ul className="flex flex-col gap-2 pl-4">
          {[
            {
              label: "Brand",
              detail: "e.g. Hot Wheels, Matchbox, Corgi — used for filtering.",
            },
            {
              label: "Vehicle Type",
              detail:
                "Muscle Car, Race Car, etc. — drives the 'Related listings' section on the detail page.",
            },
            {
              label: "Production & Model Year",
              detail:
                "Production year is when the toy was made; Model year is the real car being modelled. Both show in the spec table.",
            },
          ].map(({ label, detail }) => (
            <li key={label} className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              <span>
                <span className="font-semibold text-white">{label}</span> —{" "}
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "Editing an Existing Listing",
    icon: "✏️",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          To edit a car that's already been added, navigate to its detail page
          from the shop or by searching for it.
        </p>
        <p>
          When you're signed in as an admin, an{" "}
          <span className="inline-flex items-center gap-1 rounded-md border border-brand-700 bg-brand-900/40 px-2 py-0.5 text-xs font-semibold text-brand-300">
            ✏️ Edit listing
          </span>{" "}
          button will appear in the breadcrumb bar at the top of the page — it's
          hidden from regular visitors.
        </p>
        <p>
          Clicking it opens the same form pre-filled with the car's current
          data. Make your changes and hit{" "}
          <span className="font-semibold text-white">Save Changes</span>. The
          listing updates immediately. Buyers should see the new version within
          seconds.
        </p>
        <p className="rounded-md border border-amber-800/50 bg-amber-900/20 px-3 py-2 text-amber-300">
          💡 Tip — if you need to swap out a photo, remove the old thumbnail
          first, then upload the replacement and drag it into the correct
          position.
        </p>
      </div>
    ),
  },
];

export default function AdminHelp() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  function close() {
    setOpen(false);
    setPage(0);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 text-sm text-gray-400 transition hover:border-brand-600 hover:text-white"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Help
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-surface-border bg-surface-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{PAGES[page].icon}</span>
                <h2 className="text-base font-bold text-white">
                  {PAGES[page].title}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-surface hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="min-h-[220px] px-6 py-5">{PAGES[page].content}</div>

            {/* Footer — pagination */}
            <div className="flex items-center justify-between border-t border-surface-border px-6 py-4">
              {/* Page dots */}
              <div className="flex gap-1.5">
                {PAGES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === page
                        ? "w-5 bg-brand-500"
                        : "w-2 bg-surface-border hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="rounded-lg border border-surface-border px-4 py-1.5 text-sm text-gray-300 transition hover:text-white disabled:opacity-30"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    page === PAGES.length - 1 ? close() : setPage((p) => p + 1)
                  }
                  className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-500"
                >
                  {page === PAGES.length - 1 ? "Done" : "Next →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
