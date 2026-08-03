import type { ExploreCategory } from "@/features/explore/types";
import { fetchExploreApi } from "@/features/explore/services/explore-api";

export async function getExploreCategories(
  signal?: AbortSignal,
): Promise<ExploreCategory[]> {
  return await fetchExploreApi(signal);
}
