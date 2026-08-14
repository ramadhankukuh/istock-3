"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import { useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { MacroIndicator, MacroKey } from "@/features/macro-indicators/types";

function getBadgeIcon(badge?: string | null) {
  if (!badge) {
    return null;
  }

  if (badge.startsWith("+")) {
    return <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />;
  }

  if (badge.startsWith("-")) {
    return <ArrowDownRight className="size-3.5 shrink-0" aria-hidden />;
  }

  return <Minus className="size-3.5 shrink-0" aria-hidden />;
}

export default function MacroSlider({
  items,
  activeKey,
  onSelect,
}: {
  items: MacroIndicator[];
  activeKey?: MacroKey | null;
  onSelect?: (key: MacroKey) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labelClassName =
    "text-[14px] font-semibold uppercase tracking-[0.14em] text-foreground sm:text-[15px]";
  const subtitleClassName =
    "text-[10px] leading-snug text-muted sm:text-[11px]";

  return (
    <div className="overflow-hidden">
      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto px-0 py-2 hide-scrollbar snap-x snap-mandatory"
      >
        {items.map((indicator) => {
          const badgeIcon = getBadgeIcon(indicator.badge);
          const isBiRate = indicator.key === "bi-rate";

          return (
            <Card
              key={indicator.label}
              className={cn(
                "min-w-52 shrink-0 snap-center overflow-hidden rounded-3xl border border-subtle bg-(--surface-strong) p-0 text-foreground shadow-soft transition sm:min-w-64",
                activeKey === indicator.key && "ring-1 ring-(--ring)",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect?.(indicator.key)}
                aria-pressed={activeKey === indicator.key}
                className="focus-ring flex h-full w-full flex-col  text-left"
              >
                {isBiRate ? (
                  <>
                    <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
                      <div className="space-y-0.5">
                        <div className={labelClassName}>{indicator.label}</div>
                        <div className={subtitleClassName}>
                          {indicator.subtitle}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
                      <div className="flex items-center gap-1.5">
                        <div className="-translate-y-0.5 text-[clamp(1.8rem,5vw,2.6rem)] font-normal leading-none tracking-tight text-foreground">
                          {indicator.value}
                        </div>

                        {indicator.badge ? (
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.75 text-[11px] font-medium leading-none sm:text-[12px]",
                              indicator.badgeTone === "positive" &&
                                "bg-emerald-500/15 text-emerald-700",
                              indicator.badgeTone === "negative" &&
                                "bg-red-500/15 text-red-600",
                              indicator.badgeTone === "neutral" &&
                                "bg-foreground text-background",
                            )}
                          >
                            <span aria-hidden className="leading-none">
                              {badgeIcon}
                            </span>
                            <span>{indicator.badge}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] leading-tight text-muted sm:text-[11px]">
                        <span>{indicator.source}</span>
                        <span>{indicator.period}</span>
                      </div>

                      <hr className="my-1.5 border-t-2 border-(--border)" />

                      <div className="flex items-center justify-between text-[11px] font-medium leading-tight text-foreground sm:text-[12px]">
                        <span>Lihat Visualisasi</span>
                        <ArrowRight className="size-4 shrink-0" aria-hidden />
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
                      <div className="space-y-0.5">
                        <p className={labelClassName}>{indicator.label}</p>
                        <p className={subtitleClassName}>
                          {indicator.subtitle}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
                      <div className="flex items-start gap-2">
                        <p className="-translate-y-0.5 text-[clamp(1.6rem,4.8vw,2.35rem)] font-normal leading-none tracking-tight text-foreground">
                          {indicator.value}
                        </p>
                        {indicator.badge ? (
                          <div
                            className={cn(
                              "mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.75 text-[10px] font-medium leading-tight sm:text-[12px]",
                              indicator.badgeTone === "positive" &&
                                "bg-emerald-500/15 text-emerald-700",
                              indicator.badgeTone === "negative" &&
                                "bg-red-500/15 text-red-600",
                              indicator.badgeTone === "neutral" &&
                                "bg-foreground text-background",
                            )}
                          >
                            <span aria-hidden className="leading-none">
                              {badgeIcon}
                            </span>
                            <span>{indicator.badge}</span>
                          </div>
                        ) : (
                          <div className="mt-0.5 inline-flex rounded-full bg-(--surface) px-2 py-0.75 text-[10px] font-medium leading-tight text-foreground">
                            {indicator.source}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] leading-tight text-muted sm:text-[11px]">
                        <span>{indicator.source}</span>
                        <span>{indicator.period}</span>
                      </div>

                      <hr className="my-1.5 border-t-2 border-(--border)" />

                      <div className="flex items-center justify-between text-[11px] font-medium leading-tight text-foreground sm:text-[12px]">
                        <span>Lihat Visualisasi</span>
                        <ArrowRight className="size-4 shrink-0" aria-hidden />
                      </div>
                    </CardContent>
                  </>
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
