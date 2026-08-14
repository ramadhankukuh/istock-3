import { NextResponse } from "next/server";
import { fetchSuspendData } from "@/features/explore/services/idx-announcements.service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resultCount = searchParams.get("resultCount") ?? "20";
    const type = searchParams.get("type") ?? undefined; // Suspend | Unsuspend

    const payload = await fetchSuspendData(resultCount, type);
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
