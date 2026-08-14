import { NextResponse } from "next/server";
import { fetchUmaData } from "@/features/explore/services/idx-announcements.service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resultCount = searchParams.get("resultCount") ?? "10";

    const payload = await fetchUmaData(resultCount);
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
