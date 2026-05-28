"use client";

import { SessionProvider } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false, // fired manually below to get correct Next.js URL
    capture_pageleave: true,
  });
}

/** Fires a pageview on every client-side navigation. */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    ph?.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <SessionProvider>
        {/* Suspense required because useSearchParams() suspends */}
        <Suspense fallback={null}>
          <PageviewTracker />
        </Suspense>
        {children}
      </SessionProvider>
    </PostHogProvider>
  );
}
