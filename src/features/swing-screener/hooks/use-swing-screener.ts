"use client";

import { useCallback, useEffect, useState } from "react";
import type { SwingScreenerPayload } from "../types";

/**
 * Hook baca hasil Swing Trade Screener dari `/api/screener/swing`
 * (endpoint cuma baca Redis — data diisi pipeline cron).
 */
export function useSwingScreener() {
  const [payload, setPayload] = useState<SwingScreenerPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/screener/swing", { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as SwingScreenerPayload;
      setPayload(data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(
          "Data screener belum tersedia. Jalankan update atau coba lagi nanti.",
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
    payload,
    isLoading,
    error,
    reload: () => void load(),
  } as const;
}
