"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactRupiah, formatPercent } from "@/lib/utils/format";
import { SIGNAL_LABELS } from "../lib/screener-config";
import { useSwingScreener } from "../hooks/use-swing-screener";
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

function formatUpdatedAt(iso: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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

/* ── Page ── */

type SwingScreenerBreadcrumb = {
  label: string;
  href?: string;
  isHome?: boolean;
};

type SwingScreenerPageProps = {
  title?: string;
  description?: string;
  breadcrumbs?: SwingScreenerBreadcrumb[];
};

export default function SwingScreenerPage({
  title = "Swing Trade Screener",
  description = "Screener harian semua saham IDX — MA cross, RSI, MACD, volume breakout, dan akumulasi asing.",
  breadcrumbs = [
    { label: "Home", href: "/", isHome: true },
    { label: "Tools", href: "/tools" },
    { label: "Swing Screener" },
  ],
}: SwingScreenerPageProps) {
  const { payload, loading, error, reload } = useSwingScreener();
  const [filter, setFilter] = useState<"passed" | "all">("passed");

  const rows = useMemo(() => {
    const results = payload?.results ?? [];
    return filter === "passed"
      ? results.filter((r) => r.passed)
      : results;
  }, [payload, filter]);

  const infoItems = [
    {
      title: "Apa itu Swing Trade Screener?",
      content:
        "Screener otomatis yang mengevaluasi semua saham IDX setiap hari kerja. Data harga diambil dari IDX API, disimpan sebagai histori OHLC di Turso, lalu indikator teknikal dihitung dan hasilnya di-cache di Redis.",
    },
    {
      title: "Kriteria screening apa yang dipakai?",
      content:
        "Setiap saham diberi skor 0-6 berdasarkan signal: MA20 > MA50 (bullish), golden cross MA20/MA50, RSI(14) di rentang 50-75, MACD di atas signal line, volume breakout (volume >= 1.5x rata-rata 20 hari), dan akumulasi asing (foreign net 5 hari > 0). Saham dengan skor >= 3 dianggap lolos.",
    },
    {
      title: "Seberapa sering data di-update?",
      content:
        "Pipeline berjalan otomatis lewat Vercel Cron setiap hari kerja (Senin-Jumat) pukul 17:00 WIB setelah pasar tutup. Halaman ini hanya membaca hasil terakhir dari Redis — tidak pernah request ke IDX saat runtime.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        tags={["Analisis"]}
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 text-center text-sm text-muted">
          <p className="font-semibold text-foreground">Terjadi kesalahan</p>
          <p className="mt-1">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => reload()}
          >
            Coba lagi
          </Button>
        </div>
      ) : !payload?.available ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center">
          <p className="text-lg font-semibold text-foreground">
            Data belum tersedia
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {payload?.message ??
              "Cron screener belum pernah berjalan. Pipeline otomatis mengisi data setiap hari kerja pukul 17:00 WIB."}
          </p>
          <Button variant="outline" className="mt-5" onClick={() => reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat ulang
          </Button>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Universe", String(payload.summary?.universeSize ?? 0), "saham"],
              ["Screened", String(payload.summary?.screened ?? 0), "saham"],
              ["Lolos", String(payload.summary?.passed ?? 0), "saham"],
              [
                "Updated",
                formatUpdatedAt(payload.updatedAt),
                "WIB",
              ],
            ].map(([label, value, suffix]) => (
              <div
                key={label}
                className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-soft)"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  {label}
                </p>
                <p className="mt-1 truncate text-lg font-semibold text-foreground">
                  {value}{" "}
                  <span className="text-xs font-normal text-muted">
                    {suffix}
                  </span>
                </p>
              </div>
            ))}
          </div>

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

          <Accordion items={infoItems} defaultOpen={0} />
        </>
      )}
    </div>
  );
}
