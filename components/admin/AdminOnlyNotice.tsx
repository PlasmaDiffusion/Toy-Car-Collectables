"use client";

import { useSession } from "next-auth/react";

interface Props {
  message: string;
}

export default function AdminOnlyNotice({ message }: Props) {
  const { data: session } = useSession();
  // @ts-expect-error — isAdmin is custom
  if (!session?.user?.isAdmin) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2">
      <span className="mt-0.5 shrink-0 text-amber-400" aria-hidden>
        ⚠
      </span>
      <p className="text-xs text-amber-300">
        <span className="font-semibold">Admin only notice — </span>
        {message}
      </p>
    </div>
  );
}
