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
