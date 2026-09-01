import { formatRupiah, formatPercent } from "@/lib/utils/format";
import type { TradeSetup } from "../types";

/**
 * Card ringkasan setup swing trade: BOW / TP1 / TP2 / SL.
 *
 * Format teks persis:
 *   {ticker}
 *   Buy on weakness : Rp {bow}
 *   TP 1 : Rp {tp1} (+{tp1Pct}%)
 *   TP 2 : Rp {tp2} (+{tp2Pct}%)
 *   SL : Rp {sl} ({slPct}%)
 *
 * `formatPercent` sudah handle prefix +/-; baris TP 2 disembunyikan kalau null.
 */
export function TradeSetupPanel({
  ticker,
  setup,
}: {
  ticker: string;
  setup: TradeSetup;
}) {
  return (
    <div className="space-y-1.5 rounded-2xl border border-(--border) bg-(--surface) p-4">
      <p className="text-base font-semibold text-foreground">{ticker}</p>
      <Row label="Buy on weakness" value={formatRupiah(setup.buyOnWeakness)} />
      <Row
        label="TP 1"
        value={`${formatRupiah(setup.tp1)} (${formatPercent(setup.tp1Pct)})`}
        className="text-green-600 dark:text-green-400"
      />
      {setup.tp2 != null && setup.tp2Pct != null && (
        <Row
          label="TP 2"
          value={`${formatRupiah(setup.tp2)} (${formatPercent(setup.tp2Pct)})`}
          className="text-green-600 dark:text-green-400"
        />
      )}
      <Row
        label="SL"
        value={`${formatRupiah(setup.sl)} (${formatPercent(setup.slPct)})`}
        className="text-red-600 dark:text-red-400"
      />
    </div>
  );
}

function Row({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <p className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-medium tabular-nums ${className}`}>{value}</span>
    </p>
  );
}
