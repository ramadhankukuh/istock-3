"use client";

import TradingStyleChart from "@/features/stock-analysis/components/trading-style-chart";
import type { CandlePoint } from "@/features/stock-analysis/types";

type Props = {
  candles: CandlePoint[];
  dark: boolean;
  loading: boolean;
};

export function ChartPanel({ candles, dark, loading }: Props) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-3 shadow-(--shadow-soft) sm:p-4">
      {loading ? (
        <div className="flex h-130 w-full items-center justify-center text-sm text-muted">
          Memuat chart…
        </div>
      ) : candles.length > 0 ? (
        <TradingStyleChart candles={candles} dark={dark} />
      ) : (
        <div className="flex h-130 w-full items-center justify-center text-sm text-muted">
          Data chart belum tersedia.
        </div>
      )}
    </div>
  );
}
