import { NextResponse } from "next/server";

export const runtime = "nodejs";

const IDX_UMA_API = "https://www.idx.co.id/primary/Home/GetUmaData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resultCount = searchParams.get("resultCount") ?? "10";

    const url = `${IDX_UMA_API}?resultCount=${resultCount}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://www.idx.co.id/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Gagal fetch UMA IDX");
    }

    const json = await res.json();

    const items = (json.Results || []).map(
      (x: {
        UMADate?: string;
        CompanyID?: string;
        Judul?: string;
        Attachment?: string | null;
      }) => ({
        tanggal: x.UMADate,
        kode: x.CompanyID,
        judul: x.Judul,
        file: x.Attachment ? `https://www.idx.co.id${x.Attachment}` : null,
      }),
    );

    return NextResponse.json({
      total: items.length,
      items,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
