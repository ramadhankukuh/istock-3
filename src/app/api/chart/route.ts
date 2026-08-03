import { NextRequest, NextResponse } from "next/server";
import { fetchChartData } from "@/features/chart/services/chart-data.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") ?? "BBRI";

    if (!symbol.trim()) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 },
      );
    }

    const data = await fetchChartData(symbol);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch chart data:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch chart data" },
      { status: 500 },
    );
  }
}
