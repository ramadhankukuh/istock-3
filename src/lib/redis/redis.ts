import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Wrapper tipis di atas SDK resmi @upstash/redis.
 *
 * Sengaja TANPA fallback ke memory/Map: kalau env Upstash kosong,
 * SDK akan melempar error yang jelas supaya akar masalahnya kelihatan
 * di log (mis. Vercel), bukan diam-diam "sukses" padahal tidak pernah
 * ke-write ke Redis.
 */
export const redis = new Redis({
  url: env.upstashRedisRestUrl,
  token: env.upstashRedisRestToken,
});
