import { NextResponse } from "next/server";

import { fetchAndCacheStockSummary } from "@/features/explore/services/stock-summary.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.CRON_SECRET;

  if (token && authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchAndCacheStockSummary();

    return NextResponse.json({
      success: true,
      message: "Stock summary cache updated successfully",
      total: data.total,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update stock summary";

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
