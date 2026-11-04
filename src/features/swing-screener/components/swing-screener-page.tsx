"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSwingScreener } from "../hooks/use-swing-screener";
import { ScreenerTable } from "./screener-table";
import { TradeSetupModal } from "./trade-setup-modal";
import SectionHeading from "@/features/explore/components/section-heading";
import type { TradeSetup } from "../types";

/**
 * Halaman Swing Trade Screener (dipakai via SwingTradePreview di /explore).
 * Menampilkan hasil lolos + state modal "Lihat Setup" (satu instance modal).
 */
export function SwingScreenerPage() {
  const { payload, isLoading, error } = useSwingScreener();
  const [setupModal, setSetupModal] = useState<{
    ticker: string;
    setup: TradeSetup;
  } | null>(null);

  const allResults = payload?.results ?? [];
  const passedResults = allResults.filter((r) => r.passed);

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Swing Trade"
        updatedAt={payload?.lastUpdateFormatted}
      />
      {/* Body */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-4xl" />
        </div>
      ) : error ? (
        <div className="rounded-4xl border border-(--border) p-10 text-center">
          <p className="text-sm text-muted">{error}</p>
        </div>
      ) : (
        <ScreenerTable
          results={passedResults}
          showSetupButtons
          onOpenSetup={(ticker, setup) => setSetupModal({ ticker, setup })}
        />
      )}

      {/* Modal setup — satu instance, di atas halaman */}
      {setupModal && (
        <TradeSetupModal
          ticker={setupModal.ticker}
          setup={setupModal.setup}
          open
          onClose={() => setSetupModal(null)}
        />
      )}
    </div>
  );
}
