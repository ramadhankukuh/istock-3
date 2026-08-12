import { SMA, RSI, MACD } from "technicalindicators";
import { screenerConfig } from "../lib/screener-config";
import type {
  IdxCandle,
  MaState,
  SwingScreenerResult,
} from "../types";

/**
 * Kompilasi indikator teknikal swing trade dari histori OHLC.
 * Modul murni (pure) — input candle, output hasil analisis + flag screening.
 * Tambah/kurangi indikator cukup di file ini + evaluasi signal di bawah.
 */

/** Ambil nilai finite terakhir dari array (scan dari belakang). */
function lastFinite(
  values: Array<number | null | undefined>,
): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i];
    if (v != null && Number.isFinite(v)) return v;
  }
  return null;
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return sum(values) / values.length;
}

/** Deteksi golden/death cross dalam lookback bar terakhir. */
function detectMaState(
  ma20Arr: number[],
  ma50Arr: number[],
  closes: number[],
): MaState {
  const { maCrossLookback } = screenerConfig;

  for (let i = 0; i < maCrossLookback; i++) {
    const idx = closes.length - 1 - i;
    if (idx < 1) break;

    const prevDiff = (ma20Arr[idx - 1] ?? NaN) - (ma50Arr[idx - 1] ?? NaN);
    const curDiff = (ma20Arr[idx] ?? NaN) - (ma50Arr[idx] ?? NaN);

    if (Number.isFinite(prevDiff) && Number.isFinite(curDiff)) {
      if (prevDiff <= 0 && curDiff > 0) return "golden-cross";
      if (prevDiff >= 0 && curDiff < 0) return "death-cross";
    }
  }

  const lastDiff =
    (ma20Arr[ma20Arr.length - 1] ?? NaN) - (ma50Arr[ma50Arr.length - 1] ?? NaN);

  if (!Number.isFinite(lastDiff)) return "none";

  return lastDiff > 0 ? "above" : "below";
}

type SignalInput = {
  maState: MaState;
  ma20: number | null;
  ma50: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  volumeRatio: number | null;
  foreignNet5d: number | null;
};

/** Evaluasi signal screening dari hasil indikator. */
export function evaluateSignals(input: SignalInput): {
  score: number;
  signals: string[];
  passed: boolean;
} {
  const { minScore, rsi, volumeRatioMin } = screenerConfig;
  const signals: string[] = [];

  if (
    input.ma20 != null &&
    input.ma50 != null &&
    input.ma20 > input.ma50
  ) {
    signals.push("ma-bullish");
  }

  if (input.maState === "golden-cross") {
    signals.push("golden-cross");
  }

  if (
    input.rsi14 != null &&
    input.rsi14 >= rsi.min &&
    input.rsi14 <= rsi.max
  ) {
    signals.push("rsi-momentum");
  }

  if (
    input.macd != null &&
    input.macdSignal != null &&
    input.macd > input.macdSignal
  ) {
    signals.push("macd-bullish");
  }

  if (input.volumeRatio != null && input.volumeRatio >= volumeRatioMin) {
    signals.push("volume-breakout");
  }

  if (input.foreignNet5d != null && input.foreignNet5d > 0) {
    signals.push("foreign-accumulation");
  }

  return {
    score: signals.length,
    signals,
    passed: signals.length >= minScore,
  };
}

/**
 * Hitung indikator untuk satu ticker dari histori candle (ascending by date).
 * Return null jika data tidak cukup.
 */
export function computeIndicatorsForTicker(
  ticker: string,
  candles: IdxCandle[],
): SwingScreenerResult | null {
  const valid = candles.filter(
    (c): c is IdxCandle & { close: number } => c.close != null,
  );
  if (valid.length < screenerConfig.minBars) return null;

  const closes = valid.map((c) => c.close as number);
  const volumes = valid.map((c) => c.volume ?? 0);
  const foreignNets = valid.map((c) => c.foreignNet ?? 0);

  const last = valid[valid.length - 1];
  const prev = valid[valid.length - 2];

  // Moving average
  const ma20Arr = SMA.calculate({ period: 20, values: closes });
  const ma50Arr = SMA.calculate({ period: 50, values: closes });
  const ma20 = lastFinite(ma20Arr);
  const ma50 = lastFinite(ma50Arr);

  // RSI 14
  const rsi14 = lastFinite(RSI.calculate({ period: 14, values: closes }));

  // MACD (12, 26, 9) — EMA-based (SimpleMAOscillator/SimpleMASignal=false)
  // adalah definisi MACD klasik (Appel). Flag wajib diisi di versi lib ini.
  const macdArr = MACD.calculate({
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
    values: closes,
  });
  const macd = lastFinite(macdArr.map((m) => m.MACD));
  const macdSignal = lastFinite(macdArr.map((m) => m.signal));
  const macdHistogram = lastFinite(macdArr.map((m) => m.histogram));

  // Volume relatif terhadap rata-rata 20 hari
  const avgVolume20 = avg(volumes.slice(-20));
  const volumeRatio =
    avgVolume20 != null && avgVolume20 > 0
      ? (last.volume ?? 0) / avgVolume20
      : null;

  // State MA + cross
  const maState = detectMaState(ma20Arr, ma50Arr, closes);

  // Perubahan harga 1 hari
  const changePct =
    prev && prev.close != null && prev.close > 0
      ? ((last.close - prev.close) / prev.close) * 100
      : null;

  // Akumulasi asing
  const foreignNet1d =
    foreignNets.length > 0 ? foreignNets[foreignNets.length - 1] : null;
  const foreignNet5d = sum(foreignNets.slice(-5));
  const foreignNet20d = sum(foreignNets.slice(-20));

  // Evaluasi signal + skor
  const { score, signals, passed } = evaluateSignals({
    maState,
    ma20,
    ma50,
    rsi14,
    macd,
    macdSignal,
    volumeRatio,
    foreignNet5d,
  });

  return {
    ticker,
    date: last.date,
    close: last.close,
    changePct,
    volume: last.volume,
    avgVolume20,
    volumeRatio,
    ma20,
    ma50,
    maState,
    rsi14,
    macd,
    macdSignal,
    macdHistogram,
    foreignNet1d,
    foreignNet5d,
    foreignNet20d,
    score,
    signals,
    passed,
  };
}
