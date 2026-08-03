import { Skeleton } from "@/components/ui/skeleton";

function StockSummaryLoadingCard() {
  return (
    <div className="space-y-4">
      <div className="rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow)">
        <div className="space-y-3">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-9 w-80 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-3/4 max-w-xl" />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={`stock-summary-stat-loading-${index}`}
              className="h-10 w-28 shrink-0 rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={`stock-summary-tab-loading-${index}`}
            className="h-10 w-28 shrink-0 rounded-full"
          />
        ))}
      </div>

      <div className="glass-card rounded-3xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-40 max-w-full" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-5 w-24" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>

        <Skeleton className="mt-3 h-20 rounded-2xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`stock-summary-card-loading-${index}`}
            className="glass-card rounded-3xl p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-40 max-w-full" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="ml-auto h-5 w-24" />
                <Skeleton className="ml-auto h-4 w-20" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Skeleton className="h-14 rounded-2xl" />
              <Skeleton className="h-14 rounded-2xl" />
              <Skeleton className="h-14 rounded-2xl" />
            </div>

            <Skeleton className="mt-3 h-20 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroLoadingStrip() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-full" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar snap-x snap-mandatory">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`macro-loading-${index}`}
            className="glass-card flex min-w-52 shrink-0 snap-center flex-col gap-4 rounded-3xl p-5 sm:min-w-64"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-24 rounded-2xl" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>

            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExploreLoadingCard() {
  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_84px] grid-rows-2 gap-x-2 gap-y-2">
        <Skeleton className="h-7 w-24 self-end" />
        <Skeleton className="row-span-2 h-10 w-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow)">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-3/4 max-w-xl" />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`tab-loading-${index}`}
              className="h-10 w-24 shrink-0 rounded-full"
            />
          ))}
        </div>
      </div>

      <MacroLoadingStrip />

      <StockSummaryLoadingCard />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ExploreLoadingCard key={`card-loading-${index}`} />
        ))}
      </div>
    </section>
  );
}
