import type { StockResponse } from "@/features/stock-analysis/types";

export async function fetchStockAnalysis(code: string): Promise<StockResponse> {
  const response = await fetch(`/api/stock?code=${encodeURIComponent(code)}`);
  const payload: StockResponse = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Gagal mengambil data saham.");
  }

  return payload;
}
