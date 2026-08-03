import { NextResponse } from "next/server";

export const runtime = "nodejs";

const IDX_SUSPEND_API = "https://www.idx.co.id/primary/Home/GetSuspendData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resultCount = searchParams.get("resultCount") ?? "20";
    const type = searchParams.get("type"); // Suspend | Unsuspend | null

    const url = `${IDX_SUSPEND_API}?resultCount=${resultCount}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://www.idx.co.id/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Gagal fetch Suspend IDX");
    }

    const json = await res.json();

    let items = (json.Results || []).map((x: any) => ({
      tanggal: x.Date,
      kode: x.Kode,
      judul: x.Judul,
      tipe: x.Info_Type, // Suspend | Unsuspend
      file: x.Data_Download ? `https://www.idx.co.id${x.Data_Download}` : null,
    }));

    if (type) {
      items = items.filter(
        (x: any) => x.tipe?.toLowerCase() === type.toLowerCase(),
      );
    }

    return NextResponse.json({
      total: items.length,
      items,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
