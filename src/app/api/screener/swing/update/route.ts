import { NextRequest, NextResponse } from "next/server";
import { runSwingScreenerUpdate } from "@/features/swing-screener/services/screener-update.service";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/screener/swing/update
 *
 * Jalankan pipeline screener (fetch semua ticker universe + hitung setup) dan
 * simpan ke Redis. Dipakai oleh cron Vercel (header `x-cron-secret`) atau
 * trigger manual. Kalau `CRON_SECRET` belum di-set, endpoint terbuka (dev).
 */
export async function POST(req: NextRequest) {
  if (env.cronSecret) {
    const secret = req.headers.get("x-cron-secret");
    if (secret !== env.cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const payload = await runSwingScreenerUpdate();
    return NextResponse.json({
      ok: true,
      total: payload.total,
      passedCount: payload.passedCount,
    });
  } catch (error) {
    console.error("Swing screener update failed:", error);
    return NextResponse.json(
      { error: "Update screener gagal." },
      { status: 500 },
    );
  }
}
