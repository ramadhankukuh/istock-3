import { NextResponse } from "next/server";

import type { NewsItem } from "@/features/home/types";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { redis } from "@/lib/redis/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FeedSource = {
  id: string;
  label: string;
  url: string;
};

const FEEDS: FeedSource[] = [
  {
    id: "cnbc",
    label: "CNBC Indonesia",
    url: "https://www.cnbcindonesia.com/rss",
  },
  {
    id: "cnn",
    label: "CNN Indonesia",
    url: "https://www.cnnindonesia.com/ekonomi/rss",
  },
  {
    id: "detik",
    label: "Detik Finance",
    url: "https://finance.detik.com/rss",
  },
  {
    id: "antara",
    label: "Antara",
    url: "https://www.antaranews.com/rss/ekonomi",
  },
];

type RssItem = {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  enclosure?: { link?: string } | null;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFeed(feed: FeedSource): Promise<NewsItem[]> {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    feed.url,
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Gagal fetch RSS ${feed.label}`);
  }

  const json = await res.json();
  if (json.status !== "ok") {
    throw new Error(`RSS ${feed.label} tidak valid`);
  }

  return (json.items || []).map((item: RssItem) => ({
    id: item.link ?? item.title ?? "",
    title: stripHtml(item.title || ""),
    description: stripHtml(item.description || ""),
    link: item.link ?? "#",
    source: feed.label,
    pubDate: item.pubDate ?? "",
    image: item.thumbnail || item.enclosure?.link || null,
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force");

  const { ok, retryAfter } = await rateLimit(req, {
    limit: 30,
    windowSec: 60,
    prefix: "rl:news",
  });
  if (!ok) {
    return rateLimitedResponse(retryAfter);
  }

  const cached = await redis.get("newsItems");
  if (cached && force !== "1") {
    return NextResponse.json(cached);
  }

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const allItems = results
    .filter(
      (result): result is PromiseFulfilledResult<NewsItem[]> =>
        result.status === "fulfilled",
    )
    .flatMap((result) => result.value);

  // Urutkan dari yang terbaru, lalu dedupe berdasarkan link.
  const seen = new Set<string>();
  const items = allItems
    .filter((item) => item.title && item.link && item.link !== "#")
    .sort(
      (a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    )
    .filter((item) => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

  const payload = { items: items.slice(0, 6) };
  await redis.set("newsItems", payload, { exSeconds: 300 });
  return NextResponse.json(payload);
}
