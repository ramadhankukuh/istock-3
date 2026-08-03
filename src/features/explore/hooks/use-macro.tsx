"use client";

import { useCallback, useEffect, useState } from "react";
import type { MacroIndicator } from "@/features/explore/types";
import { fetchMacroApi } from "@/features/explore/services/macro-api";

export function useMacro() {
  const [macro, setMacro] = useState<MacroIndicator[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await fetchMacroApi(signal);
      setMacro(data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMacro(null);
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
    macro,
    isLoading,
    reload: () => void load(),
  } as const;
}
