"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NetForeignPayload } from "@/features/foreign-flow/services/net-foreign.service";
import type { DayOption, FlowMode } from "@/features/foreign-flow/types";
import {
  computeAggregateRows,
  computeDisplayRows,
  computeStockHistoryByCode,
  computeDailyTopRanks,
  computeTopLists,
} from "@/features/foreign-flow/services/foreign-flow.service";

export function useForeignFlow(initialDays: DayOption = 7) {
  const [selectedDays, setSelectedDays] = useState<DayOption>(initialDays);
  const [flowMode, setFlowMode] = useState<FlowMode>("Akumulasi");
  const [expandedStockCode, setExpandedStockCode] = useState<string | null>(
    null,
  );
  const [payload, setPayload] = useState<NetForeignPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/net-foreign${force ? "?force=1" : ""}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Gagal mengambil data foreign flow");

        const json = (await res.json()) as NetForeignPayload;

        setPayload({
          ...json,
          data: Array.isArray(json?.data) ? json.data : [],
        });
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Terjadi kesalahan saat memuat data";
        setError(message);
        setPayload({
          lastUpdate: new Date().toISOString(),
          lastUpdateFormatted: "-",
          totalDays: 0,
          requestedDays: selectedDays,
          data: [],
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedDays],
  );

  useEffect(() => {
    const ac = new AbortController();
    Promise.resolve().then(() => loadData());
    return () => ac.abort();
  }, [loadData]);

  useEffect(() => {
    Promise.resolve().then(() => setExpandedStockCode(null));
  }, [selectedDays, flowMode]);

  const visibleData = useMemo(() => {
    const source = payload?.data ?? [];
    return source.slice(0, selectedDays);
  }, [payload, selectedDays]);

  const aggregateRows = useMemo(
    () => computeAggregateRows(visibleData),
    [visibleData],
  );

  const displayRows = useMemo(
    () => computeDisplayRows(aggregateRows, flowMode),
    [aggregateRows, flowMode],
  );

  const stockHistoryByCode = useMemo(
    () => computeStockHistoryByCode(visibleData),
    [visibleData],
  );

  const dailyTopRanks = useMemo(
    () => computeDailyTopRanks(visibleData),
    [visibleData],
  );

  const { topAccumulators, topDistributors } = useMemo(
    () => computeTopLists(aggregateRows),
    [aggregateRows],
  );

  const topStock = displayRows[0] ?? null;

  const dateRange = useMemo(() => {
    if (!visibleData.length) return "-";
    const newest = visibleData[0]?.date;
    const oldest = visibleData[visibleData.length - 1]?.date;
    return `${oldest ? oldest : "-"} - ${newest ? newest : "-"}`;
  }, [visibleData]);

  const toggleStockDetail = (stockCode: string) =>
    setExpandedStockCode((cur) => (cur === stockCode ? null : stockCode));

  return {
    selectedDays,
    setSelectedDays,
    flowMode,
    setFlowMode,
    expandedStockCode,
    toggleStockDetail,
    payload,
    loading,
    error,
    loadData,
    visibleData,
    aggregateRows,
    displayRows,
    stockHistoryByCode,
    dailyTopRanks,
    topStock,
    topAccumulators,
    topDistributors,
    dateRange,
  } as const;
}
