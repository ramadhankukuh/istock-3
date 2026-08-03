"use client";

import { signOut, useSession } from "next-auth/react";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SwingTradePage() {
  const { data: session } = useSession();

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow) sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="secondary">Swing Trade</Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Ruang swing trader yang dipisah dari guest.
              </h1>
              <p className="max-w-2xl text-sm text-muted sm:text-base">
                Login Google dipakai sebagai pemisah akses. Setelah masuk, area
                ini bisa dipakai untuk preset pribadi, catatan trade, dan fitur
                future yang butuh identitas user.
              </p>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-(--border) bg-(--surface-strong) p-4 shadow-(--shadow-soft)">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Mode akses</p>
                <p className="text-sm text-muted">Member login</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-(--border) bg-(--surface)">
          <CardHeader>
            <CardTitle>
              Selamat datang, {session?.user?.name ?? "trader"}
            </CardTitle>
            <CardDescription>
              Area ini nanti dipakai untuk journaling, setup checklist, dan
              watchlist privat.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              ["Setup", "0 active"],
              ["Watchlist pribadi", "Ready"],
              ["Guest separation", "On"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-(--border) bg-(--surface-strong) p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  {label}
                </p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-(--border) bg-(--surface)">
          <CardHeader>
            <CardTitle>Security layer</CardTitle>
            <CardDescription>
              Login dipakai sebagai gate untuk fitur yang butuh user identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Google auth", "JWT session", "Guest access terpisah"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-strong) p-3 text-sm"
                >
                  <ShieldCheck className="h-4 w-4 text-(--accent)" />
                  <span>{item}</span>
                </div>
              ),
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
