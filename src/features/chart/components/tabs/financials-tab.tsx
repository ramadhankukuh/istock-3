"use client";

import { SectionCard, StatItem } from "@/features/chart/components/stat-item";
import type { ChartData } from "@/features/chart/types";
import {
  formatCompactNumber,
  formatDateShort,
  formatNumber,
  formatPercentPlain,
  formatPercentSigned,
} from "@/features/chart/utils";

function MarginBar({ label, value }: { label: string; value: number | null }) {
  const width = value === null ? 0 : Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-foreground">
          {formatPercentPlain(value)}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-(--surface-strong)">
        <div className="h-full rounded-full bg-(--accent)" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function FinancialsTab({ data }: { data: ChartData }) {
  const { financialHealth, dividend, keyStatistics, calendar } = data;

  return (
    <div className="space-y-4">
      <SectionCard title="Upcoming Events">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <StatItem
            label="Next Earnings"
            value={formatDateShort(calendar.nextEarningsDate)}
          />
          <StatItem
            label="Ex-Dividend Date"
            value={formatDateShort(dividend.exDividendDate)}
          />
          <StatItem
            label="Earnings Call"
            value={formatDateShort(calendar.earningsCallStart)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Financial Health">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <StatItem
            label="Total Revenue"
            value={formatCompactNumber(financialHealth.totalRevenue)}
          />
          <StatItem
            label="Total Cash"
            value={formatCompactNumber(financialHealth.totalCash)}
          />
          <StatItem
            label="Total Debt"
            value={formatCompactNumber(financialHealth.totalDebt)}
            valueClassName="text-red-500"
          />
          <StatItem
            label="Revenue / Share"
            value={formatNumber(financialHealth.revenuePerShare)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Margins & Growth">
        <div className="grid gap-4 sm:grid-cols-2">
          <MarginBar label="Gross Margin" value={financialHealth.grossMargin} />
          <MarginBar label="Operating Margin" value={financialHealth.operatingMargin} />
          <MarginBar label="Profit Margin" value={financialHealth.profitMargin} />
          <MarginBar label="EBITDA Margin" value={financialHealth.ebitdaMargin} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <StatItem
            label="ROE"
            value={formatPercentPlain(financialHealth.roe)}
            valueClassName="text-emerald-500"
          />
          <StatItem
            label="ROA"
            value={formatPercentPlain(financialHealth.roa)}
            valueClassName="text-emerald-500"
          />
          <StatItem
            label="Revenue Growth"
            value={formatPercentSigned(financialHealth.revenueGrowth)}
            valueClassName="text-emerald-500"
          />
          <StatItem
            label="Earnings Growth"
            value={formatPercentSigned(financialHealth.earningsGrowth)}
            valueClassName="text-emerald-500"
          />
        </div>
      </SectionCard>

      <SectionCard title="Dividend Info">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <StatItem label="Dividend Rate" value={`IDR ${formatNumber(dividend.rate, 2)}`} />
          <StatItem label="Dividend Yield" value={formatPercentPlain(dividend.yieldPercent)} />
          <StatItem label="Payout Ratio" value={formatPercentPlain(dividend.payoutRatio)} />
          <StatItem label="5Y Avg Yield" value={formatPercentPlain(dividend.fiveYearAvgYield)} />
          <StatItem label="Ex-Dividend" value={formatDateShort(dividend.exDividendDate)} />
        </div>
      </SectionCard>

      <SectionCard title="Key Statistics">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <StatItem label="Beta" value={formatNumber(keyStatistics.beta, 3)} />
          <StatItem label="Book Value" value={formatNumber(keyStatistics.bookValue)} />
          <StatItem label="EPS (TTM)" value={formatNumber(keyStatistics.epsTTM)} />
          <StatItem label="EPS (Fwd)" value={formatNumber(keyStatistics.epsForward)} />
          <StatItem
            label="Earnings Growth (Q)"
            value={formatPercentPlain(keyStatistics.earningsQuarterlyGrowth)}
          />
          <StatItem
            label="52-Week Change"
            value={formatPercentSigned(keyStatistics.fiftyTwoWeekChange)}
          />
          <StatItem
            label="Shares Outstanding"
            value={formatCompactNumber(keyStatistics.sharesOutstanding)}
          />
          <StatItem label="Float" value={formatCompactNumber(keyStatistics.floatShares)} />
          <StatItem
            label="Implied Shares Out"
            value={formatCompactNumber(keyStatistics.impliedSharesOutstanding)}
          />
          <StatItem
            label="% Held by Insiders"
            value={formatPercentPlain(keyStatistics.heldByInsiders)}
          />
          <StatItem
            label="% Held by Institutions"
            value={formatPercentPlain(keyStatistics.heldByInstitutions)}
          />
          <StatItem label="Last Split" value={keyStatistics.lastSplitFactor ?? "-"} />
        </div>
      </SectionCard>

      <SectionCard title="Ownership & Short Interest">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <StatItem
            label="Insider Ownership"
            value={formatPercentPlain(keyStatistics.heldByInsiders)}
          />
          <StatItem
            label="Institution Ownership"
            value={formatPercentPlain(keyStatistics.heldByInstitutions)}
          />
          <StatItem label="Short Ratio" value={formatNumber(keyStatistics.shortRatio)} />
          <StatItem
            label="Short % of Float"
            value={formatPercentPlain(keyStatistics.shortPercentOfFloat)}
          />
          <StatItem
            label="Shares Short"
            value={formatCompactNumber(keyStatistics.sharesShort)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Fiscal Markers">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <StatItem
            label="Most Recent Quarter"
            value={formatDateShort(keyStatistics.mostRecentQuarter)}
          />
          <StatItem
            label="Last Fiscal Year End"
            value={formatDateShort(keyStatistics.lastFiscalYearEnd)}
          />
          <StatItem
            label="Next Fiscal Year End"
            value={formatDateShort(keyStatistics.nextFiscalYearEnd)}
          />
        </div>
      </SectionCard>
    </div>
  );
}
