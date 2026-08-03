import type { ChartData } from "@/features/chart/types";

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
