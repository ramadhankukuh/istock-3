"use client";

import { useEffect, useState, useCallback } from "react";
import type { ExploreCategory } from "@/features/explore/types";
import { fetchExploreApi } from "@/features/explore/services/explore-api";

export function useExplore() {
  const [categories, setCategories] = useState<ExploreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchExploreApi(signal);
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(
          "Data realtime belum tersedia. Coba refresh beberapa saat lagi.",
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
    categories,
    isLoading,
    error,
    reload: () => void load(),
  } as const;
}
