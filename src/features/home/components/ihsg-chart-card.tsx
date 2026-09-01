"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import MarketStatusBadge from "@/features/home/components/market-status-badge";
import IHSGRechartsChart from "@/features/home/components/ihsg-recharts-chart";
import { cn } from "@/lib/utils/cn";
import { formatCompactId } from "@/lib/utils/format";
import type { IhsgSummary } from "@/features/explore/services/index-summary.service";

type IntradayPoint = {
  time: string;
  price: number;
};

type IHSGQuote = {
  price: number;
  change: number;
  changePercent: number;
  marketState: string;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
};

function DataRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted sm:text-xs">
        {label}
      </span>
      <span
        className={cn(
          "whitespace-nowrap text-xs font-semibold tabular-nums sm:text-sm",
          className,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function IHSGChartCard({
  ihsg,
  netForeign,
}: {
  ihsg?: IhsgSummary | null;
  netForeign?: number;
}) {
  const [intraday, setIntraday] = useState<IntradayPoint[]>([]);
  const [prevClose, setPrevClose] = useState<number | null>(null);
  const [quote, setQuote] = useState<IHSGQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoFailed, setLogoFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ihsg", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data IHSG.");
      const data = await res.json();
      setIntraday(data.intraday ?? []);
      setPrevClose(data.prevClose ?? null);
      setQuote(data.quote);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const isUp = (quote?.change ?? 0) >= 0;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-3">
            {!logoFailed ? (
              <div className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
                <Image
                  src="https://ik.imagekit.io/kuh/istock/indeks/IHSG.png?tr=f-auto"
                  alt="IHSG logo"
                  width={44}
                  height={44}
                  className="h-9 w-9 object-contain sm:h-11 sm:w-11"
                  unoptimized
                  onError={() => setLogoFailed(true)}
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-sm font-semibold sm:h-12 sm:w-12">
                I
              </div>
            )}
            <div className="min-w-0 flex-1">
              {/* Badge status sejajar kanan tulisan IHSG */}
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-semibold tracking-tight sm:text-xl">
                  IHSG
                </span>
                {quote?.marketState === "REGULAR" && (
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                )}
                <MarketStatusBadge />
              </div>
              <p className="truncate text-xs leading-snug text-muted sm:text-sm">
                Indeks Harga Saham Gabungan
              </p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* Price & Change */}
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold tracking-tight sm:text-4xl">
                {quote?.price.toLocaleString("id-ID", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p
                className={cn(
                  "text-base font-semibold sm:text-xl",
                  isUp ? "text-emerald-500" : "text-red-500",
                )}
              >
                {quote && (
                  <>
                    {quote.change >= 0 ? "+" : ""}
                    {quote.change.toFixed(2)} (
                    {quote.changePercent >= 0 ? "+" : ""}
                    {quote.changePercent.toFixed(2)}%)
                  </>
                )}
              </p>
            </div>

            {/* Grafik intraday IHSG */}
            {intraday.length > 1 ? (
              <div className="h-36 w-full sm:h-44">
                <IHSGRechartsChart
                  data={intraday}
                  prevClose={prevClose}
                  positive={isUp}
                />
              </div>
            ) : null}

            {/* 3 kolom statistik — tiap kolom jadi card, cuma border (transparan, tanpa shadow) */}
            {quote && ihsg ? (
              <div className="hide-scrollbar flex gap-2 overflow-x-auto px-1 pb-0.5 sm:gap-3 sm:overflow-visible sm:px-0">
                {/* Kiri: Open, High, Low */}
                <div className="min-w-36 shrink-0 space-y-1.5 rounded-xl border border-(--border) bg-transparent p-3 sm:min-w-0 sm:flex-1 sm:p-4">
                  <DataRow
                    label="Open"
                    value={quote.open.toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  />
                  <DataRow
                    label="High"
                    value={quote.dayHigh.toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    className="text-emerald-500"
                  />
                  <DataRow
                    label="Low"
                    value={quote.dayLow.toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    className="text-red-500"
                  />
                </div>

                {/* Tengah: M. Cap, Value, Net Foreign */}
                <div className="min-w-36 shrink-0 space-y-1.5 rounded-xl border border-(--border) bg-transparent p-3 sm:min-w-0 sm:flex-1 sm:p-4">
                  <DataRow
                    label="M. Cap"
                    value={`Rp${formatCompactId(ihsg.marketCap)}`}
                  />
                  <DataRow
                    label="Value"
                    value={`Rp${formatCompactId(ihsg.value)}`}
                  />
                  <DataRow
                    label="Net Foreign"
                    value={
                      netForeign !== undefined
                        ? `${netForeign >= 0 ? "+" : "-"}Rp${formatCompactId(Math.abs(netForeign))}`
                        : "—"
                    }
                    className={
                      netForeign !== undefined
                        ? netForeign >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                        : ""
                    }
                  />
                </div>

                {/* Kanan: Volume, Freq */}
                <div className="min-w-28 shrink-0 space-y-1.5 rounded-xl border border-(--border) bg-transparent p-3 sm:min-w-0 sm:flex-1 sm:p-4">
                  <DataRow label="Vol" value={formatCompactId(quote.volume)} />
                  <DataRow
                    label="Freq"
                    value={`${formatCompactId(ihsg.frequency)}x`}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
