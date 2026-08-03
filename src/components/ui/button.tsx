import { cn } from "@/lib/utils/cn";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-(--foreground) text-(--background) hover:opacity-90",
  secondary: "bg-(--surface-strong) text-(--foreground) hover:bg-(--surface)",
  ghost: "bg-transparent text-(--foreground) hover:bg-(--surface)",
  outline:
    "border border-(--border) bg-transparent text-(--foreground) hover:bg-(--surface)",
};

export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
