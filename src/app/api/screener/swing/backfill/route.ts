import { NextRequest, NextResponse } from "next/server";
import { runSwingScreenerBackfill } from "@/features/swing-screener/services/screener-update.service";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET/POST /api/screener/swing/backfill?start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * Backfill histori OHLC dari IDX ke Turso untuk rentang tanggal tertentu.
 * Hanya hari bursa yang di-request (weekend & libur dilewati otomatis).
 * Setelah tiap hari di-upsert, rolling window dipangkas ke 250 hari/ticker.
 *
 * Otentikasi: `Authorization: Bearer <CRON_SECRET>` atau `x-cron-secret`.
 */
function isAuthorized(req: NextRequest): boolean {
  if (!env.cronSecret) return true;

  const bearer = req.headers.get("authorization");
  const legacy = req.headers.get("x-cron-secret");

  return bearer === `Bearer ${env.cronSecret}` || legacy === env.cronSecret;
}

async function runBackfill(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Parameter `start` dan `end` (YYYY-MM-DD) wajib diisi." },
      { status: 400 },
    );
  }

  const result = await runSwingScreenerBackfill(start, end);

  return NextResponse.json({ ok: true, start, end, ...result });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runBackfill(req);
  } catch (error) {
    console.error("Swing screener backfill failed:", error);
    return NextResponse.json(
      { error: "Backfill screener gagal." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runBackfill(req);
  } catch (error) {
    console.error("Swing screener backfill failed:", error);
    return NextResponse.json(
      { error: "Backfill screener gagal." },
      { status: 500 },
    );
  }
}
