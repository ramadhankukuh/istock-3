import { NextRequest, NextResponse } from "next/server";
import { yahooFinance } from "@/lib/yahoo-finance";
import { redis } from "@/lib/redis/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 300;

type SearchResult = {
  symbol: string; // short code, tanpa .JK
  name: string;
};

type SearchQuote = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchange?: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const cacheKey = `stockSearch:${q.toUpperCase()}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await yahooFinance.search(q, {
      quotesCount: 10,
      newsCount: 0,
    });

    const results: SearchResult[] = [];
    const seen = new Set<string>();

    for (const quote of (data.quotes ?? []) as SearchQuote[]) {
      const symbol = quote?.symbol;
      if (!symbol) continue;
      // Hanya saham (EQUITY) di bursa Indonesia (suffix .JK / exchange JKT).
      if (quote.quoteType !== "EQUITY") continue;
      if (!symbol.endsWith(".JK") && quote.exchange !== "JKT") continue;

      const shortCode = symbol.replace(/\.JK$/i, "").toUpperCase();
      if (seen.has(shortCode)) continue;

      const name = quote.longname ?? quote.shortname ?? null;
      if (!name) continue;

      seen.add(shortCode);
      results.push({ symbol: shortCode, name: String(name) });
    }

    const payload = { results };
    await redis.set(cacheKey, payload, { exSeconds: CACHE_TTL_SECONDS });
    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Failed to search stocks:", error);
    return NextResponse.json({ results: [] });
  }
}
