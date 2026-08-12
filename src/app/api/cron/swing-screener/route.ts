import { NextResponse } from "next/server";
import { runSwingScreener } from "@/features/swing-screener/services/swing-screener.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Pipeline fetch + compute butuh waktu; izinkan sampai 5 menit.
export const maxDuration = 300;

/**
 * Entrypoint Vercel Cron untuk Swing Trade Screener.
 * Dijadwalkan lewat vercel.json (hari kerja, 17:00 WIB / 10:00 UTC).
 * Diamankan dengan header `Authorization: Bearer <CRON_SECRET>`.
 *
 * WAJIB: `CRON_SECRET` di-set di environment Vercel sebelum deploy.
 * Kalau kosong, endpoint SELALU menolak request dengan 401 (fail-closed).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.CRON_SECRET;

  // Fail-closed: tanpa CRON_SECRET yang valid, endpoint tidak boleh diakses.
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  console.log("⏰ Cron triggered: /api/cron/swing-screener");

  try {
    const { summary, results } = await runSwingScreener();

    return NextResponse.json({
      success: true,
      message: "Swing screener updated successfully",
      redisKeys: ["screener:swing:latest"],
      summary,
      passedTickers: results.filter((r) => r.passed).map((r) => r.ticker),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Swing screener cron failed:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
