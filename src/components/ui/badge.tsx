import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "secondary" | "outline";

const badgeClasses: Record<BadgeVariant, string> = {
  default: "bg-(--foreground) text-(--background)",
  secondary: "bg-(--surface-strong) text-(--foreground)",
  outline: "border border-(--border) text-(--foreground)",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        badgeClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
