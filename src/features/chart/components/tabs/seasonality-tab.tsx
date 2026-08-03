"use client";

import { cn } from "@/lib/utils/cn";
import { SectionCard } from "@/features/chart/components/stat-item";
import type { ChartData, SeasonalityTable } from "@/features/chart/types";
import { formatPercentSigned } from "@/features/chart/utils";

function cellClass(value: number | null) {
  if (value === null) return "text-muted";
  const abs = Math.abs(value);
  if (value > 0) {
    return abs >= 10
      ? "bg-emerald-500/25 text-emerald-700 dark:text-emerald-300"
      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }
  return abs >= 10
    ? "bg-red-500/25 text-red-700 dark:text-red-300"
    : "bg-red-500/10 text-red-600 dark:text-red-300";
}

function ReturnsTable({ table }: { table: SeasonalityTable }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left text-xs font-semibold uppercase text-muted">
              Year
            </th>
            {table.labels.map((label) => (
              <th
                key={label}
                className="p-2 text-center text-xs font-semibold uppercase text-muted"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-(--surface-strong)">
            <td className="rounded-l-lg p-2 text-xs font-bold text-foreground">
              Avg.
            </td>
            {table.avg.map((value, index) => (
              <td
                key={index}
                className={cn(
                  "p-2 text-center text-xs font-bold",
                  index === table.avg.length - 1 && "rounded-r-lg",
                  cellClass(value),
                )}
              >
                {formatPercentSigned(value)}
              </td>
            ))}
          </tr>

          {table.years.map((year) => (
            <tr key={year} className="border-t border-(--border)">
              <td className="p-2 text-xs font-semibold text-foreground">
                {year}
              </td>
              {table.rows[year].map((value, index) => (
                <td
                  key={index}
                  className={cn("p-2 text-center text-xs", cellClass(value))}
                >
                  {value === null ? "-" : formatPercentSigned(value)}
                </td>
              ))}
            </tr>
          ))}

          <tr className="border-t border-(--border)">
            <td className="p-2 text-xs font-bold text-foreground">Prob.</td>
            {table.prob.map((value, index) => (
              <td
                key={index}
                className="p-2 text-center text-xs font-semibold text-muted"
              >
                {value === null ? "-" : `${value}%`}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--surface-strong) p-4 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

export function SeasonalityTab({ data }: { data: ChartData }) {
  const { quarterly, monthly, quarterlySummary, monthlySummary } =
    data.seasonality;

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            label="Best Avg"
            value={formatPercentSigned(quarterlySummary.bestValue)}
            sub={quarterlySummary.bestLabel ?? "-"}
          />
          <SummaryCard
            label="Worst Avg"
            value={formatPercentSigned(quarterlySummary.worstValue)}
            sub={quarterlySummary.worstLabel ?? "-"}
          />
          <SummaryCard
            label="Q Win Rate"
            value={
              quarterlySummary.winRatePercent !== null
                ? `${quarterlySummary.winRatePercent}%`
                : "-"
            }
            sub={quarterlySummary.winRateFraction ?? "-"}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <SummaryCard
            label="Best Avg"
            value={formatPercentSigned(monthlySummary.bestValue)}
            sub={monthlySummary.bestLabel ?? "-"}
          />
          <SummaryCard
            label="Worst Avg"
            value={formatPercentSigned(monthlySummary.worstValue)}
            sub={monthlySummary.worstLabel ?? "-"}
          />
          <SummaryCard
            label="M Win Rate"
            value={
              monthlySummary.winRatePercent !== null
                ? `${monthlySummary.winRatePercent}%`
                : "-"
            }
            sub={monthlySummary.winRateFraction ?? "-"}
          />
        </div>
      </SectionCard>

      <SectionCard title="Quarterly Returns">
        <ReturnsTable table={quarterly} />
      </SectionCard>

      <SectionCard title="Monthly Returns">
        <ReturnsTable table={monthly} />
      </SectionCard>

      <p className="px-1 text-xs text-muted">
        Dihitung dari data harga historis harian (hingga 10 tahun terakhir).
        Kinerja masa lalu tidak menjamin hasil di masa depan.
      </p>
    </div>
  );
}
