import "server-only";

import type { AssetTrend, ExploreCategory } from "@/features/explore/types";
import { yahooFinance } from "@/lib/yahoo-finance";

type ExploreConfigItem = {
  symbol: string;
  yahooSymbol: string;
  name: string;
  market: string;
};

type ExploreCategoryConfig = {
  key: string;
  label: string;
  items: ExploreConfigItem[];
};

const EXPLORE_CONFIG: ExploreCategoryConfig[] = [
  {
    key: "indonesia",
    label: "Indonesia",
    items: [
      {
        symbol: "IHSG",
        yahooSymbol: "^JKSE",
        name: "Indeks Harga Saham Gabungan",
        market: "IDX",
      },
      {
        symbol: "LQ45",
        yahooSymbol: "^JKLQ45",
        name: "Liquid 45",
        market: "IDX",
      },
      {
        symbol: "IDX30",
        yahooSymbol: "IDX30.JK",
        name: "Indeks 30",
        market: "IDX",
      },
      {
        symbol: "JII",
        yahooSymbol: "^JKII",
        name: "Jakarta Islamic Index",
        market: "IDX",
      },
    ],
  },
  {
    key: "global",
    label: "Global",
    items: [
      {
        symbol: "KOSPI",
        yahooSymbol: "^KS11",
        name: "KOSPI",
        market: "Korea Selatan",
      },
      {
        symbol: "NASDAQ",
        yahooSymbol: "^IXIC",
        name: "Nasdaq Composite",
        market: "Amerika",
      },
      {
        symbol: "NIKKEI",
        yahooSymbol: "^N225",
        name: "Nikkei 225",
        market: "Jepang",
      },
      {
        symbol: "SSE",
        yahooSymbol: "000001.SS",
        name: "Shanghai Composite",
        market: "China",
      },
    ],
  },
  {
    key: "komoditas",
    label: "Komoditas",
    items: [
      {
        symbol: "XAUUSD",
        yahooSymbol: "GC=F",
        name: "Gold",
        market: "Global",
      },
      {
        symbol: "XAGUSD",
        yahooSymbol: "SI=F",
        name: "Silver",
        market: "Global",
      },
      {
        symbol: "WTI",
        yahooSymbol: "CL=F",
        name: "Crude Oil WTI",
        market: "Global",
      },
      {
        symbol: "BRENT",
        yahooSymbol: "BZ=F",
        name: "Brent Oil",
        market: "Global",
      },
    ],
  },
  {
    key: "currency",
    label: "Mata Uang",
    items: [
      {
        symbol: "USDIDR",
        yahooSymbol: "USDIDR=X",
        name: "US Dollar",
        market: "FX",
      },
      {
        symbol: "EURIDR",
        yahooSymbol: "EURIDR=X",
        name: "Euro",
        market: "FX",
      },
      {
        symbol: "JPYIDR",
        yahooSymbol: "JPYIDR=X",
        name: "Japanese Yen",
        market: "FX",
      },
      {
        symbol: "MYRIDR",
        yahooSymbol: "MYRIDR=X",
        name: "Malaysian Ringgit",
        market: "FX",
      },
    ],
  },
];

const ALL_YAHOO_SYMBOLS = EXPLORE_CONFIG.flatMap((category) =>
  category.items.map((item) => item.yahooSymbol),
);

function getIdxLogoUrl(symbol: string) {
  return `https://ik.imagekit.io/kuh/istock/indeks/${symbol}.png?tr=f-auto`;
}

function toTrend(changePercent: number): AssetTrend {
  if (changePercent > 0) return "up";
  if (changePercent < 0) return "down";
  return "flat";
}

function formatChange(changePercent: number) {
  const formatted = Math.abs(changePercent).toFixed(2).replace(".", ",");
  const sign = changePercent > 0 ? "+" : changePercent < 0 ? "-" : "";
  return `${sign}${formatted}%`;
}

