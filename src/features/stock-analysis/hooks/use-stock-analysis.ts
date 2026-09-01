"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { fetchStockAnalysis } from "@/features/stock-analysis/services/stock-analysis.service";
import type { StockResponse } from "@/features/stock-analysis/types";
import {
  getDerStatus,
  getPbStatus,
  getPeStatus,
  getRoeStatus,
} from "@/features/stock-analysis/utils";

export function useStockAnalysis() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StockResponse | null>(null);

  const canSubmit = useMemo(
    () => code.trim().length > 0 && !loading,
    [code, loading],
  );

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stockCode = code.trim().toUpperCase();
    if (!stockCode) {
      setError("Kode saham wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await fetchStockAnalysis(stockCode);
      setData(payload);
    } catch (err: any) {
      setData(null);
      setError(err?.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  const accordionItems = [
    {
      title: "Cara menggunakan Stock Analysis",
      content:
        "Masukkan kode saham (contoh: BBCA), lalu klik Analisis. Sistem akan otomatis menambahkan .JK di belakang kode, mengambil data terbaru, dan menampilkan ringkasan profil, fundamental, teknikal, serta penilaian analis.",
    },
    {
      title: "Data apa saja yang ditampilkan?",
      content:
        "Tool menampilkan data harga saat ini, high-low harian, volume, rentang 52 minggu, rasio fundamental seperti PER dan PBV, serta rating analis rata-rata jika tersedia.",
    },
  ];

  const peStatus = getPeStatus(data?.fundamental.pe_ratio ?? null);
  const pbStatus = getPbStatus(data?.fundamental.pb_ratio ?? null);
  const roeStatus = getRoeStatus(data?.fundamental.roe ?? null);
  const derStatus = getDerStatus(data?.fundamental.der ?? null);

  const priceVsMa20 =
    data?.technical.price !== null &&
    data?.technical.price !== undefined &&
    data?.technical.ma20 !== null &&
    data?.technical.ma20 !== undefined
      ? data.technical.price >= data.technical.ma20
        ? "Di atas MA20"
        : "Di bawah MA20"
      : null;

  const priceVsMa50 =
    data?.technical.price !== null &&
    data?.technical.price !== undefined &&
    data?.technical.ma50 !== null &&
    data?.technical.ma50 !== undefined
      ? data.technical.price >= data.technical.ma50
        ? "Di atas MA50"
        : "Di bawah MA50"
      : null;

  const chartCandles = data?.chart?.candles ?? [];

  return {
    // State
    code,
    setCode,
    loading,
    error,
    data,
    dark,

    // Computed
    canSubmit,
    peStatus,
    pbStatus,
    roeStatus,
    derStatus,
    priceVsMa20,
    priceVsMa50,
    chartCandles,
    accordionItems,

    // Actions
    handleAnalyze,
  };
}
