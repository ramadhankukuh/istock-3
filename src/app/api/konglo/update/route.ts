import { NextResponse } from "next/server";
import { fetchAndCacheKonglo } from "@/features/konglo-tracker/services/konglo-update.service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.CRON_SECRET;

  if (token && authHeader !== `Bearer ${token}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    console.log("⏰ Cron triggered: /api/konglo/update");

    await fetchAndCacheKonglo();

    return NextResponse.json({
      success: true,
      message: "Konglo data updated successfully",
      redisKey: "kongloData",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ Konglo update failed:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}
