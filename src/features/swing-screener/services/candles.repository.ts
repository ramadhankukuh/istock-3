import { createClient, type Client, type InValue } from "@libsql/client";
import { env } from "@/lib/env";
import type { IdxCandle } from "../types";

/**
 * Semua query Turso (SQLite) untuk histori candle IDX.
 * Hanya dipakai oleh pipeline cron — path user hanya baca Redis.
 *
 * Skema tabel `candles` (sudah ada di DB):
 *   ticker text, date text, open real, high real, low real, close real,
 *   volume integer, value integer, foreign_net integer,
 *   PRIMARY KEY (ticker, date)
 */

let clientPromise: Promise<Client> | null = null;

function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      if (!env.tursoDatabaseUrl) {
        throw new Error("TURSO_DATABASE_URL belum dikonfigurasi");
      }

      return createClient({
        url: env.tursoDatabaseUrl,
        authToken: env.tursoAuthToken || undefined,
      });
    })();
  }

  return clientPromise;
}

const UPSERT_SQL = `
  INSERT OR REPLACE INTO candles
    (ticker, date, open, high, low, close, volume, value, foreign_net)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

/**
 * Upsert candle per (ticker, date). INSERT OR REPLACE menangani kasus
 * re-run cron di hari yang sama (row lama di-replace).
 * Dijalankan batch per chunk supaya efisien.
 */
export async function upsertCandles(candles: IdxCandle[]): Promise<number> {
  if (candles.length === 0) return 0;

  const client = await getClient();
  const statements = candles.map((c) => ({
    sql: UPSERT_SQL,
    args: [
      c.ticker,
      c.date,
      c.open,
      c.high,
      c.low,
      c.close,
      c.volume,
      c.value,
      c.foreignNet,
    ] as InValue[],
  }));

  const CHUNK = 200;
  let count = 0;

  for (let i = 0; i < statements.length; i += CHUNK) {
    const chunk = statements.slice(i, i + CHUNK);
    await client.batch(chunk, "write");
    count += chunk.length;
  }

  return count;
}

const TRIM_SQL = `
  WITH ranked AS (
    SELECT ticker, date,
           ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY date DESC) AS rn
    FROM candles
  )
  DELETE FROM candles
  WHERE (ticker, date) IN (SELECT ticker, date FROM ranked WHERE rn > ?)
`;

/**
 * Rolling window: hapus baris paling lama sampai tiap ticker menyisakan
 * maksimal `windowSize` hari terakhir. Satu statement untuk semua ticker.
 */
export async function trimCandlesToWindow(windowSize: number): Promise<number> {
  const client = await getClient();
  const result = await client.execute({
    sql: TRIM_SQL,
    args: [windowSize],
  });

  return result.rowsAffected ?? 0;
}

const HISTORY_SELECT = `
  SELECT ticker, date, open, high, low, close, volume, value, foreign_net
  FROM candles
  WHERE ticker IN (%PLACEHOLDERS%)
  ORDER BY ticker ASC, date ASC
`;

function rowToCandle(row: Record<string, unknown>): IdxCandle {
  const num = (v: unknown) =>
    v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null;

  return {
    ticker: String(row.ticker),
    date: String(row.date),
    open: num(row.open),
    high: num(row.high),
    low: num(row.low),
    close: num(row.close),
    volume: num(row.volume),
    value: num(row.value),
    foreignNet: num(row.foreign_net),
  };
}

/**
 * Ambil histori OHLC untuk sekumpulan ticker (ascending by date),
 * lalu batasi ke `limit` baris terakhir per ticker.
 * Satu round-trip query untuk semua ticker (di-chunk per 250).
 */
export async function getHistoryForTickers(
  tickers: string[],
  limit: number,
): Promise<Map<string, IdxCandle[]>> {
  const map = new Map<string, IdxCandle[]>();
  if (tickers.length === 0) return map;

  const client = await getClient();
  const CHUNK = 250;

  for (let i = 0; i < tickers.length; i += CHUNK) {
    const chunk = tickers.slice(i, i + CHUNK);
    const placeholders = chunk.map(() => "?").join(",");
    const sql = HISTORY_SELECT.replace("%PLACEHOLDERS%", placeholders);
    const result = await client.execute({ sql, args: chunk as InValue[] });

    for (const row of result.rows) {
      const candle = rowToCandle(row as unknown as Record<string, unknown>);
      const list = map.get(candle.ticker);
      if (list) {
        list.push(candle);
      } else {
        map.set(candle.ticker, [candle]);
      }
    }
  }

  // Batasi ke `limit` baris terakhir per ticker
  for (const [ticker, list] of map) {
    if (list.length > limit) {
      map.set(ticker, list.slice(list.length - limit));
    }
  }

  return map;
}

/** Semua ticker unik yang punya histori di Turso (ascending). */
export async function getAllTickers(): Promise<string[]> {
  const client = await getClient();
  const result = await client.execute(
    "SELECT DISTINCT ticker FROM candles ORDER BY ticker ASC",
  );
  return result.rows.map((row) => String(row.ticker));
}

/** Tanggal candle terakhir yang tersimpan di Turso (global), atau null. */
export async function getLatestCandleDate(): Promise<string | null> {
  const client = await getClient();
  const result = await client.execute(
    "SELECT MAX(date) AS max_date FROM candles",
  );
  const value = result.rows[0]?.max_date;
  return value == null ? null : String(value);
}

export type ForeignFlowCandle = {
  ticker: string;
  date: string;
  close: number;
  foreignNet: number;
};

/**
 * Ambil histori foreign flow dari candle yang sudah tersimpan di Turso.
 * Satu query dipakai bersama oleh fitur Foreign Flow, tanpa request IDX baru.
 */
export async function getForeignFlowCandles(
  limit: number,
): Promise<ForeignFlowCandle[]> {
  if (limit <= 0) return [];

  const client = await getClient();
  const result = await client.execute({
    sql: `
      SELECT ticker, date, close, foreign_net
      FROM candles
      WHERE date IN (
        SELECT date
        FROM candles
        WHERE close IS NOT NULL AND foreign_net IS NOT NULL
        GROUP BY date
        ORDER BY date DESC
        LIMIT ?
      )
        AND close IS NOT NULL
        AND foreign_net IS NOT NULL
      ORDER BY date DESC, ticker ASC
    `,
    args: [limit],
  });

  return result.rows.flatMap((row) => {
    const close = Number(row.close);
    const foreignNet = Number(row.foreign_net);
    if (
      !row.ticker ||
      !row.date ||
      !Number.isFinite(close) ||
      !Number.isFinite(foreignNet)
    ) {
      return [];
    }

    return [
      {
        ticker: String(row.ticker),
        date: String(row.date),
        close,
        foreignNet,
      },
    ];
  });
}

/** Jumlah baris candle untuk satu ticker (buat verifikasi window). */
export async function countCandlesForTicker(ticker: string): Promise<number> {
  const client = await getClient();
  const result = await client.execute({
    sql: "SELECT COUNT(*) AS n FROM candles WHERE ticker = ?",
    args: [ticker],
  });
  return Number(result.rows[0]?.n ?? 0);
}
