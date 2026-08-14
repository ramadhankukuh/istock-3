// app/api/stock/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchStockData } from "@/features/stock-analysis/services/stock-data.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code") ?? "";

    const data = await fetchStockData(rawCode);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
