import type { IdxCandle } from "../types";
import { redis } from "@/lib/redis/redis";

/**
 * IDX Trading Summary — semua saham IDX dalam satu response.
 *
 * Endpoint ini mengembalikan data 1 hari bursa. Tanpa param `date` → hari
 * bursa terakhir. Dengan `date=YYYYMMDD` → data hari tersebut (dipakai untuk
 * backfill). Hari libur / weekend mengembalikan `data: []`.
 */
const IDX_URL =
  "https://www.idx.id/primary/TradingSummary/GetStockSummary?length=9999&start=0";

const IDX_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Referer: "https://www.idx.id/",
  Accept: "application/json, text/plain, */*",
};
const LATEST_SUMMARY_CACHE_KEY = "idx:latest-trading-summary";
const LATEST_SUMMARY_CACHE_TTL_SECONDS = 2 * 24 * 60 * 60;

/** Row mentah dari IDX API. Field lain diabaikan. */
export type IdxRow = {
  StockCode?: string;
  StockName?: string;
  Date?: string;
  Previous?: number | null;
  Change?: number | null;
  Frequency?: number | null;
  OpenPrice?: number | null;
  High?: number | null;
  Low?: number | null;
  Close?: number | null;
  Volume?: number | null;
  Value?: number | null;
  ForeignBuy?: number | null;
  ForeignSell?: number | null;
};

/**
 * Fetch Trading Summary IDX.
 * @param dateStr opsional, format YYYYMMDD (mis. "20260928"). Kalau diisi,
 *   ambil data hari tersebut; kalau kosong, ambil hari bursa terakhir.
 *   Return array kosong kalau hari itu bukan hari bursa.
 */
export async function fetchIdxStockSummary(
  dateStr?: string,
  options?: { cacheAsLatest?: boolean },
): Promise<IdxRow[]> {
  const url = dateStr ? `${IDX_URL}&date=${dateStr}` : IDX_URL;

  const response = await fetch(url, {
    headers: IDX_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`IDX API HTTP ${response.status}: ${response.statusText}`);
  }

  const json = (await response.json()) as {
    data?: IdxRow[];
    recordsTotal?: number;
  };
  const rows = Array.isArray(json?.data) ? json.data : [];

  if (!dateStr || options?.cacheAsLatest) {
    await cacheLatestIdxStockSummary(rows, json.recordsTotal ?? rows.length);
  }

  return rows;
}

export async function cacheLatestIdxStockSummary(
  rows: IdxRow[],
  recordsTotal = rows.length,
): Promise<void> {
  await redis.set(
    LATEST_SUMMARY_CACHE_KEY,
    { rows, recordsTotal },
    { exSeconds: LATEST_SUMMARY_CACHE_TTL_SECONDS },
  );
}

export async function getCachedLatestIdxStockSummary(): Promise<{
  rows: IdxRow[];
  recordsTotal: number;
} | null> {
  const cached = await redis.get<{
    rows?: IdxRow[];
    recordsTotal?: number;
  }>(LATEST_SUMMARY_CACHE_KEY);

  if (!cached || !Array.isArray(cached.rows)) return null;

  return {
    rows: cached.rows,
    recordsTotal: cached.recordsTotal ?? cached.rows.length,
  };
}

function toDateOnly(value: string): string {
  // "2026-08-11T00:00:00" -> "2026-08-11"
  return (value ?? "").slice(0, 10);
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toInt(value: unknown): number | null {
  const n = toNumber(value);
  return n == null ? null : Math.round(n);
}

/** Mapping satu row IDX ke candle Turso. */
export function mapIdxRowToCandle(row: IdxRow): IdxCandle {
  const foreignBuy = toNumber(row.ForeignBuy) ?? 0;
  const foreignSell = toNumber(row.ForeignSell) ?? 0;

  return {
    ticker: row.StockCode ?? "",
    date: toDateOnly(row.Date ?? ""),
    open: toNumber(row.OpenPrice),
    high: toNumber(row.High),
    low: toNumber(row.Low),
    close: toNumber(row.Close),
    volume: toInt(row.Volume),
    value: toInt(row.Value),
    foreignNet: Math.round(foreignBuy - foreignSell),
  };
}

/**
 * Filter & map hasil fetch ke candle valid.
 * Ticker tanpa tanggal/close valid dibuang.
 */
export function mapAndFilterToCandles(rows: IdxRow[]): IdxCandle[] {
  return rows
    .map(mapIdxRowToCandle)
    .filter((candle) => candle.ticker && candle.date && candle.close != null);
}
