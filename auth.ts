/**
 * auth.ts — Auth.js v5 configuration
 *
 * Providers: Google + Facebook
 * Adapter:   @auth/pg-adapter → stores sessions in Neon (uses the `users`,
 *            `accounts`, `sessions`, and `verification_tokens` tables that
 *            the adapter manages automatically).
 *
 * Required env vars (add to .env.local):
 *   AUTH_SECRET              # openssl rand -base64 32
 *   AUTH_GOOGLE_ID
 *   AUTH_GOOGLE_SECRET
 *   AUTH_FACEBOOK_ID
 *   AUTH_FACEBOOK_SECRET
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";

// Re-use a single Pool across invocations (important for serverless)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // Expose id + is_admin on the JWT → session
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error — is_admin comes from our custom users table
        token.isAdmin = user.is_admin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // @ts-expect-error
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});
