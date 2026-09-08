import { redis } from "@/lib/redis/redis";

const IDX_STOCK_SUMMARY_API =
  "https://www.idx.co.id/primary/TradingSummary/GetStockSummary";
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

import { formatWIB } from "@/lib/utils/date";

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getPreviousDate(dateStr: string): string {
  const year = Number.parseInt(dateStr.slice(0, 4), 10);
  const month = Number.parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = Number.parseInt(dateStr.slice(6, 8), 10);

  const date = new Date(year, month, day);
  date.setDate(date.getDate() - 1);

  return getDateString(date);
}

async function fetchNetForeignForDate(
  dateStr: string,
): Promise<NetForeignDay | null> {
  const url = `${IDX_STOCK_SUMMARY_API}?length=9999&start=0&date=${dateStr}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://www.idx.co.id/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }

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

    return {
      date: dateStr,
      stocks,
    };
  } catch (error) {
    console.error(`Error fetching for date ${dateStr}:`, error);
    return null;
  }
}

export async function updateNetForeignCache(days: number = MAX_DAYS) {
  const today = new Date();
  const todayStr = getDateString(today);

  const existingCache = await redis.get<NetForeignPayload>(CACHE_KEY);

  let netForeignData: NetForeignDay[] = [];
  let lastDate: string | null = null;

  if (existingCache?.data?.length) {
    netForeignData = [...existingCache.data];

    const todayExists = netForeignData.some((day) => day.date === todayStr);

    if (!todayExists) {
      const todayData = await fetchNetForeignForDate(todayStr);

      if (todayData) {
        netForeignData.unshift(todayData);
      }
    }

    lastDate = netForeignData[netForeignData.length - 1]?.date ?? null;
  } else {
    let currentDateStr = todayStr;
    let daysCollected = 0;
    let attempts = 0;
    const maxAttempts = 60;

    while (daysCollected < days && attempts < maxAttempts) {
      const data = await fetchNetForeignForDate(currentDateStr);

      if (data) {
        netForeignData.push(data);
        daysCollected += 1;
      }

      currentDateStr = getPreviousDate(currentDateStr);
      attempts += 1;
    }

    lastDate = netForeignData[netForeignData.length - 1]?.date ?? null;
  }

  if (netForeignData.length > MAX_DAYS) {
    netForeignData = netForeignData.slice(0, MAX_DAYS);
  }

  if (lastDate && netForeignData.length < MAX_DAYS) {
    let currentDateStr = getPreviousDate(lastDate);
    let neededDays = MAX_DAYS - netForeignData.length;
    let attempts = 0;
    const maxAttempts = neededDays * 2;

    while (neededDays > 0 && attempts < maxAttempts) {
      const data = await fetchNetForeignForDate(currentDateStr);

      if (data) {
        netForeignData.push(data);
        neededDays -= 1;
      }

      currentDateStr = getPreviousDate(currentDateStr);
      attempts += 1;
    }
  }

  const payload: NetForeignPayload = {
    lastUpdate: new Date().toISOString(),
    lastUpdateFormatted: formatWIB(new Date()),
    totalDays: netForeignData.length,
    requestedDays: days,
    data: netForeignData,
  };

  await redis.set(CACHE_KEY, payload);

  return payload;
}

export async function forceRefreshNetForeignCache(days: number = MAX_DAYS) {
  const today = new Date();
  const todayStr = getDateString(today);

  const netForeignData: NetForeignDay[] = [];
  let currentDateStr = todayStr;
  let daysCollected = 0;
  let attempts = 0;
  const maxAttempts = 60;

  while (daysCollected < days && attempts < maxAttempts) {
    const data = await fetchNetForeignForDate(currentDateStr);

    if (data) {
      netForeignData.push(data);
      daysCollected += 1;
    }

    currentDateStr = getPreviousDate(currentDateStr);
    attempts += 1;
  }

  // Safety: kalau IDX sedang memblokir (403) dan kita dapat 0 hari, JANGAN
  // menimpa cache lama yang masih valid dengan payload kosong. Error biar
  // kelihatan di log, cache lama dipertahankan.
  if (netForeignData.length === 0) {
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
    totalDays: netForeignData.length,
    requestedDays: days,
    data: netForeignData,
  };

  await redis.set(CACHE_KEY, payload);

  return payload;
}

export async function getNetForeignFromCache() {
  const cached = await redis.get<NetForeignPayload>(CACHE_KEY);

  return cached ?? null;
}
