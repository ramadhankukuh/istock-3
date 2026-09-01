"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

/**
 * Section title with a small "i" info button.
 * Clicking the button toggles a popover that shows the last update time.
 * Set `showInfo={false}` to hide the button (e.g. realtime sections).
 */
export default function SectionHeading({
  title,
  updatedAt,
  showInfo = true,
}: {
  title: string;
  updatedAt?: string | null;
  showInfo?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative -mx-4 flex items-center gap-2 bg-[#f8f8f8] px-4 py-3 dark:bg-[#1e1e1e] sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-xl lg:px-6"
    >
      <h2 className="text-base font-bold text-foreground sm:text-lg">
        {title}
      </h2>
      {showInfo ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={`Info update terakhir ${title}`}
            className="focus-ring flex h-5 w-5 shrink-0 items-center justify-center text-muted transition-colors hover:text-foreground"
          >
            <Info className="h-3 w-3" aria-hidden />
          </button>

          {open ? (
            <div
              className="absolute left-0 top-full z-30 mt-1.5 whitespace-nowrap rounded-xl border border-(--border) bg-(--surface-strong) px-3 py-2 text-xs text-muted shadow-(--shadow-soft)"
              aria-live="polite"
            >
              Update terakhir:{" "}
              <span className="font-medium text-foreground">
                {updatedAt ?? "-"}
              </span>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
