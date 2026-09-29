import { NextRequest, NextResponse } from "next/server";
import { runSwingScreenerUpdate } from "@/features/swing-screener/services/screener-update.service";
import { env } from "@/lib/env";
import { isTradingDay, toWIBDateString } from "@/lib/utils/trading-day";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/screener/swing/update  (dipakai cron Vercel)
 * POST /api/screener/swing/update (trigger manual)
 *
 * Jalankan pipeline screener: fetch 1x IDX → upsert Turso → trim 250 hari →
 * hitung indikator → tulis Redis.
 *
 * Guard hari bursa: kalau hari ini (WIB) weekend / libur bursa, request
 * dilewati (tidak fetch IDX) kecuali `?force=1`. Ini menghemat request dan
 * menghindari upsert data kosong.
 *
 * Otentikasi: cron Vercel otomatis mengirim `Authorization: Bearer <CRON_SECRET>`
 * saat env `CRON_SECRET` di-set (konvensi resmi Vercel). `x-cron-secret` tetap
 * diterima untuk kompatibilitas trigger manual lama. Kalau `CRON_SECRET` belum
 * di-set, endpoint terbuka (dev).
 */
function isAuthorized(req: NextRequest): boolean {
  if (!env.cronSecret) return true;

  const bearer = req.headers.get("authorization");
  const legacy = req.headers.get("x-cron-secret");

  return bearer === `Bearer ${env.cronSecret}` || legacy === env.cronSecret;
}

async function runUpdate() {
  const payload = await runSwingScreenerUpdate();
  return NextResponse.json({
    ok: true,
    total: payload.total,
    passedCount: payload.passedCount,
    lastUpdate: payload.lastUpdate,
    summary: payload.summary ?? null,
  });
}

function holidayGuard(req: NextRequest): NextResponse | null {
  const force = new URL(req.url).searchParams.get("force") === "1";
  const today = toWIBDateString();

  if (!force && !isTradingDay(today)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Bukan hari bursa (weekend/libur) — request IDX dilewati.",
      date: today,
    });
  }

  return null;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skipped = holidayGuard(req);
  if (skipped) return skipped;

  try {
    return await runUpdate();
  } catch (error) {
    console.error("Swing screener update failed:", error);
    return NextResponse.json(
      { error: "Update screener gagal." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skipped = holidayGuard(req);
  if (skipped) return skipped;

  try {
    return await runUpdate();
  } catch (error) {
    console.error("Swing screener update failed:", error);
    return NextResponse.json(
      { error: "Update screener gagal." },
      { status: 500 },
    );
  }
}
