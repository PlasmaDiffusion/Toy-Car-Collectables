"use client";

import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  yesButtonText?: string;
  noButtonText?: string;
  onYes: () => void;
  onNo: () => void;
  isDangerous?: boolean;
  confirmTaps?: number;
  confirmationText?: string;
}

export default function GenericModal({
  open,
  title = "Confirm",
  message,
  yesButtonText = "Yes",
  noButtonText = "No",
  onYes,
  onNo,
  isDangerous = false,
  confirmTaps = 0,
  confirmationText = "Confirming...",
}: Props) {
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    if (!open) {
      setTaps(0);
    }
  }, [open]);

  const handleYes = () => {
    if (confirmTaps === 0) {
      onYes();
      return;
    }

    const newTaps = taps + 1;

    if (newTaps >= confirmTaps) {
      setTaps(-1);
      onYes();
    } else {
      setTaps(newTaps);
    }
  };

  const getYesButtonText = () => {
    if (taps === -1) return confirmationText;
    if (confirmTaps === 0) return yesButtonText;
    const remaining = confirmTaps - taps;
    if (remaining > 0) {
      const tapWord = remaining === 1 ? "time" : "times";
      return `${yesButtonText} (Tap ${remaining} ${tapWord} to confirm)`;
    }
    return yesButtonText;
  };

  const handleNo = () => {
    setTaps(0);
    onNo();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && taps !== -1) onNo();
      }}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-xl ${
          isDangerous
            ? "border-red-500/30 bg-surface-card"
            : "border-surface-border bg-surface-card"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            {isDangerous ? "⚠️" : "ℹ️"}
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-gray-400">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3 justify-end">
          <button
            onClick={handleNo}
            disabled={taps === -1}
            className="rounded-lg border border-surface-border px-4 py-2 text-sm text-gray-400 transition hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {noButtonText}
          </button>
          <button
            onClick={handleYes}
            disabled={taps === -1}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-brand-600 hover:bg-brand-500"
            }`}
          >
            {getYesButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