function formatPrice(value: number, market: string) {
  if (!Number.isFinite(value) || value <= 0) return "-";

  if (market === "FX") {
    return value.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString("id-ID", {
    minimumFractionDigits: value >= 1000 ? 0 : 2,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  });
}

/** Check if IDX market is currently open (Mon–Fri, 09:00–15:00 WIB / UTC+7). */
function isMarketOpen(market: string): boolean {
  if (market !== "IDX") return true; // global/commodities/FX default to open

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const wib = new Date(utc + 7 * 3_600_000);

  const day = wib.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;

  const hour = wib.getHours();
  const minute = wib.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // IDX regular trading: 09:00 – 15:00 WIB
  return totalMinutes >= 9 * 60 && totalMinutes < 15 * 60;
}

async function fetchSparkline(yahooSymbol: string) {
  try {
    // Use rolling 30-day window so sparkline data from the last
    // trading session is still available after long holidays.
    const now = new Date();
    const fetchStart = new Date(now);
    fetchStart.setDate(fetchStart.getDate() - 30);

    const response = await yahooFinance.chart(yahooSymbol, {
      period1: fetchStart,
      period2: now,
      interval: "5m",
    });

    const closes = response.quotes
      .map((entry) => entry.close)
      .filter((close): close is number => Number.isFinite(close));

    if (closes.length >= 3) {
      return closes.map((value) => Number(value.toFixed(2)));
    }

    // Fallback: daily data from last 15 trading days (~3 weeks)
    // to show meaningful price movement even when market is closed.
    const fifteenDaysAgo = new Date(now);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const dailyResponse = await yahooFinance.chart(yahooSymbol, {
      period1: fifteenDaysAgo,
      period2: now,
      interval: "1d",
    });

    const dailyCloses = dailyResponse.quotes
      .map((entry) => entry.close)
      .filter((close): close is number => Number.isFinite(close));

    if (dailyCloses.length < 2) {
      // Return a minimal array so sparkline shows nothing instead of a flat line
      return [];
    }

    // Return last 15 daily closes for a smooth visible trend
    return dailyCloses.slice(-15).map((value) => Number(value.toFixed(2)));
  } catch {
    return [];
  }
}

export async function getExploreCategories(): Promise<ExploreCategory[]> {
  const quoteResult = await yahooFinance.quote(ALL_YAHOO_SYMBOLS);
  const quotes = Array.isArray(quoteResult) ? quoteResult : [quoteResult];

  const quoteBySymbol = new Map(
    quotes
      .filter((quote) => typeof quote.symbol === "string")
      .map((quote) => [quote.symbol, quote] as const),
  );

  const sparklinePairs = await Promise.all(
    ALL_YAHOO_SYMBOLS.map(async (symbol) => {
      const sparkline = await fetchSparkline(symbol);
      return [symbol, sparkline] as const;
    }),
  );

  const sparklineBySymbol = new Map(sparklinePairs);

  return EXPLORE_CONFIG.map((category) => ({
    key: category.key,
    label: category.label,
    items: category.items.map((item) => {
      const quote = quoteBySymbol.get(item.yahooSymbol);
      const regularMarketPrice = Number(quote?.regularMarketPrice ?? 0);
      const regularMarketChangePercent = Number(
        quote?.regularMarketChangePercent ?? 0,
      );

      return {
        symbol: item.symbol,
        logo:
          item.market === "IDX" ||
          ["global", "currency", "komoditas"].includes(category.key)
            ? getIdxLogoUrl(item.symbol)
            : undefined,
        name: quote?.longName ?? item.name,
        market: item.market,
        priceHint: formatPrice(regularMarketPrice, item.market),
        change: formatChange(regularMarketChangePercent),
        trend: toTrend(regularMarketChangePercent),
        chart: sparklineBySymbol.get(item.yahooSymbol) ?? [],
        isMarketOpen: isMarketOpen(item.market),
      };
    }),
  }));
}
