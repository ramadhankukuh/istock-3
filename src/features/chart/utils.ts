import type { CandlePoint } from "@/features/stock-analysis/types";
import type { ChartRange } from "@/features/chart/types";

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  const abs = Math.abs(value);
  const units: Array<[number, string]> = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];

  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      return `${(value / threshold).toFixed(2)}${suffix}`;
    }
  }

  return value.toLocaleString("en-US");
}

export function formatNumber(
  value: number | null | undefined,
  digits = 2,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function formatIDR(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })} IDR`;
}

export function formatPercentSigned(
  value: number | null | undefined,
  digits = 2,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatPercentPlain(
  value: number | null | undefined,
  digits = 2,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  return `${value.toFixed(digits)}%`;
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  return `${value.toFixed(2)}x`;
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

export function formatDateTimeShort(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toISOString().slice(0, 10)} ${date
    .toISOString()
    .slice(11, 16)}`;
}

/** e.g. "buy" -> "BUY", "strong_buy" -> "STRONG BUY" */
export function formatRecommendationKey(
  key: string | null | undefined,
): string {
  if (!key) return "-";
  return key.replace(/_/g, " ").toUpperCase();
}

// ── Range chart & perubahan harga per-range ─────────────────────────────

/** Label Bahasa Indonesia per range chart. */
export const RANGE_LABELS: Record<ChartRange, string> = {
  "1D": "Hari Ini",
  "1W": "1 Minggu",
  "1M": "1 Bulan",
  "3M": "3 Bulan",
  YTD: "YTD",
  "1Y": "1 Tahun",
  "3Y": "3 Tahun",
  "5Y": "5 Tahun",
};

const RANGE_DAYS: Record<Exclude<ChartRange, "1D" | "YTD">, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  "3Y": 365 * 3,
  "5Y": 365 * 5,
};

/**
 * Hitung perubahan harga dari candle awal range terpilih ke harga sekarang.
 * `1D` return `null` semua — untuk 1D gunakan `data.quote.change/changePercent`.
 */
export function getRangeChange(
  candles: CandlePoint[],
  currentPrice: number | null,
  range: ChartRange,
): {
  change: number | null;
  changePercent: number | null;
  fromDate: string | null;
} {
  if (range === "1D" || currentPrice === null || currentPrice === undefined) {
    return { change: null, changePercent: null, fromDate: null };
  }

  const cutoff =
    range === "YTD"
      ? new Date(new Date().getFullYear(), 0, 1)
      : new Date(
          Date.now() - (RANGE_DAYS[range as Exclude<ChartRange, "1D" | "YTD">] ?? 365) * 86_400_000,
        );

  // Candle dengan `time` terdekat ≥ cutoff (hari trading terdekat ke awal range).
  const sorted = [...candles]
    .filter((c) => !Number.isNaN(new Date(c.time).getTime()))
    .sort((a, b) => a.time.localeCompare(b.time));

  const startCandle =
    sorted.find((c) => new Date(c.time) >= cutoff) ??
    sorted[sorted.length - 1] ??
    null;

  if (!startCandle) {
    return { change: null, changePercent: null, fromDate: null };
  }

  const change = currentPrice - startCandle.close;
  const changePercent =
    startCandle.close > 0 ? (change / startCandle.close) * 100 : null;

  return {
    change,
    changePercent,
    fromDate: startCandle.time,
  };
}
