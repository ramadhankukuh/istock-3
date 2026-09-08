import { NextResponse } from "next/server";

import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { redis } from "@/lib/redis/redis";

export const runtime = "nodejs";

const IDX_SUSPEND_API = "https://www.idx.id/primary/Home/GetSuspendData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resultCount = searchParams.get("resultCount") ?? "20";
    const type = searchParams.get("type"); // Suspend | Unsuspend | null

    const { ok, retryAfter } = await rateLimit(req, {
      limit: 30,
      windowSec: 60,
      prefix: "rl:suspend",
    });
    if (!ok) {
      return rateLimitedResponse(retryAfter);
    }

    const cacheKey = `stockInfoSuspend:${resultCount}:${type ?? "all"}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const url = `${IDX_SUSPEND_API}?resultCount=${resultCount}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://www.idx.id/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Gagal fetch Suspend IDX");
    }

    const json = await res.json();

    let items = (json.Results || []).map(
      (x: {
        Date?: string;
        Kode?: string;
        Judul?: string;
        Info_Type?: string;
        Data_Download?: string | null;
      }) => ({
        tanggal: x.Date,
        kode: x.Kode,
        judul: x.Judul,
        tipe: x.Info_Type, // Suspend | Unsuspend
        file: x.Data_Download ? `https://www.idx.co.id${x.Data_Download}` : null,
      }),
    );

    if (type) {
      items = items.filter(
        (x: { tipe?: string }) => x.tipe?.toLowerCase() === type.toLowerCase(),
      );
    }

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
