"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/theme-provider";
import TradingStyleChart from "@/features/stock-analysis/components/trading-style-chart";
import type { CandlePoint } from "@/features/stock-analysis/types";
import { TradeSetupPanel } from "./trade-setup-panel";
import type { TradeSetup } from "../types";

/**
 * Modal "Lihat Setup" — candlestick chart + overlay BOW/TP1/TP2/SL + panel
 * ringkasan. Data chart di-fetch lazy dari `/api/chart?symbol={ticker}`
 * (endpoint existing, Yahoo Finance, public) saat modal pertama kali dibuka —
 * tidak fetch ulang tiap re-render.
 */
export function TradeSetupModal({
  ticker,
  setup,
  open,
  onClose,
}: {
  ticker: string;
  setup: TradeSetup;
  open: boolean;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef<string | null>(null);

  const loadChart = useCallback(async () => {
    if (hasFetchedRef.current === ticker) return;
    hasFetchedRef.current = ticker;

    // Reset candle lama dari ticker sebelumnya biar tidak tampil stale
    setCandles([]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chart?symbol=${ticker}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { candles?: CandlePoint[] };
      setCandles(data.candles ?? []);
    } catch {
      setError("Gagal memuat data chart. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  // Fetch lazy saat modal pertama kali dibuka
  useEffect(() => {
    if (!open) return;
    Promise.resolve().then(() => loadChart());
  }, [open, loadChart]);

  // Lock body scroll saat modal terbuka
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Trade setup ${ticker}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-4xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow) sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">
              Trade Setup — {ticker}
            </p>
            <p className="text-sm text-muted">
              BOW, target profit, dan stop loss dari struktur support/resistance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Skeleton className="h-130 w-full rounded-xl" />
          ) : error ? (
            <div className="flex h-130 flex-col items-center justify-center gap-4 rounded-xl border border-(--border) bg-(--surface-strong) p-6 text-center">
              <p className="text-sm text-muted">{error}</p>
              <button
                type="button"
                onClick={() => {
                  hasFetchedRef.current = null;
                  void loadChart();
                }}
                className="focus-ring rounded-full border border-(--border) bg-(--surface-strong) px-4 py-2 text-xs font-medium text-(--accent) transition hover:bg-foreground hover:text-background"
              >
                Coba lagi
              </button>
            </div>
          ) : candles.length > 0 ? (
            <TradingStyleChart
              candles={candles}
              dark={dark}
              tradeSetup={setup}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted">
              Data chart belum tersedia.
            </p>
          )}

          <TradeSetupPanel ticker={ticker} setup={setup} />
        </div>
      </div>
    </div>
  );
}
