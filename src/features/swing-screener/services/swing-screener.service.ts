import { screenerConfig } from "../lib/screener-config";
import type {
  SwingScreenerResult,
  SwingScreenerSummary,
} from "../types";
import { fetchIdxStockSummary, mapAndFilterToUniverse } from "./idx-fetch.service";
import {
  getHistoryForTickers,
  trimCandlesToWindow,
  upsertCandles,
} from "./candles.repository";
import { computeIndicatorsForTicker } from "./indicators.service";
import { writeScreenerCache } from "./screener-cache.service";

/**
 * Pipeline lengkap Swing Trade Screener (dipanggil oleh cron):
 * fetch IDX → filter universe → upsert Turso → trim rolling window →
 * hitung indikator dari Turso → tulis hasil ke Redis.
 */
export async function runSwingScreener(): Promise<{
  success: boolean;
  summary: SwingScreenerSummary;
  results: SwingScreenerResult[];
}> {
  const startedAt = Date.now();
  console.log("🚀 [swing-screener] pipeline started");

  // 1️⃣ FETCH dari IDX
  const rows = await fetchIdxStockSummary();
  console.log(`📥 [swing-screener] IDX fetched: ${rows.length} rows`);

  // 2️⃣ FILTER & map ke candle valid (default: SEMUA saham IDX)
  const candles = mapAndFilterToUniverse(rows);
  const screenTickers = Array.from(new Set(candles.map((c) => c.ticker)));
  console.log(
    `🎯 [swing-screener] candles: ${candles.length}, tickers to screen: ${screenTickers.length}`,
  );

  if (screenTickers.length === 0) {
    throw new Error(
      "Tidak ada ticker valid setelah fetch — cek response IDX.",
    );
  }

  // 3️⃣ UPSERT ke Turso
  const upserted = await upsertCandles(candles);
  console.log(`💾 [swing-screener] upserted: ${upserted} rows`);

  // 4️⃣ TRIM rolling window (250 hari per ticker)
  const trimmed = await trimCandlesToWindow(screenerConfig.historyDays);
  console.log(
    `✂️ [swing-screener] trimmed: ${trimmed} rows (rolling ${screenerConfig.historyDays}d)`,
  );

  // 5️⃣ HITUNG indikator dari histori Turso
  const history = await getHistoryForTickers(
    screenTickers,
    screenerConfig.historyDays,
  );

  const results: SwingScreenerResult[] = [];
  let failed = 0;

  for (const ticker of screenTickers) {
    try {
      const computed = computeIndicatorsForTicker(
        ticker,
        history.get(ticker) ?? [],
      );

      if (computed) {
        results.push(computed);
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      console.error(`⚠️ [swing-screener] compute failed for ${ticker}:`, error);
    }
  }

  const passed = results.filter((r) => r.passed);
  console.log(
    `📊 [swing-screener] screened: ${results.length}, passed: ${passed.length}, failed: ${failed}`,
  );

  // 6️⃣ TULIS hasil ke Redis
  const summary: SwingScreenerSummary = {
    fetched: rows.length,
    universeSize: screenTickers.length,
    upserted,
    trimmed,
    screened: results.length,
    passed: passed.length,
    failed,
    durationMs: Date.now() - startedAt,
  };

  await writeScreenerCache(results, summary);

  console.log(`✅ [swing-screener] done in ${summary.durationMs}ms`);
  return { success: true, summary, results };
}
