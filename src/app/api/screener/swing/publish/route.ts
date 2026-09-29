import { NextRequest, NextResponse } from "next/server";
import { publishSwingScreener } from "@/features/swing-screener/services/screener-update.service";
import { env } from "@/lib/env";
import { isTradingDay, toWIBDateString } from "@/lib/utils/trading-day";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET/POST /api/screener/swing/publish  (dipakai cron Vercel jam 21:00 WIB)
 *
 * Hitung indikator dari histori Turso (tanpa fetch IDX) lalu tulis hasil ke
 * Redis. Dipisah dari `/update` supaya request IDX (19:00) dan publish ke FE
 * (21:00) bisa dijadwalkan terpisah.
 *
 * Guard hari bursa: kalau hari ini (WIB) weekend / libur bursa, publish
 * dilewati (data tidak berubah) kecuali `?force=1`.
 *
 * Otentikasi: `Authorization: Bearer <CRON_SECRET>` atau `x-cron-secret`.
 */
function isAuthorized(req: NextRequest): boolean {
  if (!env.cronSecret) return true;

  const bearer = req.headers.get("authorization");
  const legacy = req.headers.get("x-cron-secret");

  return bearer === `Bearer ${env.cronSecret}` || legacy === env.cronSecret;
}

async function runPublish() {
  const payload = await publishSwingScreener();
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
      reason: "Bukan hari bursa (weekend/libur) — publish dilewati.",
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
    return await runPublish();
  } catch (error) {
    console.error("Swing screener publish failed:", error);
    return NextResponse.json(
      { error: "Publish screener gagal." },
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
    return await runPublish();
  } catch (error) {
    console.error("Swing screener publish failed:", error);
    return NextResponse.json(
      { error: "Publish screener gagal." },
      { status: 500 },
    );
  }
}
