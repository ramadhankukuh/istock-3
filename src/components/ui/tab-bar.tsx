import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type TabItem<T extends string> = {
  key: T;
  label: ReactNode;
};

type TabBarProps<T extends string> = {
  /** Daftar tab; `key` dipakai sebagai identitas & state aktif. */
  tabs: readonly TabItem<T>[];
  /** Key tab yang sedang aktif. */
  activeKey: T;
  /** Dipanggil saat sebuah tab diklik. */
  onChange: (key: T) => void;
  /** Tampilkan garis dasar di bawah nav (gaya Stockbit). Default `true`. */
  baseline?: boolean;
  /** Class tambahan pada container scroll. */
  className?: string;
};

/**
 * Tab horizontal ala Stockbit — stabil saat di-scroll:
 *
 * 1. Scroll vertikal dimatikan total: `overflow-y-hidden` + `touch-pan-x`
 *    (hanya pan horizontal yang aktif → tidak goyang naik-turun).
 * 2. Semua item punya tinggi & alignment vertikal sama: `flex items-center`
 *    + `whitespace-nowrap` (label tak pernah wrap → tinggi konsisten).
 * 3. Indikator aktif memakai `border-b-2`; tab non-aktif `border-transparent`
 *    → tidak ada layout shift / beda tinggi antar tab saat ganti aktif.
 * 4. Item tidak menyusut saat container di-scroll: `shrink-0`.
 */
export function TabBar<T extends string>({
  tabs,
  activeKey,
  onChange,
  baseline = true,
  className,
}: TabBarProps<T>) {
  return (
    <div
      className={cn(
        "hide-scrollbar -mx-1 flex touch-pan-x items-stretch gap-1 overflow-x-auto overflow-y-hidden px-1",
        baseline && "border-b border-(--border)",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition sm:text-sm",
              isActive
                ? "border-(--accent) text-(--accent)"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
