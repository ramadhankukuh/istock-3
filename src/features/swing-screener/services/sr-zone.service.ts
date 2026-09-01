import { screenerConfig } from "../lib/screener-config";
import type { IdxCandle, TradeSetup } from "../types";

type Pivot = { price: number; index: number };

/**
 * Cari pivot high/low: titik tertinggi/terendah dalam window kiri-kanan
 * `lookback`. Pure function tanpa I/O.
 */
function findPivots(candles: IdxCandle[], lookback: number) {
  const highs: Pivot[] = [];
  const lows: Pivot[] = [];

  for (let i = lookback; i < candles.length - lookback; i++) {
    const window = candles.slice(i - lookback, i + lookback + 1);
    const high = candles[i].high;
    const low = candles[i].low;
    if (high == null || low == null) continue;

    const isHighPivot = window.every((c) => c.high == null || c.high <= high);
    const isLowPivot = window.every((c) => c.low == null || c.low >= low);

    if (isHighPivot) highs.push({ price: high, index: i });
    if (isLowPivot) lows.push({ price: low, index: i });
  }

  return { highs, lows };
}

/**
 * Gabung level yang berdekatan (dalam toleransi %) jadi satu zone, ambil
 * rata-rata harga level di dalam cluster.
 */
function clusterLevels(pivots: Pivot[], tolerancePct: number): number[] {
  const sorted = [...pivots].sort((a, b) => a.price - b.price);
  const clusters: number[][] = [];

  for (const p of sorted) {
    const last = clusters[clusters.length - 1];
    const lastPrice = last?.[last.length - 1];
    if (
      last &&
      lastPrice != null &&
      (Math.abs(p.price - lastPrice) / lastPrice) * 100 <= tolerancePct
    ) {
      last.push(p.price);
    } else {
      clusters.push([p.price]);
    }
  }

  return clusters.map((c) => c.reduce((a, b) => a + b, 0) / c.length);
}

/**
 * Hitung setup swing trade dari histori candle (ascending by date).
 *
 * BOW = support terdekat di bawah harga sekarang (kalau dekat, dalam toleransi
 * cluster), atau harga sekarang kalau tidak ada support dekat.
 * TP1/TP2 = 2 resistance terdekat di atas BOW.
 * SL = support terdekat di bawah BOW.
 *
 * Return null kalau resistance/support yang valid tidak ketemu.
 */
export function computeTradeSetup(
  candles: IdxCandle[],
  currentPrice: number,
): TradeSetup | null {
  const { pivotLookback, clusterTolerancePct } = screenerConfig.srZone;
  const { highs, lows } = findPivots(candles, pivotLookback);

  const resistances = clusterLevels(highs, clusterTolerancePct)
    .filter((lvl) => lvl > currentPrice)
    .sort((a, b) => a - b);
  const supports = clusterLevels(lows, clusterTolerancePct)
    .filter((lvl) => lvl < currentPrice)
    .sort((a, b) => b - a);

  if (resistances.length === 0 || supports.length === 0) return null;

  const nearestSupport = supports[0];
  const buyOnWeakness =
    nearestSupport / currentPrice > 1 - clusterTolerancePct / 100
      ? nearestSupport
      : currentPrice;

  const tpCandidates = resistances.filter((r) => r > buyOnWeakness);
  const slCandidates = supports.filter((s) => s < buyOnWeakness);

  const tp1 = tpCandidates[0];
  const tp2 = tpCandidates[1] ?? null;
  const sl = slCandidates[0];

  if (tp1 == null || sl == null) return null;

  return {
    buyOnWeakness,
    tp1,
    tp1Pct: ((tp1 - buyOnWeakness) / buyOnWeakness) * 100,
    tp2,
    tp2Pct: tp2 != null ? ((tp2 - buyOnWeakness) / buyOnWeakness) * 100 : null,
    sl,
    slPct: ((sl - buyOnWeakness) / buyOnWeakness) * 100,
  };
}
