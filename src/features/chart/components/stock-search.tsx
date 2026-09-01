"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { StockLogo } from "@/features/chart/components/stock-logo";

type SearchResult = {
  symbol: string;
  name: string;
};

type Props = {
  onSubmit: (symbol: string) => void;
  placeholder?: string;
};

/**
 * Pencarian saham IDX — mirip pencarian di halaman /explore, dengan dropdown
 * saran (ticker + nama + logo ImageKit di kanan). Fetch di-debounce ke
 * `/api/stock-search`. Input selalu kosong (hanya placeholder) — ticker yang
 * dipilih ditampilkan di header, bukan di dalam input.
 */
export function StockSearch({
  onSubmit,
  placeholder = "Cari saham...",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch debounce saat query berubah.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      Promise.resolve().then(() => {
        setResults([]);
        setOpen(false);
        setLoading(false);
      });
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/stock-search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data: { results?: SearchResult[] }) => {
          if (cancelled) return;
          setResults(data.results ?? []);
          // Buka dropdown hanya saat user sedang fokus di input (bukan saat
          // sinkron dari luar / navigasi).
          if (document.activeElement === inputRef.current) {
            setOpen(true);
          }
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (symbol: string) => {
    setOpen(false);
    // Kosongkan input biar kembali ke placeholder — ticker tampil di header.
    setQuery("");
    onSubmit(symbol);
  };

  const showDropdown = open && (results.length > 0 || loading);

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              handleSubmit(query.trim());
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          aria-label="Cari saham"
          className="focus-ring h-10 w-full rounded-xl border border-(--border) bg-(--surface-strong) pl-10 pr-4 text-sm font-semibold uppercase tracking-tight text-foreground placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-muted outline-none transition focus:border-(--accent)"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-(--border) bg-(--surface) p-1.5 shadow-(--shadow)">
          {loading ? (
            <p className="px-3 py-2 text-xs text-muted">Mencari…</p>
          ) : (
            results.map((r) => (
              <button
                key={r.symbol}
                type="button"
                onClick={() => handleSubmit(r.symbol)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-(--surface-strong)"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {r.symbol}
                  </p>
                  <p className="truncate text-xs text-muted">{r.name}</p>
                </div>
                <StockLogo symbol={r.symbol} size={36} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
