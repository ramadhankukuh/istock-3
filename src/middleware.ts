import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Halaman /swing-trade sudah dihapus; fitur swing trade kini ada di /explore
  // dengan gating login sendiri (client-side). Middleware tidak melindungi route
  // apapun untuk saat ini.
  matcher: [],
};
