"use client";
import {useState} from "react";
import { useSession } from "next-auth/react";

interface Props {
  message: string;
}

export default function AdminOnlyNotice({ message }: Props) {
  const { data: session } = useSession();
  const [isClosed, setIsClosed] = useState(false);

  // @ts-expect-error — isAdmin is custom
  if (!session?.user?.isAdmin || isClosed) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2">
      <span className="mt-0.5 shrink-0 text-amber-400" aria-hidden>⚠</span>
      <p className="flex-1 text-xs text-amber-300">
        <span className="font-semibold">Admin Only Notice</span>
        <br />
        <br />
        {message.split("\n").map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
      <button
        type="button"
        onClick={() => setIsClosed(true)}
        className="shrink-0 text-amber-500 hover:text-amber-300 transition"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
