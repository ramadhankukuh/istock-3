"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Moon, SunDim, Utensils } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getMarketStatus } from "@/features/home/lib/market-status";

const SHOW_MS = 3000; // berapa lama tiap label tampil
const EXIT_MS = 280; // durasi animasi text keluar ke atas
const CLOSE_MS = 300; // durasi panel menutup (kolaps grid agar border smooth)

const ICONS = {
  open: SunDim,
  break: Utensils,
  weekend: CalendarOff,
  holiday: CalendarOff,
  closed: Moon,
} as const;

type StatusKind = keyof typeof ICONS;

// Warna chip per jenis status
const KIND_STYLES: Record<StatusKind, string> = {
  open: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  break: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  weekend:
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  holiday:
    "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  closed: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

// urutan label: status -> (exit ke atas) -> countdown -> (tutup ke kiri) -> idle
type Phase = "idle" | "status" | "status-out" | "countdown";

function statusKind(status: string): StatusKind {
  if (status.includes("OPEN")) return "open";
  if (status.includes("BREAK")) return "break";
  if (status.includes("WEEKEND")) return "weekend";
  if (status.includes("HOLIDAY")) return "holiday";
  return "closed";
}

export default function MarketStatusBadge() {
  const [status, setStatus] = useState("MARKET CLOSE");
  const [countdown, setCountdown] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [closing, setClosing] = useState(false);
  const [session, setSession] = useState(0);

  // Refresh status perlahan saat idle agar icon tetap akurat
  useEffect(() => {
    const update = () => {
      const result = getMarketStatus(new Date());
      setStatus(result.status);
      setCountdown(result.countdown);
    };
    update();
    const interval = window.setInterval(update, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Putar urutan status otomatis saat halaman dimuat (tanpa perlu diklik)
  useEffect(() => {
    Promise.resolve().then(() => {
      setClosing(false);
      setSession((value) => value + 1);
      setPhase("status");
    });
  }, []);

  // Saat label tampil, tick tiap detik agar countdown tetap live
  useEffect(() => {
    if (phase === "idle") return;
    const tick = window.setInterval(() => {
      const result = getMarketStatus(new Date());
      setStatus(result.status);
      setCountdown(result.countdown);
    }, 1000);
    return () => window.clearInterval(tick);
  }, [phase]);

  // status (3 dtk) -> status-out (text naik ke atas)
  useEffect(() => {
    if (phase !== "status") return;
    const timer = window.setTimeout(() => setPhase("status-out"), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // status-out (animasi keluar) -> countdown (text dari bawah)
  useEffect(() => {
    if (phase !== "status-out") return;
    const timer = window.setTimeout(() => setPhase("countdown"), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // countdown (3 dtk) -> mulai menutup (panel kolaps, text tetap tampil)
  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setTimeout(() => setClosing(true), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // closing (CLOSE_MS) -> idle (text di-unmount setelah panel tertutup)
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setPhase("idle");
      setClosing(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const handleClick = () => {
    setClosing(false);
    setSession((value) => value + 1);
    setPhase("status");
  };

  const kind = statusKind(status);
  const Icon = ICONS[kind];
  // Panel mengecil saat closing; text tetap tampil sampai grid selesai kolaps
  const collapsed = closing || phase === "idle";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Status pasar saham"
      aria-expanded={!collapsed}
      title={status}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center overflow-hidden rounded-full border py-1 pl-1 pr-1 transition-colors",
        KIND_STYLES[kind],
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span
        aria-hidden={collapsed}
        style={{
          display: "grid",
          gridTemplateColumns: collapsed ? "0fr" : "1fr",
          opacity: collapsed ? 0 : 1,
          transition:
            "grid-template-columns 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
        }}
      >
        <span className="min-w-0 overflow-hidden whitespace-nowrap">
          {/* Label 1: status — muncul langsung tanpa animasi */}
          {phase === "status" ? (
            <span
              key={`${session}-status`}
              className="inline-flex items-center pl-1.5 pr-2 align-middle text-[10px] font-semibold tracking-wide"
            >
              {status}
            </span>
          ) : null}

          {/* Exit status: text naik ke atas */}
          {phase === "status-out" ? (
            <span
              key={`${session}-status-out`}
              className="badge-text-out-up inline-flex items-center pl-1.5 pr-2 align-middle text-[10px] font-semibold tracking-wide"
            >
              {status}
            </span>
          ) : null}

          {/* Label 2: countdown — muncul dari bawah */}
          {phase === "countdown" ? (
            <span
              key={`${session}-countdown`}
              className="badge-text-up inline-flex items-center pl-1.5 pr-2 align-middle font-mono text-[10px] font-semibold tracking-wide"
            >
              {countdown}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

