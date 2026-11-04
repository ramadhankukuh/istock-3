"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type {
  MacroHistoryPayload,
  MacroHistoryPoint,
} from "@/features/explore/types";

function formatPercent(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatAxisLabel(period: string) {
  if (period.includes("Q")) {
    return period;
  }

  const [year, month, day] = period.split("-");

  if (year && month && day) {
    return `${day}/${month}`;
  }

  if (year && month) {
    return `${month}/${year.slice(2)}`;
  }

  return period;
}

function formatDisplayDate(period: string) {
  const parts = period.split("-");

  // Year-only format: YYYY (used by Debt to PDP)
  if (parts.length === 1) {
    const year = Number(parts[0]);
    if (Number.isFinite(year)) {
      return String(year);
    }
    return period;
  }

  // Month-year format: YYYY-M (used by BI Rate and Inflasi)
  if (parts.length === 2) {
    const [year, month] = parts;
    const parsedMonth = Number(month);
    if (Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      const date = new Date(Number(year), parsedMonth - 1, 1);
      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("id-ID", {
          month: "short",
          year: "numeric",
        }).format(date);
      }
    }
    return period;
  }

  const parsed = new Date(period);

  if (Number.isNaN(parsed.getTime())) {
    return period;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getYearFromPeriod(period: string): number | null {
  // Extract the first 4-digit number from the period string
  // Supports formats: "2026-Q2", "2025 Q4", "2026-6", "2026-06-11"
  const match = period.match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
}

function findPreviousYearPoint(
  points: MacroHistoryPoint[],
): MacroHistoryPoint | null {
  if (points.length < 2) return null;

  const latest = points[points.length - 1];
  const latestYear = getYearFromPeriod(latest.period);
  if (!latestYear) return null;

  const prevYear = latestYear - 1;

  // Find the last (most recent) data point from the previous calendar year
  const prevYearPoints = points.filter(
    (p) => getYearFromPeriod(p.period) === prevYear,
  );

  return prevYearPoints.length > 0
    ? prevYearPoints[prevYearPoints.length - 1]
    : null;
}

export default function MacroHistoryPanel({
  history,
  isLoading,
  error,
  onClose,
}: {
  history: MacroHistoryPayload | null;
  isLoading: boolean;
  error: string | null;
  onClose?: () => void;
}) {
  const points = history?.points ?? [];
  const latestPoint = points.at(-1);
  const previousYearPoint = findPreviousYearPoint(points);
  const minPoint = points.reduce<null | { period: string; value: number }>(
    (current, point) =>
      !current || point.value < current.value || point.value === current.value
        ? point
        : current,
    null,
  );
  const maxPoint = points.reduce<null | { period: string; value: number }>(
    (current, point) =>
      !current || point.value > current.value || point.value === current.value
        ? point
        : current,
    null,
  );
  const isBiRate = history?.key === "bi-rate";
  const [periodFilter, setPeriodFilter] = useState("All");
  const periodOptions = ["1M", "6M", "1Y", "3Y", "5Y", "All"];
  const chartPoints = (() => {
    if (periodFilter === "All") return points;
    const sizes: Record<string, number> = {
      "1M": 1,
      "6M": 6,
      "1Y": 12,
      "3Y": 36,
      "5Y": 60,
    };
    return points.slice(-(sizes[periodFilter] ?? points.length));
  })();
  const chartLatestPoint = chartPoints.at(-1);
  const chartMaxPoint = chartPoints.reduce<MacroHistoryPoint | null>(
    (current, point) => (!current || point.value >= current.value ? point : current),
    null,
  );
  const chartMinPoint = chartPoints.reduce<MacroHistoryPoint | null>(
    (current, point) => (!current || point.value <= current.value ? point : current),
    null,
  );

  return (
    <div
      className={cn(
        "min-h-dvh overflow-hidden bg-background text-foreground sm:min-h-0 sm:rounded-[2.25rem] sm:border sm:border-(--border)",
      )}
    >
      <div className="space-y-5 px-4 pb-5 pt-6 sm:px-6 sm:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              {history?.label ?? "Histori Makro"}
            </h3>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 sm:text-sm">
              {history
                ? isBiRate
                  ? "Data Historis 2016 – 2026"
                  : history.description
                : "Pilih indikator makro untuk melihat histori data."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="focus-ring z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border) bg-transparent text-foreground hover:bg-transparent"
            aria-label="Tutup card visualisasi"
          >
            <X className="size-5 stroke-[2.5]" aria-hidden />
          </button>
        </div>

        {!isLoading && !error && points.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Terkini", point: latestPoint, tone: "text-teal-500" },
              { label: "Tahun Lalu", point: previousYearPoint, tone: "text-slate-500" },
              { label: "Tertinggi", point: maxPoint, tone: "text-amber-500", arrow: "↑" },
              { label: "Terendah", point: minPoint, tone: "text-rose-500", arrow: "↓" },
            ].map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-2xl border border-slate-200 bg-transparent p-4 dark:border-slate-800"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {stat.point?.value.toFixed(2).replace(".", ",") ?? "-"}
                <span className={cn("ml-1 text-base font-semibold", stat.tone)}>%</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {stat.point ? formatDisplayDate(stat.point.period) : "-"}
              </p>
              {stat.arrow ? (
                <span className={cn(
                  "absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-lg font-bold",
                  stat.label === "Tertinggi"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-rose-100 text-rose-500",
                )}>
                  {stat.arrow}
                </span>
              ) : null}
            </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-5 px-4 pb-6 sm:px-6">
        {isLoading ? (
          <div className="h-72 animate-pulse rounded-none border border-(--border) sm:rounded-[1.75rem]" />
        ) : error ? (
          <div className="h-72 rounded-none border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-300 sm:rounded-[1.75rem]">
            {error}
          </div>
        ) : !history || history.points.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-none border border-(--border) p-4 text-sm text-muted sm:rounded-[1.75rem]">
            Data histori belum tersedia.
          </div>
        ) : (
          <div className="space-y-4">
            <div             className="flex items-center justify-between rounded-xl border border-(--border) p-1">
              {periodOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPeriodFilter(option)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium text-muted transition sm:px-5",
                    periodFilter === option && "border border-(--border) font-bold text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-transparent p-4 dark:border-slate-800 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Tren Pergerakan Suku Bunga</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Persentase (%) per periode rilis</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                  2016 – 2026
                </span>
              </div>
            <div className="relative h-80 overflow-hidden">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient
                      id="macro-history-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#14b8a6"
                        stopOpacity={0.42}
                      />
                      <stop
                        offset="100%"
                        stopColor="#14b8a6"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.18)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tickFormatter={formatAxisLabel}
                    minTickGap={20}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickFormatter={(value: number) => formatPercent(value)}
                    width={58}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    labelFormatter={(label) =>
                      `Periode: ${formatDisplayDate(String(label))}`
                    }
                    formatter={(value) => [
                      formatPercent(Number(value ?? 0)),
                      "Nilai",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.94)",
                      border: "1px solid rgba(148, 163, 184, 0.22)",
                      color: "#e2e8f0",
                      borderRadius: 18,
                      boxShadow: "0 24px 60px rgba(2, 6, 23, 0.32)",
                    }}
                    cursor={{
                      stroke: "rgba(20, 184, 166, 0.25)",
                      strokeWidth: 1,
                    }}
                  />
                  {chartMinPoint ? (
                    <ReferenceLine
                      y={chartMinPoint.value}
                      stroke="rgba(148, 163, 184, 0.18)"
                      strokeDasharray="4 4"
                    />
                  ) : null}
                  {chartLatestPoint ? (
                    <ReferenceDot
                      x={chartLatestPoint.period}
                      y={chartLatestPoint.value}
                      r={6}
                      fill="#14b8a6"
                      stroke="#e2e8f0"
                      strokeWidth={2}
                    />
                  ) : null}
                  {chartMaxPoint ? (
                    <ReferenceDot
                      x={chartMaxPoint.period}
                      y={chartMaxPoint.value}
                      r={6}
                      fill="#f59e0b"
                      stroke="#e2e8f0"
                      strokeWidth={2}
                    />
                  ) : null}
                  {chartMinPoint ? (
                    <ReferenceDot
                      x={chartMinPoint.period}
                      y={chartMinPoint.value}
                      r={6}
                      fill="#ef4444"
                      stroke="#e2e8f0"
                      strokeWidth={2}
                    />
                  ) : null}
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    fill="url(#macro-history-fill)"
                    activeDot={{
                      r: 5,
                      stroke: "#14b8a6",
                      strokeWidth: 2,
                      fill: "#0f172a",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Tertinggi
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                Terendah
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                Terkini
              </span>
            </div>
            </div>
            {isBiRate ? (
              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Info className="size-5" aria-hidden />
                </span>
                <div className="text-sm">
                  <p className="font-bold text-slate-900 dark:text-slate-100">Catatan Kebijakan Moneter</p>
                  <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                    Suku bunga acuan BI-Rate ditetapkan untuk memperkuat stabilitas nilai tukar Rupiah dan memastikan inflasi tetap terkendali dalam sasaran.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
