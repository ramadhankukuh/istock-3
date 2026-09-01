import "server-only";

import {
  getLatestInflationData,
  getInflationHistoryData,
  type InflationLatestPayload,
} from "./inflation.service";
import {
  getLatestGdpData,
  getGdpHistoryData,
  type GdpLatestPayload,
} from "./gdp.service";
import {
  getLatestBiRateData,
  getBiRateHistoryData,
  type BiRateLatestPayload,
} from "./bi-rate.service";
import {
  getLatestTptData,
  getTptHistoryData,
  type TptLatestPayload,
} from "./tpt.service";
import {
  getLatestDebtToPdpData,
  getDebtToPdpHistoryData,
  type DebtToPdpLatestPayload,
} from "./debt-to-pdp.service";
import type {
  MacroHistoryPayload,
  MacroIndicator,
  MacroKey,
} from "@/features/explore/types";

export type MacroPayload = {
  inflation: InflationLatestPayload;
  gdp: GdpLatestPayload;
  biRate: BiRateLatestPayload;
  tpt: TptLatestPayload;
  debtToPdp: DebtToPdpLatestPayload;
};

function formatPercent(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatDateLabel(period: string) {
  const parts = period.split("-");

  if (parts.length >= 3) {
    // Full date format: YYYY-MM-DD
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    }
  }

  if (parts.length === 2) {
    // Month-year format: YYYY-M
    const [year, month] = parts;
    const parsedMonth = Number(month);
    if (Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      const date = new Date(Number(year), parsedMonth - 1, 1);
      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("id-ID", {
          month: "short",
          year: "numeric",
        }).format(date);
      }
    }
  }

  return period;
}

function formatBpsDelta(delta: number | null) {
  if (delta === null) {
    return undefined;
  }

  const bps = Math.round(delta * 100);
  const prefix = bps > 0 ? "+" : "";

  return `${prefix}${bps}bps`;
}

function formatPercentDelta(delta: number | null) {
  if (delta === null) {
    return undefined;
  }

  const prefix = delta > 0 ? "+" : "";
  // Keep two decimals, use comma as decimal separator to match formatPercent
  return `${prefix}${delta.toFixed(2).replace(".", ",")}%`;
}
function toTrendClass(value: number) {
  if (value > 0) return "text-emerald-500";
  if (value < 0) return "text-red-500";
  return "text-foreground";
}

export async function getMacroPayload(): Promise<MacroPayload> {
  const [inflation, gdp, biRate, tpt, debtToPdp] = await Promise.all([
    getLatestInflationData(),
    getLatestGdpData(),
    getLatestBiRateData(),
    getLatestTptData(),
    getLatestDebtToPdpData(),
  ]);

  return { inflation, gdp, biRate, tpt, debtToPdp };
}

