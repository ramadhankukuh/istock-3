import { redis } from "@/lib/redis/redis";
import { formatWIB } from "@/lib/utils/date";
import {
  getTradingDaysBetween,
  toWIBDateString,
} from "@/lib/utils/trading-day";
import { screenerConfig } from "../lib/screener-config";
import {
  fetchIdxStockSummary,
  mapAndFilterToCandles,
} from "./idx-fetch.service";
import {
  getAllTickers,
  getHistoryForTickers,
  trimCandlesToWindow,
  upsertCandles,
} from "./candles.repository";
import { computeIndicatorsForTicker } from "./indicators.service";
import type {
  SwingScreenerPayload,
  SwingScreenerResult,
  SwingScreenerSummary,
} from "../types";

/**
 * Pipeline Swing Trade Screener berbasis Turso.
 *
 * Alur harian (cron):
 *   1. FETCH 1x ke IDX Trading Summary (semua saham sekaligus).
 *   2. UPSERT candle hari itu ke Turso.
 *   3. TRIM rolling window → tiap ticker maksimal `historyDays` (250) baris.
 *   4. HITUNG indikator dari histori Turso.
 *   5. TULIS hasil ke Redis (dibaca FE).
 *
 * Backfill: ulangi langkah 1-3 untuk tiap hari bursa yang belum ada.
 */

/** Key Redis untuk payload screener (dibaca FE). */
const CACHE_KEY = screenerConfig.cacheKey;

/** Key Redis untuk peta ticker → nama perusahaan (dari IDX). */
const NAMES_KEY = "swingScreener:names";

/** TTL payload screener: 3 hari (safety net kalau cron gagal). */
const CACHE_TTL_SECONDS = 3 * 24 * 60 * 60;

/** Format Date → YYYYMMDD (param `date` IDX). */
function toIdxDateParam(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/** Simpan peta nama ticker dari row IDX (biar publish tanpa fetch tetap ada nama). */
async function saveNameMap(
  rows: Array<{ StockCode?: string; StockName?: string }>,
): Promise<void> {
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.StockCode && row.StockName) {
      map[row.StockCode] = row.StockName;
    }
  }
  if (Object.keys(map).length > 0) {
    await redis.set(NAMES_KEY, map);
  }
}

async function getNameMap(): Promise<Record<string, string>> {
  return (await redis.get<Record<string, string>>(NAMES_KEY)) ?? {};
}

/**
 * Fetch 1 hari bursa dari IDX, upsert ke Turso, lalu trim rolling window.
 * Return jumlah candle yang di-upsert (0 kalau hari itu bukan hari bursa).
 */
async function ingestTradingDay(dateStr: string): Promise<{
  fetched: number;
  upserted: number;
  trimmed: number;
}> {
  const rows = await fetchIdxStockSummary(toIdxDateParam(dateStr));

  if (rows.length === 0) {
    return { fetched: 0, upserted: 0, trimmed: 0 };
  }

  const candles = mapAndFilterToCandles(rows);
  const upserted = await upsertCandles(candles);
  const trimmed = await trimCandlesToWindow(screenerConfig.historyDays);

  await saveNameMap(rows);

  return { fetched: rows.length, upserted, trimmed };
}

/**
 * Fetch hari bursa terakhir yang tersedia dari IDX (tanpa param `date`).
 * Dipakai sebagai fallback kalau data hari ini belum dipublikasikan IDX.
 */
async function ingestLatestTradingDay(): Promise<{
  fetched: number;
  upserted: number;
  trimmed: number;
}> {
  const rows = await fetchIdxStockSummary();

  if (rows.length === 0) {
    return { fetched: 0, upserted: 0, trimmed: 0 };
  }

  const candles = mapAndFilterToCandles(rows);
  const upserted = await upsertCandles(candles);
  const trimmed = await trimCandlesToWindow(screenerConfig.historyDays);

  await saveNameMap(rows);

  return { fetched: rows.length, upserted, trimmed };
}

/**
 * Hitung indikator dari histori Turso untuk semua ticker, lalu tulis ke Redis.
 * Dipakai oleh publish (jam 21:00 WIB) dan setelah update.
 */
