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
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
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
          month: "long",
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
    month: "long",
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

  return (
    <div
      className={cn(
        "min-h-dvh overflow-hidden rounded-none border-0 shadow-none backdrop-blur-3xl sm:min-h-0 sm:rounded-[2.25rem] sm:border sm:border-white/14 sm:shadow-[0_30px_90px_rgba(15,23,42,0.18)]",
        "bg-background",
      )}
    >
      <div className="space-y-5 border-b border-white/10 bg-transparent px-4 pb-5 pt-6 sm:px-6 sm:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-semibold sm:text-3xl">
              {history?.label ?? "Histori Makro"}
            </h3>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted sm:text-sm">
              {history
                ? isBiRate
                  ? `Data Historis 2016 - ${formatDisplayDate(history.points.at(-1)?.period ?? "")}`
                  : history.description
                : "Pilih indikator makro untuk melihat histori data."}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-11 w-11 shrink-0 rounded-full border border-white/12 bg-white/15 p-0 text-lg text-foreground backdrop-blur-xl hover:bg-white/24"
            aria-label="Tutup card visualisasi"
          >
            X
          </Button>
        </div>

        {!isLoading && !error && points.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-[1.4rem] border border-white/12 bg-(--surface) p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Terkini
              </p>
              <p className="mt-1 text-lg font-semibold sm:text-xl">
                {formatPercent(latestPoint?.value ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {latestPoint ? formatDisplayDate(latestPoint.period) : "-"}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/12 bg-(--surface) p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Tahun Lalu
              </p>
              <p className="mt-1 text-lg font-semibold sm:text-xl">
                {formatPercent(previousYearPoint?.value ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {previousYearPoint
                  ? formatDisplayDate(previousYearPoint.period)
                  : "-"}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/12 bg-(--surface) p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Tertinggi
              </p>
              <p className="mt-1 text-lg font-semibold sm:text-xl">
                {formatPercent(maxPoint?.value ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {maxPoint ? formatDisplayDate(maxPoint.period) : "-"}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/12 bg-(--surface) p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Terendah
              </p>
              <p className="mt-1 text-lg font-semibold sm:text-xl">
                {formatPercent(minPoint?.value ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {minPoint ? formatDisplayDate(minPoint.period) : "-"}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-5 px-0 pb-0 sm:px-0 sm:pb-0">
        {isLoading ? (
          <div className="h-72 animate-pulse rounded-none bg-white/10 sm:rounded-[1.75rem]" />
        ) : error ? (
          <div className="h-72 rounded-none border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-300 sm:rounded-[1.75rem]">
            {error}
          </div>
        ) : !history || history.points.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-none border border-white/12 bg-white/8 p-4 text-sm text-muted backdrop-blur-xl sm:rounded-[1.75rem]">
            Data histori belum tersedia.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-96 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-6 top-6 h-20 rounded-full bg-emerald-400/10 blur-3xl" />

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.points} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
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
                  {minPoint ? (
                    <ReferenceLine
                      y={minPoint.value}
                      stroke="rgba(148, 163, 184, 0.18)"
                      strokeDasharray="4 4"
                    />
                  ) : null}
                  {latestPoint ? (
                    <ReferenceDot
                      x={latestPoint.period}
                      y={latestPoint.value}
                      r={6}
                      fill="#14b8a6"
                      stroke="#e2e8f0"
                      strokeWidth={2}
                    />
                  ) : null}
                  {maxPoint ? (
                    <ReferenceDot
                      x={maxPoint.period}
                      y={maxPoint.value}
                      r={6}
                      fill="#f59e0b"
                      stroke="#e2e8f0"
                      strokeWidth={2}
                    />
                  ) : null}
                  {minPoint ? (
                    <ReferenceDot
                      x={minPoint.period}
                      y={minPoint.value}
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

            <div className="flex flex-wrap items-center gap-4 pl-6 text-sm font-medium text-muted">
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

            <div className="mx-4 mb-4 space-y-3 rounded-[1.6rem] border border-white/12 bg-(--surface) p-4 backdrop-blur-xl sm:mx-6 sm:mb-6">
              <CardDescription className="text-sm leading-relaxed text-muted sm:text-base">
                {history.description}
              </CardDescription>
              <Button
                type="button"
                onClick={onClose}
                className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90 sm:w-auto sm:px-6"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