export async function getMacroIndicators(): Promise<MacroIndicator[]> {
  const { inflation, gdp, biRate, tpt, debtToPdp } = await getMacroPayload();
  const biRateDelta =
    biRate.previousValue === null ? 0 : biRate.value - biRate.previousValue;

  // Try to compute previous values for GDP and inflation from their history endpoints
  const [gdpHistory, inflationHistory, tptHistory, debtToPdpHistory] =
    await Promise.all([
      getGdpHistoryData(),
      getInflationHistoryData(),
      getTptHistoryData(),
      getDebtToPdpHistoryData(),
    ]);

  const gdpPrevPoint =
    gdpHistory.points.length > 1
      ? gdpHistory.points[gdpHistory.points.length - 2]
      : null;
  const inflationPrevPoint =
    inflationHistory.points.length > 1
      ? inflationHistory.points[inflationHistory.points.length - 2]
      : null;
  const tptPrevPoint =
    tptHistory.points.length > 1
      ? tptHistory.points[tptHistory.points.length - 2]
      : null;
  const debtToPdpPrevPoint =
    debtToPdpHistory.points.length > 1
      ? debtToPdpHistory.points[debtToPdpHistory.points.length - 2]
      : null;

  const gdpDelta =
    gdpPrevPoint === null ? null : gdp.value - gdpPrevPoint.value;
  const inflationDelta =
    inflationPrevPoint === null
      ? null
      : inflation.value - inflationPrevPoint.value;
  const tptDelta =
    tptPrevPoint === null ? null : tpt.value - tptPrevPoint.value;
  const debtToPdpDelta =
    debtToPdpPrevPoint === null
      ? null
      : debtToPdp.value - debtToPdpPrevPoint.value;

  return [
    {
      key: "bi-rate",
      label: "BI Rate",
      subtitle: "Suku Bunga Acuan",
      value: formatPercent(biRate.value),
      source: "Bank Indonesia",
      period: formatDateLabel(biRate.period),
      badge: formatBpsDelta(biRate.previousValue === null ? null : biRateDelta),
      badgeTone:
        biRateDelta > 0 ? "positive" : biRateDelta < 0 ? "negative" : "neutral",
      trend: toTrendClass(biRateDelta),
    },
    {
      key: "gdp",
      label: "GDP",
      subtitle: "Gross Domestic Product",
      value: formatPercent(gdp.value),
      source: "BPS",
      period: gdp.period,
      badge: formatPercentDelta(gdpDelta),
      badgeTone:
        gdpDelta === null
          ? "neutral"
          : gdpDelta > 0
            ? "positive"
            : gdpDelta < 0
              ? "negative"
              : "neutral",
      trend: toTrendClass(gdpDelta ?? 0),
    },
    {
      key: "inflation",
      label: "Inflasi",
      subtitle: "Indeks Harga Konsumen",
      value: formatPercent(inflation.value),
      source: "BPS",
      period: inflation.period,
      badge: formatPercentDelta(inflationDelta),
      badgeTone:
        inflationDelta === null
          ? "neutral"
          : inflationDelta > 0
            ? "positive"
            : inflationDelta < 0
              ? "negative"
              : "neutral",
      trend: toTrendClass(inflationDelta ?? 0),
    },
    {
      key: "tpt",
      label: "TPT",
      subtitle: "Tingkat Pengangguran Terbuka",
      value: formatPercent(tpt.value),
      source: "BPS",
      period: formatDateLabel(tpt.period),
      badge: formatPercentDelta(tptDelta),
      badgeTone:
        tptDelta === null
          ? "neutral"
          : tptDelta > 0
            ? "positive"
            : tptDelta < 0
              ? "negative"
              : "neutral",
      trend: toTrendClass(tptDelta ?? 0),
    },
    {
      key: "debt-to-pdp",
      label: "Debt to PDP",
      subtitle: "Rasio Utang terhadap PDB",
      value: formatPercent(debtToPdp.value),
      source: "Kemenkeu",
      period: formatDateLabel(debtToPdp.period),
      badge: formatPercentDelta(debtToPdpDelta),
      badgeTone:
        debtToPdpDelta === null
          ? "neutral"
          : debtToPdpDelta > 0
            ? "positive"
            : debtToPdpDelta < 0
              ? "negative"
              : "neutral",
      trend: toTrendClass(debtToPdpDelta ?? 0),
    },
  ];
}

export async function getMacroHistory(
  key: MacroKey,
): Promise<MacroHistoryPayload> {
  if (key === "bi-rate") {
    const biRate = await getBiRateHistoryData();
    return {
      key,
      label: "BI Rate",
      description: biRate.description,
      points: biRate.points,
    };
  }

  if (key === "gdp") {
    const gdp = await getGdpHistoryData();
    return {
      key,
      label: "GDP",
      description: gdp.description,
      points: gdp.points,
    };
  }

  if (key === "tpt") {
    const tpt = await getTptHistoryData();
    return {
      key,
      label: "TPT",
      description: tpt.description,
      points: tpt.points,
    };
  }

  if (key === "debt-to-pdp") {
    const debtToPdp = await getDebtToPdpHistoryData();
    return {
      key,
      label: "Debt to PDP",
      description: debtToPdp.description,
      points: debtToPdp.points,
    };
  }

  const inflation = await getInflationHistoryData();
  return {
    key: "inflation",
    label: "Inflasi",
    description: inflation.description,
    points: inflation.points,
  };
}
