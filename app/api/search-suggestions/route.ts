import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/api";

// Search suggestions appearing whenever the user types something and stops for a moment (debounce).
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const suggestions = await getSearchSuggestions(q);
  return NextResponse.json(suggestions);
}
