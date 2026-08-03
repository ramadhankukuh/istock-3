"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import IHSGRechartsChart from "@/features/home/components/ihsg-recharts-chart";
import { cn } from "@/lib/utils/cn";

type IntradayPoint = {
  time: string;
  price: number;
};

type IHSGQuote = {
  price: number;
  change: number;
  changePercent: number;
  marketState: string;
};

export default function IHSGChartCard() {
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
    load();
  }, [load]);

  // Debug: log data summary to verify early-morning drop exists
  useEffect(() => {
    if (intraday.length > 2) {
      const prices = intraday.map((d) => d.price);
      const rawMin = Math.min(...prices);
      const rawMax = Math.max(...prices);
      const range = rawMax - rawMin;
      console.log("[IHSG Data Debug]", {
        count: intraday.length,
        first: intraday[0],
        last: intraday[intraday.length - 1],
        intradayMin: rawMin,
        intradayMax: rawMax,
        range,
        earlyPoints: intraday.slice(0, 5),
      });
    }
  }, [intraday]);

  const isUp = (quote?.change ?? 0) >= 0;

  return (
    <Card className="group overflow-hidden border-(--border) bg-(--surface) shadow-(--shadow)">
      {isLoading ? (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Header — same style as ExploreCard but larger */}
          <CardHeader className="space-y-3 pb-4 sm:pb-5">
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
                <CardTitle className="flex items-center gap-1.5 text-lg sm:text-xl">
                  IHSG
                  {quote?.marketState === "REGULAR" && (
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </CardTitle>
                <p className="truncate text-xs leading-snug text-muted sm:text-sm">
                  Indeks Harga Saham Gabungan
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-5">
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

            {/* Recharts chart — dynamic Y-axis, WIB time labels */}
            <div className="h-36 w-full sm:h-44">
              <IHSGRechartsChart
                data={intraday}
                prevClose={prevClose}
                positive={isUp}
              />
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
