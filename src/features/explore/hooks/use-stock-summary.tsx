"use client";

import { useCallback, useEffect, useState } from "react";
import type { StockSummaryPayload } from "@/features/explore/types";
import { fetchStockSummaryApi } from "@/features/explore/services/stock-summary-api";

export function useStockSummary() {
  const [stockSummary, setStockSummary] = useState<StockSummaryPayload | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchStockSummaryApi(signal);
      if (data && Array.isArray(data.items)) {
        setStockSummary(data);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(
          "Stock summary belum tersedia. Coba refresh beberapa saat lagi.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load]);

  return {
    stockSummary,
    isLoading,
    error,
    reload: () => void load(),
  } as const;
}
