import { redis } from "@/lib/redis/redis";
import type {
  StockSummaryItem,
  StockSummaryPayload,
} from "@/features/explore/types";
import {
  fetchIdxStockSummary,
  getCachedLatestIdxStockSummary,
  type IdxRow,
} from "@/features/swing-screener/services/idx-fetch.service";

import { formatWIB } from "@/lib/utils/date";

function toNumber(value: unknown) {
  const parsed = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInteger(value: unknown) {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchAndCacheStockSummary(): Promise<StockSummaryPayload> {
  const cachedIdx = await getCachedLatestIdxStockSummary();
  const source = cachedIdx ?? {
    rows: await fetchIdxStockSummary(),
    recordsTotal: 0,
  };

  const items: StockSummaryItem[] = source.rows.map((item: IdxRow) => {
    const previous = toNumber(item.Previous);
    const close = toNumber(item.Close);
    const changePct =
      previous !== 0 ? ((close - previous) / previous) * 100 : 0;

    const foreignSellVolume = toInteger(item.ForeignSell);
    const foreignBuyVolume = toInteger(item.ForeignBuy);

    const foreignSell = Math.round(foreignSellVolume * close);
    const foreignBuy = Math.round(foreignBuyVolume * close);
    const foreignNet = foreignBuy - foreignSell;

    return {
      stockCode: String(item.StockCode ?? ""),
      stockName: String(item.StockName ?? ""),
      previous: String(item.Previous ?? "0"),
      close: String(item.Close ?? "0"),
      change: String(item.Change ?? "0"),
      changePct: Number.parseFloat(changePct.toFixed(2)),
      volume: toInteger(item.Volume),
      value: toInteger(item.Value),
      frequency: toInteger(item.Frequency),
      foreignSell,
      foreignBuy,
      foreignNet,
    };
  });

  const payload: StockSummaryPayload = {
    lastUpdate: new Date().toISOString(),
    lastUpdateFormatted: formatWIB(new Date()),
    total: source.recordsTotal || items.length,
    items,
  };

  await redis.set("stockSummary", payload);

  return payload;
}
