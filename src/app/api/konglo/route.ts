import { NextResponse } from "next/server";
import { redis } from "@/lib/redis/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await redis.get("kongloData");

    if (!cached) {
      return NextResponse.json({
        message: "Cache belum tersedia. Menunggu cron job.",
        data: [],
      });
    }

    return NextResponse.json(cached);
  } catch (err: any) {
    console.error("Konglo API error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}
