import "server-only";

const BI_RATE_DATA_URL =
  "https://raw.githubusercontent.com/ramadhankukuh/market/refs/heads/master/makro/bi-rate.json";

type RawBiRateData = Record<string, Record<string, number | null>>;

type RawBiRateResponse = {
  description?: string;
  data?: RawBiRateData;
};

export type BiRateLatestPayload = {
  description: string;
  period: string;
  value: number;
  previousValue: number | null;
};

export type BiRateHistoryPoint = {
  period: string;
  value: number;
};

export type BiRateHistoryPayload = {
  description: string;
  points: BiRateHistoryPoint[];
};

type BiRatePoint = {
  year: number;
  month: number;
  day: number | null;
  value: number;
};

function normalizePoints(raw: RawBiRateData): BiRatePoint[] {
  const points: BiRatePoint[] = [];

  for (const [year, months] of Object.entries(raw)) {
    const parsedYear = Number(year);
    if (!Number.isFinite(parsedYear)) {
      continue;
    }

    for (const [monthKey, value] of Object.entries(months)) {
      // Support two key formats:
      //   - DDMM format: "1701" → day=17, month=01 (January)
      //   - Legacy      : "1"    → month=1  (January)
      let parsedDay: number | null = null;
      let parsedMonth: number;

      if (monthKey.length === 4 && /^\d{4}$/.test(monthKey)) {
        // DDMM — extract first 2 digits as day, last 2 digits as month
        parsedDay = Number(monthKey.slice(0, 2));
        parsedMonth = Number(monthKey.slice(2));
      } else {
        parsedMonth = Number(monthKey);
      }

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
        day: parsedDay,
        value,
      });
    }
  }

  return points.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    if (a.month !== b.month) {
      return a.month - b.month;
    }
    // Sort by day if both have it
    if (a.day !== null && b.day !== null) {
      return a.day - b.day;
    }
    if (a.day !== null) return -1;
    if (b.day !== null) return 1;
    return 0;
  });
}

async function fetchBiRateData(): Promise<RawBiRateResponse> {
  const response = await fetch(BI_RATE_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`BI rate source failed with status ${response.status}`);
  }

  const text = await response.text();

  try {
    return JSON.parse(text) as RawBiRateResponse;
  } catch {
    // The source JSON may be malformed — the data object is missing its key:
    //   "description": "...",
    //   { "2016": {...} }        ← missing "data" key before `{`
    // Fix by inserting `"data": ` before the lone opening brace.
    const fixed = text.replace(/"\s*,\s*\{/, '", "data": {');
    return JSON.parse(fixed) as RawBiRateResponse;
  }
}

export async function getLatestBiRateData(): Promise<BiRateLatestPayload> {
  const payload = await fetchBiRateData();
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("BI rate source returned empty data");
  }

  const latest = points[points.length - 1];
  const previous = points.length > 1 ? points[points.length - 2] : null;

  return {
    description:
      payload.description ??
      "Data BI 7-Day Reverse Repo Rate dari sumber publik (ramadhankukuh/market)",
    period: `${latest.year}-${String(latest.month).padStart(2, "0")}-${String(latest.day ?? 1).padStart(2, "0")}`,
    value: latest.value,
    previousValue: previous?.value ?? null,
  };
}

export async function getBiRateHistoryData(): Promise<BiRateHistoryPayload> {
  const payload = await fetchBiRateData();
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("BI rate source returned empty data");
  }

  return {
    description:
      payload.description ??
      "Data BI 7-Day Reverse Repo Rate dari sumber publik (ramadhankukuh/market)",
    points: points.map((point) => ({
      period: `${point.year}-${String(point.month).padStart(2, "0")}-${String(point.day ?? 1).padStart(2, "0")}`,
      value: point.value,
    })),
  };
}
