import { NextRequest, NextResponse } from "next/server";
import { yahooFinance } from "@/lib/yahoo-finance";
import { redis } from "@/lib/redis/redis";
import { normalizeSymbol } from "@/features/chart/services/chart-data.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_DAYS = 7; // 1W → candle 1 jam selama 7 hari kalender terakhir
const CACHE_TTL_SECONDS = 60;

/**
 * Convert UTC Date → bagian waktu lokal WIB (Asia/Jakarta, UTC+7), dipakai
 * untuk filter jam trading IDX (09:00–16:00 WIB). Pola sama seperti route
 * `/api/ihsg` & `/api/chart/intraday`.
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
 * Filter quotes 1 jam untuk jam trading IDX (09:00–16:00 WIB) dan buang bar
 * dengan OHLC null. Return candle terurut ascending.
 */
function filterHourly(
  quotes: {
    date: Date;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
  }[],
) {
  return quotes
    .filter(
      (q): q is typeof q & Record<"open" | "high" | "low" | "close", number> =>
        q.open !== null &&
        q.open !== undefined &&
        q.high !== null &&
        q.high !== undefined &&
        q.low !== null &&
        q.low !== undefined &&
        q.close !== null &&
        q.close !== undefined,
    )
    .map((q) => ({ date: q.date, wib: toWIB(q.date), q }))
    .filter((d) => d.wib.hours >= 9 && d.wib.hours < 16)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ wib, q }) => ({
      time: `${wib.year}-${String(wib.month + 1).padStart(2, "0")}-${String(
        wib.day,
      ).padStart(2, "0")} ${String(wib.hours).padStart(2, "0")}:${String(
        wib.minutes,
      ).padStart(2, "0")}`,
      open: Number(q.open),
      high: Number(q.high),
      low: Number(q.low),
      close: Number(q.close),
    }));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get("symbol") ?? "";
    const symbol = normalizeSymbol(rawSymbol);

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 },
      );
    }

    const shortCode = symbol.replace(/\.JK$/i, "");
    const cacheKey = `chartHourly:${shortCode}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const now = new Date();
    const start = new Date(
      now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const chart = await yahooFinance.chart(
      symbol,
      {
        period1: start,
        period2: now,
        interval: "1h",
      },
      { validateResult: false } as any,
    );

    const points = filterHourly(chart.quotes);
    const payload = { symbol: shortCode, points };

    // Cache pendek supaya toggle range bolak-balik tidak spam Yahoo Finance.
    await redis.set(cacheKey, payload, { exSeconds: CACHE_TTL_SECONDS });

    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Failed to fetch hourly chart:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch hourly chart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
