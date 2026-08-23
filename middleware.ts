/**
 * middleware.ts — protects any route under /account/*
 * Uses the edge-safe auth config (no pg/Node.js crypto dependency).
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
