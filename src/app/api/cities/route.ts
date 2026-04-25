/**
 * GET /api/cities — public list of active cities for the search pickers.
 * Falls back to the in-memory mock list if Neon isn't configured.
 */

import { NextResponse } from "next/server";
import { getAllCities } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const cities = await getAllCities();
  return NextResponse.json({ cities });
}
