import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Match protected routes but explicitly ignore:
     * - /api/auth (NextAuth OAuth callback & session routes)
     * - _next/static, _next/image, favicon.ico
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};