import { NextResponse } from "next/server";
import { yahooFinance } from "@/lib/yahoo-finance";

const symbols = {
  ihsg: "^JKSE",
  gold: "GC=F",
  usdidr: "IDR=X",
  btcusd: "BTC-USD",
};

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<
    string,
    { price: number | null; change: number | null }
  > = {};

  for (const [key, symbol] of Object.entries(symbols)) {
    try {
      const quote = await yahooFinance.quote(symbol);
      const price = quote.regularMarketPrice ?? null;
      const prevClose = quote.regularMarketPreviousClose ?? null;

      let change: number | null = null;
      if (price !== null && prevClose !== null && prevClose !== 0) {
        change = parseFloat(
          (((price - prevClose) / prevClose) * 100).toFixed(2),
        );
      }

      result[key] = { price, change };
    } catch (err) {
      console.error(`Error fetching market status for ${key}:`, err);
      result[key] = { price: null, change: null };
    }
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate",
    },
  });
}
