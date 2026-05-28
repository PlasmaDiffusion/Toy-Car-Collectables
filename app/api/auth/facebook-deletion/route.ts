/**
 * Facebook Data Deletion Callback
 *
 * Meta calls this endpoint (POST) when a user removes your app from their
 * Facebook settings. We delete their account data and return a confirmation URL.
 *
 * Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 *
 * Register this URL in the Meta App Dashboard:
 *   Settings → Basic → Data Deletion → Data Deletion Callback URL
 *   https://yourdomain.com/api/auth/facebook-deletion
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";

function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split(".");

  const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error("Invalid signature");
  }

  return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request");

    if (!signedRequest || typeof signedRequest !== "string") {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    const appSecret = process.env.AUTH_FACEBOOK_SECRET;
    if (!appSecret) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const data = parseSignedRequest(signedRequest, appSecret);
    const facebookUserId: string = data.user_id;

    // Find the user via their Facebook account link and delete them.
    // The FK cascade in the schema handles wishlist_cars, accounts, and sessions.
    await sql`
      DELETE FROM users
      WHERE id IN (
        SELECT "userId" FROM accounts
        WHERE provider = 'facebook' AND "providerAccountId" = ${facebookUserId}
      )
    `;

    // Generate a confirmation code to return to Meta
    const confirmationCode = crypto
      .createHash("sha256")
      .update(facebookUserId + (process.env.AUTH_SECRET ?? ""))
      .digest("hex")
      .slice(0, 16);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;

    // Meta requires this exact JSON shape
    return NextResponse.json({
      url: `${baseUrl}/api/auth/facebook-deletion/status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (err) {
    console.error("[facebook-deletion]", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
