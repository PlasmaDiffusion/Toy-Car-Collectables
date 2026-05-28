/**
 * Thin analytics wrapper — swap the implementation here without touching
 * any component that calls `trackEvent`.
 *
 * Currently backed by PostHog. To switch providers:
 *   1. Replace the posthog.capture() call below
 *   2. Update Providers.tsx to initialise the new SDK
 */

import posthog from "posthog-js";

export function trackEvent(
  event: string,
  payload?: Record<string, string>
): void {
  // posthog-js is a no-op until the provider has initialised, so this is safe
  // to call server-side or before hydration — it queues and flushes automatically.
  posthog.capture(event, payload);
}
