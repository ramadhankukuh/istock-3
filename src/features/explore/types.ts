export type AssetTrend = "up" | "down" | "flat";

export type ExploreCategory = {
  key: string;
  label: string;
  items: Array<{
    symbol: string;
    logo?: string;
    name: string;
    market: string;
    priceHint: string;
    change: string;
    trend: AssetTrend;
    chart: number[];
    isMarketOpen?: boolean;
  }>;
};

export type StockSummaryItem = {
  stockCode: string;
  stockName: string;
  previous: string;
  close: string;
  change: string;
  changePct: number;
  volume: number;
  value: number;
  frequency: number;
  foreignSell: number;
  foreignBuy: number;
  foreignNet: number;
};

export type StockSummaryPayload = {
  lastUpdate: string;
  lastUpdateFormatted: string;
  total: number;
  items: StockSummaryItem[];
};

export type InflationLatestPayload = {
  description: string;
  period: string;
  value: number;
};

export type MacroKey =
  | "bi-rate"
  | "gdp"
  | "inflation"
  | "tpt"
  | "debt-to-pdp";

export type MacroIndicator = {
  key: MacroKey;
  label: string;
  subtitle: string;
  value: string;
  source: string;
  period: string;
  badge?: string;
  badgeTone?: "positive" | "negative" | "neutral";
  trend: string;
};

export type MacroHistoryPoint = {
  period: string;
  value: number;
};

export type MacroHistoryPayload = {
  key: MacroKey;
  label: string;
  description: string;
  points: MacroHistoryPoint[];
};

// --- UMA & Suspend ---

export type UmaItem = {
  tanggal: string;
  kode: string;
  judul: string;
  file: string | null;
};

export type UmaPayload = {
  total: number;
  items: UmaItem[];
};

export type SuspendItem = {
  tanggal: string;
  kode: string;
  judul: string;
  tipe: string; // "Suspend" | "Unsuspend"
  file: string | null;
};

export type SuspendPayload = {
  total: number;
  items: SuspendItem[];
};
