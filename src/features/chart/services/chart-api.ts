import type {
  ChartData,
  HourlyResponse,
  IntradayResponse,
} from "@/features/chart/types";

export async function fetchChart(symbol: string): Promise<ChartData> {
  const response = await fetch(
    `/api/chart?symbol=${encodeURIComponent(symbol)}`,
    { cache: "no-store" },
  );
  const payload: ChartData = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Gagal mengambil data chart.");
  }

  return payload;
}

/** Fetch candle 15 menit intraday untuk range 1D. */
export async function fetchIntraday(
  symbol: string,
): Promise<IntradayResponse> {
  const response = await fetch(
    `/api/chart/intraday?symbol=${encodeURIComponent(symbol)}`,
    { cache: "no-store" },
  );
  const payload = (await response.json()) as IntradayResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Gagal mengambil data intraday.");
  }

  return payload;
}

/** Fetch candle 1 jam (OHLC) 7 hari terakhir untuk range 1W. */
export async function fetchHourly(symbol: string): Promise<HourlyResponse> {
  const response = await fetch(
    `/api/chart/hourly?symbol=${encodeURIComponent(symbol)}`,
    { cache: "no-store" },
  );
  const payload = (await response.json()) as HourlyResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Gagal mengambil data hourly.");
  }

  return payload;
}
