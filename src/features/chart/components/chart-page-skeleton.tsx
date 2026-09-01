import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton penuh halaman /chart — mirror dari layout chart-page.tsx:
 * pencarian → ticker/nama → harga+logo → tags → chart → range/style →
 * tombol portfolio → tab nav → isi tab. Dipakai sebagai fallback streaming
 * (src/app/chart/loading.tsx) dan saat data client-side masih dimuat.
 */
export function ChartPageSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {/* Baris 1: kotak pencarian saham */}
      <Skeleton className="h-10 w-full" />

      {/* Baris 2: ticker + nama perusahaan */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-36 sm:h-10 sm:w-40" />
        <Skeleton className="h-4 w-52 sm:w-64" />
      </div>

      {/* Baris 3: harga + perubahan, logo sejajar di kanan */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-10 w-40 sm:h-12 sm:w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      </div>

      {/* Baris 4: tag badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Area chart */}
      <Skeleton className="h-100 w-full" />

      {/* Range tabs + style toggle */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-56 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Tombol Add to Portfolio */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-(--border) px-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-md" />
        ))}
      </div>

      {/* Isi tab */}
      <TabContentSkeleton />
    </div>
  );
}

/**
 * Skeleton isi tab — beberapa section dengan grid item stat, meniru
 * layout keystats/analysis/about (Section + StatItem).
 */
export function TabContentSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, section) => (
        <section key={section}>
          <Skeleton className="mb-4 h-6 w-44" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
