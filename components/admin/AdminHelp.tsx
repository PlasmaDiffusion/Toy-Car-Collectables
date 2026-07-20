"use client";

import { useState } from "react";
import { PAGES } from "./AdminHelpPages";

export default function AdminHelp() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<number | null>(null);

  function close() {
    setOpen(false);
    setPage(null);
  }

  function goToPage(pageIndex: number) {
    setPage(pageIndex);
  }

  function goBack() {
    setPage(null);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-green-400 rounded-lg border border-surface-border  px-3 py-1.5 text-sm text-gray-500 transition hover:border-green-600 hover:text-white"
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
          <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-surface-border bg-surface-card shadow-2xl max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-border px-6 py-4 shrink-0">
              <h2 className="text-base font-bold text-white">
                {page === null ? "Help" : PAGES[page].title}
              </h2>
              <button
                type="button"
                onClick={close}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-surface hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {page === null ? (
                /* Index page */
                <div className="flex flex-col gap-2">
                  {PAGES.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToPage(i)}
                      className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface hover:border-green-600 hover:bg-surface-card px-4 py-3 text-left transition"
                    > 
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-300">
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                /* Content page */
                <div>{PAGES[page].content}</div>
              )}
            </div>

            {/* Footer — back button or close */}
            {page !== null && (
              <div className="border-t border-surface-border px-6 py-4 shrink-0">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-lg border border-surface-border px-4 py-1.5 text-sm text-gray-300 transition hover:text-white hover:border-green-600"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
