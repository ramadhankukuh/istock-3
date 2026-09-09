import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proteksi login server-side DINONAKTIFKAN.
 *
 * File ini adalah `proxy.ts` (konvensi baru Next.js 16; pengganti
 * `middleware.ts` yang deprecated).
 *
 * FIX ERR_TOO_MANY_REDIRECTS:
 * Sebelumnya (masih bernama `middleware.ts`) file ini me-redirect SEMUA request
 * tanpa token ke /login — TANPA mengecualikan /login itu sendiri — sehingga di
 * production setiap request /login di-307 balik ke /login (GET / → 307 /login,
 * lalu GET /login → 307 /login) dan browser berhenti dengan "This page isn't
 * working / redirected you too many times" (ERR_TOO_MANY_REDIRECTS).
 *
 * Gating login di app ini murni CLIENT-SIDE per fitur (contoh: Swing Trade di
 * /explore menampilkan tombol "Login untuk akses" → /login?callbackUrl=...),
 * jadi proxy sengaja tidak melindungi route apa pun (matcher: []) dan tidak
 * boleh me-redirect ke /login secara global.
 *
 * Jika suatu saat ingin proteksi server-side:
 *   1. isi `config.matcher` dengan path yang dilindungi (mis. ["/explore/:path*"]), DAN
 *   2. selalu kecualikan /login, /api, /_next, favicon, dan aset statis
 *      (cek pathname sebelum redirect) agar loop seperti ini tidak muncul lagi.
 */
export async function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Tidak ada route yang dilindungi untuk saat ini.
  matcher: [],
};
