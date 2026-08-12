import { NextResponse } from "next/server";
import { fetchAndCacheKonglo } from "@/features/konglo-tracker/services/konglo-update.service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.CRON_SECRET;

  // Fail-closed: tanpa CRON_SECRET valid selalu 401.
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    console.log("⏰ Cron triggered: /api/cron/konglo");

    await fetchAndCacheKonglo();

    return NextResponse.json({
      success: true,
      message: "Konglo data updated successfully",
      redisKey: "kongloData",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update Konglo data";
    console.error("❌ Konglo update failed:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
