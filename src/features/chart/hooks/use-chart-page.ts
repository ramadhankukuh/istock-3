"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { fetchChart } from "@/features/chart/services/chart-api";
import type { ChartData, ChartTab } from "@/features/chart/types";

const VALID_TABS: ChartTab[] = [
  "keystats",
  "analysis",
  "financials",
  "seasonality",
  "about",
];

function parseTab(value: string | null): ChartTab {
  if (value && (VALID_TABS as string[]).includes(value)) {
    return value as ChartTab;
  }
  return "keystats";
}

export function useChartPage(initialSymbol: string, initialTab: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [symbolInput, setSymbolInput] = useState(initialSymbol);
  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [tab, setTabState] = useState<ChartTab>(parseTab(initialTab));
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep local state in sync if the URL changes externally (e.g. back button).
  useEffect(() => {
    const urlSymbol = (searchParams.get("symbol") ?? "BBRI").toUpperCase();
    const urlTab = parseTab(searchParams.get("tab"));
    setSymbol((prev) => (prev !== urlSymbol ? urlSymbol : prev));
    setSymbolInput(urlSymbol);
    setTabState((prev) => (prev !== urlTab ? urlTab : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateUrl = useCallback(
    (nextSymbol: string, nextTab: ChartTab) => {
      const params = new URLSearchParams();
      params.set("symbol", nextSymbol);
      params.set("tab", nextTab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const goToSymbol = useCallback(
    (nextSymbol: string) => {
      const cleaned = nextSymbol.trim().toUpperCase();
      if (!cleaned) return;
      setSymbol(cleaned);
      updateUrl(cleaned, tab);
    },
    [tab, updateUrl],
  );

  const goToTab = useCallback(
    (nextTab: ChartTab) => {
      setTabState(nextTab);
      updateUrl(symbol, nextTab);
    },
    [symbol, updateUrl],
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchChart(symbol)
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setData(null);
        setError(err?.message ?? "Gagal mengambil data saham.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const isPositive = useMemo(() => {
    if (!data?.quote.change) return true;
    return data.quote.change >= 0;
  }, [data]);

  return {
    symbolInput,
    setSymbolInput,
    symbol,
    tab,
    data,
    loading,
    error,
    dark,
    isPositive,
    goToSymbol,
    goToTab,
  };
}
