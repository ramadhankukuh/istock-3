// app/api/stock/route.ts

import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { RSI, StochasticRSI, MACD, SMA } from "technicalindicators";
import { redis } from "@/lib/redis/redis";

const yahooFinance = new YahooFinance();

function normalizeStockCode(rawCode: string) {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) return "";
  return normalized.endsWith(".JK") ? normalized : `${normalized}.JK`;
}

// =========================
// HELPER FUNCTIONS
// =========================

function getSupportResistance(closes: number[]) {
  if (!closes.length) return { support: null, resistance: null };

  const sorted = [...closes].sort((a, b) => a - b);

  const support = sorted[Math.floor(sorted.length * 0.2)];
  const resistance = sorted[Math.floor(sorted.length * 0.8)];

  return { support, resistance };
}

function getVolumeRatio(volumes: number[], avg: number | null) {
  if (!volumes.length || !avg) return null;
  return volumes[volumes.length - 1] / avg;
}

async function getForeignFlow(stockCode: string, closePrice: number | null) {
  try {
    const cached = await redis.get("stockSummary");
    if (!cached) {
      return {
        foreign_buy: null,
        foreign_sell: null,
        net_foreign: null,
      };
    }

    const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    const matched = items.find(
      (item: any) =>
        typeof item?.stockCode === "string" &&
        item.stockCode.toUpperCase() === stockCode.toUpperCase(),
    );

    if (!matched) {
      return {
        foreign_buy: null,
        foreign_sell: null,
        net_foreign: null,
      };
    }

    const hasPrecomputedValues =
      matched.foreignBuy !== undefined && matched.foreignSell !== undefined;

    if (hasPrecomputedValues) {
      const foreignBuy = Number(matched.foreignBuy);
      const foreignSell = Number(matched.foreignSell);

      return {
        foreign_buy: Number.isFinite(foreignBuy) ? foreignBuy : null,
        foreign_sell: Number.isFinite(foreignSell) ? foreignSell : null,
        net_foreign:
          Number.isFinite(foreignBuy) && Number.isFinite(foreignSell)
            ? foreignBuy - foreignSell
            : null,
      };
    }

    const price = closePrice ?? null;
    if (!price) {
      return {
        foreign_buy: null,
        foreign_sell: null,
        net_foreign: null,
      };
    }

    const foreignBuyVolume = Number(matched.foreignBuyVolume ?? 0);
    const foreignSellVolume = Number(matched.foreignSellVolume ?? 0);

    if (
      !Number.isFinite(foreignBuyVolume) ||
      !Number.isFinite(foreignSellVolume)
    ) {
      return {
        foreign_buy: null,
        foreign_sell: null,
        net_foreign: null,
      };
    }

    const foreignBuy = foreignBuyVolume * price;
    const foreignSell = foreignSellVolume * price;

    return {
      foreign_buy: foreignBuy,
      foreign_sell: foreignSell,
      net_foreign: foreignBuy - foreignSell,
    };
  } catch {
    return {
      foreign_buy: null,
      foreign_sell: null,
      net_foreign: null,
    };
  }
}

