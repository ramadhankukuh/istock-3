/**
 * Konfigurasi threshold screening swing trade.
 *
 * Default mengikuti prompt: MA cross (MA20 vs MA50), RSI(14), MACD,
 * volume breakout vs MA20 volume, dan akumulasi asing (foreign net).
 * Semua nilai di sini gampang diubah — indikator & sinyal dihitung
 * dari konfigurasi ini, jadi tuning cukup edit file ini.
 */
export const screenerConfig = {
  /** Rolling window histori OHLC per ticker di Turso. */
  historyDays: 250,

  /** Minimal jumlah signal yang harus terpenuhi agar lolos screening. */
  minScore: 4,

  /** Jumlah bar terakhir untuk deteksi golden/death cross. */
  maCrossLookback: 3,

  /** RSI dianggap momentum bullish jika berada dalam rentang ini. */
  rsi: {
    min: 50,
    max: 75,
  },

  /** Volume dianggap breakout jika >= threshold ini x rata-rata 20 hari. */
  volumeRatioMin: 1.5,

  /** Jumlah hari terakhir untuk akumulasi asing (foreign net > 0). */
  foreignAccumulationDays: 5,

  /** Minimal jumlah bar valid sebelum indikator dihitung. */
  minBars: 30,
} as const;

/** Label signal yang dipakai di UI. */
export const SIGNAL_LABELS: Record<string, string> = {
  "ma-bullish": "MA20 > MA50",
  "golden-cross": "Golden cross",
  "rsi-momentum": "RSI momentum",
  "macd-bullish": "MACD bullish",
  "volume-breakout": "Volume breakout",
  "foreign-accumulation": "Asing akumulasi",
};
