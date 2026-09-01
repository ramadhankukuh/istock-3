"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import {
  fetchChart,
  fetchHourly,
  fetchIntraday,
} from "@/features/chart/services/chart-api";
import type {
  ChartData,
  ChartRange,
  ChartStyle,
  ChartTab,
  HourlyResponse,
  IntradayResponse,
} from "@/features/chart/types";

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

  // ── Range & style chart (header + panel) ─────────────────────────────
  const [range, setRange] = useState<ChartRange>("1D");
  const [style, setStyle] = useState<ChartStyle>("candle");
  // Candle intraday 15 menit untuk range 1D — di-fetch lazy hanya saat tab 1D
  // aktif & belum di-fetch untuk symbol ini (jangan refetch tiap toggle balik
  // ke 1D dalam sesi yang sama).
  const [intraday, setIntraday] = useState<IntradayResponse | null>(null);
  const intradaySymbolRef = useRef<string | null>(null);
  // Candle 1 jam untuk range 1W — di-fetch lazy, sama polanya dengan intraday.
  const [hourly, setHourly] = useState<HourlyResponse | null>(null);
  const hourlySymbolRef = useRef<string | null>(null);

  // Fetch intraday hanya saat range === "1D" & data untuk symbol aktif belum
  // ada di cache. Saat symbol berganti, data lama di-reset (di-defer lewat
  // Promise.resolve supaya tidak setState sinkron di dalam body effect).
  useEffect(() => {
    if (range !== "1D" || !data?.symbol) return;
    if (intradaySymbolRef.current === data.symbol) return;

    intradaySymbolRef.current = data.symbol;
    Promise.resolve().then(() => setIntraday(null));

    let cancelled = false;
    fetchIntraday(data.symbol)
      .then((payload) => {
        if (cancelled) return;
        setIntraday(payload);
      })
      .catch((err) => {
        // Jangan gagalkan seluruh halaman — chart 1D cukup fallback ke daily.
        if (!cancelled) console.error("Failed to fetch intraday:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [range, data?.symbol]);

  // Fetch candle 1 jam hanya saat range === "1W" & belum di-fetch utk symbol ini.
  useEffect(() => {
    if (range !== "1W" || !data?.symbol) return;
    if (hourlySymbolRef.current === data.symbol) return;

    hourlySymbolRef.current = data.symbol;
    Promise.resolve().then(() => setHourly(null));

    let cancelled = false;
    fetchHourly(data.symbol)
      .then((payload) => {
        if (cancelled) return;
        setHourly(payload);
      })
      .catch((err) => {
        // Jangan gagalkan seluruh halaman — chart 1W cukup fallback ke daily.
        if (!cancelled) console.error("Failed to fetch hourly:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [range, data?.symbol]);

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
    range,
    setRange,
    style,
    setStyle,
    intraday,
    hourly,
    goToSymbol,
    goToTab,
  };
}
