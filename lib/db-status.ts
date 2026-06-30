/**
 * Cheap Neon reachability check for the current request, used to decide
 * whether to show the "using local backup data" banner. Wrapped in React's
 * `cache()` so it only runs once per request even though both the root
 * layout and individual pages may check it.
 */
import { cache } from "react";
import { sql } from "@/lib/db";

export const isDatabaseOnline = cache(async (): Promise<boolean> => {
  try {
    // Race the health-check query against a 3-second timeout so a slow or
    // hung Neon connection never blocks page rendering.
    const timeout = new Promise<false>((resolve) => {
      const t = setTimeout(() => resolve(false), 3000);
      // Don't keep the Node process alive just for this timer.
      if (typeof t === "object" && "unref" in t) t.unref();
    });
    const result = await Promise.race([
      sql`SELECT 1`.then(() => true as const),
      timeout,
    ]);
    return result;
  } catch {
    return false;
  }
});
