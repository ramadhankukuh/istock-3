/**
 * Konfigurasi Swing Trade Screener.
 *
 * Nilai di sini hasil tuning terhadap kondisi pasar nyata:
 *   - Run 2026-08-24: dengan minScore 6 hanya ada 0-1 saham ber-score >= 5
 *     (sinyal goldenCross & volumeBreakout jarang muncul), jadi minScore
 *     diturunkan ke 4 → hasil 5 lolos.
 *   - Run 2026-08-26: dengan minScore 4 hanya 2 lolos; analisis menunjukkan
 *     banyak saham score-4 gagal karena setup-nya jelek (RR < 1) dan ada 6
 *     saham score-3 dengan setup SANGAT berkualitas (RR 1.9-4.8, TP1% 6-15)
 *     yang terblokir threshold sinyal. minScore diturunkan ke 3 → hasil 8 lolos.
 *
 * Filosofi: filter kualitas setup (R:R & jarak TP1) yang jadi penyeleksi utama,
 * minScore cuma nentuin ambang sinyal supaya ada kandidat. Kalau jumlah lolos
 * berubah naik/turun karena pasar, sesuaikan di sini, bukan hardcode di logic:
 *   - Terlalu banyak (>10) → naikkan `minScore` / `minRewardRiskRatio` /
 *     `minTp1Pct`.
 *   - Terlalu sedikit (<5) → turunkan `minScore` (sampai 3, jangan di bawah —
 *     nanti kandidatnya terlalu lemah), baru longgarkan filter kualitas.
 */
export const screenerConfig = {
  /** Skor minimal dari 6 sinyal. 3 = butuh setengah+ sinyal terpenuhi. */
  minScore: 3,

  /** Rentang RSI momentum. */
  rsi: { min: 55, max: 70 },

  /** Volume breakout: volume hari ini / rata-rata 20 hari. */
  volumeRatioMin: 2.0,

  /** Akumulasi asing: net foreign positif dalam N hari perdagangan terakhir. */
  foreignAccumulationDays: 5,

  /** Konfigurasi support/resistance zone (pivot + clustering). */
  srZone: {
    /** Jumlah bar kiri-kanan buat deteksi pivot high/low. */
    pivotLookback: 5,
    /** Toleransi (%) buat gabung level yang berdekatan jadi satu zone. */
    clusterTolerancePct: 1.5,
  } as const,

  /** Filter kualitas trade setup (dari hasil `computeTradeSetup`). */
  tradeSetupQuality: {
    /** Reward:Risk minimal — TP1 % gain dibagi SL % loss (absolut). */
    minRewardRiskRatio: 1.5,
    /** TP1 minimal harus berjarak sekian % dari entry, biar nggak terlalu deket. */
    minTp1Pct: 5,
  } as const,

  /** Kunci Redis tempat payload screener dicache. */
  cacheKey: "swingScreener",

  /** Berapa ticker yang diproses paralel per batch saat update cron. */
  concurrency: 4,
} as const;
