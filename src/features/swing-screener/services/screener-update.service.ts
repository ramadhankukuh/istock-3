import { yahooFinance } from "@/lib/yahoo-finance";
import { redis } from "@/lib/redis/redis";
import { formatWIB } from "@/lib/utils/date";
import { screenerConfig } from "../lib/screener-config";
import { idxUniverse } from "../data/idx-universe";
import { computeIndicatorsForTicker } from "./indicators.service";
import type {
  SwingScreenerPayload,
  SwingScreenerResult,
} from "../types";

function toJK(ticker: string) {
  return ticker.endsWith(".JK") ? ticker : `${ticker}.JK`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** Bentuk minimal quote dari `yahooFinance.quote()` (beberapa field bisa null). */
type RawQuote = {
  symbol?: string;
  longName?: string | null;
  sector?: string | null;
  regularMarketPrice?: number | null;
  regularMarketPreviousClose?: number | null;
  regularMarketChangePercent?: number | null;
};

/** Jalankan task secara paralel dengan batas concurrency. */
async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await task(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return results;
}

/**
 * Pipeline harian Swing Trade Screener:
 *   1. Batch quote Yahoo Finance untuk nama/sektor/harga/perubahan.
 *   2. Per ticker: hitung indikator + trade setup (S/R zone).
 *   3. Simpan payload lengkap ke Redis (dibaca `/api/screener/swing`).
 *
 * `computeTradeSetup` dijalankan untuk SEMUA ticker di universe — hasilnya
 * dipakai buat nentuin `passed`, bukan cuma properti tambahan.
 */
export async function runSwingScreenerUpdate(): Promise<SwingScreenerPayload> {
  console.log("🚀 Starting swing screener update...");

  const tickers = idxUniverse;

  // 1️⃣ Batch quote (di-chunk biar aman dari batas permintaan Yahoo)
  let quoteMap = new Map<string, RawQuote>();
  try {
    const chunks = chunk(tickers.map(toJK), 50);
    const quotes = (
      await Promise.all(chunks.map((c) => yahooFinance.quote(c)))
    ).flat() as RawQuote[];
    quoteMap = new Map(
      quotes
        .filter((q): q is RawQuote & { symbol: string } => Boolean(q?.symbol))
        .map((q) => [q.symbol.replace(/\.JK$/i, "").toUpperCase(), q]),
    );
  } catch (error) {
    console.warn("⚠️ Batch quote gagal, lanjut tanpa nama/sektor:", error);
  }

  // 2️⃣ Hitung indikator + setup per ticker
  const computed = await mapWithConcurrency(
    tickers,
    screenerConfig.concurrency,
    async (ticker) => {
      const q = quoteMap.get(ticker.toUpperCase());
      const quote = q
        ? {
            name: (q.longName as string | null) ?? null,
            sector: (q.sector as string | null) ?? null,
            price:
              (q.regularMarketPrice as number | null) ??
              (q.regularMarketPreviousClose as number | null) ??
              null,
            // yahoo-finance2 `regularMarketChangePercent` sudah dalam satuan
            // persen (mis. 0.78125 = +0.78%) — JANGAN dikali 100.
            changePct:
              q.regularMarketChangePercent != null
                ? Number(q.regularMarketChangePercent)
                : null,
          }
        : null;

      return computeIndicatorsForTicker(ticker, quote);
    },
  );

  const results = computed.filter(
    (r): r is SwingScreenerResult => r !== null,
  );
  const passedResults = results.filter((r) => r.passed);

  console.log(
    `✅ Screener selesai: ${results.length} ticker diproses, ${passedResults.length} lolos.`,
  );

  const payload: SwingScreenerPayload = {
    lastUpdate: new Date().toISOString(),
    lastUpdateFormatted: formatWIB(new Date()),
    total: results.length,
    passedCount: passedResults.length,
    results,
  };

  // 3️⃣ Cache 24 jam
  await redis.set(screenerConfig.cacheKey, payload, {
    exSeconds: 60 * 60 * 24,
  });

  return payload;
}

/** Baca payload screener dari Redis (dipakai API route). */
export async function getSwingScreenerCache(): Promise<SwingScreenerPayload | null> {
  return redis.get<SwingScreenerPayload>(screenerConfig.cacheKey);
}
