"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import IHSGChartCard from "@/features/home/components/ihsg-chart-card";
import MarketStatusCard from "@/features/home/components/market-status-card";
import MacroSlider from "@/features/explore/components/macro-slider";
import MacroHistoryPanel from "@/features/explore/components/macro-history-panel";
import StockSummaryBoard from "@/features/explore/components/stock-summary-board";
import OverviewBoard from "@/features/explore/components/overview-board";
import StockSummarySkeleton from "@/features/explore/components/stock-summary-skeleton";
import UmaSuspendBoard from "@/features/explore/components/uma-suspend-board";
import SectorBoard from "@/features/explore/components/sector-board";
import { useMacroHistory } from "@/features/explore/hooks/use-macro-history";
import { useMacro } from "@/features/explore/hooks/use-macro";
import { useStockSummary } from "@/features/explore/hooks/use-stock-summary";
import { useIndexSummary } from "@/features/explore/hooks/use-index-summary";
import { generateLeaderboards } from "@/features/explore/services/stock-summary-leaderboard.service";
import { cn } from "@/lib/utils/cn";
import type { StockSummaryItem } from "@/features/explore/types";

export default function HomePage() {
  const { macro, isLoading: macroLoading } = useMacro();
  const {
    activeKey: activeMacroKey,
    setActiveKey: setActiveMacroKey,
    history: macroHistory,
    isLoading: macroHistoryLoading,
    error: macroHistoryError,
  } = useMacroHistory(macro);
  const {
    stockSummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useStockSummary();
  const {
    indexSummary,
    isLoading: indexLoading,
    error: indexError,
  } = useIndexSummary();

  const netForeign = React.useMemo(() => {
    if (!stockSummary?.items) return 0;
    return (stockSummary.items as StockSummaryItem[]).reduce(
      (sum, item) => sum + item.foreignNet,
      0,
    );
  }, [stockSummary]);

  const [isMacroModalOpen, setIsMacroModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isMacroModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMacroModalOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMacroModalOpen]);

  const leaderboards = React.useMemo(() => {
    return stockSummary
      ? generateLeaderboards(stockSummary.items as StockSummaryItem[])
      : null;
  }, [stockSummary]);

  const summaryTabs = React.useMemo(
    () =>
      leaderboards
        ? [
            {
              key: "topValue",
              label: "Top Value",
              items: leaderboards.topValue,
            },
            {
              key: "topGainer",
              label: "Top Gainer",
              items: leaderboards.topGainer,
            },
            {
              key: "topLoser",
              label: "Top Loser",
              items: leaderboards.topLoser,
            },
            {
              key: "topFreq",
              label: "Top Frekuensi",
              items: leaderboards.topFreq,
            },
            {
              key: "topVolume",
              label: "Top Volume",
              items: leaderboards.topVolume,
            },
            {
              key: "netForeignBuy",
              label: "Net Foreign Buy",
              items: leaderboards.netForeignBuy,
            },
            {
              key: "netForeignSell",
              label: "Net Foreign Sell",
              items: leaderboards.netForeignSell,
            },
          ]
        : [],
    [leaderboards],
  );

  const [activeSummaryKey, setActiveSummaryKey] =
    React.useState<string>("topValue");

  const resolvedActiveSummaryKey = React.useMemo(() => {
    if (summaryTabs.length === 0) {
      return "";
    }

    const hasActiveSummary = summaryTabs.some(
      (tab) => tab.key === activeSummaryKey,
    );

    return hasActiveSummary ? activeSummaryKey : summaryTabs[0].key;
  }, [activeSummaryKey, summaryTabs]);

  const activeSummaryTab = React.useMemo(() => {
    return (
      summaryTabs.find((tab) => tab.key === resolvedActiveSummaryKey) ??
      summaryTabs[0]
    );
  }, [resolvedActiveSummaryKey, summaryTabs]);

  return (
    <section className="space-y-6 overflow-hidden">
      {/* Market Status */}
      <MarketStatusCard />

      {/* Chart IHSG */}
      <IHSGChartCard ihsg={indexSummary?.ihsgSummary} netForeign={netForeign} />

      {/* Makro Indonesia */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground sm:text-base">
            Makro Indonesia
          </span>
        </div>
        {macroLoading ? (
          <div className="flex gap-3 overflow-x-auto py-2 hide-scrollbar snap-x snap-mandatory">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`macro-skel-${i}`}
                className="min-w-52 shrink-0 snap-center"
              >
                <div className="rounded-3xl border border-(--border) bg-(--surface-strong) p-4 shadow-(--shadow-soft) sm:min-w-64">
                  <Skeleton className="mb-3 h-4 w-28" />
                  <Skeleton className="mb-4 h-8 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : macro && macro.length > 0 ? (
          <MacroSlider
            items={macro}
            activeKey={activeMacroKey}
            onSelect={(key) => {
              setActiveMacroKey(key);
              setIsMacroModalOpen(true);
            }}
          />
        ) : null}
      </div>

      {/* Top Value, Gainer, dll — card tetap, konten di-skeleton */}
      <div className="space-y-4">
        {/* Tab buttons — skeleton saat loading */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {summaryLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={`tab-skel-${i}`}
                  className="h-10 w-28 shrink-0 rounded-full"
                />
              ))
            : stockSummary &&
              leaderboards &&
              summaryTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveSummaryKey(tab.key)}
                  aria-pressed={tab.key === activeSummaryTab?.key}
                  className={cn(
                    "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    tab.key === activeSummaryTab?.key
                      ? "bg-foreground text-background"
                      : "bg-(--surface-strong) text-muted hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
        </div>

        {/* Card board — skeleton konten di dalam card */}
        <Card className="overflow-hidden">
          {summaryLoading ? (
            <>
              <div className="px-4 pt-4 pb-0">
                <Skeleton className="h-5 w-24" />
              </div>
              <StockSummarySkeleton />
            </>
          ) : summaryError ? (
            <CardContent className="pt-6 text-sm text-red-500">
              {summaryError}
            </CardContent>
          ) : stockSummary && leaderboards && activeSummaryTab ? (
            <StockSummaryBoard
              title={activeSummaryTab.label}
              items={activeSummaryTab.items}
              inCard={false}
            />
          ) : null}
        </Card>
      </div>

      {/* Stock Breadth */}
      {stockSummary ? (
        <OverviewBoard items={stockSummary.items as StockSummaryItem[]} />
      ) : null}

      {/* UMA, Suspend, Unsuspend */}
      <UmaSuspendBoard />

      {/* Sektor */}
      {indexLoading ? (
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-[11px] uppercase tracking-[0.16em] text-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Nama</th>
                      <th className="px-4 py-3 text-right font-semibold">Chg</th>
                      <th className="px-4 py-3 text-right font-semibold">Val</th>
                      <th className="px-4 py-3 text-right font-semibold">Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`sector-skel-${i}`} className="border-t border-white/8">
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="ml-auto h-4 w-16" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="ml-auto h-4 w-20" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="ml-auto h-4 w-20" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-[11px] uppercase tracking-[0.16em] text-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Nama</th>
                      <th className="px-4 py-3 text-right font-semibold">Chg</th>
                      <th className="px-4 py-3 text-right font-semibold">Val</th>
                      <th className="px-4 py-3 text-right font-semibold">Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`index-skel-${i}`} className="border-t border-white/8">
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="ml-auto h-4 w-16" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="ml-auto h-4 w-20" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Skeleton className="ml-auto h-4 w-20" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : indexError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-red-500">
            {indexError}
          </CardContent>
        </Card>
      ) : (
        <SectorBoard indexSummary={indexSummary} />
      )}

      {/* Modal Makro */}
      {isMacroModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-background backdrop-blur-xl sm:items-start sm:bg-slate-950/45 sm:pt-12 sm:pb-8 sm:px-4 modal-overlay-enter"
          role="dialog"
          aria-modal="true"
          aria-label="Histori makro Indonesia"
          onClick={() => setIsMacroModalOpen(false)}
        >
          <div
            className="relative h-full w-full max-w-none modal-sheet-enter sm:h-auto sm:max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-full w-full rounded-none sm:h-auto sm:rounded-[2.25rem]">
              <MacroHistoryPanel
                history={macroHistory}
                isLoading={macroLoading || macroHistoryLoading}
                error={macroHistoryError}
                onClose={() => setIsMacroModalOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
