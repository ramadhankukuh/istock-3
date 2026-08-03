"use client";

import { useState } from "react";
import Image from "next/image";
import { useUmaSuspend } from "@/features/explore/hooks/use-uma-suspend";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

function StockLogo({
  stockCode,
  stockName,
}: {
  stockCode: string;
  stockName: string;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const initials =
    stockCode.slice(0, 2).toUpperCase() || stockName.slice(0, 2).toUpperCase();

  if (logoFailed || !stockCode) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-[10px] font-semibold tracking-[0.08em] text-muted">
        {initials}
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
      <Image
        src={`https://ik.imagekit.io/kuh/istock/company/${stockCode}.png?tr=f-auto`}
        alt={`${stockName} logo`}
        width={32}
        height={32}
        className="h-full w-full rounded-full object-contain"
        loading="lazy"
        unoptimized
        onError={() => setLogoFailed(true)}
      />
    </div>
  );
}

const cleanCompanyName = (raw: string) => {
  let name = raw.replace(
    /^(UMA atas Saham|Pembukaan Kembali Perdagangan Saham|Penghentian Sementara Perdagangan Saham)\s+/i,
    "",
  );
  name = name.replace(/\s*& Waran Seri [IVX, ]+/gi, "");
  name = name.replace(/\s*\([^)]*\)\s*$/, "");
  name = name.replace(/\s+/g, " ");
  return name.trim();
};

const formatDate = (raw: string) => {
  const d = new Date(raw);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function UmaSuspendBoard() {
  const { activeTab, setActiveTab, items, tabs, isLoading, error } =
    useUmaSuspend();

  return (
    <div className="space-y-4">
      {/* Tab row — same style as summary tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            aria-pressed={tab.key === activeTab}
            className={cn(
              "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab.key === activeTab
                ? "bg-foreground text-background"
                : "bg-(--surface-strong) text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-(--border)">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 animate-pulse rounded bg-(--surface-strong)" />
                    <div className="h-3.5 w-32 animate-pulse rounded bg-(--surface-strong)" />
                  </div>
                  <div className="h-3 w-16 animate-pulse rounded bg-(--surface-strong)" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <p className="text-sm text-muted">Belum ada data.</p>
            </div>
          ) : (
            <div className="divide-y divide-(--border)">
              {items.slice(0, 5).map((item, i) => {
                const company = cleanCompanyName(
                  "judul" in item ? item.judul : "",
                );
                const tanggal = formatDate(
                  "tanggal" in item ? item.tanggal : "",
                );
                const kode = "kode" in item ? item.kode : "-";
                const fileUrl = "file" in item ? item.file : null;

                return (
                  <div
                    key={`${kode}-${i}`}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StockLogo stockCode={kode} stockName={company} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{kode}</p>
                        <p className="truncate text-xs text-muted">{company}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted">{tanggal}</span>
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-blue-500 hover:underline"
                        >
                          PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
