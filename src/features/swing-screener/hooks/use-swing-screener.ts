"use client";

import { useCallback, useEffect, useState } from "react";
import type { SwingScreenerPayload } from "../types";

/**
 * Hook client untuk membaca hasil screener dari endpoint user
 * (/api/screener/swing) yang hanya membaca Redis — tanpa fetch IDX/Turso.
 */
export function useSwingScreener() {
  const [payload, setPayload] = useState<SwingScreenerPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/screener/swing", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data screener");
      }

      const json = (await res.json()) as SwingScreenerPayload;
      setPayload(json);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Terjadi kesalahan saat memuat data",
      );
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { payload, loading, error, reload: load } as const;
}
