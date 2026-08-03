"use client";

import { useTheme } from "@/components/theme-provider";
import { useForeignFlow } from "@/features/foreign-flow/hooks/use-foreign-flow";
import Filters from "@/features/foreign-flow/components/filters";
import Summary from "@/features/foreign-flow/components/summary";
import Table from "@/features/foreign-flow/components/table";

export default function ForeignFlowPage() {
  const { theme } = useTheme();

  const {
    selectedDays,
    setSelectedDays,
    flowMode,
    setFlowMode,
    expandedStockCode,
    toggleStockDetail,
    payload,
    loading,
    loadData,
    displayRows,
    stockHistoryByCode,
    dailyTopRanks,
    topStock,
    topAccumulators,
    topDistributors,
    dateRange,
  } = useForeignFlow(7);

  const chartColors = {
    grid: theme === "dark" ? "#334155" : "#dbe3ee",
    axis: theme === "dark" ? "#94a3b8" : "#6b7280",
    legend: theme === "dark" ? "#e2e8f0" : "#334155",
    tooltipBg: theme === "dark" ? "#0f172a" : "#ffffff",
    tooltipBorder: theme === "dark" ? "#334155" : "#cbd5e1",
    tooltipText: theme === "dark" ? "#f8fafc" : "#0f172a",
    referenceLine: theme === "dark" ? "#64748b" : "#94a3b8",
    closeLine: theme === "dark" ? "#60a5fa" : "#2563eb",
    foreignPositive: theme === "dark" ? "#4ade80" : "#16a34a",
    foreignNegative: theme === "dark" ? "#f87171" : "#dc2626",
  };

  return (
    <section className="space-y-6">
      <div className="rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow) sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Foreign Flow
            </h1>
            <p className="max-w-2xl text-sm text-muted sm:text-base">
              Pantau akumulasi dan distribusi net foreign per saham dalam
              periode 7, 14, atau 30 hari terakhir, lengkap dengan ranking
              harian dan visualisasi close price.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <div className="inline-flex items-center gap-2">{dateRange}</div>
            <div className="inline-flex items-center gap-2">
              {payload?.lastUpdateFormatted ?? "-"}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Filters
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
          flowMode={flowMode}
          setFlowMode={setFlowMode}
          onRefresh={() => void loadData(true)}
          loading={loading}
        />
      </div>

      <Summary
        topStock={topStock}
        payload={payload}
        dateRange={dateRange}
        loading={loading}
        flowMode={flowMode}
      />

      {(topAccumulators.length > 0 || topDistributors.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top lists preserved for UI parity but simple */}
          <div />
          <div />
        </div>
      )}

      <Table
        loading={loading}
        displayRows={displayRows}
        expandedStockCode={expandedStockCode}
        toggleStockDetail={toggleStockDetail}
        stockHistoryByCode={stockHistoryByCode}
        dailyTopRanks={dailyTopRanks}
        chartColors={chartColors}
        flowMode={flowMode}
      />
    </section>
  );
}
