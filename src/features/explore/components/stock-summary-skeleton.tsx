"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function StockSummarySkeleton() {
  return (
    <div className="divide-y divide-(--border)">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`skel-item-${i}`}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="ml-auto h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
