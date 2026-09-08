import { NextResponse } from "next/server";

import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { redis } from "@/lib/redis/redis";

export const runtime = "nodejs";

const IDX_UMA_API = "https://www.idx.id/primary/Home/GetUmaData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resultCount = searchParams.get("resultCount") ?? "10";

    const { ok, retryAfter } = await rateLimit(req, {
      limit: 30,
      windowSec: 60,
      prefix: "rl:uma",
    });
    if (!ok) {
      return rateLimitedResponse(retryAfter);
    }

    const cacheKey = `stockInfoUma:${resultCount}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const url = `${IDX_UMA_API}?resultCount=${resultCount}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://www.idx.id/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Gagal fetch UMA IDX");
    }

    const json = await res.json();

    const items = (json.Results || []).map(
      (x: {
        UMADate?: string;
        CompanyID?: string;
        Judul?: string;
        Attachment?: string | null;
      }) => ({
        tanggal: x.UMADate,
        kode: x.CompanyID,
        judul: x.Judul,
        file: x.Attachment ? `https://www.idx.co.id${x.Attachment}` : null,
      }),
    );

    const payload = {
      total: items.length,
      items,
    };

    await redis.set(cacheKey, payload, { exSeconds: 60 });
    return NextResponse.json(payload);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
