"use client";

import {
  formatCompactId,
  formatPercent,
  formatRupiah,
} from "@/lib/utils/format";
import type { SwingScreenerResult, TradeSetup } from "../types";

function fmt(value: number | null, digits = 2) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

function maTrend(result: SwingScreenerResult) {
  if (result.signals.maBullish) {
    return <BadgeTone tone="green">Bullish</BadgeTone>;
  }
  if (result.ma20 != null && result.ma50 != null) {
    return result.ma20 > result.ma50 ? (
      <BadgeTone tone="amber">Netral</BadgeTone>
    ) : (
      <BadgeTone tone="red">Bearish</BadgeTone>
    );
  }
  return <span className="text-xs text-muted">-</span>;
}

function BadgeTone({
  tone,
  children,
}: {
  tone: "green" | "red" | "amber";
  children: React.ReactNode;
}) {
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      : tone === "red"
        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";

  return (
    <span
      className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

const COLUMNS = 11;

export function ScreenerTable({
  results,
  showSetupButtons,
  onOpenSetup,
}: {
  results: SwingScreenerResult[];
  showSetupButtons: boolean;
  onOpenSetup: (ticker: string, setup: TradeSetup) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="rounded-4xl border border-(--border) bg-(--surface) p-10 text-center shadow-(--shadow)">
        <p className="text-sm text-muted">
          Belum ada data. Jalankan update screener dulu, atau tidak ada saham
          yang cocok di tab ini.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-4xl border border-(--border) bg-(--surface) shadow-(--shadow)">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-(--border) text-left text-xs uppercase tracking-[0.14em] text-muted">
            <th className="p-3">Ticker</th>
            <th className="p-3">Nama</th>
            <th className="p-3 text-right">Harga</th>
            <th className="p-3 text-right">%Chg</th>
            <th className="p-3 text-right">Volume</th>
            <th className="p-3 text-right">Vol R</th>
            <th className="p-3 text-right">RSI</th>
            <th className="p-3 text-right">MACD</th>
            <th className="p-3 text-center">MA</th>
            <th className="p-3 text-center">Score</th>
            <th className="p-3 text-center">Setup</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr
              key={row.ticker}
              className="border-b border-(--border) last:border-0 transition-colors hover:bg-(--surface-strong)/50"
            >
              <td className="p-3 font-semibold text-(--accent)">
                {row.ticker}
              </td>
              <td className="max-w-[220px] truncate p-3 text-muted">
                {row.name ?? "-"}
              </td>
              <td className="p-3 text-right font-medium tabular-nums">
                {formatRupiah(row.price)}
              </td>
              <td
                className={`p-3 text-right font-medium tabular-nums ${
                  row.changePct >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatPercent(row.changePct)}
              </td>
              <td className="p-3 text-right tabular-nums">
                {formatCompactId(row.volume)}
              </td>
              <td className="p-3 text-right tabular-nums">
                {row.volumeRatio != null
                  ? `${fmt(row.volumeRatio, 2)}x`
                  : "-"}
              </td>
              <td className="p-3 text-right tabular-nums">
                {fmt(row.rsi, 1)}
              </td>
              <td className="p-3 text-right tabular-nums">
                {fmt(row.macd, 2)}
              </td>
              <td className="p-3 text-center">{maTrend(row)}</td>
              <td className="p-3 text-center">
                <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-(--surface-strong) px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                  {row.score}/6
                </span>
              </td>
              <td className="p-3 text-center">
                {showSetupButtons && row.passed && row.tradeSetup ? (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSetup(row.ticker, row.tradeSetup!)
                    }
                    className="focus-ring rounded-full border border-(--border) bg-(--surface-strong) px-3 py-1 text-xs font-medium text-(--accent) transition hover:bg-foreground hover:text-background"
                  >
                    Lihat Setup
                  </button>
                ) : (
                  <span className="text-xs text-muted">-</span>
                )}
              </td>
            </tr>
          ))}
          {results.length === 0 && (
            <tr>
              <td colSpan={COLUMNS} className="p-10 text-center text-muted">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
