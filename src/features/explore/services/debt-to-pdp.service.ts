import "server-only";

const DEBT_TO_PDP_DATA_URL =
  "https://raw.githubusercontent.com/ramadhankukuh/market/refs/heads/master/makro/debt-to-pdp.json";

type RawDebtToPdpData = Record<string, number | null>;

type RawDebtToPdpResponse = {
  description?: string;
  data?: RawDebtToPdpData;
};

export type DebtToPdpLatestPayload = {
  description: string;
  period: string;
  value: number;
};

export type DebtToPdpHistoryPoint = {
  period: string;
  value: number;
};

export type DebtToPdpHistoryPayload = {
  description: string;
  points: DebtToPdpHistoryPoint[];
};

type DebtToPdpPoint = {
  year: number;
  value: number;
};

function normalizePoints(raw: RawDebtToPdpData): DebtToPdpPoint[] {
  const points: DebtToPdpPoint[] = [];

  for (const [year, value] of Object.entries(raw)) {
    const parsedYear = Number(year);
    if (!Number.isFinite(parsedYear)) {
      continue;
    }

    if (typeof value !== "number" || !Number.isFinite(value)) {
      continue;
    }

    points.push({
      year: parsedYear,
      value,
    });
  }

  return points.sort((a, b) => a.year - b.year);
}

export async function getLatestDebtToPdpData(): Promise<DebtToPdpLatestPayload> {
  const response = await fetch(DEBT_TO_PDP_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Debt to PDP source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawDebtToPdpResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("Debt to PDP source returned empty data");
  }

  const latest = points[points.length - 1];

  return {
    description:
      payload.description ??
      "Data rasio utang terhadap Produk Domestik Bruto (PDP) Indonesia dari sumber publik (ramadhankukuh/market)",
    period: String(latest.year),
    value: latest.value,
  };
}

export async function getDebtToPdpHistoryData(): Promise<DebtToPdpHistoryPayload> {
  const response = await fetch(DEBT_TO_PDP_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Debt to PDP source failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RawDebtToPdpResponse;
  const points = normalizePoints(payload.data ?? {});

  if (points.length === 0) {
    throw new Error("Debt to PDP source returned empty data");
  }

  const first = points[0];
  const last = points[points.length - 1];

  return {
    description: `Data Historis Debt to PDP ${first.year} - ${last.year}`,
    points: points.map((point) => ({
      period: String(point.year),
      value: point.value,
    })),
  };
}
