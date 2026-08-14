import type { SwingScreenerPayload } from "../types";

function formatUpdatedAt(iso: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Strip ringkasan screener: Universe, Screened, Lolos, dan Updated.
 * Dipakai di halaman /swing-trade maupun preview di /explore.
 */
export function SummaryStrip({
  payload,
}: {
  payload: SwingScreenerPayload | null;
}) {
  const items: Array<[string, string, string]> = [
    ["Universe", String(payload?.summary?.universeSize ?? 0), "saham"],
    ["Screened", String(payload?.summary?.screened ?? 0), "saham"],
    ["Lolos", String(payload?.summary?.passed ?? 0), "saham"],
    ["Updated", formatUpdatedAt(payload?.updatedAt ?? null), "WIB"],
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([label, value, suffix]) => (
        <div
          key={label}
          className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-soft)"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-semibold text-foreground">
            {value}{" "}
            <span className="text-xs font-normal text-muted">{suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
