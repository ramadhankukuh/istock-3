import { redis } from "@/lib/redis/redis";
import { formatWIB } from "@/lib/utils/date";
import detailIPO from "@/lib/data/detail-ipo.json";

/**
 * Performance IPO tahun berjalan: harga IPO vs harga pasar (Yahoo).
 * Hasilnya di-cache di Redis key `ipo-performance`.
 * Dipanggil oleh cron `/api/cron/ipo-performance` (fail-closed).
 * Mirip `sitools/src/lib/redis/IPOUpdate.ts`, disesuaikan gaya istock.
 */

export type IpoPerformanceItem = {
  code: string;
  company: string;
  ipoPrice: number;
  currentPrice: number;
  returnPct: number;
};

export type IpoPerformancePayload = {
  lastUpdate: string;
  lastUpdateFormatted: string;
  totalIPO: number;
  data: IpoPerformanceItem[];
};

async function fetchYahooPrice(code: string): Promise<number | null> {
  const symbol = `${code}.JK`;
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    const json = await res.json();
    return json?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
  } catch {
    return null;
  }
}

export async function updateIPOData(): Promise<IpoPerformancePayload> {
  const now = new Date();
  const year = now.getFullYear();

  const list = (detailIPO as Array<Record<string, unknown>>).filter((x) => {
    const listingDate = x["Listing Date"];
    if (!listingDate) return false;
    return String(listingDate).startsWith(year.toString());
  });

  const results = await Promise.all(
    list.map(async (item) => {
      const code = String(item["Ticker Code"] ?? "").trim();
      const ipoPrice = Number.parseFloat(String(item["Final Price (Rp)"]));
      const price = await fetchYahooPrice(code);

      if (!code || !Number.isFinite(ipoPrice) || !price) return null;

      return {
        code,
        company: String(item["Company Name"] ?? ""),
        ipoPrice,
        currentPrice: price,
        returnPct: (price - ipoPrice) / ipoPrice,
      } satisfies IpoPerformanceItem;
    }),
  );

  const finalData = results.filter(
    (r): r is IpoPerformanceItem => r !== null,
  );
  finalData.sort((a, b) => b.returnPct - a.returnPct);

  const payload: IpoPerformancePayload = {
    lastUpdate: now.toISOString(),
    lastUpdateFormatted: formatWIB(now),
    totalIPO: finalData.length,
    data: finalData,
  };

  await redis.set("ipo-performance", payload);

  return payload;
}
