"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowRightLeft,
  Eye,
  Building2,
  TrendingUp,
  Package,
  Calculator,
  Wallet,
  Scale,
  LineChart,
  ShieldAlert,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tools } from "@/features/tools/data";
import { cn } from "@/lib/utils/cn";

/* ── Icon lookup ── */
const iconMap: Record<string, LucideIcon> = {
  "stock-analysis": BarChart3,
  "foreign-flow": ArrowRightLeft,
  "uw-tracker": Eye,
  "konglo-tracker": Building2,
  "ara-arb-calculator": TrendingUp,
  "ipo-allotment-predictor": Package,
  "stock-average-calculator": Calculator,
  "dividend-calculator": Wallet,
  "right-issue-calculator": Scale,
  "fibonacci-retracement-calculator": LineChart,
  "value-at-risk-calculator": ShieldAlert,
  "dca-calculator": PiggyBank,
};

const categories = [
  "Semua",
  ...Array.from(new Set(tools.map((t) => t.category).filter(Boolean))),
] as string[];

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredTools = useMemo(
    () =>
      activeCategory === "Semua"
        ? tools
        : tools.filter((t) => t.category === activeCategory),
    [activeCategory],
  );

  return (
    <section className="space-y-6">
      {/* ── Hero ── */}
      <div className="rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow) sm:p-8">
        <Badge variant="secondary">All Tools</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Tools Saham untuk Analisis & Kalkulasi
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Kumpulan tools analisis saham, kalkulator investasi, dan pelacak data
          pasar dalam satu tempat.
        </p>
      </div>

      {/* ── Category pills ── */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              activeCategory === cat
                ? "bg-foreground text-background"
                : "border border-(--border) bg-(--surface-strong) text-muted hover:text-foreground",
            )}
          >
            {cat}
            {cat !== "Semua" && (
              <span className="ml-1.5 text-xs opacity-60">
                {tools.filter((t) => t.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Card grid ── */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredTools.map((tool) => {
          const Icon = iconMap[tool.slug] ?? BarChart3;

          return (
            <div
              key={tool.slug}
              className="flex flex-col rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-(--shadow-soft) backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow)"
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--surface-strong) text-(--accent)">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="truncate text-[15px] font-semibold leading-tight">
                  {tool.title}
                </h3>
              </div>

              {/* Description */}
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
                {tool.description}
              </p>

              {/* Spacer + Button */}
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="inline-flex items-center rounded-full border border-(--border) px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {tool.category ?? "Tool"}
                </span>
                <Link href={`/tools/${tool.slug}`}>
                  <Button variant="outline" className="h-8 px-3.5 text-xs">
                    Buka
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
