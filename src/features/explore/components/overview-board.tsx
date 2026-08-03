"use client";

import { formatNumber } from "@/lib/utils/format";
import type { StockSummaryItem } from "@/features/explore/types";

export default function OverviewBoard({
  items,
}: {
  items: StockSummaryItem[];
}) {
  let advancing = 0;
  let unchanged = 0;
  let declining = 0;

  for (const item of items) {
    if (item.changePct > 0) advancing++;
    else if (item.changePct < 0) declining++;
    else unchanged++;
  }

  const totalStocks = items.length;
  const safePct = (val: number) =>
    totalStocks > 0 ? (val / totalStocks) * 100 : 0;

  const greenPct = safePct(advancing);
  const flatPct = safePct(unchanged);
  const redPct = safePct(declining);

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold">Stock Breadth</span>
        <span className="text-[11px] text-muted">
          {formatNumber(totalStocks)} saham tercatat
        </span>
      </div>

      {/* Individual bars: Naik / Tetap / Turun */}
      <div className="flex w-full items-start gap-3">
        <div className="min-w-0" style={{ width: `${Math.max(greenPct, 4)}%` }}>
          <p className="mb-1.5 text-center text-sm font-bold text-emerald-600">
            {advancing}
          </p>
          <div className="h-3 w-full rounded-full bg-emerald-500" />
          <p className="mt-1.5 text-center text-xs font-medium text-emerald-600">
            {greenPct.toFixed(1)}%
          </p>
        </div>
        <div className="min-w-0" style={{ width: `${Math.max(flatPct, 4)}%` }}>
          <p className="mb-1.5 text-center text-sm font-bold text-foreground">
            {unchanged}
          </p>
          <div className="h-3 w-full rounded-full bg-neutral-400" />
          <p className="mt-1.5 text-center text-xs font-medium text-muted">
            {flatPct.toFixed(1)}%
          </p>
        </div>
        <div className="min-w-0" style={{ width: `${Math.max(redPct, 4)}%` }}>
          <p className="mb-1.5 text-center text-sm font-bold text-red-600">
            {declining}
          </p>
          <div className="h-3 w-full rounded-full bg-red-500" />
          <p className="mt-1.5 text-center text-xs font-medium text-red-600">
            {redPct.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
