"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExploreMiniSparkline } from "@/features/explore/components/mini-sparkline";
import { cn } from "@/lib/utils/cn";
import type { ExploreCategory } from "@/features/explore/types";

export default function ExploreCard({
  item,
  failedLogos,
  onLogoError,
}: {
  item: ExploreCategory["items"][number];
  failedLogos: Record<string, boolean>;
  onLogoError: (symbol: string) => void;
}) {
  // Sparkline colour follows the daily change so text & line stay consistent
  const chartPositive = item.trend !== "down";

  return (
    <Card className="group">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center gap-2">
          {item.logo && !failedLogos[item.symbol] ? (
            <div className="flex h-8 w-8 items-center justify-center">
              <Image
                src={item.logo}
                alt={`${item.symbol} logo`}
                width={30}
                height={30}
                className="h-7 w-7 object-contain"
                unoptimized
                onError={() => onLogoError(item.symbol)}
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-xs font-semibold">
              {String(item.symbol).trim().charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-1 truncate text-sm sm:text-base">
              {item.symbol}
              {item.isMarketOpen && (
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              )}
            </CardTitle>
            <p className="truncate text-[10px] leading-snug text-muted sm:text-[11px]">
              {item.name}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-semibold tracking-tight sm:text-xl">
              {item.priceHint}
            </p>
            <p
              className={cn(
                "text-xs sm:text-sm",
                item.trend === "down" ? "text-red-500" : "text-emerald-500",
              )}
            >
              {item.change.replace(".", ",")}
            </p>
          </div>
          <div className="h-12 w-full">
            <ExploreMiniSparkline
              points={item.chart}
              positive={chartPositive}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
