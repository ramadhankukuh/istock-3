import { NextResponse } from "next/server";

import { fetchAndCacheIndexSummary } from "@/features/explore/services/index-summary.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/index-summary/update (dipakai cron Vercel)
 *
 * Ambil ulang data Index Summary IDX (sektor & indeks) dan simpan ke Redis.
 * Otentikasi: cron Vercel otomatis mengirim `Authorization: Bearer <CRON_SECRET>`
 * saat env `CRON_SECRET` di-set. Kalau belum di-set, endpoint terbuka (dev).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.CRON_SECRET;

  if (token && authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchAndCacheIndexSummary();

    return NextResponse.json({
      success: true,
      message: "Index summary cache updated successfully",
      sectorCount: data.sector.length,
      indexCount: data.index.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update index summary";

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
