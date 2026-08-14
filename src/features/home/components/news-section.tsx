"use client";

import Image from "next/image";
import { Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "../hooks/use-news";

function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").trim();
  }
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function formatDateWIB(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Section berita ekonomi & pasar di bagian paling bawah halaman home.
 * Data dari /api/news (RSS tempo, CNN, CNBC, Detik, Antara, Okezone).
 */
export function NewsSection() {
  const { news, loading, error } = useNews();

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-(--accent)" />
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground sm:text-base">
          Berita Ekonomi &amp; Pasar
        </span>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-2xl border border-(--border) bg-(--surface) p-3 shadow-(--shadow-soft)"
            >
              <Skeleton className="h-20 w-28 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2 py-0.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : error || news.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 text-center text-sm text-muted">
          <p className="font-semibold text-foreground">
            Berita belum tersedia
          </p>
          <p className="mt-1">{error ?? "Coba muat ulang beberapa saat lagi."}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item, idx) => (
            <a
              key={`${item.link}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 rounded-2xl border border-(--border) bg-(--surface) p-3 shadow-(--shadow-soft) transition hover:border-(--accent) hover:shadow-(--shadow)"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={112}
                  height={80}
                  unoptimized
                  className="h-20 w-28 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-(--surface-strong)">
                  <Newspaper className="h-6 w-6 text-muted" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-semibold text-(--accent)">
                    {item.source}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {formatDateWIB(item.pubDate)}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition group-hover:text-(--accent)">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted">
                  {stripHtml(item.description ?? "")}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
