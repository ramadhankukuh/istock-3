"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

type Breadcrumb = {
  label: string;
  href?: string;
  isHome?: boolean;
};

type ToolHeaderCardProps = {
  title: string;
  description: string;
  breadcrumbs?: Breadcrumb[];
  tags?: ("Popular" | "IPO" | "Kalkulator" | "Analisis")[];
};

const tagStyle: Record<string, string> = {
  Popular: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  IPO: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Kalkulator:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Analisis:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
};

export default function ToolHeaderCard({
  title,
  description,
  breadcrumbs = [],
  tags = [],
}: ToolHeaderCardProps) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) backdrop-blur-md">
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center gap-2 text-sm text-muted">
        {breadcrumbs.map((bc, i) => (
          <div key={i} className="flex items-center gap-2">
            {bc.href ? (
              <Link
                href={bc.href}
                className="flex items-center gap-1 transition hover:text-(--accent)"
              >
                {bc.isHome ? <Home size={14} /> : bc.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{bc.label}</span>
            )}
            {i < breadcrumbs.length - 1 && (
              <ChevronRight size={14} className="text-muted" />
            )}
          </div>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>

      {/* Description */}
      <p className="mt-1 text-sm text-muted">{description}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${tagStyle[tag]}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
