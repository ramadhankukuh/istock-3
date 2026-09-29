/**
 * Types untuk Swing Trade Screener.
 *
 * Sumber data: histori OHLC harian IDX disimpan di Turso (SQLite), diisi oleh
 * pipeline cron dari endpoint IDX Trading Summary (1 request = semua saham).
 * Hasil screening ditulis ke Redis dan dibaca halaman /explore.
 *
 * `tradeSetup` dihitung dari struktur support/resistance (pivot high/low pada
 * histori candle) — terpisah dari indikator MA/RSI/MACD, tapi hasilnya ikut
 * menentukan status lolos screening (`passed`).
 */

/** Candle harian IDX hasil mapping dari response IDX Trading Summary. */
export type IdxCandle = {
  ticker: string;
  /** Tanggal trading, format YYYY-MM-DD. */
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  value: number | null;
  /** ForeignBuy - ForeignSell (dalam rupiah). */
  foreignNet: number | null;
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

/** Ringkasan pipeline yang ditulis bersama hasil (buat observability cron). */
export type SwingScreenerSummary = {
  fetched: number;
  universeSize: number;
  upserted: number;
  trimmed: number;
  screened: number;
  passed: number;
  failed: number;
  durationMs: number;
};

/** Payload yang dicache di Redis dan dibaca halaman /explore. */
export type SwingScreenerPayload = {
  lastUpdate: string;
  lastUpdateFormatted: string;
  total: number;
  passedCount: number;
  results: SwingScreenerResult[];
  summary?: SwingScreenerSummary | null;
};
