"use client";

import { CandlestickChart, LineChart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ChartRange, ChartStyle } from "@/features/chart/types";

type Props = {
  value: ChartStyle;
  onChange: (style: ChartStyle) => void;
  range: ChartRange;
};

/**
 * Toggle gaya chart (Line / Candle) — grup pill, item aktif punya background
 * berbeda. Untuk range 1D candle tidak tersedia (data intraday hanya price),
 * jadi tombol candle dinonaktifkan dengan tooltip penjelas.
 */
export function ChartStyleToggle({ value, onChange, range }: Props) {
  const candleDisabled = range === "1D";

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--surface-strong) p-1">
      <button
        type="button"
        onClick={() => onChange("line")}
        title="Line chart"
        aria-label="Tampilan garis"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition",
          value === "line"
            ? "bg-(--accent) text-(--accent-foreground)"
            : "text-muted hover:text-foreground",
        )}
      >
        <LineChart className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => !candleDisabled && onChange("candle")}
        title={
          candleDisabled
            ? "Candle tidak tersedia untuk 1D"
            : "Candlestick chart"
        }
        aria-label="Tampilan candlestick"
        disabled={candleDisabled}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition",
          value === "candle"
            ? "bg-(--accent) text-(--accent-foreground)"
            : "text-muted hover:text-foreground",
          candleDisabled && "cursor-not-allowed opacity-40 hover:text-muted",
        )}
      >
        <CandlestickChart className="h-4 w-4" />
      </button>
    </div>
  );
}
