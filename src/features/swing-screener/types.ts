/** Candle harian hasil mapping dari response IDX Trading Summary. */
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
  /** ForeignBuy - ForeignSell dalam rupiah. */
  foreignNet: number | null;
};

export type MaState =
  | "golden-cross"
  | "death-cross"
  | "above"
  | "below"
  | "none";

/** Hasil analisis indikator teknikal + screening per ticker. */
export type SwingScreenerResult = {
  ticker: string;
  /** Tanggal candle terakhir yang dipakai. */
  date: string;
  close: number | null;
  /** Perubahan harga 1 hari (%) terhadap close sebelumnya. */
  changePct: number | null;
  volume: number | null;
  avgVolume20: number | null;
  /** volume / rata-rata volume 20 hari (breakout jika >= threshold). */
  volumeRatio: number | null;
  ma20: number | null;
  ma50: number | null;
  maState: MaState;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  /** Akumulasi asing (foreign_net) 1 hari terakhir. */
  foreignNet1d: number | null;
  /** Akumulasi asing 5 hari terakhir. */
  foreignNet5d: number | null;
  /** Akumulasi asing 20 hari terakhir. */
  foreignNet20d: number | null;
  /** Jumlah signal yang terpenuhi (0-6). */
  score: number;
  /** Label signal yang terpenuhi. */
  signals: string[];
  /** Lolos screening atau tidak. */
  passed: boolean;
};

/** Ringkasan yang ditulis ke Redis bersama hasil screening. */
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

/** Payload lengkap yang dibaca endpoint user dari Redis. */
export type SwingScreenerPayload = {
  available: boolean;
  updatedAt: string | null;
  message?: string;
  results: SwingScreenerResult[];
  summary: SwingScreenerSummary | null;
};
