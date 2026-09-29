import { NextResponse } from "next/server";
import https from "node:https";

export const runtime = "nodejs";

/**
 * Proxy logo ImageKit lewat server Next.js.
 *
 * Domain `ik.imagekit.io` diblokir oleh Internet Positif (filter DNS ISP
 * Indonesia) — DNS-nya di-hijack ke `internetpositif.id`, sehingga browser
 * (dan dev server lokal) gagal memuat logo.
 *
 * Strategi:
 *  1. Coba fetch normal (berhasil di server Vercel yang DNS-nya bersih).
 *  2. Bila gagal (mis. dev lokal di jaringan terblokir), resolve IP asli via
 *     DNS-over-HTTPS lalu sambung langsung ke IP tersebut dengan SNI + Host
 *     tetap `ik.imagekit.io`.
 *
 * Contoh: /api/logo?path=company/BBCA.png
 *         /api/logo?path=indeks/IHSG.png
 */
const IMAGEKIT_HOST = "ik.imagekit.io";
const IMAGEKIT_BASE = `https://${IMAGEKIT_HOST}/kuh/istock`;

/** Hanya izinkan folder & nama file yang aman (cegah SSRF). */
const ALLOWED_PATH = /^(company|indeks)\/[A-Za-z0-9._-]+\.png$/;

const DOH_PROVIDERS = [
  "https://1.1.1.1/dns-query",
  "https://8.8.8.8/resolve",
];

const CACHE_HEADERS = {
  "Cache-Control":
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
};

/** Resolve IPv4 asli sebuah hostname via DNS-over-HTTPS. */
async function resolveViaDoh(hostname: string): Promise<string | null> {
  for (const provider of DOH_PROVIDERS) {
    try {
      const res = await fetch(
        `${provider}?name=${encodeURIComponent(hostname)}&type=A`,
        {
          headers: { accept: "application/dns-json" },
          cache: "no-store",
        },
      );

      if (!res.ok) continue;

      const json = (await res.json()) as {
        Answer?: Array<{ type: number; data: string }>;
      };

      const record = json.Answer?.find((entry) => entry.type === 1);
      if (record?.data) return record.data;
    } catch {
      // coba provider berikutnya
    }
  }

  return null;
}

/** Ambil gambar langsung dari IP (SNI & Host tetap hostname asli). */
function fetchViaIp(
  url: string,
  ip: string,
): Promise<{ status: number; contentType: string; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);

    const req = https.request(
      {
        host: ip,
        servername: parsed.hostname,
        path: `${parsed.pathname}${parsed.search}`,
        method: "GET",
        headers: {
          Host: parsed.hostname,
          Accept: "image/*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk as Buffer));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 500,
            contentType: String(res.headers["content-type"] ?? "image/png"),
            body: Buffer.concat(chunks),
          }),
        );
      },
    );

    req.on("error", reject);
    req.end();
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") ?? "";

  if (!ALLOWED_PATH.test(path)) {
    return new NextResponse("Invalid logo path", { status: 400 });
  }

  const target = `${IMAGEKIT_BASE}/${path}?tr=f-auto`;

  // 1) Fetch normal (Vercel / jaringan bersih).
  try {
    const res = await fetch(target, {
      headers: {
        Accept: "image/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": res.headers.get("content-type") ?? "image/png",
          ...CACHE_HEADERS,
        },
      });
    }
  } catch {
    // lanjut ke fallback DoH
  }

  // 2) Fallback: resolve IP asli via DoH lalu sambung langsung.
  try {
    const ip = await resolveViaDoh(IMAGEKIT_HOST);

    if (ip) {
      const result = await fetchViaIp(target, ip);

      if (result.status >= 200 && result.status < 300) {
        return new NextResponse(new Uint8Array(result.body), {
          status: 200,
          headers: {
            "Content-Type": result.contentType,
            ...CACHE_HEADERS,
          },
        });
      }

      return new NextResponse("Logo not found", { status: result.status });
    }
  } catch {
    // jatuh ke error di bawah
  }

  return new NextResponse("Failed to fetch logo", { status: 502 });
}
