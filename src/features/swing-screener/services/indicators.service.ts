import { MACD, RSI } from "technicalindicators";
import { yahooFinance } from "@/lib/yahoo-finance";
import { redis } from "@/lib/redis/redis";
import { screenerConfig } from "../lib/screener-config";
import { computeTradeSetup } from "./sr-zone.service";
import type {
  IdxCandle,
  SwingScreenerResult,
  SwingScreenerSignals,
} from "../types";
import type { NetForeignPayload } from "@/features/foreign-flow/services/net-foreign.service";

function toJK(ticker: string) {
  return ticker.endsWith(".JK") ? ticker : `${ticker}.JK`;
}

/** Bentuk minimal quote harian dari Yahoo Finance chart (nilai OHLC bisa null). */
type RawQuote = {
  date?: Date | string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

/** Normalisasi hasil `yahooFinance.chart()` jadi IdxCandle[] (buang baris OHLC null). */
function normalizeCandles(history: RawQuote[]): IdxCandle[] {
  return history
    .filter(
      (d) =>
        d?.date != null &&
        d?.open != null &&
        d?.high != null &&
        d?.low != null &&
        d?.close != null,
    )
    .map((d) => ({
      time: new Date(d.date as Date).toISOString().slice(0, 10),
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
      volume: Number(d.volume ?? 0),
    }));
}

/** SMA yang sejajar index dengan array input (null di baris awal). */
function smaAligned(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;

  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }

  return out;
}

/** MA20 golden cross MA50 dalam `lookback` bar terakhir. */
function computeGoldenCross(
  ma20: (number | null)[],
  ma50: (number | null)[],
  lookback = 5,
): boolean {
  const n = Math.min(ma20.length, ma50.length);
  const start = Math.max(1, n - lookback);

  for (let i = start; i < n; i += 1) {
    const prev20 = ma20[i - 1];
    const prev50 = ma50[i - 1];
    const cur20 = ma20[i];
    const cur50 = ma50[i];

    if (
      prev20 == null ||
      prev50 == null ||
      cur20 == null ||
      cur50 == null
    ) {
      continue;
    }

    if (prev20 <= prev50 && cur20 > cur50) return true;
  }

  return false;
}

/**
 * Akumulasi asing: net foreign positif secara kumulatif dalam N hari
 * perdagangan terakhir (baca cache Redis `netForeign` — data layer existing).
 */
async function getForeignAccumulation(
  ticker: string,
  days: number,
): Promise<boolean> {
  try {
    const payload = await redis.get<NetForeignPayload>("netForeign");
    const recent = payload?.data?.slice(0, days) ?? [];

    if (recent.length === 0) return false;

    let totalNet = 0;
    for (const day of recent) {
      const stock = day.stocks.find(
        (s) => s.stockCode.toUpperCase() === ticker.toUpperCase(),
      );
      totalNet += stock?.totalForeignNet ?? 0;
    }

    return totalNet > 0;
  } catch (error) {
    console.warn("⚠️ getForeignAccumulation skipped:", ticker, error);
    return false;
  }
}

/** Evaluasi 6 sinyal kriteria lolos dari nilai indikator yang sudah dihitung. */
export function evaluateSignals(input: {
  close: number;
  ma20: number | null;
  ma50: number | null;
  ma20Series: (number | null)[];
  ma50Series: (number | null)[];
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  volumeRatio: number | null;
  foreignAccumulation: boolean;
}): { signals: SwingScreenerSignals; score: number; passed: boolean } {
  const signals: SwingScreenerSignals = {
    maBullish:
      input.ma20 != null &&
      input.ma50 != null &&
      input.close > input.ma20 &&
      input.ma20 > input.ma50,
    goldenCross: computeGoldenCross(input.ma20Series, input.ma50Series),
    rsiMomentum:
      input.rsi != null &&
      input.rsi >= screenerConfig.rsi.min &&
      input.rsi <= screenerConfig.rsi.max,
    macdBullish:
      input.macd != null &&
      input.macdSignal != null &&
      input.macd > input.macdSignal,
    volumeBreakout:
      input.volumeRatio != null &&
      input.volumeRatio >= screenerConfig.volumeRatioMin,
    foreignAccumulation: input.foreignAccumulation,
  };

  const score = Object.values(signals).filter(Boolean).length;
  const passed = score >= screenerConfig.minScore;

  return { signals, score, passed };
}

