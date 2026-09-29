import { MACD, RSI } from "technicalindicators";
import { screenerConfig } from "../lib/screener-config";
import { computeTradeSetup } from "./sr-zone.service";
import type {
  IdxCandle,
  SwingScreenerResult,
  SwingScreenerSignals,
} from "../types";

/**
 * Hitung indikator + trade setup untuk satu ticker dari histori candle Turso.
 *
 * Modul murni (pure) — input candle (ascending by date), output hasil analisis.
 * Tidak ada I/O: data OHLC & foreign net sudah tersedia di candle.
 */

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

    if (prev20 == null || prev50 == null || cur20 == null || cur50 == null) {
      continue;
    }

    if (prev20 <= prev50 && cur20 > cur50) return true;
  }

  return false;
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
 * Hitung indikator + trade setup untuk satu ticker dari histori candle Turso.
 *
 * Aturan penting: `tradeSetup` menentukan `passed` final. Saham dianggap lolos
 * HANYA jika sinyal indikator terpenuhi (`evaluateSignals`) DAN
 * `computeTradeSetup` menghasilkan setup valid (non-null) yang lolos filter
 * kualitas (reward:risk & jarak TP1). Tanpa BOW/TP/SL yang jelas, entry-nya
 * nggak layak — jangan diloloskan walau indikator lain semua terpenuhi.
 */
export function computeIndicatorsForTicker(
  ticker: string,
  candles: IdxCandle[],
  name: string | null = null,
): SwingScreenerResult | null {
  const valid = candles.filter(
    (c): c is IdxCandle & { close: number } => c.close != null,
  );

  if (valid.length < screenerConfig.minBars) return null;

  const closes = valid.map((c) => c.close);
  const volumes = valid.map((c) => c.volume ?? 0);
  const foreignNets = valid.map((c) => c.foreignNet ?? 0);

  const last = valid[valid.length - 1];
  const prev = valid[valid.length - 2];
  const lastClose = last.close;

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
      ? (last.volume ?? 0) / avgVolume20
      : null;

  // Akumulasi asing: net foreign kumulatif N hari terakhir > 0
  const recentForeign = foreignNets.slice(
    -screenerConfig.foreignAccumulationDays,
  );
  const foreignAccumulation =
    recentForeign.length > 0 &&
    recentForeign.reduce((acc, v) => acc + v, 0) > 0;

  // ── Kriteria sinyal (MA/RSI/MACD/volume/foreign) ──
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
  const tradeSetup = computeTradeSetup(valid, lastClose);

  // ── Filter kualitas setup ──
  const rewardRiskRatio =
    tradeSetup != null ? tradeSetup.tp1Pct / Math.abs(tradeSetup.slPct) : 0;

  const passesQuality =
    tradeSetup != null &&
    rewardRiskRatio >= screenerConfig.tradeSetupQuality.minRewardRiskRatio &&
    tradeSetup.tp1Pct >= screenerConfig.tradeSetupQuality.minTp1Pct;

  // ── Passed final = sinyal AND trade setup valid & berkualitas ──
  const passed = evaluateSignalsResult.passed && passesQuality;

  const changePct =
    prev && prev.close > 0 ? ((lastClose - prev.close) / prev.close) * 100 : 0;

  return {
    ticker,
    name,
    sector: null,
    price: lastClose,
    changePct,
    volume: last.volume ?? 0,
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
}
