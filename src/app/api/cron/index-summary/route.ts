import { NextResponse } from "next/server";
import { fetchAndCacheIndexSummary } from "@/features/explore/services/index-summary.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.CRON_SECRET;

  // Fail-closed: tanpa CRON_SECRET valid selalu 401.
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchAndCacheIndexSummary();

    return NextResponse.json({
      success: true,
      message: "Index summary cache updated successfully",
      total: data.data?.length ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update index summary";
    console.error("❌ Index summary update failed:", error);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