// =========================
// API
// =========================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code") ?? "";
    const code = normalizeStockCode(rawCode);

    if (!code) {
      return NextResponse.json(
        { error: "Stock code is required" },
        { status: 400 },
      );
    }

    // =========================
    // FETCH FUNDAMENTAL
    // =========================

    const quoteSummary = (await yahooFinance.quoteSummary(code, {
      modules: [
        "price",
        "summaryProfile",
        "defaultKeyStatistics",
        "financialData",
        "summaryDetail",
      ],
    } as any)) as any;

    const quote = (await yahooFinance.quote(code)) as any;

    // =========================
    // FETCH HISTORICAL
    // =========================

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Use chart() instead of historical(): historical() throws on rows with
    // partial null OHLCV values (common on IDX halted days). chart() returns
    // raw quotes including nulls; they are filtered below.
    const chartResult = await yahooFinance.chart(code, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
      return: "array",
    });
    const history = chartResult.quotes;

    const closes = history.map((d: any) => d.close).filter(Boolean);
    const volumes = history.map((d: any) => d.volume).filter(Boolean);
    const candles = history
      .filter(
        (d: any) =>
          d?.date &&
          d?.open !== null &&
          d?.open !== undefined &&
          d?.high !== null &&
          d?.high !== undefined &&
          d?.low !== null &&
          d?.low !== undefined &&
          d?.close !== null &&
          d?.close !== undefined,
      )
      .map((d: any) => ({
        time: new Date(d.date).toISOString().slice(0, 10),
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
        volume: Number(d.volume ?? 0),
      }));

    // =========================
    // TECHNICAL CALCULATION
    // =========================

    const rsi14 =
      RSI.calculate({
        values: closes,
        period: 14,
      }).slice(-1)[0] ?? null;

    const stochRsi =
      StochasticRSI.calculate({
        values: closes,
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3,
      }).slice(-1)[0] ?? null;

    const macd =
      MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      }).slice(-1)[0] ?? null;

    const ma20 =
      SMA.calculate({
        period: 20,
        values: closes,
      }).slice(-1)[0] ?? null;

    const ma50 =
      SMA.calculate({
        period: 50,
        values: closes,
      }).slice(-1)[0] ?? null;

    const { support, resistance } = getSupportResistance(closes);

    const volRatio = getVolumeRatio(
      volumes,
      quoteSummary.summaryDetail?.averageVolume ?? null,
    );
    const foreignFlow = await getForeignFlow(
      code.replace(/\.JK$/i, ""),
      quote.regularMarketPrice ?? quote.regularMarketPreviousClose ?? null,
    );

    // =========================
    // RESPONSE
    // =========================

    const response = {
      profile: {
        code: code.replace(/\.JK$/i, ""),
        longName: quoteSummary.price?.longName ?? null,
        sector: quoteSummary.summaryProfile?.sector ?? null,
        market_cap: quoteSummary.price?.marketCap ?? null,
      },

      fundamental: {
        pe_ratio: quoteSummary.summaryDetail?.trailingPE ?? null,
        pb_ratio: quoteSummary.defaultKeyStatistics?.priceToBook ?? null,
        roe: quoteSummary.financialData?.returnOnEquity ?? null,
        der: quoteSummary.financialData?.debtToEquity ?? null,
        total_revenue: quoteSummary.financialData?.totalRevenue ?? null,
        net_income:
          quoteSummary.defaultKeyStatistics?.netIncomeToCommon ?? null,
        dividen: quoteSummary.summaryDetail?.dividendRate ?? null,
        dividen_yield: quoteSummary.summaryDetail?.dividendYield ?? null,
      },

      technical: {
        price: quote.regularMarketPrice ?? null,
        prev_close: quote.regularMarketPreviousClose ?? null,
        open_price: quote.regularMarketOpen ?? null,
        high: quote.regularMarketDayHigh ?? null,
        low: quote.regularMarketDayLow ?? null,
        volume: quote.regularMarketVolume ?? null,
        volume3m_avg: quoteSummary.summaryDetail?.averageVolume ?? null,
        volume10d_avg:
          quoteSummary.summaryDetail?.averageDailyVolume10Day ?? null,
        "52week_low": quoteSummary.summaryDetail?.fiftyTwoWeekLow ?? null,
        "52week_high": quoteSummary.summaryDetail?.fiftyTwoWeekHigh ?? null,

        // NEW TECHNICALS
        rsi14: rsi14,
        stoch_rsi_k: stochRsi?.k ?? null,
        stoch_rsi_d: stochRsi?.d ?? null,
        macd: macd?.MACD ?? null,
        macd_signal: macd?.signal ?? null,
        macd_histogram: macd?.histogram ?? null,
        ma20: ma20,
        ma50: ma50,
        support: support,
        resistance: resistance,
        volume_ratio: volRatio,
        foreign_buy: foreignFlow.foreign_buy,
        foreign_sell: foreignFlow.foreign_sell,
        net_foreign: foreignFlow.net_foreign,
      },

      score: {
        averageAnalystRating:
          quoteSummary.financialData?.recommendationKey ?? null,
      },

      chart: {
        candles,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
