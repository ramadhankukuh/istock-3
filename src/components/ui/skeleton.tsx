import { cn } from "@/lib/utils/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-(--surface-strong) before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-black/[0.06] before:to-transparent dark:before:via-white/[0.08]",
        className,
      )}
      {...props}
    />
  );
}
