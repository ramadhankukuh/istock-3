import { redis } from "@/lib/redis/redis";

const IDX_INDEX_SUMMARY_API =
  "https://www.idx.id/primary/TradingSummary/GetIndexSummary";

const SECTOR_CODES = new Set([
  "IDXENERGY",
  "IDXBASIC",
  "IDXINDUST",
  "IDXNONCYC",
  "IDXCYCLIC",
  "IDXHEALTH",
  "IDXFINANCE",
  "IDXPROPERT",
  "IDXTECHNO",
  "IDXINFRA",
  "IDXTRANS",
]);

import { formatWIB } from "@/lib/utils/date";

export type IhsgSummary = {
  marketCap: number;
  value: number;
  volume: number;
  frequency: number;
};

export type IndexSummaryPayload = {
  lastUpdate: string;
  lastUpdateFormatted: string;
  data: Array<Record<string, unknown>>;
  sector: Array<Record<string, unknown>>;
  index: Array<Record<string, unknown>>;
  ihsgSummary: IhsgSummary | null;
};

export async function fetchAndCacheIndexSummary(): Promise<IndexSummaryPayload> {
  const res = await fetch(`${IDX_INDEX_SUMMARY_API}?length=9999&start=0`, {
    headers: {
      Accept: "application/json",
      Referer: "https://www.idx.id/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Gagal fetch Index Summary IDX (${res.status})`);
  }

  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data : [];

  const categorizedData: {
    sector: Array<Record<string, unknown>>;
    index: Array<Record<string, unknown>>;
  } = {
    sector: [],
    index: [],
  };

  data.forEach((row: Record<string, unknown>) => {
    const indexCode = String(row?.IndexCode ?? "").toUpperCase();

    if (SECTOR_CODES.has(indexCode)) {
      categorizedData.sector.push(row);
    } else {
      categorizedData.index.push(row);
    }
  });

  const ihsgRow = data.find((row: Record<string, unknown>) => {
    const code = String(row?.IndexCode ?? "").toUpperCase();
    return code === "COMPOSITE" || code === "IHSG";
  });

  const ihsgSummary: IhsgSummary | null = ihsgRow
    ? {
        marketCap: Number(ihsgRow?.MarketCapital ?? 0),
        value: Number(ihsgRow?.Value ?? 0),
        volume: Number(ihsgRow?.Volume ?? 0),
        frequency: Number(ihsgRow?.Frequency ?? 0),
      }
    : null;

  const payload: IndexSummaryPayload = {
    lastUpdate: new Date().toISOString(),
    lastUpdateFormatted: formatWIB(new Date()),
    data,
    ...categorizedData,
    ihsgSummary,
  };

  await redis.set("indexSummary", payload);

  return payload;
}
