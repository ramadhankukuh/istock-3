"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, LockKeyhole, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenerTable } from "@/features/swing-screener/components/screener-table";
import { SummaryStrip } from "@/features/swing-screener/components/summary-strip";
import { useSwingScreener } from "@/features/swing-screener/hooks/use-swing-screener";

/**
 * Preview Swing Trade di halaman /explore (tanpa card promo).
 *
 * - Belum login  → ringkasan (Universe, Screened, Lolos, Updated)
 *   + notifikasi "Fitur ini perlu login" (ikon gembok) → /login.
 * - Sudah login  → data hasil screener (ringkasan + tabel).
 */
export function SwingTradePreview() {
  const { status } = useSession();
  const { payload, loading, error } = useSwingScreener();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="space-y-4 border-t border-(--border) pt-6">
      {/* Section header (pemisah dari kartu kategori di atas) */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Swing Trade Screener
          </h2>
          <p className="text-sm text-muted">
            Screener harian semua saham IDX — MA cross, RSI, MACD, volume
            breakout &amp; akumulasi asing.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 text-center text-sm text-muted">
          <p className="font-semibold text-foreground">Terjadi kesalahan</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : !payload?.available ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 text-center text-sm text-muted">
          <p className="font-semibold text-foreground">
            Data belum tersedia
          </p>
          <p className="mt-1">
            {payload?.message ??
              "Cron screener belum pernah berjalan. Pipeline otomatis mengisi data setiap hari kerja pukul 17:00 WIB."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ringkasan: Universe, Screened, Lolos, Updated */}
          <SummaryStrip payload={payload} />

          {isAuthenticated ? (
            <ScreenerTable results={payload?.results ?? []} />
          ) : (
            <Link
              href="/login"
              className="focus-ring group flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-(--border) bg-(--surface) p-6 text-center transition hover:border-(--accent)"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-(--surface-strong) text-(--accent)">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">
                Fitur ini perlu login
              </span>
              <span className="text-xs text-muted">
                Login untuk melihat data hasil screener lengkap.
              </span>
              <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition group-hover:opacity-90">
                Login
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