/**
 * Hitung indikator + trade setup untuk satu ticker.
 *
 * Aturan penting: `tradeSetup` menentukan `passed` final. Saham dianggap lolos
 * HANYA jika sinyal indikator lama terpenuhi (`evaluateSignals`) DAN
 * `computeTradeSetup` menghasilkan setup valid (non-null) yang lolos filter
 * kualitas (reward:risk & jarak TP1). Tanpa BOW/TP/SL yang jelas, entry-nya
 * nggak layak — jangan diloloskan walau indikator lain semua terpenuhi.
 */
export async function computeIndicatorsForTicker(
  ticker: string,
  quote?: {
    name: string | null;
    sector: string | null;
    price: number | null;
    changePct: number | null;
  } | null,
): Promise<SwingScreenerResult | null> {
  try {
    const symbol = toJK(ticker);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const chartResult = (await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
      return: "array",
    })) as { quotes: RawQuote[] };

    const candles = normalizeCandles(chartResult.quotes ?? []);
    if (candles.length < 60) {
      console.warn(`⚠️ ${ticker}: candle tidak cukup (${candles.length})`);
      return null;
    }

    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const lastClose = closes[closes.length - 1];

    const ma20Series = smaAligned(closes, 20);
    const ma50Series = smaAligned(closes, 50);
    const ma20 = ma20Series[ma20Series.length - 1];
    const ma50 = ma50Series[ma50Series.length - 1];

    const rsiArr = RSI.calculate({ values: closes, period: 14 });
    const rsi = rsiArr[rsiArr.length - 1] ?? null;

    const macdArr = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const macd = macdArr[macdArr.length - 1]?.MACD ?? null;
    const macdSignal = macdArr[macdArr.length - 1]?.signal ?? null;

    // Volume ratio: volume terakhir / rata-rata volume 20 hari
    const avgVolumeArr = smaAligned(volumes, 20);
    const avgVolume20 = avgVolumeArr[avgVolumeArr.length - 1];
    const volumeRatio =
      avgVolume20 != null && avgVolume20 > 0
        ? volumes[volumes.length - 1] / avgVolume20
        : null;

    const foreignAccumulation = await getForeignAccumulation(
      ticker,
      screenerConfig.foreignAccumulationDays,
    );

    // ── Kriteria sinyal lama (MA/RSI/MACD/volume/foreign) ──
    const evaluateSignalsResult = evaluateSignals({
      close: lastClose,
      ma20,
      ma50,
      ma20Series,
      ma50Series,
      rsi,
      macd,
      macdSignal,
      volumeRatio,
      foreignAccumulation,
    });

    // ── Trade setup (S/R zone) — dihitung untuk SEMUA ticker, bukan cuma
    //    yang lolos indikator lain, karena hasilnya dipakai buat nentuin passed ──
    const tradeSetup = computeTradeSetup(candles, lastClose);

    // ── Filter kualitas setup ──
    const rewardRiskRatio =
      tradeSetup != null
        ? tradeSetup.tp1Pct / Math.abs(tradeSetup.slPct)
        : 0;

    const passesQuality =
      tradeSetup != null &&
      rewardRiskRatio >= screenerConfig.tradeSetupQuality.minRewardRiskRatio &&
      tradeSetup.tp1Pct >= screenerConfig.tradeSetupQuality.minTp1Pct;

    // ── Passed final = sinyal lama AND trade setup valid & berkualitas ──
    const passed = evaluateSignalsResult.passed && passesQuality;

    const price = quote?.price ?? lastClose;
    const changePct = quote?.changePct ?? 0;

    return {
      ticker,
      name: quote?.name ?? null,
      sector: quote?.sector ?? null,
      price,
      changePct,
      volume: volumes[volumes.length - 1] ?? 0,
      volumeRatio,
      rsi,
      macd,
      macdSignal,
      ma20,
      ma50,
      score: evaluateSignalsResult.score,
      signals: evaluateSignalsResult.signals,
      passed,
      tradeSetup,
    };
  } catch (error) {
    console.warn(`⚠️ ${ticker} di-skip:`, error);
    return null;
  }
}
