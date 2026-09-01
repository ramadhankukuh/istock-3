import type { CandlePoint } from "@/features/stock-analysis/types";

export type ChartTab =
  | "keystats"
  | "analysis"
  | "financials"
  | "seasonality"
  | "about";

export type CompanyOfficer = {
  name: string;
  title: string;
};

export type EarningsHistoryPoint = {
  quarter: string; // e.g. "Q1 2026"
  estimate: number | null;
  actual: number | null;
  surprise: number | null; // absolute diff (actual - estimate)
};

export type FinancialsChartPoint = {
  period: string; // e.g. "Q2 2025"
  revenue: number | null;
  earnings: number | null;
};

export type RecommendationTrendPoint = {
  period: string; // "0m", "-1m", "-2m", "-3m"
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  total: number;
};

export type ConsensusEstimatePoint = {
  period: string; // "Q2 2025", "Q4 2025", "Q1 2026"...
  revenueAvg: number | null;
  earningsAvg: number | null;
};

export type SeasonalityTable = {
  labels: string[]; // column labels, e.g. ["Q1","Q2","Q3","Q4","Total"]
  years: number[]; // descending
  rows: Record<number, (number | null)[]>; // year -> values aligned to labels
  avg: (number | null)[];
  prob: (number | null)[]; // win-rate % per column, based on historical years
};

export type SeasonalitySummary = {
  bestLabel: string | null;
  bestValue: number | null;
  worstLabel: string | null;
  worstValue: number | null;
  winRatePercent: number | null; // % of period-columns whose average is positive
  winRateFraction: string | null; // e.g. "4/4 pos"
};

export type ChartData = {
  symbol: string; // without .JK, e.g. "BBRI"
  profile: {
    longName: string | null;
    shortName: string | null;
    exchangeName: string | null;
    quoteType: string | null;
    sector: string | null;
    industry: string | null;
    country: string | null;
    phone: string | null;
    employees: number | null;
    headquarters: string | null;
    website: string | null;
    investorRelationsUrl: string | null;
    longBusinessSummary: string | null;
    officers: CompanyOfficer[];
    /**
     * Tag tambahan (mis. "Syariah", "Day Trade"). Kosong untuk sekarang —
     * belum ada sumber data nyata. Saat data tersedia, isi di service dan
     * render dengan `.map()` di PriceHeader.
     */
    tags: string[];
  };
  quote: {
    price: number | null;
    previousClose: number | null;
    open: number | null;
    dayLow: number | null;
    dayHigh: number | null;
    change: number | null;
    changePercent: number | null;
    marketState: string | null;
    currency: string | null;
    exchangeTimezoneName: string | null;
    regularMarketTime: string | null;
  };
  keyStats: {
    marketCap: number | null;
    peTTM: number | null;
    forwardPe: number | null;
    pb: number | null;
    fiftyTwoWeekLow: number | null;
    fiftyTwoWeekHigh: number | null;
    volume: number | null;
    avgVolume3M: number | null;
    avgVolume10D: number | null;
    relativeVolume: number | null;
    fiftyDayAverage: number | null;
    twoHundredDayAverage: number | null;
    bid: number | null;
    ask: number | null;
    bidSize: number | null;
    askSize: number | null;
  };
  analystSummary: {
    recommendationMean: number | null;
    recommendationKey: string | null;
    numberOfAnalystOpinions: number | null;
    targetLow: number | null;
    targetMean: number | null;
    targetHigh: number | null;
    trend: RecommendationTrendPoint[];
  };
  earningsHistory: EarningsHistoryPoint[];
  financialsChart: FinancialsChartPoint[];
  consensusEstimates: ConsensusEstimatePoint[];
  calendar: {
    nextEarningsDate: string | null;
    exDividendDate: string | null;
    earningsCallStart: string | null;
    earningsCallEnd: string | null;
  };
  financialHealth: {
    totalRevenue: number | null;
    totalCash: number | null;
    totalDebt: number | null;
    revenuePerShare: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    profitMargin: number | null;
    ebitdaMargin: number | null;
    roe: number | null;
    roa: number | null;
    revenueGrowth: number | null;
    earningsGrowth: number | null;
  };
  dividend: {
    rate: number | null;
    yieldPercent: number | null;
    payoutRatio: number | null;
    fiveYearAvgYield: number | null;
    exDividendDate: string | null;
  };
  keyStatistics: {
    beta: number | null;
    bookValue: number | null;
    epsTTM: number | null;
    epsForward: number | null;
    earningsQuarterlyGrowth: number | null;
    fiftyTwoWeekChange: number | null;
    sharesOutstanding: number | null;
    floatShares: number | null;
    impliedSharesOutstanding: number | null;
    heldByInsiders: number | null;
    heldByInstitutions: number | null;
    lastSplitFactor: string | null;
    shortRatio: number | null;
    shortPercentOfFloat: number | null;
    sharesShort: number | null;
    mostRecentQuarter: string | null;
    lastFiscalYearEnd: string | null;
    nextFiscalYearEnd: string | null;
  };
  seasonality: {
    quarterly: SeasonalityTable;
    monthly: SeasonalityTable;
    quarterlySummary: SeasonalitySummary;
    monthlySummary: SeasonalitySummary;
  };
  candles: CandlePoint[];
  error?: string;
};

/** Rentang waktu aktif di chart / header harga. */
export type ChartRange =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "YTD"
  | "1Y"
  | "3Y"
  | "5Y";

/** Gaya render chart: garis atau candlestick. */
export type ChartStyle = "line" | "candle";

/** Satu titik intraday (interval 15 menit, WIB). */
export type IntradayPoint = {
  /** "HH:mm" WIB */
  time: string;
  price: number;
};

/** Response `GET /api/chart/intraday?symbol=...` */
export type IntradayResponse = {
  symbol: string; // short code, tanpa .JK
  date: string; // "YYYY-MM-DD" tanggal sesi yang ditampilkan
  points: IntradayPoint[];
};

/** Satu candle 1 jam (WIB) — untuk range 1W. */
export type HourlyPoint = {
  /** "YYYY-MM-DD HH:mm" WIB */
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

/** Response `GET /api/chart/hourly?symbol=...` */
export type HourlyResponse = {
  symbol: string; // short code, tanpa .JK
  points: HourlyPoint[];
};
