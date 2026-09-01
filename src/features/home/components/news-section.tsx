"use client";

import Image from "next/image";
import { Newspaper } from "lucide-react";
import { useNews } from "@/features/home/hooks/use-news";

function formatDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function NewsSkeleton() {
  return (
    <div className="flex gap-3 rounded-2xl border border-(--border) bg-(--surface-strong) p-3">
      <div className="h-20 w-28 shrink-0 animate-pulse rounded-lg bg-(--surface)" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-2.5 w-24 animate-pulse rounded bg-(--surface)" />
        <div className="h-3.5 w-full animate-pulse rounded bg-(--surface)" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-(--surface)" />
      </div>
    </div>
  );
}

export default function NewsSection() {
  const { items, isLoading, error } = useNews();

  return (
    <div className="space-y-3">
      <div className="-mx-4 flex items-center gap-2 bg-[#f8f8f8] px-4 py-3 dark:bg-[#1e1e1e] sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-xl lg:px-6">
        <Newspaper className="h-4 w-4 text-(--accent)" aria-hidden />
        <h2 className="text-base font-bold text-foreground sm:text-lg">
          Berita Ekonomi & Pasar
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">Belum ada berita.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 rounded-2xl border border-(--border) bg-(--surface-strong) p-3 shadow-(--shadow-soft) transition-colors hover:border-(--accent)"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-(--surface)">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={112}
                    height={80}
                    unoptimized
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Newspaper className="h-5 w-5 text-muted" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted">
                  {item.source} · {formatDate(item.pubDate)}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-(--accent)">
                  {item.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted">
                  {item.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
