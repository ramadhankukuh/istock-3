import { NextResponse } from "next/server";
import { getSwingScreenerCache } from "@/features/swing-screener/services/screener-update.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/screener/swing
 *
 * Baca hasil screening dari Redis (data layer — diisi oleh pipeline cron).
 * Dipakai hook `useSwingScreener` di halaman /explore.
 */
export async function GET() {
  try {
    const payload = await getSwingScreenerCache();

    if (!payload) {
      return NextResponse.json(
        {
          error:
            "Data screener belum tersedia. Jalankan update terlebih dahulu.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to read swing screener cache:", error);
    return NextResponse.json(
      { error: "Gagal membaca data screener." },
      { status: 500 },
    );
  }
}
