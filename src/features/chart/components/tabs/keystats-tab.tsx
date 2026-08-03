"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard, StatItem } from "@/features/chart/components/stat-item";
import type { ChartData } from "@/features/chart/types";
import {
  formatCompactNumber,
  formatDateShort,
  formatNumber,
  formatPercentSigned,
  formatRatio,
} from "@/features/chart/utils";

function vsAverage(price: number | null, avg: number | null) {
  if (price === null || avg === null || avg === 0) return null;
  return ((price - avg) / avg) * 100;
}

export function KeystatsTab({ data }: { data: ChartData }) {
  const { keyStats, quote } = data;

  const toHighPercent =
    keyStats.fiftyTwoWeekHigh && quote.price
      ? ((quote.price - keyStats.fiftyTwoWeekHigh) / keyStats.fiftyTwoWeekHigh) *
        100
      : null;
  const fromLowPercent =
    keyStats.fiftyTwoWeekLow && quote.price
      ? ((quote.price - keyStats.fiftyTwoWeekLow) / keyStats.fiftyTwoWeekLow) *
        100
      : null;
  const vs50D = vsAverage(quote.price, keyStats.fiftyDayAverage);
  const vs200D = vsAverage(quote.price, keyStats.twoHundredDayAverage);
  const spread =
    keyStats.ask !== null && keyStats.bid !== null
      ? keyStats.ask - keyStats.bid
      : null;

  const chartData = data.financialsChart.map((point) => ({
    period: point.period,
    Revenue: point.revenue,
    Earnings: point.earnings,
  }));

  return (
    <div className="space-y-4">
      <SectionCard title="Summary">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
          <StatItem label="Market Cap" value={formatCompactNumber(keyStats.marketCap) + " IDR"} />
          <StatItem label="P/E (TTM)" value={formatNumber(keyStats.peTTM)} />
          <StatItem label="Forward P/E" value={formatNumber(keyStats.forwardPe)} />
          <StatItem label="P/B" value={formatNumber(keyStats.pb)} />
          <StatItem
            label="52W Range"
            value={`${formatNumber(keyStats.fiftyTwoWeekLow, 0)} - ${formatNumber(keyStats.fiftyTwoWeekHigh, 0)}`}
          />
          <StatItem
            label="Day Range"
            value={`${formatNumber(quote.dayLow, 0)} - ${formatNumber(quote.dayHigh, 0)}`}
          />
          <StatItem label="Volume" value={formatCompactNumber(keyStats.volume)} />
          <StatItem label="Avg Volume (3M)" value={formatCompactNumber(keyStats.avgVolume3M)} />
          <StatItem label="Avg Volume (10D)" value={formatCompactNumber(keyStats.avgVolume10D)} />
          <StatItem label="Relative Volume" value={formatRatio(keyStats.relativeVolume)} />
          <StatItem label="50D Average" value={formatNumber(keyStats.fiftyDayAverage)} />
          <StatItem label="200D Average" value={formatNumber(keyStats.twoHundredDayAverage)} />
          <StatItem
            label="Vs 50D"
            value={formatPercentSigned(vs50D)}
            valueClassName={vs50D !== null && vs50D < 0 ? "text-red-500" : "text-emerald-500"}
          />
          <StatItem
            label="Vs 200D"
            value={formatPercentSigned(vs200D)}
            valueClassName={vs200D !== null && vs200D < 0 ? "text-red-500" : "text-emerald-500"}
          />
          <StatItem
            label="To 52W High"
            value={formatPercentSigned(toHighPercent)}
            valueClassName={toHighPercent !== null && toHighPercent < 0 ? "text-red-500" : "text-emerald-500"}
          />
          <StatItem
            label="From 52W Low"
            value={formatPercentSigned(fromLowPercent)}
            valueClassName={fromLowPercent !== null && fromLowPercent < 0 ? "text-red-500" : "text-emerald-500"}
          />
          <StatItem label="Previous Close" value={formatNumber(quote.previousClose)} />
          <StatItem label="Open" value={formatNumber(quote.open)} />
        </div>
      </SectionCard>

      <SectionCard title="Trading Snapshot">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
          <StatItem label="Market State" value={quote.marketState ?? "-"} />
          <StatItem label="Quote Source" value="Delayed Quote" />
          <StatItem label="Bid" value={formatNumber(keyStats.bid, 0)} />
          <StatItem label="Ask" value={formatNumber(keyStats.ask, 0)} />
          <StatItem label="Bid Size" value={formatNumber(keyStats.bidSize, 0)} />
          <StatItem label="Ask Size" value={formatNumber(keyStats.askSize, 0)} />
          <StatItem label="Spread" value={formatNumber(spread, 0)} />
        </div>
      </SectionCard>

      {data.earningsHistory.length > 0 && (
        <SectionCard title="Earnings Results">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.earningsHistory.map((point) => {
              const beat = point.surprise !== null && point.surprise >= 0;
              return (
                <div
                  key={point.quarter}
                  className="rounded-xl border border-(--border) bg-(--surface-strong) p-3"
                >
                  <p className="text-xs text-muted">{point.quarter}</p>
                  <p className="mt-1 text-xs text-muted">
                    Est {formatNumber(point.estimate, 2)} · Act{" "}
                    {formatNumber(point.actual, 2)}
                  </p>
                  <p
                    className={
                      point.surprise === null
                        ? "mt-1 text-sm font-semibold text-muted"
                        : beat
                          ? "mt-1 text-sm font-semibold text-emerald-500"
                          : "mt-1 text-sm font-semibold text-red-500"
                    }
                  >
                    {point.surprise === null
                      ? "-"
                      : `${beat ? "Beat" : "Miss"} ${formatPercentSigned(point.surprise, 2)}`}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {chartData.length > 0 && (
        <SectionCard title="Revenue vs Earnings">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.22)"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fill: "currentColor", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatCompactNumber(Number(v))}
                  tick={{ fill: "currentColor", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value) => formatCompactNumber(Number(value))}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(148, 163, 184, 0.28)",
                    background: "rgba(255, 255, 255, 0.92)",
                  }}
                />
                <Legend />
                <Bar dataKey="Revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Earnings" fill="#0f172a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Upcoming Events">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <StatItem
            label="Next Earnings"
            value={formatDateShort(data.calendar.nextEarningsDate)}
          />
          <StatItem
            label="Ex-Dividend Date"
            value={formatDateShort(data.calendar.exDividendDate)}
          />
          <StatItem
            label="Earnings Call"
            value={formatDateShort(data.calendar.earningsCallStart)}
          />
        </div>
      </SectionCard>
    </div>
  );
}
