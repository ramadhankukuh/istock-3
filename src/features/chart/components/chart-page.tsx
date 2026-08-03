"use client";

import { PriceHeader } from "@/features/chart/components/price-header";
import { ChartPanel } from "@/features/chart/components/chart-panel";
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
    symbolInput,
    setSymbolInput,
    symbol,
    tab,
    data,
    loading,
    error,
    dark,
    isPositive,
    goToSymbol,
    goToTab,
  } = useChartPage(initialSymbol, initialTab);

  return (
    <div className="space-y-4">
      <PriceHeader
        symbol={symbol}
        symbolInput={symbolInput}
        setSymbolInput={setSymbolInput}
        onSubmitSymbol={goToSymbol}
        data={data}
        loading={loading}
        isPositive={isPositive}
      />

      <ChartPanel candles={data?.candles ?? []} dark={dark} loading={loading} />

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-500">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft)">
        <div className="px-3 pt-2 sm:px-4">
          <TabNav active={tab} onChange={goToTab} />
        </div>
        <div className="p-4 sm:p-5">
          {loading && !data ? (
            <p className="py-8 text-center text-sm text-muted">
              Memuat data {symbol}…
            </p>
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
