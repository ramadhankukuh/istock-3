"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CandlePoint } from "@/features/stock-analysis/types";
import type { ChartData, ChartRange } from "@/features/chart/types";
import { StockLogo } from "@/features/chart/components/stock-logo";
import { StockSearch } from "@/features/chart/components/stock-search";
import {
  RANGE_LABELS,
  formatDateTimeShort,
  formatIDR,
  formatNumber,
  formatPercentSigned,
  getRangeChange,
} from "@/features/chart/utils";

type Props = {
  symbol: string;
  onSubmitSymbol: (symbol: string) => void;
  data: ChartData | null;
  loading: boolean;
  range: ChartRange;
  candles: CandlePoint[];
};

export function PriceHeader({
  symbol,
  onSubmitSymbol,
  data,
  loading,
  range,
  candles,
}: Props) {
  const price = data?.quote.price ?? null;

  // Saat loading (awal muat / ganti simbol) tampilkan skeleton, supaya tidak
  // menampilkan nama/harga dari simbol lama.
  const showSkeleton = loading;

  // Delta mengikuti range aktif: 1D pakai data quote, sisanya hitung dari
  // candle awal range (getRangeChange).
  const rangeChange =
    range === "1D"
      ? {
          change: data?.quote.change ?? null,
          changePercent: data?.quote.changePercent ?? null,
        }
      : getRangeChange(candles, price, range);

  const isUp = (rangeChange.change ?? 0) >= 0;
  const changeColor = isUp ? "text-emerald-500" : "text-red-500";

  return (
    <div className="space-y-3">
      {/* Baris 1: pencarian saham (selalu placeholder, tanpa teks ticker) */}
      <StockSearch onSubmit={onSubmitSymbol} />

      {/* Baris 2: ticker + nama perusahaan (jadi satu, tidak terpisah) */}
      <div>
        <p className="text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
          {symbol}
        </p>
        {showSkeleton ? (
          <Skeleton className="mt-1 h-4 w-52 sm:w-64" />
        ) : (
          <p className="truncate text-sm text-muted">
            {data?.profile.longName ?? "-"}
          </p>
        )}
      </div>

      {/* Baris 3: harga + perubahan, logo sejajar di kanan */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-baseline gap-3">
            {showSkeleton ? (
              <Skeleton className="h-10 w-40 sm:h-12 sm:w-48" />
            ) : (
              <span className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                {formatIDR(price)}
              </span>
            )}
          </div>

          {/* Delta + label range aktif */}
          <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold tabular-nums">
            {showSkeleton ? (
              <Skeleton className="h-4 w-36" />
            ) : rangeChange.change !== null &&
              rangeChange.changePercent !== null ? (
              <>
                {isUp ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={changeColor}>
                  {formatNumber(Math.abs(rangeChange.change), 2)}{" "}
                  {formatPercentSigned(rangeChange.changePercent, 2)}
                </span>
                <span className="font-medium text-muted">
                  {RANGE_LABELS[range]}
                </span>
              </>
            ) : (
              <span className="text-muted">-</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {showSkeleton ? (
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
          ) : (
            <StockLogo symbol={symbol} size={56} />
          )}
        </div>
      </div>

      {/* Baris 4: tag badges — sektor + market state + waktu */}
      {showSkeleton ? (
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {data?.profile.sector ? (
            <span className="rounded-full border border-(--border) bg-(--surface-strong) px-2.5 py-1 font-medium uppercase tracking-wide">
              {data.profile.sector}
            </span>
          ) : null}
          {data?.profile.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-(--border) bg-(--surface-strong) px-2.5 py-1 font-medium uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
          <span className="rounded-full border border-(--border) bg-(--surface-strong) px-2.5 py-1 font-medium uppercase tracking-wide">
            {data?.quote.marketState ?? "-"}
          </span>
          <span>{formatDateTimeShort(data?.quote.regularMarketTime)}</span>
        </div>
      )}
    </div>
  );
}
