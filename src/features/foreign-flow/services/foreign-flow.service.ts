import { formatDateId } from "@/lib/utils/format";
import type {
  AggregateRow,
  DailyTopRank,
  StockHistoryPoint,
} from "@/features/foreign-flow/types";
import type { NetForeignPayload } from "@/features/foreign-flow/services/net-foreign.service";

export function getRankBadgeClass(rank: number | null, flowMode: string) {
  if (!rank) {
    return "bg-(--surface-strong) text-muted border-(--border)";
  }

  if (flowMode === "Distribusi") {
    if (rank <= 2) {
      return "bg-red-600 text-white border-red-700";
    }

    if (rank <= 4) {
      return "bg-red-500 text-white border-red-600";
    }

    if (rank <= 8) {
      return "bg-red-300 text-red-900 border-red-400";
    }

    return "bg-red-200 text-red-900 border-red-300";
  }

  if (rank <= 2) {
    return "bg-emerald-600 text-white border-emerald-700";
  }

  if (rank <= 4) {
    return "bg-emerald-500 text-white border-emerald-600";
  }

  if (rank <= 8) {
    return "bg-emerald-300 text-emerald-950 border-emerald-400";
  }

  return "bg-emerald-200 text-emerald-950 border-emerald-300";
}

export function getForeignGradientOffset(rows: StockHistoryPoint[]) {
  if (!rows.length) return 0.5;

  let max = Number.NEGATIVE_INFINITY;
  let min = Number.POSITIVE_INFINITY;

  for (const row of rows) {
    const value = Number(row.totalForeignNet) || 0;
    if (value > max) max = value;
    if (value < min) min = value;
  }

  if (max <= 0) return 0;
  if (min >= 0) return 1;
  return max / (max - min);
}

export function getClosePriceDomain(
  rows: StockHistoryPoint[],
): [number, number] {
  if (!rows.length) return [0, 1];

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const row of rows) {
    const value = Number(row.close) || 0;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.03, 50);
    const lower = Math.max(0, min - pad);
    return [Math.floor(lower / 50) * 50, Math.ceil((max + pad) / 50) * 50];
  }

  const spread = max - min;
  const pad = Math.max(spread * 0.08, 50);
  const lower = Math.max(0, min - pad);
  const upper = max + pad;

  return [Math.floor(lower / 50) * 50, Math.ceil(upper / 50) * 50];
}

export function computeAggregateRows(visibleData: NetForeignPayload["data"]) {
  const map = new Map<string, { total: number }>();

  for (const dayData of visibleData) {
    for (const item of dayData.stocks ?? []) {
      const current = map.get(item.stockCode) ?? { total: 0 };
      current.total += Number(item.totalForeignNet) || 0;
      map.set(item.stockCode, current);
    }
  }

  return Array.from(map.entries())
    .map(([stockCode, value]) => ({ stockCode, totalForeignNet: value.total }))
    .sort((left, right) => right.totalForeignNet - left.totalForeignNet);
}

export function computeDisplayRows(
  aggregateRows: AggregateRow[],
  flowMode: "Akumulasi" | "Distribusi",
) {
  if (flowMode === "Akumulasi") {
    return aggregateRows.filter((row) => row.totalForeignNet > 0);
  }

  return [...aggregateRows]
    .filter((row) => row.totalForeignNet < 0)
    .sort((left, right) => left.totalForeignNet - right.totalForeignNet);
}

export function computeStockHistoryByCode(
  visibleData: NetForeignPayload["data"],
) {
  const map = new Map<string, StockHistoryPoint[]>();

  for (let index = visibleData.length - 1; index >= 0; index -= 1) {
    const dayData = visibleData[index];
    const dateLabel = formatDateId(dayData.date);

    for (const item of dayData.stocks ?? []) {
      const rows = map.get(item.stockCode) ?? [];
      rows.push({
        date: dateLabel,
        close: Number(item.close) || 0,
        totalForeignNet: Number(item.totalForeignNet) || 0,
      });
      map.set(item.stockCode, rows);
    }
  }

  return map;
}

export function computeDailyTopRanks(visibleData: NetForeignPayload["data"]) {
  const ordered = [...visibleData].reverse();

  return ordered.map((dayData) => {
    const stocks = (dayData.stocks ?? []).map((item) => ({
      stockCode: item.stockCode,
      totalForeignNet: Number(item.totalForeignNet) || 0,
    }));

    const buyRankMap = new Map<string, number>();
    const sellRankMap = new Map<string, number>();

    stocks
      .filter((item) => item.totalForeignNet > 0)
      .sort((left, right) => right.totalForeignNet - left.totalForeignNet)
      .slice(0, 30)
      .forEach((item, index) => buyRankMap.set(item.stockCode, index + 1));

    stocks
      .filter((item) => item.totalForeignNet < 0)
      .sort((left, right) => left.totalForeignNet - right.totalForeignNet)
      .slice(0, 30)
      .forEach((item, index) => sellRankMap.set(item.stockCode, index + 1));

    return {
      date: formatDateId(dayData.date),
      buyRankMap,
      sellRankMap,
    } as DailyTopRank;
  });
}

export function computeTopLists(aggregateRows: AggregateRow[]) {
  const topAccumulators = aggregateRows
    .filter((row) => row.totalForeignNet > 0)
    .slice(0, 3);
  const topDistributors = [...aggregateRows]
    .filter((row) => row.totalForeignNet < 0)
    .slice(0, 3);

  return { topAccumulators, topDistributors };
}