export async function publishSwingScreener(): Promise<SwingScreenerPayload> {
  const startedAt = Date.now();

  const tickers = await getAllTickers();
  const history = await getHistoryForTickers(tickers, screenerConfig.historyDays);
  const nameMap = await getNameMap();

  const results: SwingScreenerResult[] = [];
  let failed = 0;

  for (const [ticker, candles] of history) {
    try {
      const computed = computeIndicatorsForTicker(
        ticker,
        candles,
        nameMap[ticker] ?? null,
      );
      if (computed) {
        results.push(computed);
      } else {
        failed += 1;
      }
    } catch (error) {
      failed += 1;
      console.warn(`⚠️ [swing-screener] compute gagal ${ticker}:`, error);
    }
  }

  results.sort((a, b) => b.score - a.score || a.ticker.localeCompare(b.ticker));
  const passedResults = results.filter((r) => r.passed);

  const summary: SwingScreenerSummary = {
    fetched: 0,
    universeSize: history.size,
    upserted: 0,
    trimmed: 0,
    screened: results.length,
    passed: passedResults.length,
    failed,
    durationMs: Date.now() - startedAt,
  };

  const payload: SwingScreenerPayload = {
    lastUpdate: new Date().toISOString(),
    lastUpdateFormatted: formatWIB(new Date()),
    total: results.length,
    passedCount: passedResults.length,
    results,
    summary,
  };

  await redis.set(CACHE_KEY, payload, { exSeconds: CACHE_TTL_SECONDS });

  console.log(
    `✅ [swing-screener] publish: ${results.length} ticker, ${passedResults.length} lolos (${summary.durationMs}ms)`,
  );

  return payload;
}

/**
 * Pipeline harian: fetch IDX (hari bursa terakhir) → upsert Turso → trim →
 * publish ke Redis.
 */
export async function runSwingScreenerUpdate(): Promise<SwingScreenerPayload> {
  console.log("🚀 [swing-screener] update started");

  const today = toWIBDateString();
  let result = await ingestTradingDay(today);

  // Fallback: kalau data hari ini belum dipublikasikan IDX (mis. cron jalan
  // sebelum IDX update), ambil hari bursa terakhir yang tersedia.
  if (result.fetched === 0) {
    console.warn(
      `⚠️ [swing-screener] ${today}: data IDX kosong, fallback ke hari bursa terakhir`,
    );
    result = await ingestLatestTradingDay();
  }

  const { fetched, upserted, trimmed } = result;

  console.log(
    `📥 [swing-screener] IDX fetched=${fetched}, upserted=${upserted}, trimmed=${trimmed}`,
  );

  const payload = await publishSwingScreener();

  return {
    ...payload,
    summary: payload.summary
      ? { ...payload.summary, fetched, upserted, trimmed }
      : null,
  };
}

/**
 * Backfill histori dari `startDate` s/d `endDate` (YYYY-MM-DD, inklusif).
 * Hanya hari bursa yang di-request (weekend & libur dilewati). Setelah tiap
 * hari di-upsert, rolling window dipangkas supaya tiap ticker maksimal 250.
 */
export async function runSwingScreenerBackfill(
  startDate: string,
  endDate: string,
): Promise<{
  days: number;
  fetched: number;
  upserted: number;
  trimmed: number;
  skipped: string[];
}> {
  const tradingDays = getTradingDaysBetween(startDate, endDate);
  console.log(
    `🚀 [swing-screener] backfill ${startDate}..${endDate}: ${tradingDays.length} hari bursa`,
  );

  let fetched = 0;
  let upserted = 0;
  let trimmed = 0;
  const skipped: string[] = [];

  for (const day of tradingDays) {
    const result = await ingestTradingDay(day);

    if (result.fetched === 0) {
      skipped.push(day);
      console.log(`⏭️ [swing-screener] ${day}: tidak ada data (libur?)`);
      continue;
    }

    fetched += result.fetched;
    upserted += result.upserted;
    trimmed += result.trimmed;
    console.log(
      `✅ [swing-screener] ${day}: fetched=${result.fetched}, upserted=${result.upserted}`,
    );
  }

  return { days: tradingDays.length, fetched, upserted, trimmed, skipped };
}

/** Baca payload screener dari Redis (dipakai API route). */
export async function getSwingScreenerCache(): Promise<SwingScreenerPayload | null> {
  return redis.get<SwingScreenerPayload>(CACHE_KEY);
}
