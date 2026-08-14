import { yahooFinance } from "@/lib/yahoo-finance";
import { redis } from "@/lib/redis/redis";
import { kongloList } from "@/lib/data/konglo-list";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toJK(ticker: string) {
  return ticker.endsWith(".JK") ? ticker : `${ticker}.JK`;
}

function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("day")}/${get("month")}/${get("year")}  ${get("hour")}:${get("minute")}:${get("second")}`;
}

export async function fetchAndCacheKonglo() {
  console.log("🚀 Starting Konglo data fetch...");

  const allTickers = kongloList.flatMap((g) => g.tickers);
  const uniqueTickers = Array.from(new Set(allTickers));
  const tickersJK = uniqueTickers.map(toJK);

  // 1️⃣ BATCH QUOTE
  console.log("📥 Fetching quotes:", tickersJK.length);
  const quotes: any[] = await yahooFinance.quote(tickersJK);
  const quoteMap = new Map(
    quotes.filter((q) => q?.symbol).map((q) => [q.symbol, q]),
  );

  const results: any[] = [];
  const now = new Date();
  const date30DaysAgo = new Date(now.getTime() - 30 * 86400000);

  for (let i = 0; i < uniqueTickers.length; i++) {
    const ticker = uniqueTickers[i];
    const symbol = toJK(ticker);
    const q = quoteMap.get(symbol);

    console.log(`🔄 ${i + 1}/${uniqueTickers.length}: ${ticker}`);

    const priceNow = q?.regularMarketPrice ?? null;
    const prevClose = q?.regularMarketPreviousClose ?? null;

    if (!priceNow) {
      console.warn("⛔ Price not available:", ticker);
      continue;
    }

    // 2️⃣ FUNDAMENTAL (PBV, PER)
    let pbv: number | null = null;
    let per: number | null = null;
    try {
      const summary: any = await yahooFinance.quoteSummary(toJK(ticker), {
        modules: ["defaultKeyStatistics"],
      });
      const stats = summary?.defaultKeyStatistics;
      pbv = stats?.priceToBook ?? null;
      per = stats?.trailingPE ?? stats?.forwardPE ?? null;
    } catch {
      console.warn("⚠️ quoteSummary skipped:", ticker);
    }

    // 3️⃣ HISTORICAL (7D / 30D)
    let price7d: number | null = null;
    let price30d: number | null = null;
    try {
      const historical = await yahooFinance.historical(toJK(ticker), {
        period1: date30DaysAgo,
        period2: now,
      });
      if (historical?.length) {
        historical.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
        price30d = historical[0]?.close ?? null;
        price7d = historical.length >= 8
          ? (historical[historical.length - 8]?.close ?? null)
          : null;
      }
    } catch {
      console.warn("⚠️ historical skipped:", ticker);
    }

    // 4️⃣ RETURN CALC
    const return1d = prevClose ? ((priceNow - prevClose) / prevClose) * 100 : null;
    const return7d = price7d ? ((priceNow - price7d) / price7d) * 100 : null;
    const return30d = price30d ? ((priceNow - price30d) / price30d) * 100 : null;

    // 5️⃣ PUSH RESULT
    results.push({
      ticker,
      price: priceNow,
      changePct: return1d,
      return1d,
      return7d,
      return30d,
      marketCap: q?.marketCap ?? null,
      pbv,
      per,
      fromLow: q?.fiftyTwoWeekLow
        ? ((priceNow - q.fiftyTwoWeekLow) / q.fiftyTwoWeekLow) * 100
        : null,
      fromHigh: q?.fiftyTwoWeekHigh
        ? ((priceNow - q.fiftyTwoWeekHigh) / q.fiftyTwoWeekHigh) * 100
        : null,
      atl: q?.fiftyTwoWeekLow ?? null,
      ath: q?.fiftyTwoWeekHigh ?? null,
    });

    // ⏳ DELAY
    await sleep(800);
  }

  // 6️⃣ SAVE TO REDIS
  console.log("💾 Saving Konglo data to Redis...");

  await redis.set("kongloData", {
    lastUpdate: formatDate(new Date()),
    total: results.length,
    data: results,
  });

  console.log("✅ Konglo data cached:", results.length, "records");
}
