"use client";

import { FormEvent, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ChartData } from "@/features/chart/types";
import {
  formatDateTimeShort,
  formatIDR,
  formatPercentSigned,
} from "@/features/chart/utils";

type Props = {
  symbol: string;
  symbolInput: string;
  setSymbolInput: (value: string) => void;
  onSubmitSymbol: (symbol: string) => void;
  data: ChartData | null;
  loading: boolean;
  isPositive: boolean;
};

export function PriceHeader({
  symbol,
  symbolInput,
  setSymbolInput,
  onSubmitSymbol,
  data,
  loading,
  isPositive,
}: Props) {
  const [starred, setStarred] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitSymbol(symbolInput);
  };

  const changeColor = isPositive ? "text-emerald-500" : "text-red-500";

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-soft) sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
              placeholder="BBRI"
              maxLength={12}
              className="w-32 rounded-lg border border-(--border) bg-(--surface-strong) px-3 py-1.5 text-xl font-bold uppercase tracking-tight text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring) sm:text-2xl"
            />
            <button
              type="submit"
              className="rounded-lg bg-(--foreground) px-3 py-1.5 text-xs font-semibold text-(--background) transition hover:opacity-90"
            >
              Go
            </button>
          </form>

          <p className="truncate text-sm text-muted">
            {data?.profile.longName ?? (loading ? "Memuat…" : "-")}
          </p>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
              {formatIDR(data?.quote.price ?? null)}
            </span>
            <span className={cn("text-sm font-semibold tabular-nums", changeColor)}>
              {formatPercentSigned(data?.quote.change ?? null, 2).replace(
                "%",
                "",
              )}{" "}
              ({formatPercentSigned(data?.quote.changePercent ?? null, 2)})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full border border-(--border) bg-(--surface-strong) px-2.5 py-1 font-medium uppercase tracking-wide">
              {data?.quote.marketState ?? "-"}
            </span>
            <span>{formatDateTimeShort(data?.quote.regularMarketTime)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setStarred((v) => !v)}
            aria-label="Toggle watchlist"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) transition hover:bg-(--surface)",
              starred ? "text-amber-400" : "text-muted",
            )}
          >
            <Star className="h-5 w-5" fill={starred ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">Kode: {symbol}.JK</p>
    </div>
  );
}
