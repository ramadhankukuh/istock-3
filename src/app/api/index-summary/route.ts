import { NextResponse } from "next/server";

import { redis } from "@/lib/redis/redis";
import { fetchAndCacheIndexSummary } from "@/features/explore/services/index-summary.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force");

    const cached = await redis.get("indexSummary");

    if (cached && force !== "1") {
      return NextResponse.json(cached);
    }

    const data = await fetchAndCacheIndexSummary();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch index summary" },
      { status: 500 },
    );
  }
}
