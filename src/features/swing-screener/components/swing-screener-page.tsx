"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSwingScreener } from "../hooks/use-swing-screener";
import { ScreenerTable } from "./screener-table";
import { TradeSetupModal } from "./trade-setup-modal";
import { cn } from "@/lib/utils/cn";
import type { TradeSetup } from "../types";

type TabKey = "passed" | "all";

/**
 * Halaman Swing Trade Screener (dipakai via SwingTradePreview di /explore).
 * Memegang state tab + state modal "Lihat Setup" (satu instance modal).
 */
export function SwingScreenerPage() {
  const { payload, isLoading, error, reload } = useSwingScreener();
  const [tab, setTab] = useState<TabKey>("passed");
  const [setupModal, setSetupModal] = useState<{
    ticker: string;
    setup: TradeSetup;
  } | null>(null);

  const allResults = payload?.results ?? [];
  const passedResults = allResults.filter((r) => r.passed);
  const visibleResults = tab === "passed" ? passedResults : allResults;
  const showSetupButtons = tab === "passed";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Swing Trade Screener</Badge>
            {payload && (
              <Badge
                variant="outline"
                className="text-green-600 dark:text-green-400"
              >
                {payload.passedCount} lolos
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted">
            Screening harian saham IDX — sinyal MA/RSI/MACD + setup BOW/TP/SL
            dari struktur support/resistance.
          </p>
          {payload && (
            <p className="text-xs text-muted">
              Update terakhir: {payload.lastUpdateFormatted} ·{" "}
              {payload.total} ticker diproses
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={reload}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border border-(--border) bg-(--surface-strong) px-4 py-2 text-xs font-medium text-foreground transition hover:bg-foreground hover:text-background"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Muat ulang
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-(--surface-strong)/50 p-1 w-fit">
        {(
          [
            { key: "passed", label: "Lolos screening" },
            { key: "all", label: "Semua saham" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              "focus-ring rounded-xl px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-4xl" />
        </div>
      ) : error ? (
        <div className="rounded-4xl border border-(--border) bg-(--surface) p-10 text-center shadow-(--shadow)">
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="focus-ring mt-4 rounded-full border border-(--border) bg-(--surface-strong) px-4 py-2 text-xs font-medium text-(--accent) transition hover:bg-foreground hover:text-background"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <ScreenerTable
          results={visibleResults}
          showSetupButtons={showSetupButtons}
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
