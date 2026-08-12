import { NextResponse } from "next/server";
import { redis } from "@/lib/redis/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await redis.get("ipo-performance");

    if (!cached) {
      return NextResponse.json({
        message: "Cache belum tersedia. Menunggu cron job.",
        data: [],
      });
    }

    return NextResponse.json(cached);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch IPO performance";
    console.error("IPO performance API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
