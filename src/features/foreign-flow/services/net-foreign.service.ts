import { redis } from "@/lib/redis/redis";
import { formatWIB } from "@/lib/utils/date";
import {
  isTradingDay,
  previousTradingDay,
  toWIBDateString,
} from "@/lib/utils/trading-day";

/**
 * Net Foreign Flow — akumulasi/distribusi asing per saham.
 *
 * Sumber: IDX Trading Summary (1 request = semua saham untuk 1 hari bursa).
 * Cache: Redis key `netForeign`, maksimal 30 hari bursa terakhir (newest-first).
 *
 * Catatan satuan: `totalForeignNet` disimpan dalam RUPIAH
 * (ForeignBuy - ForeignSell) × Close, sesuai yang ditampilkan FE.
 */

const IDX_STOCK_SUMMARY_API =
  "https://www.idx.id/primary/TradingSummary/GetStockSummary";
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

/** YYYY-MM-DD → YYYYMMDD (format tanggal di cache & param `date` IDX). */
function toIdxDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * Hari bursa terakhir yang datanya seharusnya sudah tersedia (WIB).
 * Kalau hari ini weekend/libur → hari bursa sebelumnya.
 */
function getLatestTradingDay(): string {
  const today = toWIBDateString();
  return isTradingDay(today) ? today : previousTradingDay(today);
}

async function fetchNetForeignForDate(
  dateStr: string,
): Promise<NetForeignDay | null> {
  const url = `${IDX_STOCK_SUMMARY_API}?length=9999&start=0&date=${toIdxDate(dateStr)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://www.idx.id/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Gagal fetch untuk tanggal ${dateStr}`);
    }

    const json = (await res.json()) as {
      data?: Array<Record<string, unknown>>;
    };

    if (!Array.isArray(json.data) || json.data.length === 0) {
      return null;
    }

    const stocks = json.data
      .map((item) => {
        const close = Number.parseFloat(String(item.Close ?? 0)) || 0;
        const foreignSellVolume =
          Number.parseInt(String(item.ForeignSell ?? 0), 10) || 0;
        const foreignBuyVolume =
          Number.parseInt(String(item.ForeignBuy ?? 0), 10) || 0;

        const foreignSell = foreignSellVolume * close;
        const foreignBuy = foreignBuyVolume * close;
        const foreignNet = foreignBuy - foreignSell;

        if (foreignSellVolume > 0 || foreignBuyVolume > 0) {
          return {
            stockCode: String(item.StockCode ?? ""),
            close,
            totalForeignNet: foreignNet,
          } satisfies NetForeignStock;
        }

        return null;
      })
      .filter((item): item is NetForeignStock => item !== null)
      .sort(
        (left, right) =>
          Math.abs(right.totalForeignNet) - Math.abs(left.totalForeignNet),
      );

    return { date: toIdxDate(dateStr), stocks };
  } catch (error) {
    console.error(`Error fetching for date ${dateStr}:`, error);
    return null;
  }
}

/**
 * Daftar `count` hari bursa terakhir (newest-first) yang berakhir di `endDate`.
 * Dipakai sebagai target cache supaya isinya PERSIS N hari bursa terakhir,
 * tanpa bolong.
 */
function getLastTradingDays(endDate: string, count: number): string[] {
  const days: string[] = [];
  let cursor = endDate;

  while (days.length < count) {
    days.push(cursor);
    cursor = previousTradingDay(cursor);
  }

  return days;
}

/**
 * Ambil `days` hari bursa terakhir (newest-first) mulai dari `latestTradingDay`
 * mundur ke belakang. Dipakai untuk cold start / force refresh.
 */
async function collectLatestDays(
  latestTradingDay: string,
  days: number,
): Promise<NetForeignDay[]> {
  const targetDates = getLastTradingDays(latestTradingDay, days);
  const collected: NetForeignDay[] = [];

  for (const dateStr of targetDates) {
    const day = await fetchNetForeignForDate(dateStr);
    if (day) collected.push(day);
  }

  return collected;
}

/**
 * Update incremental: pastikan cache berisi PERSIS `days` hari bursa terakhir.
 *
 * Strategi: hitung daftar hari bursa target (newest-first), pakai data yang
 * sudah ada di cache, dan hanya fetch tanggal yang belum ada. Ini menutup
 * SEMUA gap (bukan cuma gap di ujung), sekaligus hemat request.
 */
export async function updateNetForeignCache(days: number = MAX_DAYS) {
  const latestTradingDay = getLatestTradingDay();
  const targetDates = getLastTradingDays(latestTradingDay, days);

  const existing = await redis.get<NetForeignPayload>(CACHE_KEY);
  const existingMap = new Map<string, NetForeignDay>();
  for (const day of existing?.data ?? []) {
    if (day?.date) existingMap.set(day.date, day);
  }

  const data: NetForeignDay[] = [];
  let fetchedCount = 0;

  for (const dateStr of targetDates) {
    const key = toIdxDate(dateStr);
    const cached = existingMap.get(key);

    if (cached) {
      data.push(cached);
      continue;
    }

    const fetched = await fetchNetForeignForDate(dateStr);
    if (fetched) {
      data.push(fetched);
      fetchedCount += 1;
    }
  }

  // Safety: jangan timpa cache lama yang valid dengan payload kosong.
  if (data.length === 0 && existing?.data?.length) {
    throw new Error(
      "Gagal mengambil data net foreign dari IDX — cache lama dipertahankan.",
    );
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
    `✅ [net-foreign] updated: ${data.length} hari (${fetchedCount} baru di-fetch)`,
  );

  return payload;
}

/** Force refresh: bangun ulang cache dari nol (30 hari bursa terakhir). */
export async function forceRefreshNetForeignCache(days: number = MAX_DAYS) {
  const latestTradingDay = getLatestTradingDay();
  const data = await collectLatestDays(latestTradingDay, days);

  // Safety: kalau IDX memblokir (403) dan kita dapat 0 hari, JANGAN menimpa
  // cache lama yang masih valid dengan payload kosong.
  if (data.length === 0) {
    const existing = await redis.get<NetForeignPayload>(CACHE_KEY);
    if (existing?.data?.length) {
      throw new Error(
        "Gagal mengambil data net foreign dari IDX (kemungkinan 403) — cache lama dipertahankan.",
      );
    }
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
