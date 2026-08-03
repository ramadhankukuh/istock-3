import type { StockSummaryItem } from "@/features/explore/types";
import {
  formatCompactId,
  formatCompactRupiah,
  formatPercent,
} from "@/lib/utils/format";

function sortAndSlice<T>(items: T[], compare: (a: T, b: T) => number) {
  return [...items].sort(compare).slice(0, 5);
}

export function generateLeaderboards(items: StockSummaryItem[]) {
  const topValue = sortAndSlice(items, (l, r) => r.value - l.value).map(
    (item) => ({
      stockCode: item.stockCode,
      stockName: item.stockName,
      value: item.value,
      valueLabel: formatCompactRupiah(item.value),
    }),
  );

  const topGainer = sortAndSlice(
    items,
    (l, r) => r.changePct - l.changePct,
  ).map((item) => ({
    stockCode: item.stockCode,
    stockName: item.stockName,
    value: item.changePct,
    valueLabel: formatPercent(item.changePct),
    valueClassName: "text-emerald-500",
  }));

  const topLoser = sortAndSlice(items, (l, r) => l.changePct - r.changePct).map(
    (item) => ({
      stockCode: item.stockCode,
      stockName: item.stockName,
      value: item.changePct,
      valueLabel: formatPercent(item.changePct),
      valueClassName: "text-red-500",
    }),
  );

  const topFreq = sortAndSlice(items, (l, r) => r.frequency - l.frequency).map(
    (item) => ({
      stockCode: item.stockCode,
      stockName: item.stockName,
      value: item.frequency,
      valueLabel: `${formatCompactId(item.frequency)}x`,
    }),
  );

  const topVolume = sortAndSlice(items, (l, r) => r.volume - l.volume).map(
    (item) => ({
      stockCode: item.stockCode,
      stockName: item.stockName,
      value: item.volume,
      valueLabel: formatCompactId(item.volume),
    }),
  );

  const netForeignBuy = items
    .filter((item) => item.foreignNet > 0)
    .sort((l, r) => r.foreignNet - l.foreignNet)
    .slice(0, 5)
    .map((item) => ({
      stockCode: item.stockCode,
      stockName: item.stockName,
      value: item.foreignNet,
      valueLabel: formatCompactRupiah(item.foreignNet),
      valueClassName: "text-emerald-500",
    }));

  const netForeignSell = items
    .filter((item) => item.foreignNet < 0)
    .sort((l, r) => l.foreignNet - r.foreignNet)
    .slice(0, 5)
    .map((item) => ({
      stockCode: item.stockCode,
      stockName: item.stockName,
      value: item.foreignNet,
      valueLabel: formatCompactRupiah(item.foreignNet),
      valueClassName: "text-red-500",
    }));

  return {
    topValue,
    topGainer,
    topLoser,
    topFreq,
    topVolume,
    netForeignBuy,
    netForeignSell,
  } as const;
}
