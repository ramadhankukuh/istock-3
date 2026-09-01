import { yahooFinance } from "@/lib/yahoo-finance";
import { computeSeasonality } from "@/features/chart/services/seasonality";
import type {
  ChartData,
  ConsensusEstimatePoint,
  EarningsHistoryPoint,
  FinancialsChartPoint,
  RecommendationTrendPoint,
} from "@/features/chart/types";

const MODULES = [
  "price",
  "summaryDetail",
  "assetProfile",
  "defaultKeyStatistics",
  "financialData",
  "earnings",
  "earningsHistory",
  "earningsTrend",
  "recommendationTrend",
  "calendarEvents",
] as const;

export function normalizeSymbol(rawSymbol: string) {
  const normalized = rawSymbol.trim().toUpperCase();
  if (!normalized) return "";
  return normalized.endsWith(".JK") ? normalized : `${normalized}.JK`;
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pct(value: unknown): number | null {
  const parsed = num(value);
  return parsed === null ? null : parsed * 100;
}

function quarterLabel(date: Date | null): string {
  if (!date) return "-";
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `Q${quarter} ${date.getUTCFullYear()}`;
}

/** Yahoo returns quarterly financials periods like "1Q2025" — reformat to "Q1 2025". */
function formatFinancialsPeriod(raw: unknown): string {
  const value = String(raw ?? "-");
  const match = value.match(/^(\d)Q(\d{4})$/);
  if (match) return `Q${match[1]} ${match[2]}`;
  return value;
}

export async function fetchChartData(rawSymbol: string): Promise<ChartData> {
  const symbol = normalizeSymbol(rawSymbol);
  const shortCode = symbol.replace(/\.JK$/i, "");

  const [quoteSummary, quote] = await Promise.all([
    // validateResult:false — Yahoo kadang mengubah bentuk data sehingga validasi
    // bawaan library melempar "Failed Yahoo Schema validation"; data tetap
    // diproses aman lewat guard null di bawah.
    yahooFinance.quoteSummary(
      symbol,
      { modules: MODULES as any } as any,
      { validateResult: false } as any,
    ) as any,
    yahooFinance.quote(symbol, undefined as any, {
      validateResult: false,
    } as any) as any,
  ]);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 10);

  // Use chart() instead of historical(): historical() hard-throws when a row
  // has SOME (but not all) null OHLCV values — common on IDX halted / no-volume
  // days (e.g. BBCA). chart() returns the raw quotes including nulls, which we
  // filter out below for candles and seasonality.
  const chartResult = await yahooFinance.chart(
    symbol,
    {
      period1: startDate,
      period2: endDate,
      interval: "1d",
      return: "array",
    },
    { validateResult: false } as any,
  );
  const history = chartResult.quotes;

  const candles = history
    .filter(
      (d: any) =>
        d?.date &&
        d?.open !== null &&
        d?.open !== undefined &&
        d?.high !== null &&
        d?.high !== undefined &&
        d?.low !== null &&
        d?.low !== undefined &&
        d?.close !== null &&
        d?.close !== undefined,
    )
    .map((d: any) => ({
      time: new Date(d.date).toISOString().slice(0, 10),
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
      volume: Number(d.volume ?? 0),
    }));

  const seasonality = computeSeasonality(
    history.map((d: any) => ({ date: new Date(d.date), close: d.close })),
  );

  const price = quoteSummary.price ?? {};
  const summaryDetail = quoteSummary.summaryDetail ?? {};
  const assetProfile = quoteSummary.assetProfile ?? {};
  const keyStats = quoteSummary.defaultKeyStatistics ?? {};
  const financialData = quoteSummary.financialData ?? {};
  const earnings = quoteSummary.earnings ?? {};
  const earningsHistoryModule = quoteSummary.earningsHistory ?? {};
  const earningsTrend = quoteSummary.earningsTrend ?? {};
  const recommendationTrend = quoteSummary.recommendationTrend ?? {};
  const calendarEvents = quoteSummary.calendarEvents ?? {};

  const lastPrice = num(price.regularMarketPrice ?? quote.regularMarketPrice);
  const previousClose = num(
    price.regularMarketPreviousClose ?? quote.regularMarketPreviousClose,
  );
  const change =
    lastPrice !== null && previousClose !== null
      ? lastPrice - previousClose
      : num(price.regularMarketChange);
  const changePercent =
    change !== null && previousClose
      ? (change / previousClose) * 100
      : num(price.regularMarketChangePercent) !== null
        ? Number(price.regularMarketChangePercent) * 100
        : null;

  const volume = num(price.regularMarketVolume ?? quote.regularMarketVolume);
  const avgVolume3M = num(summaryDetail.averageVolume);
  const relativeVolume =
    volume !== null && avgVolume3M ? volume / avgVolume3M : null;

  // ── Recommendation trend ────────────────────────────────────────
  const trend: RecommendationTrendPoint[] = (
    recommendationTrend.trend ?? []
  ).map((t: any) => ({
    period: t.period ?? "-",
    strongBuy: Number(t.strongBuy ?? 0),
    buy: Number(t.buy ?? 0),
    hold: Number(t.hold ?? 0),
    sell: Number(t.sell ?? 0),
    strongSell: Number(t.strongSell ?? 0),
    total:
      Number(t.strongBuy ?? 0) +
      Number(t.buy ?? 0) +
      Number(t.hold ?? 0) +
      Number(t.sell ?? 0) +
      Number(t.strongSell ?? 0),
  }));

  // ── Earnings history (beat/miss) ────────────────────────────────
  const earningsHistory: EarningsHistoryPoint[] = (
    earningsHistoryModule.history ?? []
  ).map((h: any) => {
    const date = h.quarter ? new Date(h.quarter) : null;
    const estimate = num(h.epsEstimate);
    const actual = num(h.epsActual);
    return {
      quarter: quarterLabel(date),
      estimate,
      actual,
      surprise:
        estimate !== null && actual !== null ? actual - estimate : null,
    };
  });

  // ── Revenue vs earnings (quarterly financials chart) ────────────
  const financialsChart: FinancialsChartPoint[] = (
    earnings.financialsChart?.quarterly ?? []
  ).map((q: any) => ({
    period: formatFinancialsPeriod(q.date),
    revenue: num(q.revenue),
    earnings: num(q.earnings),
  }));

  // ── Consensus estimates (revenue & earnings, quarterly trend) ───
  const consensusEstimates: ConsensusEstimatePoint[] = (
    earningsTrend.trend ?? []
  )
    .filter((t: any) => typeof t.period === "string" && t.period.endsWith("q"))
    .map((t: any) => ({
      period: t.period === "0q" ? "Current Qtr" : "Next Qtr",
      revenueAvg: num(t.revenueEstimate?.avg),
      earningsAvg: num(t.earningsEstimate?.avg),
    }));

  const officers = (assetProfile.companyOfficers ?? [])
    .filter((o: any) => o?.name)
    .slice(0, 6)
    .map((o: any) => ({
      name: String(o.name),
      title: String(o.title ?? "-"),
    }));

  const headquartersParts = [
    assetProfile.address1,
    assetProfile.city,
    assetProfile.country,
  ].filter(Boolean);

  const nextEarningsDate = toIso(
    Array.isArray(calendarEvents.earnings?.earningsDate)
      ? calendarEvents.earnings.earningsDate[0]
      : calendarEvents.earnings?.earningsDate,
  );

  const data: ChartData = {
    symbol: shortCode,
    profile: {
      longName: price.longName ?? null,
      shortName: price.shortName ?? null,
      exchangeName: price.exchangeName ?? null,
      quoteType: price.quoteType ?? null,
      sector: assetProfile.sector ?? null,
      industry: assetProfile.industry ?? null,
      country: assetProfile.country ?? null,
      phone: assetProfile.phone ?? null,
      employees: num(assetProfile.fullTimeEmployees),
      headquarters: headquartersParts.length
        ? headquartersParts.join(", ")
        : null,
      website: assetProfile.website ?? null,
      investorRelationsUrl: assetProfile.website ?? null,
      longBusinessSummary: assetProfile.longBusinessSummary ?? null,
      officers,
      // Belum ada sumber data nyata untuk tag tambahan (Syariah/Day Trade).
      tags: [],
    },
    quote: {
      price: lastPrice,
      previousClose,
      open: num(price.regularMarketOpen ?? quote.regularMarketOpen),
      dayLow: num(price.regularMarketDayLow ?? quote.regularMarketDayLow),
      dayHigh: num(price.regularMarketDayHigh ?? quote.regularMarketDayHigh),
      change,
      changePercent,
      marketState: price.marketState ?? quote.marketState ?? null,
      currency: price.currency ?? null,
      exchangeTimezoneName: quote.exchangeTimezoneName ?? null,
      regularMarketTime: toIso(price.regularMarketTime ?? quote.regularMarketTime),
    },
    keyStats: {
      marketCap: num(price.marketCap ?? summaryDetail.marketCap),
      peTTM: num(summaryDetail.trailingPE),
      forwardPe: num(summaryDetail.forwardPE),
      pb: num(keyStats.priceToBook),
      fiftyTwoWeekLow: num(summaryDetail.fiftyTwoWeekLow),
      fiftyTwoWeekHigh: num(summaryDetail.fiftyTwoWeekHigh),
      volume,
      avgVolume3M,
      avgVolume10D: num(summaryDetail.averageDailyVolume10Day),
      relativeVolume,
      fiftyDayAverage: num(summaryDetail.fiftyDayAverage),
      twoHundredDayAverage: num(summaryDetail.twoHundredDayAverage),
      bid: num(summaryDetail.bid ?? quote.bid),
      ask: num(summaryDetail.ask ?? quote.ask),
      bidSize: num(summaryDetail.bidSize ?? quote.bidSize),
      askSize: num(summaryDetail.askSize ?? quote.askSize),
    },
    analystSummary: {
      recommendationMean: num(financialData.recommendationMean),
      recommendationKey: financialData.recommendationKey ?? null,
      numberOfAnalystOpinions: num(financialData.numberOfAnalystOpinions),
      targetLow: num(financialData.targetLowPrice),
      targetMean: num(financialData.targetMeanPrice),
      targetHigh: num(financialData.targetHighPrice),
      trend,
    },
    earningsHistory,
    financialsChart,
    consensusEstimates,
    calendar: {
      nextEarningsDate,
      exDividendDate: toIso(
        calendarEvents.exDividendDate ?? summaryDetail.exDividendDate,
      ),
      earningsCallStart: toIso(calendarEvents.earnings?.earningsCallDate?.[0]),
      earningsCallEnd: toIso(
        calendarEvents.earnings?.earningsCallDate?.[
          (calendarEvents.earnings?.earningsCallDate?.length ?? 1) - 1
        ],
      ),
    },
    financialHealth: {
      totalRevenue: num(financialData.totalRevenue),
      totalCash: num(financialData.totalCash),
      totalDebt: num(financialData.totalDebt),
      revenuePerShare: num(financialData.revenuePerShare),
      grossMargin: pct(financialData.grossMargins),
      operatingMargin: pct(financialData.operatingMargins),
      profitMargin: pct(financialData.profitMargins),
      ebitdaMargin: pct(financialData.ebitdaMargins),
      roe: pct(financialData.returnOnEquity),
      roa: pct(financialData.returnOnAssets),
      revenueGrowth: pct(financialData.revenueGrowth),
      earningsGrowth: pct(financialData.earningsGrowth),
    },
    dividend: {
      rate: num(summaryDetail.dividendRate),
      yieldPercent: pct(summaryDetail.dividendYield),
      payoutRatio: pct(summaryDetail.payoutRatio),
      fiveYearAvgYield: num(summaryDetail.fiveYearAvgDividendYield),
      exDividendDate: toIso(summaryDetail.exDividendDate),
    },
    keyStatistics: {
      beta: num(keyStats.beta ?? summaryDetail.beta),
      bookValue: num(keyStats.bookValue),
      epsTTM: num(keyStats.trailingEps),
      epsForward: num(keyStats.forwardEps),
      earningsQuarterlyGrowth: pct(keyStats.earningsQuarterlyGrowth),
      fiftyTwoWeekChange: pct(keyStats["52WeekChange"]),
      sharesOutstanding: num(keyStats.sharesOutstanding),
      floatShares: num(keyStats.floatShares),
      impliedSharesOutstanding: num(keyStats.impliedSharesOutstanding),
      heldByInsiders: pct(keyStats.heldPercentInsiders),
      heldByInstitutions: pct(keyStats.heldPercentInstitutions),
      lastSplitFactor: keyStats.lastSplitFactor ?? null,
      shortRatio: num(keyStats.shortRatio),
      shortPercentOfFloat: pct(keyStats.shortPercentOfFloat),
      sharesShort: num(keyStats.sharesShort),
      mostRecentQuarter: toIso(keyStats.mostRecentQuarter),
      lastFiscalYearEnd: toIso(keyStats.lastFiscalYearEnd),
      nextFiscalYearEnd: toIso(keyStats.nextFiscalYearEnd),
    },
    seasonality,
    candles,
  };

  return data;
}
