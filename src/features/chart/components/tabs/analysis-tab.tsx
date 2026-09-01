"use client";

import { Section, StatItem } from "@/features/chart/components/stat-item";
import type { ChartData } from "@/features/chart/types";
import {
  formatCompactNumber,
  formatDateShort,
  formatNumber,
  formatPercentSigned,
  formatRecommendationKey,
} from "@/features/chart/utils";

const RATING_SEGMENTS = [
  { key: "strongBuy" as const, label: "Strong Buy", color: "#0f9d58" },
  { key: "buy" as const, label: "Buy", color: "#34c78d" },
  { key: "hold" as const, label: "Hold", color: "#f59e0b" },
  { key: "sell" as const, label: "Sell", color: "#f97316" },
  { key: "strongSell" as const, label: "Strong Sell", color: "#ef4444" },
];

function GaugeBar({ mean }: { mean: number | null }) {
  // recommendationMean ranges roughly 1 (Strong Buy) .. 5 (Strong Sell)
  const clamped = mean === null ? 3 : Math.min(5, Math.max(1, mean));
  const percent = ((clamped - 1) / 4) * 100;

  return (
    <div className="relative mt-2 h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500">
      <div
        className="absolute -top-1.5 h-5 w-1.5 -translate-x-1/2 rounded-full bg-foreground shadow"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}

export function AnalysisTab({ data }: { data: ChartData }) {
  const { analystSummary, consensusEstimates } = data;
  const latestTrend = analystSummary.trend[0] ?? null;

  const targetRange =
    analystSummary.targetLow !== null && analystSummary.targetHigh !== null
      ? analystSummary.targetHigh - analystSummary.targetLow
      : null;
  const targetPosition =
    targetRange && data.quote.price !== null && analystSummary.targetLow !== null
      ? Math.min(
          100,
          Math.max(
            0,
            ((data.quote.price - analystSummary.targetLow) / targetRange) * 100,
          ),
        )
      : null;
  const meanPosition =
    targetRange && analystSummary.targetMean !== null && analystSummary.targetLow !== null
      ? Math.min(
          100,
          Math.max(
            0,
            ((analystSummary.targetMean - analystSummary.targetLow) / targetRange) *
              100,
          ),
        )
      : null;

  const upsidePercent =
    analystSummary.targetMean !== null && data.quote.price
      ? ((analystSummary.targetMean - data.quote.price) / data.quote.price) * 100
      : null;

  return (
    <div className="space-y-4">
      <Section title="Analyst Rating">
        <p className="mb-4 text-xs text-muted">
          Based on {analystSummary.numberOfAnalystOpinions ?? "-"} analysts
        </p>

        <GaugeBar mean={analystSummary.recommendationMean} />
        <div className="mt-1 flex justify-between text-[10px] uppercase text-muted">
          <span>Strong Buy</span>
          <span>Hold</span>
          <span>Strong Sell</span>
        </div>

        <p className="mt-4 text-center text-2xl font-bold text-(--accent)">
          {formatRecommendationKey(analystSummary.recommendationKey)}
        </p>

        {latestTrend && (
          <div className="mt-6 space-y-2">
            {RATING_SEGMENTS.map((segment) => {
              const count = latestTrend[segment.key];
              const percent = latestTrend.total
                ? (count / latestTrend.total) * 100
                : 0;
              return (
                <div key={segment.key} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-muted">
                    {segment.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-(--surface-strong)">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Price Target">
        <p className="mb-3 text-xs text-muted">
          Analyst price forecast for {data.symbol}.JK
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase text-red-500">Low</p>
            <p className="text-lg font-bold text-foreground">
              {formatNumber(analystSummary.targetLow, 0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-emerald-600">
              Average
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatNumber(analystSummary.targetMean, 0)}
            </p>
            <p className="text-xs text-emerald-600">
              {formatPercentSigned(upsidePercent)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-emerald-600">
              High
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatNumber(analystSummary.targetHigh, 0)}
            </p>
          </div>
        </div>

        {targetPosition !== null && (
          <div className="relative mt-4 h-2 w-full rounded-full bg-(--surface-strong)">
            {meanPosition !== null && (
              <div
                className="absolute -top-0.5 h-3 w-0.5 bg-(--accent)"
                style={{ left: `${meanPosition}%` }}
              />
            )}
            <div
              className="absolute -top-0.5 h-3 w-0.5 bg-foreground"
              style={{ left: `${targetPosition}%` }}
            />
          </div>
        )}
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>Current: {formatNumber(data.quote.price, 0)} IDR</span>
          <span>Target: {formatNumber(analystSummary.targetMean, 0)} IDR</span>
        </div>
      </Section>

      {consensusEstimates.length > 0 && (
        <Section title="Consensus Estimates">
          <p className="mb-3 text-xs text-muted">
            Revenue and earnings projections
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {consensusEstimates.map((point) => (
              <div key={point.period}>
                <p className="text-xs text-muted">{point.period}</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatCompactNumber(point.revenueAvg)} IDR
                </p>
                <p className="text-xs text-muted">
                  EPS {formatNumber(point.earningsAvg, 2)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {analystSummary.trend.length > 0 && (
        <Section title="Recommendation Trend History">
          <p className="mb-3 text-xs text-muted">
            Monthly shift in analyst stance
          </p>
          <div className="space-y-4">
            {analystSummary.trend.map((point) => (
              <div key={point.period}>
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-foreground">
                    {point.period}
                  </span>
                  <span>{point.total} analysts</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full">
                  {RATING_SEGMENTS.map((segment) => {
                    const count = point[segment.key];
                    const percent = point.total ? (count / point.total) * 100 : 0;
                    return (
                      <div
                        key={segment.key}
                        style={{
                          width: `${percent}%`,
                          backgroundColor: segment.color,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted">
                  <span>SB: {point.strongBuy}</span>
                  <span>B: {point.buy}</span>
                  <span>H: {point.hold}</span>
                  <span>S: {point.sell}</span>
                  <span>SS: {point.strongSell}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Earnings Event Window">
        <p className="mb-3 text-xs text-muted">
          Upcoming earnings and call schedule from Yahoo feed
        </p>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <StatItem
            label="Next Earnings"
            value={formatDateShort(data.calendar.nextEarningsDate)}
          />
          <StatItem
            label="Ex-Dividend Date"
            value={formatDateShort(data.calendar.exDividendDate)}
          />
          <StatItem
            label="Call Start"
            value={formatDateShort(data.calendar.earningsCallStart)}
          />
          <StatItem
            label="Call End"
            value={formatDateShort(data.calendar.earningsCallEnd)}
          />
        </div>
      </Section>
    </div>
  );
}
