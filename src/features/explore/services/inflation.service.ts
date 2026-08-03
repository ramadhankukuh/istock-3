import "server-only";

const INFLATION_DATA_URL =
  "https://raw.githubusercontent.com/ramadhankukuh/market/master/makro/inflasi.json";

type RawInflationData = Record<string, Record<string, number | null>>;

type RawInflationResponse = {
  description?: string;
  data?: RawInflationData;
};

export type InflationLatestPayload = {
  description: string;
  period: string;
  value: number;
};

export type InflationHistoryPoint = {
  period: string;
  value: number;
};

export type InflationHistoryPayload = {
  description: string;
  points: InflationHistoryPoint[];
};

type InflationPoint = {
  year: number;
  month: number;
  value: number;
};

function formatInflationHistoryLabel(period: string) {
  const [year, month] = period.split("-");

  if (!year || !month) {
    return period;
  }

  const parsedMonth = Number(month);
  if (!Number.isFinite(parsedMonth)) {
    return period;
  }

  const date = new Date(Number(year), parsedMonth - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return period;
  }

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizePoints(raw: RawInflationData): InflationPoint[] {
  const points: InflationPoint[] = [];

  for (const [year, months] of Object.entries(raw)) {
    const parsedYear = Number(year);
    if (!Number.isFinite(parsedYear)) {
      continue;
    }

    for (const [month, value] of Object.entries(months)) {
      const parsedMonth = Number(month);
      if (
        !Number.isFinite(parsedMonth) ||
        parsedMonth < 1 ||
        parsedMonth > 12
      ) {
        continue;
      }

      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }

      points.push({
        year: parsedYear,
        month: parsedMonth,
        value,
      });
    }
  }

  return points.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    return a.month - b.month;
  });
}

export async function getLatestInflationData(): Promise<InflationLatestPayload> {
  const response = await fetch(INFLATION_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Inflation source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawInflationResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("Inflation source returned empty data");
  }

  const latest = points[points.length - 1];
  const month = String(latest.month).padStart(2, "0");

  return {
    description:
      payload.description ??
      "Data inflasi Indonesia dari sumber publik (ramadhankukuh/market)",
    period: `${latest.year}-${month}`,
    value: latest.value,
  };
}

export async function getInflationHistoryData(): Promise<InflationHistoryPayload> {
  const response = await fetch(INFLATION_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Inflation source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawInflationResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("Inflation source returned empty data");
  }

  const first = points[0];
  const last = points[points.length - 1];

  return {
    description: `Data Historis ${formatInflationHistoryLabel(`${first.year}-${String(first.month).padStart(2, "0")}`)} - ${formatInflationHistoryLabel(`${last.year}-${String(last.month).padStart(2, "0")}`)}`,
    points: points.map((point) => ({
      period: `${point.year}-${String(point.month).padStart(2, "0")}`,
      value: point.value,
    })),
  };
}
