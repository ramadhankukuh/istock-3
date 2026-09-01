"use client";

import { useEffect, useState, useRef } from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { getMarketStatus } from "@/features/home/lib/market-status";

export default function MarketStatusCard() {
  const [status, setStatus] = useState("");
  const [countdown, setCountdown] = useState("");
  const [holidayInfo, setHolidayInfo] = useState("");
  const [showHolidayInfo, setShowHolidayInfo] = useState(false);
  const holidayInfoRef = useRef<HTMLDivElement>(null);

  // Market status logic
  useEffect(() => {
    const updateStatus = () => {
      const { status: statusText, countdown: countdownText, holiday } =
        getMarketStatus(new Date());

      setStatus(statusText);
      setCountdown(countdownText);
      setHolidayInfo(holiday);
      setShowHolidayInfo((prev) => (holiday ? prev : false));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Click outside handler for holiday info
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        holidayInfoRef.current &&
        !holidayInfoRef.current.contains(event.target as Node)
      ) {
        setShowHolidayInfo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusColor = status.includes("OPEN")
    ? "text-emerald-600 dark:text-emerald-400"
    : status.includes("BREAK")
      ? "text-amber-600 dark:text-amber-400"
      : status.includes("WAITING")
        ? "text-blue-600 dark:text-blue-400"
        : status.includes("WEEKEND") || status.startsWith("MARKET CLOSE -")
          ? "text-rose-600 dark:text-rose-400"
          : "text-slate-600 dark:text-slate-400";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-row items-center justify-between gap-3">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 w-fit",
              status.includes("OPEN")
                ? "bg-emerald-500/10"
                : status.includes("BREAK")
                  ? "bg-amber-500/10"
                  : "bg-rose-500/10",
            )}
          >
            <span
              className={cn(
                "inline-block h-2 w-2 shrink-0 rounded-full",
                status.includes("OPEN")
                  ? "bg-emerald-500"
                  : status.includes("BREAK")
                    ? "bg-amber-500"
                    : "bg-rose-500",
              )}
            />
            <span className={cn("text-xs font-semibold", statusColor)}>
              {status || "LOADING..."}
            </span>
            {holidayInfo && (
              <div
                ref={holidayInfoRef}
                className="relative"
                onMouseEnter={() => setShowHolidayInfo(true)}
                onMouseLeave={() => setShowHolidayInfo(false)}
              >
                <button
                  type="button"
                  onFocus={() => setShowHolidayInfo(true)}
                  className="inline-flex items-center justify-center text-muted transition-colors hover:text-foreground"
                  aria-label="Info hari libur"
                >
                  <Info size={12} />
                </button>
                {showHolidayInfo && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-border bg-background p-2 text-left text-xs text-muted shadow-lg">
                    {holidayInfo}
                  </div>
                )}
              </div>
            )}
          </div>
          {countdown && (
            <span className="font-mono text-[11px] text-muted text-right">
              {countdown}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
