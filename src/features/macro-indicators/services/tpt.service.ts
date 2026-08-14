import "server-only";

const TPT_DATA_URL =
  "https://raw.githubusercontent.com/ramadhankukuh/market/refs/heads/master/makro/tpt.json";

type RawTptData = Record<string, Record<string, number | null>>;

type RawTptResponse = {
  description?: string;
  data?: RawTptData;
};

export type TptLatestPayload = {
  description: string;
  period: string;
  value: number;
};

export type TptHistoryPoint = {
  period: string;
  value: number;
};

export type TptHistoryPayload = {
  description: string;
  points: TptHistoryPoint[];
};

type TptPoint = {
  year: number;
  month: number;
  value: number;
};

function normalizePoints(raw: RawTptData): TptPoint[] {
  const points: TptPoint[] = [];

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

export async function getLatestTptData(): Promise<TptLatestPayload> {
  const response = await fetch(TPT_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`TPT source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawTptResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("TPT source returned empty data");
  }

  const latest = points[points.length - 1];

  return {
    description:
      payload.description ??
      "Data Tingkat Pengangguran Terbuka (TPT) Indonesia dari sumber publik (ramadhankukuh/market)",
    period: `${latest.year}-${String(latest.month).padStart(2, "0")}`,
    value: latest.value,
  };
}

export async function getTptHistoryData(): Promise<TptHistoryPayload> {
  const response = await fetch(TPT_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`TPT source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawTptResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("TPT source returned empty data");
  }

  const first = points[0];
  const last = points[points.length - 1];

  return {
    description: `Data Historis TPT ${first.year} - ${last.year}`,
    points: points.map((point) => ({
      period: `${point.year}-${String(point.month).padStart(2, "0")}`,
      value: point.value,
    })),
  };
}
