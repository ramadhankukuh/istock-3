"use client";

import { useState } from "react";
import Image from "next/image";
import { TabBar } from "@/components/ui/tab-bar";
import { useUmaSuspend } from "@/features/explore/hooks/use-uma-suspend";
import SectionHeading from "@/features/explore/components/section-heading";
import type { UmaItem, SuspendItem } from "@/features/explore/types";

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

type BoardItem = UmaItem | SuspendItem;

function UmaRow({ item }: { item: BoardItem }) {
  const company = cleanCompanyName(item.judul);
  const tanggal = formatDate(item.tanggal);
  const fileUrl = item.file;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <StockLogo stockCode={item.kode} stockName={company} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.kode}</p>
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
}

const ROW_LIMIT = 5;

function UmaColumnSkeleton() {
  return (
    <div className="divide-y divide-(--border) overflow-hidden rounded-2xl border border-(--border)">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`column-skeleton-${i}`}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-(--surface)" />
            <div className="space-y-1.5">
              <div className="h-3 w-14 animate-pulse rounded bg-(--surface)" />
              <div className="h-3 w-24 animate-pulse rounded bg-(--surface)" />
            </div>
          </div>
          <div className="h-3 w-16 animate-pulse rounded bg-(--surface)" />
        </div>
      ))}
    </div>
  );
}

function UmaColumn({
  title,
  items,
  isLoading,
  error,
}: {
  title: string;
  items: BoardItem[];
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <section className="min-w-0 space-y-2">
      <h3 className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h3>

      {isLoading ? (
        <UmaColumnSkeleton />
      ) : error ? (
        <div className="flex items-center justify-center rounded-2xl border border-(--border) px-4 py-12 text-sm text-red-500">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-(--border) py-12 text-sm text-muted">
          Belum ada data.
        </div>
      ) : (
        <div className="divide-y divide-(--border) overflow-hidden rounded-2xl border border-(--border)">
          {items.slice(0, ROW_LIMIT).map((item, i) => (
            <UmaRow key={`${item.kode}-${i}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function UmaSuspendBoard() {
  const {
    activeTab,
    setActiveTab,
    items,
    tabs,
    umaItems,
    suspendItems,
    isLoading,
    error,
  } = useUmaSuspend();

  const suspend = suspendItems.filter(
    (x) => x.tipe?.toLowerCase() === "suspend",
  );
  const unsuspend = suspendItems.filter(
    (x) => x.tipe?.toLowerCase() === "unsuspend",
  );

  return (
    <div className="space-y-3">
      {/* Judul */}
      <SectionHeading title="Papan Khusus" showInfo={false} />

      {/* Mobile: tab bar + daftar tab aktif */}
      <div className="space-y-3 lg:hidden">
        <TabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

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
          <p className="px-4 pt-2 text-sm text-red-500">{error}</p>
        ) : items.length === 0 ? (
          <p className="px-4 pt-2 text-sm text-muted">Belum ada data.</p>
        ) : (
          <div className="divide-y divide-(--border)">
            {items.slice(0, ROW_LIMIT).map((item, i) => (
              <UmaRow key={`${item.kode}-${i}`} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: 3 kolom tanpa tab — UMA | Suspend | Unsuspend */}
      <div className="hidden items-start gap-4 lg:grid lg:grid-cols-3">
        <UmaColumn
          title="UMA"
          items={umaItems}
          isLoading={isLoading}
          error={error}
        />
        <UmaColumn
          title="Suspend"
          items={suspend}
          isLoading={isLoading}
          error={error}
        />
        <UmaColumn
          title="Unsuspend"
          items={unsuspend}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
