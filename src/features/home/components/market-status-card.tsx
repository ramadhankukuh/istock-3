"use client";

import { useEffect, useState, useRef } from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import tradHolidays from "@/lib/data/tradHoliday.json";

function getCountdown(
  now: Date,
  targetHour: number,
  targetMinute: number,
  label: string,
) {
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);
  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 1000 / 3600);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return `${label}: ${h}j ${m}m ${s}d`;
}

const isHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  return tradHolidays.some((holiday) => holiday.date === dateStr);
};

const getHolidayEvent = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  const holiday = tradHolidays.find((h) => h.date === dateStr);
  return holiday ? holiday.event : "Holiday";
};

const getCountdownNextTradingDay = (current: Date): string => {
  let nextDay = new Date(current);

  const day = current.getDay();
  if (day >= 1 && day <= 5 && current.getHours() < 9 && !isHoliday(current)) {
    nextDay.setHours(9, 0, 0, 0);
  } else {
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(9, 0, 0, 0);

    while (
      nextDay.getDay() === 0 ||
      nextDay.getDay() === 6 ||
      isHoliday(nextDay)
    ) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
  }

  const diff = nextDay.getTime() - current.getTime();
  const h = Math.floor(diff / 1000 / 3600);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return `Open In: ${h}j ${m}m ${s}d`;
};

export default function MarketStatusCard() {
  const [status, setStatus] = useState("");
  const [countdown, setCountdown] = useState("");
  const [holidayInfo, setHolidayInfo] = useState("");
  const [showHolidayInfo, setShowHolidayInfo] = useState(false);
  const holidayInfoRef = useRef<HTMLDivElement>(null);

  // Market status logic
  useEffect(() => {
    const updateStatus = () => {
      const current = new Date();

      const day = current.getDay();
      const hour = current.getHours();
      const minute = current.getMinutes();
      const time = hour * 60 + minute;

      let statusText = "";
      let countdownText = "";

      if (isHoliday(current)) {
        setHolidayInfo(getHolidayEvent(current));
        statusText = "MARKET CLOSE - HOLIDAY";
        countdownText = getCountdownNextTradingDay(current);
      } else if (day === 0 || day === 6) {
        setHolidayInfo("");
        setShowHolidayInfo(false);
        statusText = "MARKET CLOSE - WEEKEND";
        countdownText = getCountdownNextTradingDay(current);
      } else {
        setHolidayInfo("");
        setShowHolidayInfo(false);
        if (day >= 1 && day <= 4) {
          if (time >= 9 * 60 && time < 12 * 60) {
            statusText = "MARKET OPEN - SESI I";
            countdownText = getCountdown(current, 12, 0, "Sesi I End In");
          } else if (time >= 12 * 60 && time < 13 * 60 + 30) {
            statusText = "MARKET BREAK - LUNCH TIME";
            countdownText = getCountdown(current, 13, 30, "Break End In");
          } else if (time >= 13 * 60 + 30 && time < 16 * 60) {
            statusText = "MARKET OPEN - SESI II";
            countdownText = getCountdown(current, 16, 0, "Sesi II End In");
          } else {
            statusText = "MARKET CLOSE - WAITING";
            countdownText = getCountdownNextTradingDay(current);
          }
        } else if (day === 5) {
          if (time >= 9 * 60 && time < 11 * 60 + 30) {
            statusText = "MARKET OPEN - SESI I";
            countdownText = getCountdown(current, 11, 30, "Sesi I End In");
          } else if (time >= 11 * 60 + 30 && time < 14 * 60) {
            statusText = "MARKET BREAK - LUNCH TIME";
            countdownText = getCountdown(current, 14, 0, "Break End In");
          } else if (time >= 14 * 60 && time < 16 * 60) {
            statusText = "MARKET OPEN - SESI II";
            countdownText = getCountdown(current, 16, 0, "Sesi II End In");
          } else {
            statusText = "MARKET CLOSE - WAITING";
            countdownText = getCountdownNextTradingDay(current);
          }
        }
      }

      setStatus(statusText);
      setCountdown(countdownText);
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
