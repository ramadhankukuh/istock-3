import { NextResponse } from "next/server";

import { expire, incr } from "@/lib/redis/redis";

/**
 * IP asli di belakang proxy/Vercel ada di header x-forwarded-for
 * (ambil nilai pertama; nilai berikutnya adalah hop proxy).
 */
export function getClientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
}

type RateLimitOptions = {
  /** jumlah request maksimal per window */
  limit?: number;
  /** panjang window dalam detik */
  windowSec?: number;
  /** prefix key redis, biar tiap route punya budget sendiri */
  prefix?: string;
};

export type RateLimitResult = { ok: boolean; retryAfter: number };

/**
 * Fixed-window rate limiter berbasis Redis INCR + EXPIRE.
 * Melindungi route yang memanggil external API (Yahoo/IDX/rss2json)
 * dari refresh iseng / abuse. Kalau Redis tidak tersedia, fallback ke
 * in-memory counter (cukup untuk mencegah spam ringan).
 */
export async function rateLimit(
  req: Request,
  { limit = 30, windowSec = 60, prefix = "rl" }: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const ip = getClientIp(req);
  const window = Math.floor(Date.now() / 1000 / windowSec);
  const key = `${prefix}:${ip}:${window}`;

  const count = await incr(key);

  // Set expiry di hit pertama agar key tidak menumpuk.
  if (count === 1) {
    await expire(key, windowSec + 1);
  }

  if (count > limit) {
    const retryAfter =
      (window + 1) * windowSec - Math.floor(Date.now() / 1000);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }

  return { ok: true, retryAfter: 0 };
}

export function rateLimitedResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Terlalu banyak request. Coba lagi beberapa saat lagi." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}