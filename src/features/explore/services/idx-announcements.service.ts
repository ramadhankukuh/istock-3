import "server-only";

import type {
  UmaPayload,
  SuspendPayload,
} from "@/features/explore/types";

const IDX_BASE_URL = "https://www.idx.co.id/primary";
const IDX_HEADERS = {
  Accept: "application/json",
  Referer: "https://www.idx.co.id/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
};

async function fetchIdxResults(
  path: string,
  params: Record<string, string>,
): Promise<any[]> {
  const url = new URL(`${IDX_BASE_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: IDX_HEADERS,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Gagal fetch ${path} IDX`);
  }

  const json = await res.json();
  return Array.isArray(json.Results) ? json.Results : [];
}

// =========================
// UMA (Unusual Market Activity)
// =========================

export async function fetchUmaData(resultCount = "10"): Promise<UmaPayload> {
  const results = await fetchIdxResults("Home/GetUmaData", { resultCount });

  const items = results.map((x: any) => ({
    tanggal: x.UMADate,
    kode: x.CompanyID,
    judul: x.Judul,
    file: x.Attachment ? `https://www.idx.co.id${x.Attachment}` : null,
  }));

  return { total: items.length, items };
}

// =========================
// SUSPEND / UNSUSPEND
// =========================

export async function fetchSuspendData(
  resultCount = "20",
  type?: string, // "Suspend" | "Unsuspend" | undefined
): Promise<SuspendPayload> {
  const results = await fetchIdxResults("Home/GetSuspendData", {
    resultCount,
  });

  let items = results.map((x: any) => ({
    tanggal: x.Date,
    kode: x.Kode,
    judul: x.Judul,
    tipe: x.Info_Type, // Suspend | Unsuspend
    file: x.Data_Download ? `https://www.idx.co.id${x.Data_Download}` : null,
  }));

  if (type) {
    items = items.filter(
      (x) => x.tipe?.toLowerCase() === type.toLowerCase(),
    );
  }

  return { total: items.length, items };
}
