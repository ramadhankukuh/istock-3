"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  MacroHistoryPayload,
  MacroIndicator,
} from "@/features/macro-indicators/types";
import { fetchMacroHistoryApi } from "@/features/macro-indicators/services/macro-api";

export function useMacroHistory(indicators: MacroIndicator[] | null) {
  const [activeKey, setActiveKey] = useState<MacroIndicator["key"] | null>(
    null,
  );
  const [history, setHistory] = useState<MacroHistoryPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedActiveKey =
    indicators && indicators.length > 0
      ? indicators.some((indicator) => indicator.key === activeKey)
        ? activeKey
        : indicators[0].key
      : null;

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!resolvedActiveKey) return;

      try {
        setIsLoading(true);
        setError(null);
        const payload = await fetchMacroHistoryApi(resolvedActiveKey, signal);
        setHistory(payload);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setHistory(null);
          setError("Histori makro belum bisa dimuat.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [resolvedActiveKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load]);

  return {
    activeKey: resolvedActiveKey,
    setActiveKey,
    history,
    isLoading,
    error,
  } as const;
}
