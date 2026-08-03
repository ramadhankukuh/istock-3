import type { IndexSummaryPayload } from "@/features/explore/services/index-summary.service";

export async function fetchIndexSummaryApi(signal?: AbortSignal) {
  const res = await fetch("/api/index-summary", { signal, cache: "no-store" });

  if (!res.ok) {
    throw new Error("Gagal mengambil index summary IDX.");
  }

  const data = (await res.json()) as IndexSummaryPayload;
  return data;
}
