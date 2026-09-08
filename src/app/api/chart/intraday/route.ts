import { NextRequest, NextResponse } from "next/server";
import { yahooFinance } from "@/lib/yahoo-finance";
import { redis } from "@/lib/redis/redis";
import { normalizeSymbol } from "@/features/chart/services/chart-data.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_DAYS = 5; // window mundur untuk fallback ke sesi trading terakhir
const CACHE_TTL_SECONDS = 60; // cache pendek, jangan spam Yahoo saat toggle range

/**
 * Convert UTC Date → bagian waktu lokal WIB (Asia/Jakarta, UTC+7), dipakai
 * untuk filter jam trading IDX (09:00–16:00 WIB). Pola sama seperti route
 * `/api/ihsg`.
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

/** Format tanggal WIB sebagai "YYYY-MM-DD". */
function formatDateWIB(date: Date): string {
  const { year, month, day } = toWIB(date);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Format jam WIB sebagai "HH:mm". */
function formatTimeWIB(date: Date): string {
  const { hours, minutes } = toWIB(date);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Filter quotes intraday untuk tanggal tertentu (WIB) dalam jam trading IDX
 * (09:00–16:00 WIB). Bar terakhir jam 16:00 = hasil closing auction, jadi
 * TIDAK dibuang (filter lama `< 16` membuat chart 1D berhenti di 15:45).
 * Return titik `{ time, open, high, low, close, price }` terurut ascending —
 * OHLC dipakai untuk menggambar candlestick 15 menit di range 1D.
 */
function filterIntraday(
  quotes: {
    date: Date;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
  }[],
  targetYear: number,
  targetMonth: number,
  targetDay: number,
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
        q.close !== undefined &&
        Number.isFinite(q.close),
    )
    .map((q) => ({
      date: q.date,
      wib: toWIB(q.date),
      open: Number(q.open),
      high: Number(q.high),
      low: Number(q.low),
      close: Number(q.close),
    }))
    .filter(
      (d) =>
        d.wib.year === targetYear &&
        d.wib.month === targetMonth &&
        d.wib.day === targetDay,
    )
    // 09:00 s.d. 15:59 + bar 16:00 (closing auction). Tidak ada bar > 16:00
    // karena IDX tidak punya sesi setelah penutupan.
    .filter(
      (d) =>
        d.wib.hours >= 9 &&
        (d.wib.hours < 16 || (d.wib.hours === 16 && d.wib.minutes === 0)),
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((d) => ({
      time: formatTimeWIB(d.date),
      price: d.close,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
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
    const cacheKey = `chartIntraday:${shortCode}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const now = new Date();
    const { year, month, day } = toWIB(now);

    // Window 5 hari supaya sesi trading terakhir tetap tersedia walau
    // hari ini libur/weekend (pola fallback sama seperti /api/ihsg).
    const start = new Date(
      now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const chart = await yahooFinance.chart(
      symbol,
      {
        period1: start,
        period2: now,
        interval: "15m",
      },
      { validateResult: false } as any,
    );

    let points = filterIntraday(chart.quotes, year, month, day);
    let date = formatDateWIB(now);

    if (points.length === 0) {
      // Walk back untuk menemukan sesi trading terakhir (weekend / libur).
      for (let i = 1; i <= WINDOW_DAYS; i++) {
        const prev = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const prevWIB = toWIB(prev);
        points = filterIntraday(
          chart.quotes,
          prevWIB.year,
          prevWIB.month,
          prevWIB.day,
        );
        if (points.length > 0) {
          date = `${prevWIB.year}-${String(prevWIB.month + 1).padStart(2, "0")}-${String(prevWIB.day).padStart(2, "0")}`;
          break;
        }
      }
    }

    const payload = { symbol: shortCode, date, points };

    // Cache pendek supaya toggle range 1D bolak-balik tidak spam Yahoo Finance.
    await redis.set(cacheKey, payload, { exSeconds: CACHE_TTL_SECONDS });

    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Failed to fetch intraday chart:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch intraday chart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
