"use client";

import { Accordion } from "@/components/ui/accordion";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { useStockAnalysis } from "@/features/stock-analysis/hooks/use-stock-analysis";
import TradingStyleChart from "@/features/stock-analysis/components/trading-style-chart";
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatRatio,
} from "@/features/stock-analysis/utils";

export default function StockAnalysisPage() {
  const {
    code,
    setCode,
    loading,
    error,
    data,
    dark,
    canSubmit,
    peStatus,
    pbStatus,
    roeStatus,
    derStatus,
    priceVsMa20,
    priceVsMa50,
    chartCandles,
    accordionItems,
    handleAnalyze,
  } = useStockAnalysis();

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="Stock Analysis"
        description="Analisis cepat saham dengan data profil, fundamental, teknikal, dan rating analis dalam satu tampilan."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Stock Analysis" },
        ]}
        tags={["Analisis"]}
      />

      <form
        onSubmit={handleAnalyze}
        className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)"
      >
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <label className="block text-xs font-medium text-muted">
              Kode Saham
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="BBCA"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-(--accent) px-5 py-2.5 text-sm font-semibold text-(--accent-foreground) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {loading ? "Menganalisa..." : "Analisis"}
          </button>
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      {data && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
            <h2 className="mb-4 text-lg font-bold text-foreground">Chart</h2>
            {chartCandles.length > 0 ? (
              <TradingStyleChart candles={chartCandles} dark={dark} />
            ) : (
              <p className="text-sm text-muted">Data chart belum tersedia.</p>
            )}
          </div>

          {/* Profil Emiten */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Profil Emiten
            </h2>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-muted">Kode</p>
                <p className="font-semibold text-foreground">
                  {data.profile.code}
                </p>
              </div>
              <div>
                <p className="text-muted">Nama</p>
                <p className="font-semibold text-foreground">
                  {data.profile.longName || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted">Sektor</p>
                <p className="font-semibold text-foreground">
                  {data.profile.sector || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted">Market Cap</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.profile.market_cap, true)}
                </p>
              </div>
            </div>
          </div>

          {/* Data Teknikal */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Data Teknikal
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-5">
              <div>
                <p className="text-muted">Harga</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.price)}
                </p>
              </div>
              <div>
                <p className="text-muted">Prev Close</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.prev_close)}
                </p>
              </div>
              <div>
                <p className="text-muted">Open</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.open_price)}
                </p>
              </div>
              <div>
                <p className="text-muted">High</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.high)}
                </p>
              </div>
              <div>
                <p className="text-muted">Low</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.low)}
                </p>
              </div>
              <div>
                <p className="text-muted">Volume</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.technical.volume)}
                </p>
              </div>
              <div>
                <p className="text-muted">Volume Avg 3M</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.technical.volume3m_avg)}
                </p>
              </div>
              <div>
                <p className="text-muted">Volume Avg 10D</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.technical.volume10d_avg)}
                </p>
              </div>
              <div>
                <p className="text-muted">52W Low</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical["52week_low"])}
                </p>
              </div>
              <div>
                <p className="text-muted">52W High</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical["52week_high"])}
                </p>
              </div>
              <div>
                <p className="text-muted">Foreign Buy</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.technical.foreign_buy, true)}
                </p>
              </div>
              <div>
                <p className="text-muted">Foreign Sell</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.technical.foreign_sell, true)}
                </p>
              </div>
              <div>
                <p className="text-muted">Net Foreign</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.technical.net_foreign, true)}
                </p>
              </div>
            </div>
          </div>

          {/* Indikator Teknikal */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Indikator Teknikal
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-muted">RSI (14)</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.rsi14)}
                </p>
              </div>
              <div>
                <p className="text-muted">Stoch RSI %K</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.stoch_rsi_k)}
                </p>
              </div>
              <div>
                <p className="text-muted">Stoch RSI %D</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.stoch_rsi_d)}
                </p>
              </div>
              <div>
                <p className="text-muted">MACD</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.macd, 4)}
                </p>
              </div>
              <div>
                <p className="text-muted">MACD Signal</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.macd_signal, 4)}
                </p>
              </div>
              <div>
                <p className="text-muted">MACD Histogram</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.macd_histogram, 4)}
                </p>
              </div>
              <div>
                <p className="text-muted">MA20</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.ma20)}
                </p>
                {priceVsMa20 && (
                  <span className="mt-1 inline-flex rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {priceVsMa20}
                  </span>
                )}
              </div>
              <div>
                <p className="text-muted">MA50</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.ma50)}
                </p>
                {priceVsMa50 && (
                  <span className="mt-1 inline-flex rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {priceVsMa50}
                  </span>
                )}
              </div>
              <div>
                <p className="text-muted">Support</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.support)}
                </p>
              </div>
              <div>
                <p className="text-muted">Resistance</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.technical.resistance)}
                </p>
              </div>
              <div>
                <p className="text-muted">Volume Ratio</p>
                <p className="font-semibold text-foreground">
                  {formatRatio(data.technical.volume_ratio)}
                </p>
              </div>
            </div>
          </div>

          {/* Data Fundamental */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Data Fundamental
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-muted">P/E Ratio</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.fundamental.pe_ratio)}
                </p>
                {peStatus && (
                  <span
                    className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${peStatus.badgeClass}`}
                  >
                    {peStatus.label}
                  </span>
                )}
              </div>
              <div>
                <p className="text-muted">P/B Ratio</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.fundamental.pb_ratio)}
                </p>
                {pbStatus && (
                  <span
                    className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${pbStatus.badgeClass}`}
                  >
                    {pbStatus.label}
                  </span>
                )}
              </div>
              <div>
                <p className="text-muted">ROE</p>
                <p className="font-semibold text-foreground">
                  {formatPercent(data.fundamental.roe)}
                </p>
                {roeStatus && (
                  <span
                    className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${roeStatus.badgeClass}`}
                  >
                    {roeStatus.label}
                  </span>
                )}
              </div>
              <div>
                <p className="text-muted">DER</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.fundamental.der)}
                </p>
                {derStatus && (
                  <span
                    className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${derStatus.badgeClass}`}
                  >
                    {derStatus.label}
                  </span>
                )}
              </div>
              <div>
                <p className="text-muted">Total Revenue</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.fundamental.total_revenue, true)}
                </p>
              </div>
              <div>
                <p className="text-muted">Net Income</p>
                <p className="font-semibold text-foreground">
                  {formatCompact(data.fundamental.net_income, true)}
                </p>
              </div>
              <div>
                <p className="text-muted">Dividen / Share</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(data.fundamental.dividen)}
                </p>
              </div>
              <div>
                <p className="text-muted">Dividend Yield</p>
                <p className="font-semibold text-foreground">
                  {formatPercent(data.fundamental.dividen_yield)}
                </p>
              </div>
            </div>
          </div>

          {/* Skor Analis */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Skor Analis
            </h2>
            <p className="text-sm text-foreground">
              Rata-rata rating analis:{" "}
              <span className="font-semibold">
                {data.score.averageAnalystRating || "-"}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Tentang + Accordion */}
      <div className="space-y-6 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Tentang Stock Analysis
          </h2>
          <p className="mt-2 text-sm text-muted">
            Stock Analysis membantu Anda membaca kondisi saham berdasarkan data
            harga, volume, dan rasio penting secara cepat dalam satu halaman.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
