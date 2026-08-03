import type { StockSummaryPayload } from "@/features/explore/types";

export async function fetchStockSummaryApi(signal?: AbortSignal) {
  const res = await fetch("/api/stock-summary", { signal, cache: "no-store" });

  if (!res.ok) {
    throw new Error("Gagal mengambil stock summary IDX.");
  }

  const data = (await res.json()) as StockSummaryPayload;
  return data;
}
