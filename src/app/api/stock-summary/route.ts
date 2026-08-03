import { NextResponse } from "next/server";

import { redis } from "@/lib/redis/redis";
import { fetchAndCacheStockSummary } from "@/features/explore/services/stock-summary.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force");

    const cached = await redis.get("stockSummary");

    if (cached && force !== "1") {
      return NextResponse.json(cached);
    }

    const data = await fetchAndCacheStockSummary();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stock summary" },
      { status: 500 },
    );
  }
}
