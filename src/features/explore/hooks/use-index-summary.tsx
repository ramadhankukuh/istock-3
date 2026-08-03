"use client";

import { useCallback, useEffect, useState } from "react";
import type { IndexSummaryPayload } from "@/features/explore/services/index-summary.service";
import { fetchIndexSummaryApi } from "@/features/explore/services/index-summary-api";

export function useIndexSummary() {
  const [indexSummary, setIndexSummary] = useState<IndexSummaryPayload | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchIndexSummaryApi(signal);
      if (data) {
        setIndexSummary(data);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Index summary belum tersedia.");
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
    indexSummary,
    isLoading,
    error,
    reload: () => void load(),
  } as const;
}
