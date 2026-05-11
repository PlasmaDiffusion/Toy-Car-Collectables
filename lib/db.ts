/**
 * Neon serverless PostgreSQL client.
 * Import `sql` from here throughout the app.
 *
 * The `neon()` function returns a tagged-template SQL executor that runs
 * queries over HTTP (no persistent connection needed — ideal for Next.js
 * Server Components and API routes on serverless/edge runtimes).
 */
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);
