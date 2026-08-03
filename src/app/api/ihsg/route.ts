import { NextResponse } from "next/server";
import { yahooFinance } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

/**
 * Convert a UTC Date to WIB (Asia/Jakarta, UTC+7) local time parts.
 * Returns an object with year, month, day, hours, minutes so we can
 * filter strictly by IDX trading session (09:00–16:00 WIB).
 */
function toWIB(date: Date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60_000;
  const wib = new Date(utc + 7 * 3_600_000);
  return {
    year: wib.getFullYear(),
    month: wib.getMonth(),
    day: wib.getDate(),
    hours: wib.getHours(),
    minutes: wib.getMinutes(),
  };
}

/**
 * Format hours+minutes as "HH:mm" in WIB.
 */
function formatWIB(date: Date): string {
  const { hours, minutes } = toWIB(date);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Filter raw chart quotes for a specific date (WIB) within IDX trading hours.
 * Returns sorted intraday points with "HH:mm" time and price.
 */
function filterIntraday(
  quotes: { date: Date; close: number | null }[],
  targetYear: number,
  targetMonth: number,
  targetDay: number,
) {
  interface IntradayPoint {
    time: string;
    price: number;
  }

  return quotes
    .filter(
      (q): q is typeof q & { close: number } =>
        q.close !== null && q.close !== undefined && Number.isFinite(q.close),
    )
    .map((q) => ({
      date: q.date,
      wib: toWIB(q.date),
      close: Number(q.close),
    }))
    .filter(
      (d) =>
        d.wib.year === targetYear &&
        d.wib.month === targetMonth &&
        d.wib.day === targetDay,
    )
    .filter((d) => d.wib.hours >= 9 && d.wib.hours < 16)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(
      (d) =>
        ({
          time: `${String(d.wib.hours).padStart(2, "0")}:${String(d.wib.minutes).padStart(2, "0")}`,
          price: d.close,
        }) satisfies IntradayPoint,
    );
}

export async function GET() {
  try {
    const now = new Date();
    const { year, month, day } = toWIB(now);

    // ── 1. Previous close (last complete daily bar) ──────────────────────
    // yahoo-finance2 may throw "SOME null values" when today's bar has
    // partial nulls (close=null while open/high/low are populated).  We
    // gracefully fall back to quote.regularMarketPreviousClose in that case.
    let prevClose = 0;
    try {
      const prevDays = 7;
      const startDaily = new Date(now.getTime() - prevDays * 24 * 60 * 60 * 1000);
      const dailyHistory = await yahooFinance.historical("^JKSE", {
        period1: startDaily,
        period2: now,
        interval: "1d",
      });
      prevClose =
        dailyHistory.length > 1
          ? Number(dailyHistory[dailyHistory.length - 2].close)
          : dailyHistory.length > 0
            ? Number(dailyHistory[dailyHistory.length - 1].close)
            : 0;
    } catch {
      // Fallback: use previous close from quote
      const quoteSnapshot = await yahooFinance.quote("^JKSE");
      prevClose = Number(
        quoteSnapshot.regularMarketPreviousClose ??
          quoteSnapshot.regularMarketOpen ??
          0,
      );
    }

    // ── 2. Intraday 5-minute data ───────────────────────────────────────
    // Use a 30-day window so data from the last trading session is
    // still available even after long holiday periods (e.g. 7+ days).
    const startIntraday = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const chart = await yahooFinance.chart("^JKSE", {
      period1: startIntraday,
      period2: now,
      interval: "5m",
    });

    // ── 3. Get intraday for today; if empty, fallback to previous days ──
    let intraday = filterIntraday(chart.quotes, year, month, day);
    let fallbackLabel: string | null = null;

    if (intraday.length === 0) {
      // Walk back through available data to find the last trading
      // session — handles weekends and long holidays (up to ~30 days).
      for (let i = 1; i <= 30; i++) {
        const prev = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const prevWIB = toWIB(prev);
        intraday = filterIntraday(
          chart.quotes,
          prevWIB.year,
          prevWIB.month,
          prevWIB.day,
        );
        if (intraday.length > 0) {
          fallbackLabel = `${String(prevWIB.year)}-${String(prevWIB.month + 1).padStart(2, "0")}-${String(prevWIB.day).padStart(2, "0")}`;
          break;
        }
      }
    }

    // ── 4. Quote data for price header ──────────────────────────────────
    const quote = await yahooFinance.quote("^JKSE");
    const lastPrice =
      intraday.length > 0 ? intraday[intraday.length - 1].price : prevClose;
    const change = lastPrice - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return NextResponse.json({
      prevClose,
      intraday,
      fallbackDate: fallbackLabel,
      quote: {
        price: Number(quote.regularMarketPrice ?? lastPrice),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        marketState: quote.marketState ?? "CLOSED",
        open: Number(quote.regularMarketOpen ?? prevClose),
        dayHigh: Number(quote.regularMarketDayHigh ?? lastPrice),
        dayLow: Number(quote.regularMarketDayLow ?? lastPrice),
        volume: Number(quote.regularMarketVolume ?? 0),
      },
    });
  } catch (error) {
    console.error("Failed to fetch IHSG data:", error);
    return NextResponse.json(
      { error: "Failed to fetch IHSG data" },
      { status: 500 },
    );
  }
}
