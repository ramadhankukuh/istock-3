import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const feeds = [
  { url: "https://rss.tempo.co/bisnis", source: "Tempo" },
  { url: "https://www.cnnindonesia.com/ekonomi/rss", source: "CNN Indonesia" },
  { url: "https://www.cnbcindonesia.com/market/rss", source: "CNBC Indonesia" },
  { url: "https://finance.detik.com/rss", source: "Detik Finance" },
  { url: "https://www.antaranews.com/rss/ekonomi.xml", source: "Antara News" },
  { url: "https://sindikasi.okezone.com/index.php/rss/11/RSS2.0", source: "Okezone" },
];

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  imageUrl?: string;
};

function parseImageFromDescription(desc: string): string | undefined {
  const match = desc.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : undefined;
}

async function fetchFeed(url: string, source: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error(`Feed status ${res.status}`);
    }

    const data = (await res.json()) as { items?: Array<Record<string, unknown>> };
    const items = Array.isArray(data.items) ? data.items : [];

    return items.slice(0, 6).map((item) => {
      const title = String(item.title ?? "");
      const link = String(item.link ?? "");
      const pubDate = String(item.pubDate ?? "");
      const description = String(item.description ?? "");
      const enclosure = item.enclosure as
        | { link?: string }
        | string
        | undefined;
      const enclosureLink =
        enclosure && typeof enclosure === "object" ? enclosure.link : undefined;

      return {
        title,
        link,
        pubDate,
        description,
        source,
        imageUrl: enclosureLink || parseImageFromDescription(description),
      };
    });
  } catch (e) {
    console.error("Feed error:", url, e);
    return [];
  }
}

export async function GET() {
  try {
    const allItems = await Promise.all(
      feeds.map((feed) => fetchFeed(feed.url, feed.source)),
    );

    const allNews = allItems
      .flat()
      .sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      );

    return NextResponse.json(allNews.slice(0, 6), {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Error fetching news:", err);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}
