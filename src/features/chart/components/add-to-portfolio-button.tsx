"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = {
  symbol: string;
  price: number | null;
};

/**
 * Tombol "Add to Your Portfolio" — membuka modal input jumlah lot & harga
 * rata-rata. Submit saat ini hanya console.log + toast sukses karena halaman
 * /portfolio masih dummy data.
 */
export function AddToPortfolioButton({ symbol, price }: Props) {
  const [open, setOpen] = useState(false);
  const [lots, setLots] = useState("1");
  const [avgPrice, setAvgPrice] = useState(
    price && Number.isFinite(price) ? String(price) : "",
  );
  const [toast, setToast] = useState<string | null>(null);

  // Lock body scroll saat modal terbuka
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: persist ke backend/portfolio store saat data layer portfolio sudah ada.
    console.log("Add to portfolio:", {
      symbol,
      lots: Number(lots),
      avgPrice: Number(avgPrice),
    });
    setOpen(false);
    setToast(
      `Ditambahkan: ${symbol} (${lots || 0} lot @ ${avgPrice || "-"})`,
    );
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAvgPrice(price && Number.isFinite(price) ? String(price) : "");
          setOpen(true);
        }}
        className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.99]"
      >
        Add to Your Portfolio
      </button>

      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-500 shadow-(--shadow)">
          {toast}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Tambah ${symbol} ke portfolio`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-sm rounded-4xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow) sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Add to Your Portfolio
                </p>
                <p className="text-sm text-muted">{symbol}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="portfolio-lots"
                  className="block text-xs font-medium text-muted"
                >
                  Jumlah Lot
                </label>
                <input
                  id="portfolio-lots"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={lots}
                  onChange={(e) => setLots(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
                />
              </div>

              <div>
                <label
                  htmlFor="portfolio-avg-price"
                  className="block text-xs font-medium text-muted"
                >
                  Harga Rata-rata
                </label>
                <input
                  id="portfolio-avg-price"
                  type="number"
                  min={0}
                  step="any"
                  required
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
