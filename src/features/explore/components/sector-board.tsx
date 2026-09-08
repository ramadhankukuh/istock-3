"use client";

import { useMemo, useState } from "react";
import { TabBar } from "@/components/ui/tab-bar";
import { cn } from "@/lib/utils/cn";
import { formatCompactRupiah } from "@/lib/utils/format";
import type { IndexSummaryPayload } from "@/features/explore/services/index-summary.service";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

const SECTOR_LABELS: Record<string, string> = {
  IDXENERGY: "Energy",
  IDXBASIC: "Basic Materials",
  IDXINDUST: "Industrial",
  IDXNONCYC: "Non-Cyclicals",
  IDXCYCLIC: "Cyclicals",
  IDXHEALTH: "Healthcare",
  IDXFINANCE: "Financials",
  IDXPROPERT: "Property",
  IDXTECHNO: "Technology",
  IDXINFRA: "Infrastructures",
  IDXTRANS: "Transportation",
};

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")} %`;
}

function getChangePct(previous: number, close: number) {
  return previous > 0 ? ((close - previous) / previous) * 100 : 0;
}

function getDisplayName(code: string, rawName: string) {
  return SECTOR_LABELS[code] || rawName.replace(/^Indeks\s*/i, "") || code;
}

type SummaryRow = {
  code: string;
  name: string;
  changePct: number;
  value: number;
  marketCap: number;
};

const ROW_LIMIT = 10;

function SummaryTable({ rows }: { rows: SummaryRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--border)">
      <div className="max-h-[34rem] overflow-auto">
        <table className="w-max min-w-[560px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 border-b border-(--border) bg-(--background)">
            <tr>
              <th className="py-3 pl-4 pr-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Nama
              </th>
              <th className="w-[120px] px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Chg
              </th>
              <th className="w-[130px] px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Val
              </th>
              <th className="w-[130px] py-3 pl-3 pr-4 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Cap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {rows.map((row) => {
              const isUp = row.changePct > 0;
              const isDown = row.changePct < 0;
              const ChangeIcon = isUp
                ? ArrowUpRight
                : isDown
                  ? ArrowDownRight
                  : Minus;

              return (
                <tr
                  key={row.code}
                  className="transition-colors hover:bg-(--surface)"
                >
                  <td className="py-3.5 pl-4 pr-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold leading-tight text-foreground">
                        {row.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <span
                      className={cn(
                        "inline-flex min-w-20 items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums tracking-tight",
                        isUp &&
                          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                        isDown && "bg-red-500/15 text-red-600 dark:text-red-400",
                        !isUp && !isDown && "bg-(--surface) text-muted",
                      )}
                    >
                      <ChangeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {formatPercent(row.changePct)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right font-medium tabular-nums text-foreground">
                    {formatCompactRupiah(row.value)}
                  </td>
                  <td className="py-3.5 pl-3 pr-4 text-right font-medium tabular-nums text-foreground">
                    {formatCompactRupiah(row.marketCap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > ROW_LIMIT ? (
        <div className="border-t border-(--border) px-4 py-2 text-center text-[11px] text-muted">
          Scroll untuk melihat lainnya
        </div>
      ) : null}
    </div>
  );
}

function SplitColumn({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <section className="min-w-0 space-y-2">
      <h3 className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h3>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-(--border) py-12 text-sm text-muted">
          Belum ada data.
        </div>
      ) : (
        <SummaryTable rows={rows} />
      )}
    </section>
  );
}

export default function SectorBoard({
  indexSummary,
}: {
  indexSummary: IndexSummaryPayload | null;
}) {
  const [activeTab, setActiveTab] = useState<"sector" | "index">("sector");
  const rawSectors = indexSummary?.sector ?? [];
  const rawIndices = indexSummary?.index ?? [];

  const sortedSectors = useMemo(
    () =>
      [...rawSectors]
        .map((sector) => {
          const code = String(sector.IndexCode ?? "").toUpperCase();
          const rawName = String(sector.IndexName ?? "");
          const previous = Number(sector.Previous ?? 0);
          const close = Number(sector.Close ?? 0);

          return {
            code,
            name: getDisplayName(code, rawName),
            changePct: getChangePct(previous, close),
            value: Number(sector.Value ?? 0),
            marketCap: Number(sector.MarketCapital ?? 0),
          } satisfies SummaryRow;
        })
        .sort((a, b) => b.changePct - a.changePct),
    [rawSectors],
  );

  const sortedIndices = useMemo(
    () =>
      [...rawIndices]
        .map((index) => {
          const code = String(index.IndexCode ?? "").toUpperCase();
          const rawName = String(index.IndexName ?? "");
          const previous = Number(index.Previous ?? 0);
          const close = Number(index.Close ?? 0);

          return {
            code,
            name: rawName.replace(/^Indeks\s*/i, "") || code,
            changePct: getChangePct(previous, close),
            value: Number(index.Value ?? 0),
            marketCap: Number(index.MarketCapital ?? 0),
          } satisfies SummaryRow;
        })
        .sort((a, b) => b.changePct - a.changePct),
    [rawIndices],
  );

  if (sortedSectors.length === 0 && sortedIndices.length === 0) return null;

  const resolvedTab: "sector" | "index" =
    activeTab === "index" && sortedIndices.length === 0
      ? "sector"
      : activeTab === "sector" && sortedSectors.length === 0
        ? "index"
        : activeTab;

  const rows = resolvedTab === "sector" ? sortedSectors : sortedIndices;
  const tabs = [
    { key: "sector", label: "Sektor" },
    { key: "index", label: "Indeks" },
  ] as const;

  return (
    <div className="space-y-3">
      {/* Mobile: tab bar */}
      <div className="lg:hidden">
        <TabBar
          tabs={tabs}
          activeKey={resolvedTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Mobile: satu tabel sesuai tab aktif */}
      <div className="lg:hidden">
        {rows.length === 0 ? (
          <p className="px-4 pt-2 text-sm text-muted">Belum ada data.</p>
        ) : (
          <SummaryTable rows={rows} />
        )}
      </div>

      {/* Desktop: Sektor (kiri) | Indeks (kanan) */}
      <div className="hidden items-start gap-4 lg:grid lg:grid-cols-2">
        <SplitColumn title="Sektor" rows={sortedSectors} />
        <SplitColumn title="Indeks" rows={sortedIndices} />
      </div>
    </div>
  );
}
