"use client";

import React from "react";
import { TabBar } from "@/components/ui/tab-bar";
import ExploreCard from "@/features/explore/components/explore-card";
import ExploreCardSkeleton from "@/features/explore/components/explore-card-skeleton";
import { SwingTradePreview } from "@/features/explore/components/swing-trade-preview";
import { useExplore } from "@/features/explore/hooks/use-explore";
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
    <section className="space-y-6">
      {/* Category tabs */}
      {categoriesLoading ? (
        <div className="flex gap-6 border-b border-(--border) pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-5 w-20 animate-pulse rounded bg-(--surface-strong)" />
          ))}
        </div>
      ) : (
        <TabBar
          tabs={filteredCategories.map((category) => ({
            key: category.key,
            label: category.label,
          }))}
          activeKey={resolvedActiveCategoryKey}
          onChange={setActiveCategoryKey}
        />
      )}

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
      <SwingTradePreview />
    </section>
  );
}
