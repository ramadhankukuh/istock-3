import { NextResponse } from "next/server";
import { readScreenerCache } from "@/features/swing-screener/services/screener-cache.service";
import type { SwingScreenerPayload } from "@/features/swing-screener/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint untuk user — HANYA membaca hasil screening dari Redis.
 * Tidak ada fetch IDX / query Turso di path ini. Kalau Redis kosong,
 * tampilkan state "data belum tersedia" (available: false).
 */
export async function GET() {
  try {
    const cache = await readScreenerCache();

    if (!cache) {
      const payload: SwingScreenerPayload = {
        available: false,
        updatedAt: null,
        message:
          "Data belum tersedia. Tunggu cron berikutnya (hari kerja, 17:00 WIB).",
        results: [],
        summary: null,
      };
      return NextResponse.json(payload);
    }

    return NextResponse.json(cache);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Swing screener read error:", error);
    return NextResponse.json(
      {
        available: false,
        updatedAt: null,
        message: "Gagal membaca data screener.",
        results: [],
        summary: null,
      },
      { status: 500 },
    );
  }
}
