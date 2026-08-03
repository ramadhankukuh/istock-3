"use client";

import { cn } from "@/lib/utils/cn";
import type { ChartTab } from "@/features/chart/types";

const TABS: { id: ChartTab; label: string }[] = [
  { id: "keystats", label: "Keystats" },
  { id: "analysis", label: "Analysis" },
  { id: "financials", label: "Financials" },
  { id: "seasonality", label: "Seasonality" },
  { id: "about", label: "About" },
];

type Props = {
  active: ChartTab;
  onChange: (tab: ChartTab) => void;
};

export function TabNav({ active, onChange }: Props) {
  return (
    <div className="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-(--border) px-1">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition sm:text-sm",
              isActive
                ? "text-(--accent)"
                : "text-muted hover:text-foreground",
            )}
          >
            {t.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-(--accent)" />
            )}
          </button>
        );
      })}
    </div>
  );
}
