import { redis } from "@/lib/redis/redis";
import { formatWIB } from "@/lib/utils/date";
import { getForeignFlowCandles } from "@/features/swing-screener/services/candles.repository";

/**
 * Net Foreign Flow — akumulasi/distribusi asing per saham.
 *
 * Sumber: candle histori Turso yang diisi pipeline Swing Trade.
 * Cache: Redis key `netForeign`, maksimal 30 hari bursa terakhir (newest-first).
 *
 * Catatan satuan: `totalForeignNet` disimpan dalam RUPIAH
 * (ForeignBuy - ForeignSell) × Close, sesuai yang ditampilkan FE.
 */

const CACHE_KEY = "netForeign";
const MAX_DAYS = 30;

type NetForeignStock = {
  stockCode: string;
  close: number;
  totalForeignNet: number;
};

type NetForeignDay = {
  date: string;
  stocks: NetForeignStock[];
};

export type NetForeignPayload = {
  lastUpdate: string;
  lastUpdateFormatted: string;
  totalDays: number;
  requestedDays: number;
  data: NetForeignDay[];
};

async function readNetForeignFromCandles(
  days: number,
): Promise<NetForeignDay[]> {
  const candles = await getForeignFlowCandles(days);
  const byDate = new Map<string, NetForeignStock[]>();

  for (const candle of candles) {
    const stocks = byDate.get(candle.date) ?? [];
    stocks.push({
      stockCode: candle.ticker,
      close: candle.close,
      totalForeignNet: candle.foreignNet * candle.close,
    });
    byDate.set(candle.date, stocks);
  }

  return Array.from(byDate.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, stocks]) => ({
      date: date.replace(/-/g, ""),
      stocks: stocks.sort(
        (left, right) =>
          Math.abs(right.totalForeignNet) - Math.abs(left.totalForeignNet),
      ),
    }));
}

/**
 * Update cache dari histori candle Turso. Pipeline Swing Trade bertanggung
 * jawab mengambil data IDX dan mengisi candle tersebut.
 */
export async function updateNetForeignCache(days: number = MAX_DAYS) {
  const data = await readNetForeignFromCandles(days);

  const existing = await redis.get<NetForeignPayload>(CACHE_KEY);
  if (data.length === 0) {
    if (existing?.data?.length) {
      throw new Error(
        "Histori candle Turso belum tersedia — cache lama dipertahankan.",
      );
    }

    throw new Error("Histori candle Turso belum tersedia.");
  }

  const payload: NetForeignPayload = {
    lastUpdate: new Date().toISOString(),
    lastUpdateFormatted: formatWIB(new Date()),
    totalDays: data.length,
    requestedDays: days,
    data,
  };

  await redis.set(CACHE_KEY, payload);

  console.log(
    `✅ [net-foreign] updated: ${data.length} hari dari Turso`,
  );

  return payload;
}

/** Force refresh cache dari histori candle Turso (tanpa request IDX). */
export async function forceRefreshNetForeignCache(days: number = MAX_DAYS) {
  const data = await readNetForeignFromCandles(days);

  if (data.length === 0) {
    const existing = await redis.get<NetForeignPayload>(CACHE_KEY);
    if (existing?.data?.length) {
      throw new Error(
        "Histori candle Turso belum tersedia — cache lama dipertahankan.",
      );
    }

    throw new Error("Histori candle Turso belum tersedia.");
  }

  const payload: NetForeignPayload = {
    lastUpdate: new Date().toISOString(),
    lastUpdateFormatted: formatWIB(new Date()),
    totalDays: data.length,
    requestedDays: days,
    data,
  };

  await redis.set(CACHE_KEY, payload);

  return payload;
}

export async function getNetForeignFromCache() {
  const cached = await redis.get<NetForeignPayload>(CACHE_KEY);

  return cached ?? null;
}
