"use client";

import { CandlestickChart, LineChart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ChartStyle } from "@/features/chart/types";

type Props = {
  value: ChartStyle;
  onChange: (style: ChartStyle) => void;
};

/**
 * Toggle gaya chart (Line / Candle) — grup pill, item aktif punya background
 * berbeda. Range 1D kini mendukung candlestick (data intraday 15 menit sudah
 * menyertakan OHLC), jadi kedua tombol selalu aktif.
 */
export function ChartStyleToggle({ value, onChange }: Props) {
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
        onClick={() => onChange("candle")}
        title="Candlestick chart"
        aria-label="Tampilan candlestick"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition",
          value === "candle"
            ? "bg-(--accent) text-(--accent-foreground)"
            : "text-muted hover:text-foreground",
        )}
      >
        <CandlestickChart className="h-4 w-4" />
      </button>
    </div>
  );
}
