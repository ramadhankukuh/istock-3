import "server-only";

const GDP_DATA_URL =
  "https://raw.githubusercontent.com/ramadhankukuh/market/refs/heads/master/makro/pdb.json";

type RawGdpData = Record<string, Record<string, number | null>>;

type RawGdpResponse = {
  description?: string;
  unit?: string;
  data?: RawGdpData;
};

export type GdpLatestPayload = {
  description: string;
  period: string;
  value: number;
  unit: string;
};

export type GdpHistoryPoint = {
  period: string;
  value: number;
};

export type GdpHistoryPayload = {
  description: string;
  unit: string;
  points: GdpHistoryPoint[];
};

type GdpPoint = {
  year: number;
  quarter: number;
  value: number;
};

function formatGdpHistoryLabel(period: string) {
  return period;
}

function normalizePoints(raw: RawGdpData): GdpPoint[] {
  const points: GdpPoint[] = [];

  for (const [year, quarters] of Object.entries(raw)) {
    const parsedYear = Number(year);
    if (!Number.isFinite(parsedYear)) {
      continue;
    }

    for (const [quarterLabel, value] of Object.entries(quarters)) {
      const parsedQuarter = Number(quarterLabel.replace(/^Q/i, ""));
      if (
        !Number.isFinite(parsedQuarter) ||
        parsedQuarter < 1 ||
        parsedQuarter > 4
      ) {
        continue;
      }

      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }

      points.push({
        year: parsedYear,
        quarter: parsedQuarter,
        value,
      });
    }
  }

  return points.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    return a.quarter - b.quarter;
  });
}

export async function getLatestGdpData(): Promise<GdpLatestPayload> {
  const response = await fetch(GDP_DATA_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`GDP source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawGdpResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("GDP source returned empty data");
  }

  const latest = points[points.length - 1];

  return {
    description:
      payload.description ??
      "Data pertumbuhan ekonomi Indonesia dari sumber publik (ramadhankukuh/market)",
    period: `${latest.year} Q${latest.quarter}`,
    value: latest.value,
    unit: payload.unit ?? "persen",
  };
}

export async function getGdpHistoryData(): Promise<GdpHistoryPayload> {
  const response = await fetch(GDP_DATA_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`GDP source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawGdpResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("GDP source returned empty data");
  }

  const first = points[0];
  const last = points[points.length - 1];

  return {
    description: `Data Historis ${formatGdpHistoryLabel(`${first.year} Q${first.quarter}`)} - ${formatGdpHistoryLabel(`${last.year} Q${last.quarter}`)}`,
    unit: payload.unit ?? "persen",
    points: points.map((point) => ({
      period: `${point.year} Q${point.quarter}`,
      value: point.value,
    })),
  };
}
