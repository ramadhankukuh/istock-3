import { redis } from "@/lib/redis/redis";
import type {
  StockSummaryItem,
  StockSummaryPayload,
} from "@/features/explore/types";

const IDX_STOCK_SUMMARY_API =
  "https://www.idx.id/primary/TradingSummary/GetStockSummary";

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
  const url = `${IDX_STOCK_SUMMARY_API}?length=9999&start=0`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Referer: "https://www.idx.id/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal fetch Stock Summary IDX");
  }

  const json = (await res.json()) as {
    data?: Array<Record<string, unknown>>;
    recordsTotal?: number;
  };

  const items: StockSummaryItem[] = (json.data ?? []).map((item) => {
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
    total: json.recordsTotal ?? items.length,
    items,
  };

  await redis.set("stockSummary", payload);

  return payload;
}
