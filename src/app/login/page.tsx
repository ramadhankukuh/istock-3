"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  LockKeyhole,
  ShieldCheck,
  Shield,
  Eye,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";

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

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/explore";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  if (status === "authenticated") {
    return null;
  }

  return (
    <section className="flex items-start justify-center min-h-[calc(100vh-12rem)] py-12 sm:py-16 lg:py-24">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl space-y-8 px-4">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-(--border) bg-(--surface-strong) shadow-(--shadow-soft)">
            <BarChart3 className="h-7 w-7 text-(--accent)" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Masuk ke iStock
          </h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Login untuk mengakses fitur eksklusif seperti Swing Trade, watchlist
            pribadi, dan preset tersimpan.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-[1.3fr_1fr]">
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
  className="w-full gap-3 py-3" 
  onClick={() => signIn("google", { callbackUrl })}
>
  <GoogleIcon className="h-5 w-5 shrink-0" />
</Button>

              <div className="border-t border-(--border) pt-4">
                <p className="text-xs text-muted text-center">
                  Dengan login, kamu menyetujui data dasar (nama &amp; email)
                  digunakan untuk mengelola akun iStock-mu.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 md:space-y-4">
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
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {features.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm flex items-center gap-3"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-(--accent)" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
