"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  LockKeyhole,
  Shield,
  Eye,
  KeyRound,
  ShieldCheck,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { MoonStar, SunMedium } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const securityPoints = [
  {
    icon: Shield,
    title: "Aman & terenkripsi",
    desc: "Login menggunakan OAuth 2.0 Google — password Google-mu tidak pernah dibaca atau disimpan oleh iStock.",
  },
  {
    icon: Eye,
    title: "Data minimal",
    desc: "Kami hanya membaca nama, email, dan foto profil. Tidak ada akses ke email, drive, atau data pribadi lainnya.",
  },
  {
    icon: KeyRound,
    title: "Sesi JWT",
    desc: "Setelah login, sesi diamankan dengan token JWT yang terenkripsi. Tidak ada data sensitif yang dikirim ulang.",
  },
];

const features = [
  "Preset tersimpan per user login",
  "Watchlist pribadi terpisah dari guest",
  "Siap untuk integrasi sinyal dan jurnal trade",
];

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function SettingsPage() {
  const { status, data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const initials = getInitials(user?.name);

  return (
    <section className="space-y-6">
      {/* Profil */}
      {isAuthenticated ? (
        <div className="flex flex-col items-center gap-2 pt-4">
          {user?.image ? (
            <img
              src={user.image}
              alt={user?.name ?? "Profile"}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--accent) text-xl font-bold text-white">
              {initials}
            </div>
          )}
          <h1 className="mt-1 text-xl font-semibold">{user?.name ?? "User"}</h1>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
      ) : (
        <div className="space-y-6 pt-4">
          <Card className="border-(--border) bg-(--surface)">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Login dengan Google</CardTitle>
                  <CardDescription>
                    Gunakan akun Google-mu untuk masuk — cepat, aman, tanpa
                    perlu daftar akun baru.
                  </CardDescription>
                </div>
                <LockKeyhole className="h-5 w-5 shrink-0 text-(--accent)" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Button
                className="w-full gap-3 py-2.5"
                onClick={() => signIn("google", { callbackUrl: "/settings" })}
              >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                <span>Login dengan Google</span>
              </Button>
              <div className="border-t border-(--border) pt-4">
                <p className="text-center text-xs text-muted">
                  Dengan login, kamu menyetujui data dasar (nama &amp; email)
                  digunakan untuk mengelola akun iStock-mu.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {securityPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-(--accent)" />
                    <div>
                      <p className="font-medium text-foreground">
                        {point.title}
                      </p>
                      <p className="mt-1 text-muted">{point.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {features.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-(--accent)" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tampilan */}
      <Card className="border-(--border) bg-(--surface)">
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Atur tema tampilan aplikasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface-strong) p-4">
            <div>
              <p className="text-sm font-semibold">Tema</p>
              <p className="text-xs text-muted">
                {theme === "dark" ? "Mode gelap" : "Mode terang"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) transition hover:bg-(--surface-strong)"
            >
              {theme === "dark" ? (
                <SunMedium className="h-4 w-4" />
              ) : (
                <MoonStar className="h-4 w-4" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Lainnya */}
      <Card className="border-(--border) bg-(--surface)">
        <CardHeader>
          <CardTitle>Lainnya</CardTitle>
          <CardDescription>Informasi platform dan legal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href="/syarat-ketentuan"
            className="focus-ring flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm transition hover:bg-(--surface)"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-(--accent)" />
              <span className="font-medium">Syarat dan Ketentuan</span>
            </div>
            <ExternalLink className="h-4 w-4 text-muted" />
          </Link>
          <Link
            href="/kebijakan-privasi"
            className="focus-ring flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm transition hover:bg-(--surface)"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-(--accent)" />
              <span className="font-medium">Kebijakan Privasi</span>
            </div>
            <ExternalLink className="h-4 w-4 text-muted" />
          </Link>
        </CardContent>
      </Card>

      {isAuthenticated && (
        <div className="flex justify-center pb-8">
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/settings" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </section>
  );
}
