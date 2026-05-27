"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/account/actions";

interface Props {
  username: string;
}

export default function DeleteAccountModal({ username }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const confirmPhrase = `delete ${username}`;
  const isMatch = value.trim().toLowerCase() === confirmPhrase.toLowerCase();

  function handleDelete() {
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:border-red-500"
      >
        Delete account
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-surface-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                ⚠️
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Delete your account?
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  This will permanently delete your account and wishlist. This
                  cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Type{" "}
                <span className="font-mono text-red-400">
                  delete {username}
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`delete ${username}`}
                className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setOpen(false);
                  setValue("");
                }}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm text-gray-400 transition hover:text-white"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isMatch || isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "Deleting…" : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
