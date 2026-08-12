import { redis } from "@/lib/redis/redis";
import type {
  SwingScreenerPayload,
  SwingScreenerResult,
  SwingScreenerSummary,
} from "../types";

/**
 * Baca/tulis hasil screening di Upstash Redis.
 * Path user hanya memakai readScreenerCache — tanpa fetch/compute.
 */

const LATEST_KEY = "screener:swing:latest";

/** Safety net: kalau cron gagal jalan, data tetap ada 3 hari. */
const TTL_SECONDS = 3 * 24 * 60 * 60;

export async function writeScreenerCache(
  results: SwingScreenerResult[],
  summary: SwingScreenerSummary,
): Promise<void> {
  const updatedAt = new Date().toISOString();

  const payload: SwingScreenerPayload = {
    available: true,
    updatedAt,
    results,
    summary,
  };

  // Satu key berisi payload lengkap (termasuk updatedAt).
  await redis.set(LATEST_KEY, payload, { ex: TTL_SECONDS });

  console.log(
    `✅ [swing-screener] Redis cache written: ${LATEST_KEY} (${results.length} results, TTL ${TTL_SECONDS}s)`,
  );
}

export async function readScreenerCache(): Promise<SwingScreenerPayload | null> {
  // Satu round-trip: updatedAt diambil langsung dari payload LATEST_KEY.
  const latest = await redis.get<SwingScreenerPayload>(LATEST_KEY);

  if (!latest) {
    return null;
  }

  return {
    available: true,
    updatedAt: latest.updatedAt ?? null,
    results: Array.isArray(latest.results) ? latest.results : [],
    summary: latest.summary ?? null,
  };
}
