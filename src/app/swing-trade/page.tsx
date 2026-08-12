"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SwingScreenerPage from "@/features/swing-screener/components/swing-screener-page";

export default function SwingTradePage() {
  const { data: session } = useSession();

  return (
    <section className="space-y-6">
      {/* ── Member header ── */}
      <div className="flex flex-col gap-4 rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow) sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <Badge variant="secondary">Member Area</Badge>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Halo, {session?.user?.name ?? "trader"}
            </h1>
            <p className="text-sm text-muted">
              Area eksklusif member — akses penuh Swing Trade Screener.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* ── Swing Screener (member-only) ── */}
      <SwingScreenerPage
        title="Swing Trade Screener"
        description="Screener harian semua saham IDX untuk member — MA cross, RSI, MACD, volume breakout, dan akumulasi asing."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Swing Trade" },
        ]}
      />
    </section>
  );
}
