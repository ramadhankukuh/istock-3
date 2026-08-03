"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search } from "lucide-react";
import ExploreCard from "@/features/explore/components/explore-card";
import ExploreCardSkeleton from "@/features/explore/components/explore-card-skeleton";
import { useExplore } from "@/features/explore/hooks/use-explore";
import { cn } from "@/lib/utils/cn";
import type { ExploreCategory } from "@/features/explore/types";

const EXPLORE_KEYS = ["global", "komoditas", "currency"];

export default function ExplorePage() {
  const { categories = [], isLoading: categoriesLoading } = useExplore();

  const [failedLogos, setFailedLogos] = React.useState<Record<string, boolean>>(
    {},
  );
  const [activeCategoryKey, setActiveCategoryKey] = React.useState<string>("");

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => EXPLORE_KEYS.includes(c.key));
  }, [categories]);

  const resolvedActiveCategoryKey = React.useMemo(() => {
    if (filteredCategories.length === 0) {
      return "";
    }

    const hasActiveCategory = filteredCategories.some(
      (category) => category.key === activeCategoryKey,
    );

    return hasActiveCategory ? activeCategoryKey : filteredCategories[0].key;
  }, [activeCategoryKey, filteredCategories]);

  const activeCategory = React.useMemo(() => {
    return (
      filteredCategories.find(
        (category) => category.key === resolvedActiveCategoryKey,
      ) ?? filteredCategories[0]
    );
  }, [filteredCategories, resolvedActiveCategoryKey]);

  return (
    <section className="space-y-6 overflow-hidden">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Cari indeks, komoditas, atau mata uang..."
          className="focus-ring h-10 w-full rounded-xl border border-(--border) bg-(--surface-strong) pl-10 pr-4 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-(--accent)"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {categoriesLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <ExploreCardSkeleton key={i} />
            ))
          : filteredCategories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveCategoryKey(c.key)}
                aria-pressed={c.key === activeCategory?.key}
                className={cn(
                  "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  c.key === activeCategory?.key
                    ? "bg-foreground text-background"
                    : "bg-(--surface-strong) text-muted hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {categoriesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <ExploreCardSkeleton key={`s-${i}`} />
            ))
          : (activeCategory?.items ?? []).map(
              (item: ExploreCategory["items"][number]) => (
                <ExploreCard
                  key={item.symbol}
                  item={item}
                  failedLogos={failedLogos}
                  onLogoError={(s) =>
                    setFailedLogos((p) => ({ ...p, [s]: true }))
                  }
                />
              ),
            )}
      </div>

      {/* Swing Trade section */}
      <div className="rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow)">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">Swing Trade</Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              Ruang swing trader
            </h2>
            <p className="max-w-xl text-sm text-muted">
              Area eksklusif untuk preset pribadi, watchlist, dan catatan trade
              — terpisah dari guest. Login dengan Google untuk mengakses.
            </p>
          </div>
          <Link
            href="/swing-trade"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 shrink-0"
          >
            Buka Swing Trade
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
