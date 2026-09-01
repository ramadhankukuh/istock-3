"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TabContentSkeleton } from "@/features/chart/components/chart-page-skeleton";
import { PriceHeader } from "@/features/chart/components/price-header";
import { ChartPanel } from "@/features/chart/components/chart-panel";
import { AddToPortfolioButton } from "@/features/chart/components/add-to-portfolio-button";
import { TabNav } from "@/features/chart/components/tab-nav";
import { KeystatsTab } from "@/features/chart/components/tabs/keystats-tab";
import { AnalysisTab } from "@/features/chart/components/tabs/analysis-tab";
import { FinancialsTab } from "@/features/chart/components/tabs/financials-tab";
import { SeasonalityTab } from "@/features/chart/components/tabs/seasonality-tab";
import { AboutTab } from "@/features/chart/components/tabs/about-tab";
import { useChartPage } from "@/features/chart/hooks/use-chart-page";

type Props = {
  initialSymbol: string;
  initialTab: string;
};

export default function ChartPage({ initialSymbol, initialTab }: Props) {
  const {
    symbol,
    tab,
    data,
    loading,
    error,
    dark,
    range,
    setRange,
    style,
    setStyle,
    intraday,
    hourly,
    goToSymbol,
    goToTab,
  } = useChartPage(initialSymbol, initialTab);

  return (
    <div className="space-y-4">
      <PriceHeader
        symbol={symbol}
        onSubmitSymbol={goToSymbol}
        data={data}
        loading={loading}
        range={range}
        candles={data?.candles ?? []}
      />

      <ChartPanel
        candles={data?.candles ?? []}
        dark={dark}
        loading={loading}
        range={range}
        onRangeChange={setRange}
        style={style}
        onStyleChange={setStyle}
        intraday={intraday}
        hourly={hourly}
        previousClose={data?.quote.previousClose ?? null}
      />

      {loading ? (
        <Skeleton className="h-12 w-full rounded-xl" />
      ) : (
        <AddToPortfolioButton
          symbol={symbol}
          price={data?.quote.price ?? null}
        />
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-500">
          {error}
        </div>
      )}

      <div>
        <TabNav active={tab} onChange={goToTab} />
        <div className="mt-4">
          {loading ? (
            <TabContentSkeleton />
          ) : data ? (
            <>
              {tab === "keystats" && <KeystatsTab data={data} />}
              {tab === "analysis" && <AnalysisTab data={data} />}
              {tab === "financials" && <FinancialsTab data={data} />}
              {tab === "seasonality" && <SeasonalityTab data={data} />}
              {tab === "about" && <AboutTab data={data} />}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              Data belum tersedia untuk {symbol}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
