import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  hint?: React.ReactNode;
};

export function StatItem({ label, value, valueClassName, hint }: Props) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("font-semibold text-foreground", valueClassName)}>
        {value}
      </p>
      {hint}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
