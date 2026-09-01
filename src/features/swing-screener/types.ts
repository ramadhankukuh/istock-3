/**
 * Types untuk Swing Trade Screener.
 *
 * `tradeSetup` dihitung dari struktur support/resistance (pivot high/low pada
 * histori candle) — terpisah dari indikator MA/RSI/MACD, tapi hasilnya ikut
 * menentukan status lolos screening (`passed`).
 */

/** Candle harian IDX hasil normalisasi dari Yahoo Finance chart. */
export type IdxCandle = {
  time: string; // YYYY-MM-DD (ascending by date)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/** Trade setup BOW/TP1/TP2/SL hasil `computeTradeSetup`. */
export type TradeSetup = {
  buyOnWeakness: number;
  tp1: number;
  tp1Pct: number;
  tp2: number | null;
  tp2Pct: number | null;
  sl: number;
  slPct: number;
};

/** Enam sinyal kriteria lolos (skor 0-6). */
export type SwingScreenerSignals = {
  /** close > MA20 > MA50 */
  maBullish: boolean;
  /** MA20 golden cross MA50 dalam beberapa bar terakhir */
  goldenCross: boolean;
  /** RSI berada dalam rentang momentum (55-70) */
  rsiMomentum: boolean;
  /** MACD > signal line */
  macdBullish: boolean;
  /** volume hari ini >= volumeRatioMin × rata-rata 20 hari */
  volumeBreakout: boolean;
  /** akumulasi asing net positif dalam N hari terakhir */
  foreignAccumulation: boolean;
};

/** Satu baris hasil screening. */
export type SwingScreenerResult = {
  ticker: string;
  name: string | null;
  sector: string | null;
  price: number;
  changePct: number;
  volume: number;
  volumeRatio: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  ma20: number | null;
  ma50: number | null;
  score: number;
  signals: SwingScreenerSignals;
  /** Lolos penuh: sinyal terpenuhi DAN trade setup valid & berkualitas. */
  passed: boolean;
  tradeSetup: TradeSetup | null;
};

/** Payload yang dicache di Redis dan dibaca halaman /explore. */
export type SwingScreenerPayload = {
  lastUpdate: string;
  lastUpdateFormatted: string;
  total: number;
  passedCount: number;
  results: SwingScreenerResult[];
};
