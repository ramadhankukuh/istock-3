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
