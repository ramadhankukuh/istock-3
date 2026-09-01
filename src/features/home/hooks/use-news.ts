"use client";

import { useCallback, useEffect, useState } from "react";
import type { NewsItem } from "@/features/home/types";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 menit

export function useNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/news", { signal, cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil berita.");
      const json = await res.json();

      if (!signal?.aborted) {
        setItems(Array.isArray(json.items) ? json.items : []);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Berita belum tersedia.");
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => load(controller.signal));

    const interval = window.setInterval(() => {
      void load();
    }, REFRESH_INTERVAL_MS);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [load]);

  return {
    items,
    isLoading,
    error,
    reload: () => void load(),
  } as const;
}
