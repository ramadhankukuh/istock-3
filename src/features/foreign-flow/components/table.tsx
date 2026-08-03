"use client";

import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  getRankBadgeClass,
  getForeignGradientOffset,
  getClosePriceDomain,
} from "@/features/foreign-flow/services/foreign-flow.service";
import ForeignChart from "./chart";
import type {
  AggregateRow,
  StockHistoryPoint,
  DailyTopRank,
  FlowMode,
} from "@/features/foreign-flow/types";

type ChartColors = Record<string, string>;

export default function ForeignTable({
  loading,
  displayRows,
  expandedStockCode,
  toggleStockDetail,
  stockHistoryByCode,
  dailyTopRanks,
  chartColors,
  flowMode,
}: {
  loading: boolean;
  displayRows: AggregateRow[];
  expandedStockCode: string | null;
  toggleStockDetail: (code: string) => void;
  stockHistoryByCode: Map<string, StockHistoryPoint[]>;
  dailyTopRanks: DailyTopRank[];
  chartColors: ChartColors;
  flowMode: FlowMode;
}) {
  return (
    <Card className="overflow-hidden border-(--border) bg-(--surface)">
      <CardContent className="overflow-x-auto p-0">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-(--surface-strong)">
            <tr>
              {[
                "Rank",
                "Ticker",
                "Net Foreign",
                "Rank Harian (1-30)",
                "Detail",
              ].map((head) => (
                <th
                  key={head}
                  className="border-b border-(--border) p-3 text-left font-semibold text-muted whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr
                  key={`loading-${index}`}
                  className="border-b border-(--border)"
                >
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <td key={`loading-${index}-${cellIndex}`} className="p-3">
                      <div className="h-4 w-full animate-pulse rounded bg-(--surface-strong)" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayRows.length ? (
              displayRows
                .slice(0, 30)
                .map((row: AggregateRow, index: number) => {
                  const isExpanded = expandedStockCode === row.stockCode;
                  const historyRows =
                    stockHistoryByCode.get(row.stockCode) ?? [];
                  const foreignGradientOffset =
                    getForeignGradientOffset(historyRows);
                  const closePriceDomain = getClosePriceDomain(historyRows);
                  const foreignGradientId = `foreign-line-${row.stockCode}`;
                  const dailyRanks = dailyTopRanks.map((day) => {
                    const rank =
                      day.buyRankMap.get(row.stockCode) ??
                      day.sellRankMap.get(row.stockCode);
                    return { date: day.date, rank: rank ?? null };
                  });
                  const rank1to30 = dailyRanks.slice(0, 30);

                  return (
                    <Fragment key={row.stockCode}>
                      <tr
                        className="cursor-pointer border-b border-(--border) transition-colors hover:bg-(--surface-strong)"
                        onClick={() => toggleStockDetail(row.stockCode)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleStockDetail(row.stockCode);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Buka detail ${row.stockCode}`}
                      >
                        <td className="p-3 whitespace-nowrap text-foreground">
                          {index + 1}
                        </td>
                        <td className="p-3 whitespace-nowrap font-semibold text-foreground">
                          {row.stockCode}
                        </td>
                        <td
                          className={cn(
                            "p-3 whitespace-nowrap font-semibold",
                            row.totalForeignNet >= 0
                              ? "text-emerald-500"
                              : "text-red-500",
                          )}
                        >
                          {formatNumberCompact(row.totalForeignNet)}
                        </td>
                        <td className="p-3">
                          <div className="flex min-w-max items-center gap-1.5">
                            {rank1to30.map(
                              (
                                entry: { date: string; rank: number | null },
                                rankIndex: number,
                              ) => (
                                <span
                                  key={`${row.stockCode}-${entry.date}-${rankIndex}`}
                                  title={`${entry.date}: ${entry.rank ?? "-"}`}
                                  className={cn(
                                    "inline-flex h-7 min-w-7 items-center justify-center rounded-lg border px-1 text-xs font-bold",
                                    getRankBadgeClass(entry.rank, flowMode),
                                  )}
                                >
                                  {entry.rank ?? "-"}
                                </span>
                              ),
                            )}
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <button
                            type="button"
                            aria-label={`Lihat detail ${row.stockCode}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleStockDetail(row.stockCode);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-(--surface-strong) text-foreground transition-colors hover:bg-(--surface)"
                          >
                            <ChevronDown
                              size={18}
                              className={isExpanded ? "rotate-180" : "rotate-0"}
                            />
                          </button>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="border-b border-(--border) bg-(--surface-strong)/60">
                          <td colSpan={5} className="p-4">
                            {historyRows.length ? (
                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-foreground">
                                  Visualisasi Net Foreign & Close:{" "}
                                  {row.stockCode}
                                </p>
                                <div className="h-64 w-full">
                                  <ForeignChart
                                    historyRows={historyRows}
                                    foreignGradientId={foreignGradientId}
                                    foreignGradientOffset={
                                      foreignGradientOffset
                                    }
                                    closePriceDomain={closePriceDomain}
                                    chartColors={chartColors}
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted">
                                Detail belum tersedia untuk saham ini.
                              </p>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted">
                  Tidak ada data untuk ditampilkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function formatNumberCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${Math.round(value / 1_000_000_000)}M`;
  if (abs >= 1_000_000) return `${Math.round(value / 1_000_000)}Jt`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
}
