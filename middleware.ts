/**
 * middleware.ts — protects any route under /account/*
 * All other routes are public.
 */
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/account/:path*"],
};
