"use client";

import { RefreshCw } from "lucide-react";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSwingScreener } from "../hooks/use-swing-screener";
import { ScreenerTable } from "./screener-table";
import { SummaryStrip } from "./summary-strip";

/* ── Page ── */

type SwingScreenerBreadcrumb = {
  label: string;
  href?: string;
  isHome?: boolean;
};

type SwingScreenerPageProps = {
  title?: string;
  description?: string;
  breadcrumbs?: SwingScreenerBreadcrumb[];
};

export default function SwingScreenerPage({
  title = "Swing Trade Screener",
  description = "Screener harian semua saham IDX — MA cross, RSI, MACD, volume breakout, dan akumulasi asing.",
  breadcrumbs = [
    { label: "Home", href: "/", isHome: true },
    { label: "Tools", href: "/tools" },
    { label: "Swing Screener" },
  ],
}: SwingScreenerPageProps) {
  const { payload, loading, error, reload } = useSwingScreener();

  const infoItems = [
    {
      title: "Apa itu Swing Trade Screener?",
      content:
        "Screener otomatis yang mengevaluasi semua saham IDX setiap hari kerja. Data harga diambil dari IDX API, disimpan sebagai histori OHLC di Turso, lalu indikator teknikal dihitung dan hasilnya di-cache di Redis.",
    },
    {
      title: "Kriteria screening apa yang dipakai?",
      content:
        "Setiap saham diberi skor 0-6 berdasarkan signal: MA20 > MA50 (bullish), golden cross MA20/MA50, RSI(14) di rentang 50-75, MACD di atas signal line, volume breakout (volume >= 1.5x rata-rata 20 hari), dan akumulasi asing (foreign net 5 hari > 0). Saham dengan skor >= 3 dianggap lolos.",
    },
    {
      title: "Seberapa sering data di-update?",
      content:
        "Pipeline berjalan otomatis lewat Vercel Cron setiap hari kerja (Senin-Jumat) pukul 17:00 WIB setelah pasar tutup. Halaman ini hanya membaca hasil terakhir dari Redis — tidak pernah request ke IDX saat runtime.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        tags={["Analisis"]}
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 text-center text-sm text-muted">
          <p className="font-semibold text-foreground">Terjadi kesalahan</p>
          <p className="mt-1">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => reload()}
          >
            Coba lagi
          </Button>
        </div>
      ) : !payload?.available ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center">
          <p className="text-lg font-semibold text-foreground">
            Data belum tersedia
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {payload?.message ??
              "Cron screener belum pernah berjalan. Pipeline otomatis mengisi data setiap hari kerja pukul 17:00 WIB."}
          </p>
          <Button variant="outline" className="mt-5" onClick={() => reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat ulang
          </Button>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <SummaryStrip payload={payload} />

          {/* Results table */}
          <ScreenerTable results={payload?.results ?? []} />

          <Accordion items={infoItems} defaultOpen={0} />
        </>
      )}
    </div>
  );
}
