import { NextResponse } from "next/server";

import {
  getNetForeignFromCache,
  updateNetForeignCache,
} from "@/features/foreign-flow/services/net-foreign.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force");

    if (force === "1") {
      const refreshed = await updateNetForeignCache(30);
      return NextResponse.json(refreshed);
    }

    const cached = await getNetForeignFromCache();

    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await updateNetForeignCache(30);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch net foreign data" },
      { status: 500 },
    );
  }
}
