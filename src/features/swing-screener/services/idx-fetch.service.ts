import { tickerUniverse } from "@/lib/data/ticker-universe";
import type { IdxCandle } from "../types";

/**
 * IDX Trading Summary — semua saham IDX dalam satu response.
 */
const IDX_URL =
  "https://www.idx.id/primary/TradingSummary/GetStockSummary?length=9999&start=0";

const IDX_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Referer: "https://www.idx.id/",
  Accept: "application/json, text/plain, */*",
};

/** Row mentah dari IDX API. Field lain diabaikan. */
export type IdxRow = {
  StockCode?: string;
  StockName?: string;
  Date?: string;
  OpenPrice?: number | null;
  High?: number | null;
  Low?: number | null;
  Close?: number | null;
  Volume?: number | null;
  Value?: number | null;
  ForeignBuy?: number | null;
  ForeignSell?: number | null;
};

export async function fetchIdxStockSummary(): Promise<IdxRow[]> {
  const response = await fetch(IDX_URL, {
    headers: IDX_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`IDX API HTTP ${response.status}: ${response.statusText}`);
  }

  const json = (await response.json()) as {
    data?: IdxRow[];
  };

  const data = Array.isArray(json?.data) ? json.data : [];

  if (data.length === 0) {
    throw new Error("IDX API mengembalikan data kosong");
  }

  return data;
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
 * Default screen SEMUA ticker dari IDX; kalau `tickerUniverse` diisi,
 * hanya ticker dalam daftar itu yang diambil.
 * Ticker tanpa tanggal/close valid dibuang.
 */
export function mapAndFilterToUniverse(rows: IdxRow[]): IdxCandle[] {
  const restriction = new Set(tickerUniverse);

  return rows
    .map(mapIdxRowToCandle)
    .filter(
      (candle) =>
        candle.ticker &&
        candle.date &&
        candle.close != null &&
        (restriction.size === 0 || restriction.has(candle.ticker)),
    );
}
