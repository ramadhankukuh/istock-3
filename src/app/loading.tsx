import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-card rounded-3xl p-5">
            <Skeleton className="mb-4 h-5 w-32" />
            <Skeleton className="mb-3 h-10 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
