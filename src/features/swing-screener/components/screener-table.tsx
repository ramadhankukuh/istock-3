"use client";

import { useMemo, useState } from "react";
import { formatCompactRupiah, formatPercent } from "@/lib/utils/format";
import { SIGNAL_LABELS } from "../lib/screener-config";
import type { SwingScreenerResult } from "../types";

/* ── Helpers ── */

function formatNum(value: number | null, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatRatio(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${formatNum(value, 2)}x`;
}

function changeClass(value: number | null): string {
  if (value == null) return "text-muted";
  if (value > 0) return "text-green-600 dark:text-green-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-muted";
}

function rsiClass(value: number | null): string {
  if (value == null) return "text-muted";
  if (value >= 70) return "text-red-600 dark:text-red-400";
  if (value >= 55) return "text-green-600 dark:text-green-400";
  if (value >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

const maStateMeta: Record<
  string,
  { label: string; title: string; className: string }
> = {
  "golden-cross": {
    label: "GC",
    title: "Golden cross",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  "death-cross": {
    label: "DC",
    title: "Death cross",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  above: {
    label: "Bull",
    title: "MA20 > MA50",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  below: {
    label: "Bear",
    title: "MA20 < MA50",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  none: {
    label: "-",
    title: "Data kurang",
    className: "bg-(--surface-strong) text-muted",
  },
};

/* ── Table row ── */

function Row({ row }: { row: SwingScreenerResult }) {
  const ma = maStateMeta[row.maState] ?? maStateMeta.none;

  return (
    <tr className="border-b border-(--border) transition-colors hover:bg-(--surface-strong)">
      <td className="sticky left-0 z-10 bg-(--surface) p-3 font-semibold text-foreground">
        {row.ticker}
      </td>
      <td className="p-3 text-right tabular-nums">
        {row.close != null ? formatCompactRupiah(row.close) : "-"}
      </td>
      <td className={`p-3 text-right tabular-nums ${changeClass(row.changePct)}`}>
        {row.changePct != null ? formatPercent(row.changePct) : "-"}
      </td>
      <td className={`p-3 text-right tabular-nums ${rsiClass(row.rsi14)}`}>
        {row.rsi14 != null ? formatNum(row.rsi14, 0) : "-"}
      </td>
      <td className="p-3 text-center">
        <span
          title={ma.title}
          className={`inline-flex min-w-12 items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ma.className}`}
        >
          {ma.label}
        </span>
      </td>
      <td
        className={`p-3 text-right tabular-nums ${
          row.macd != null && row.macd > 0
            ? "text-green-600 dark:text-green-400"
            : row.macd != null && row.macd < 0
              ? "text-red-600 dark:text-red-400"
              : "text-muted"
        }`}
      >
        {row.macd != null ? formatNum(row.macd) : "-"}
      </td>
      <td className="p-3 text-right tabular-nums">
        {formatRatio(row.volumeRatio)}
      </td>
      <td
        className={`p-3 text-right tabular-nums ${
          row.foreignNet5d != null && row.foreignNet5d > 0
            ? "text-green-600 dark:text-green-400"
            : row.foreignNet5d != null && row.foreignNet5d < 0
              ? "text-red-600 dark:text-red-400"
              : "text-muted"
        }`}
      >
        {row.foreignNet5d != null ? formatCompactRupiah(row.foreignNet5d) : "-"}
      </td>
      <td className="p-3 text-center">
        <span
          className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ${
            row.passed
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "bg-(--surface-strong) text-muted"
          }`}
        >
          {row.score}
        </span>
      </td>
      <td className="p-3">
        <div className="flex max-w-64 flex-wrap gap-1">
          {row.signals.length > 0 ? (
            row.signals.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-md border border-(--border) bg-(--surface-strong) px-2 py-0.5 text-[10px] font-medium text-muted"
              >
                {SIGNAL_LABELS[s] ?? s}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted">-</span>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── Table ── */

/**
 * Tabel hasil screener lengkap dengan filter "Lolos screening" / "Semua saham".
 * Dipakai di halaman /swing-trade maupun preview di /explore.
 */
export function ScreenerTable({
  results,
}: {
  results: SwingScreenerResult[];
}) {
  const [filter, setFilter] = useState<"passed" | "all">("passed");

  const rows = useMemo(
    () => (filter === "passed" ? results.filter((r) => r.passed) : results),
    [results, filter],
  );

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              ["passed", "Lolos screening"],
              ["all", "Semua saham"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
                  : "rounded-full border border-(--border) bg-(--surface-strong) px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">
          {rows.length} saham ditampilkan
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
        <table className="w-full text-sm">
          <thead className="bg-(--surface-strong) text-xs text-muted">
            <tr>
              <th className="sticky left-0 z-10 bg-(--surface-strong) p-3 text-left">
                Ticker
              </th>
              <th className="p-3 text-right">Close</th>
              <th className="p-3 text-right">Chg%</th>
              <th className="p-3 text-right">RSI 14</th>
              <th className="p-3 text-center">MA</th>
              <th className="p-3 text-right">MACD</th>
              <th className="p-3 text-right">Vol</th>
              <th className="p-3 text-right">Asing 5H</th>
              <th className="p-3 text-center">Skor</th>
              <th className="p-3 text-left">Signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => <Row key={row.ticker} row={row} />)
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="p-10 text-center text-sm text-muted"
                >
                  {filter === "passed"
                    ? "Belum ada saham yang lolos screening."
                    : "Tidak ada data."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
