import { NextResponse } from "next/server";
import { updateIPOData } from "@/features/ipo-performance/services/ipo-update.service";

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
    const data = await updateIPOData();

    return NextResponse.json({
      success: true,
      message: "IPO performance cache updated successfully",
      total: data.totalIPO,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update IPO performance data";
    console.error("❌ IPO performance update failed:", error);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
