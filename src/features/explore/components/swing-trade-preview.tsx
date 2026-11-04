"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SwingScreenerPage } from "@/features/swing-screener/components/swing-screener-page";
import SectionHeading from "./section-heading";

/**
 * Swing Trade Screener di halaman /explore, dengan gating login sendiri:
 * belum login → prompt login; sudah login → tabel + modal setup penuh.
 */
export function SwingTradePreview() {
  const { status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="space-y-4">
        <SectionHeading title="Swing Trade" showInfo={false} />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="space-y-4">
        <SectionHeading title="Swing Trade" showInfo={false} />
        <div className="rounded-4xl border border-(--border) p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Ruang swing trader
            </h2>
            <p className="max-w-xl text-sm text-muted">
              Screening harian saham IDX: sinyal MA/RSI/MACD + setup
              BOW/TP1/TP2/SL dari support/resistance. Login dengan Google untuk
              mengakses.
            </p>
          </div>
          <Link
            href="/login?callbackUrl=/explore"
            className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Login untuk akses
            <ArrowRight className="h-4 w-4" />
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SwingScreenerPage />
    </div>
  );
}
