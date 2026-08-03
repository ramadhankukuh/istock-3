import type { ExploreCategory } from "@/features/explore/types";

export async function fetchExploreApi(signal?: AbortSignal) {
  const res = await fetch("/api/explore", { signal, cache: "no-store" });

  if (!res.ok) {
    throw new Error("Gagal mengambil data market realtime.");
  }

  const data = (await res.json()) as ExploreCategory[];
  return data;
}
