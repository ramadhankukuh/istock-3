"use client";

import { Skeleton } from "@/components/ui/skeleton";
import TradingStyleChart from "@/features/stock-analysis/components/trading-style-chart";
import { ChartRangeTabs } from "@/features/chart/components/chart-range-tabs";
import { ChartStyleToggle } from "@/features/chart/components/chart-style-toggle";
import type { CandlePoint } from "@/features/stock-analysis/types";
import type {
  ChartRange,
  ChartStyle,
  HourlyResponse,
  IntradayResponse,
} from "@/features/chart/types";

type Props = {
  candles: CandlePoint[];
  dark: boolean;
  loading: boolean;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  style: ChartStyle;
  onStyleChange: (style: ChartStyle) => void;
  intraday: IntradayResponse | null;
  hourly: HourlyResponse | null;
  previousClose: number | null;
};

export function ChartPanel({
  candles,
  dark,
  loading,
  range,
  onRangeChange,
  style,
  onStyleChange,
  intraday,
  hourly,
  previousClose,
}: Props) {
  const hasData =
    candles.length > 0 ||
    (intraday?.points.length ?? 0) > 0 ||
    (hourly?.points.length ?? 0) > 0;

  return (
    <div className="space-y-3">
      {loading ? (
        <Skeleton className="h-100 w-full" />
      ) : hasData ? (
        <TradingStyleChart
          candles={candles}
          dark={dark}
          range={range}
          style={style}
          intraday={intraday?.points}
          intradayDate={intraday?.date ?? null}
          hourly={hourly?.points}
          previousClose={previousClose}
        />
      ) : (
        <div className="flex h-100 w-full items-center justify-center text-sm text-muted">
          Data chart belum tersedia.
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <ChartRangeTabs active={range} onChange={onRangeChange} />
        <ChartStyleToggle
          value={style}
          onChange={onStyleChange}
          range={range}
        />
      </div>
    </div>
  );
}
