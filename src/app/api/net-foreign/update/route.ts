import { NextResponse } from "next/server";

import {
  forceRefreshNetForeignCache,
  updateNetForeignCache,
} from "@/features/foreign-flow/services/net-foreign.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
