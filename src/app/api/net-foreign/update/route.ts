import { NextResponse } from "next/server";

import {
  forceRefreshNetForeignCache,
  updateNetForeignCache,
} from "@/features/foreign-flow/services/net-foreign.service";
import { isTradingDay, toWIBDateString } from "@/lib/utils/trading-day";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/net-foreign/update  (dipakai cron Vercel)
 *
 * Update cache net foreign dari IDX. Guard hari bursa: kalau hari ini (WIB)
 * weekend / libur bursa, request dilewati kecuali `?force=1`.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.CRON_SECRET;

  if (token && authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = searchParams.get("days");
    const force = searchParams.get("force");
    const daysNum = days ? Number.parseInt(days, 10) : 30;

    // Guard hari bursa (force refresh tetap boleh kapan saja).
    if (force !== "1" && !isTradingDay(toWIBDateString())) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Bukan hari bursa (weekend/libur) — request IDX dilewati.",
        date: toWIBDateString(),
      });
    }

    const data =
      force === "1"
        ? await forceRefreshNetForeignCache(daysNum)
        : await updateNetForeignCache(daysNum);

    return NextResponse.json({
      success: true,
      message:
        force === "1"
          ? "Net foreign cache force refreshed successfully"
          : "Net foreign cache updated successfully",
      totalDays: data.totalDays,
      requestedDays: data.requestedDays,
      mode: force === "1" ? "force" : "incremental",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update net foreign cache";

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
