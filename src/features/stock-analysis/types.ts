export type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockResponse = {
  profile: {
    code: string;
    longName: string | null;
    sector: string | null;
    market_cap: number | null;
  };
  fundamental: {
    pe_ratio: number | null;
    pb_ratio: number | null;
    roe: number | null;
    der: number | null;
    total_revenue: number | null;
    net_income: number | null;
    dividen: number | null;
    dividen_yield: number | null;
  };
  technical: {
    price: number | null;
    prev_close: number | null;
    open_price: number | null;
    high: number | null;
    low: number | null;
    volume: number | null;
    volume3m_avg: number | null;
    volume10d_avg: number | null;
    "52week_low": number | null;
    "52week_high": number | null;
    rsi14: number | null;
    stoch_rsi_k: number | null;
    stoch_rsi_d: number | null;
    macd: number | null;
    macd_signal: number | null;
    macd_histogram: number | null;
    ma20: number | null;
    ma50: number | null;
    support: number | null;
    resistance: number | null;
    volume_ratio: number | null;
    foreign_buy: number | null;
    foreign_sell: number | null;
    net_foreign: number | null;
  };
  score: {
    averageAnalystRating: string | null;
  };
  chart?: {
    candles: CandlePoint[];
  };
  error?: string;
};

export type RatioStatus = {
  label: string;
  badgeClass: string;
};
