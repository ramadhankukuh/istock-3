"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UmaItem, SuspendItem } from "@/features/explore/types";

export type UmaSuspendTab = "UMA" | "Suspend" | "Unsuspend";

export function useUmaSuspend() {
  const [activeTab, setActiveTab] = useState<UmaSuspendTab>("UMA");
  const [umaItems, setUmaItems] = useState<UmaItem[]>([]);
  const [suspendItems, setSuspendItems] = useState<SuspendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUma = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch("/api/stock-info/uma?resultCount=20", {
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil data UMA.");
    const json = await res.json();
    return (json.items || []) as UmaItem[];
  }, []);

  const fetchSuspend = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch("/api/stock-info/suspend?resultCount=20", {
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil data Suspend.");
    const json = await res.json();
    return (json.items || []) as SuspendItem[];
  }, []);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setIsLoading(true);
        setError(null);

        const [uma, suspend] = await Promise.all([
          fetchUma(signal),
          fetchSuspend(signal),
        ]);

        if (!signal?.aborted) {
          setUmaItems(uma);
          setSuspendItems(suspend);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Data UMA/Suspend belum tersedia.");
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [fetchUma, fetchSuspend],
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load]);

  const items = useMemo(() => {
    if (activeTab === "UMA") return umaItems;
    if (activeTab === "Unsuspend")
      return suspendItems.filter((x) => x.tipe?.toLowerCase() === "unsuspend");
    return suspendItems.filter((x) => x.tipe?.toLowerCase() === "suspend");
  }, [activeTab, umaItems, suspendItems]);

  const tabs: { key: UmaSuspendTab; label: string }[] = [
    { key: "UMA", label: "UMA" },
    { key: "Suspend", label: "Suspend" },
    { key: "Unsuspend", label: "Unsuspend" },
  ];

  return {
    activeTab,
    setActiveTab,
    items,
    tabs,
    umaItems,
    suspendItems,
    isLoading,
    error,
    reload: () => void load(),
  } as const;
}
