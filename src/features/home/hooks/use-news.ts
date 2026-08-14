"use client";

import { useCallback, useEffect, useState } from "react";

export type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  source?: string;
  imageUrl?: string;
};

/** Hook client untuk membaca berita dari /api/news (RSS ekonomi/pasar). */
export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/news", { cache: "no-store" });

      if (!res.ok) {
        throw new Error("Gagal memuat berita");
      }

      const data = (await res.json()) as NewsItem[] | { error: string };
      setNews(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Terjadi kesalahan saat memuat berita",
      );
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { news, loading, error, reload: load } as const;
}
