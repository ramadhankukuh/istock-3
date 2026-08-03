import { getExploreCategories } from "@/features/explore/services/explore-data.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getExploreCategories();
    return Response.json(categories);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch explore data" },
      { status: 500 },
    );
  }
}
