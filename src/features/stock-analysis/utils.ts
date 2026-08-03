import type { RatioStatus } from "@/features/stock-analysis/types";

export const formatNumber = (value: number | null, digits = 2) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatCompact = (value: number | null, isCurrency = false) => {
  if (value === null || value === undefined) return "-";

  const abs = Math.abs(value);
  let scaled = value;
  let suffix = "";

  if (abs >= 1_000_000_000_000) {
    scaled = value / 1_000_000_000_000;
    suffix = " T";
  } else if (abs >= 1_000_000_000) {
    scaled = value / 1_000_000_000;
    suffix = " M";
  } else if (abs >= 1_000_000) {
    scaled = value / 1_000_000;
    suffix = " Jt";
  } else if (abs >= 1_000) {
    scaled = value / 1_000;
    suffix = " K";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: scaled % 1 === 0 ? 0 : 2,
  }).format(scaled);

  return `${isCurrency ? "Rp " : ""}${formatted}${suffix}`;
};

export const formatPercent = (value: number | null) => {
  if (value === null || value === undefined) return "-";
  return `${(value * 100).toFixed(2)}%`;
};

export const formatRatio = (value: number | null) => {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(2)}x`;
};

export const getPeStatus = (value: number | null): RatioStatus | null => {
  if (value === null || value === undefined) return null;
  if (value <= 15) {
    return {
      label: "Undervalued",
      badgeClass:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    };
  }
  return {
    label: "Overvalued",
    badgeClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  };
};

export const getPbStatus = (value: number | null): RatioStatus | null => {
  if (value === null || value === undefined) return null;
  if (value > 1) {
    return {
      label: "Above Book",
      badgeClass:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    };
  }
  return {
    label: "Below Book",
    badgeClass:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };
};

export const getRoeStatus = (value: number | null): RatioStatus | null => {
  if (value === null || value === undefined) return null;
  if (value >= 0.15) {
    return {
      label: "Excellent",
      badgeClass:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    };
  }
  return {
    label: "Moderate",
    badgeClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  };
};

export const getDerStatus = (value: number | null): RatioStatus | null => {
  if (value === null || value === undefined) return null;
  if (value <= 1) {
    return {
      label: "Low Risk",
      badgeClass:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    };
  }
  return {
    label: "High Risk",
    badgeClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  };
};
