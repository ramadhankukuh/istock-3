"use client";

import { useEffect, useState } from "react";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";
import { kongloList } from "@/lib/data/konglo-list";

type Row = {
  ticker: string;
  price: number | null;
  changePct: number | null;
  return1d: number | null;
  return7d: number | null;
  return30d: number | null;
  marketCap: number | null;
  pbv: number | null;
  per: number | null;
  fromLow: number | null;
  fromHigh: number | null;
  atl: number | null;
  ath: number | null;
};

type GroupReturn = { return1d: number; return7d: number; return30d: number; totalMarketCap: number };

function formatNum(value: number | null, digits = 2): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function formatCompact(value: number | null): string {
  if (value === null || value === undefined) return "-";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return (value / 1_000_000_000_000).toFixed(2) + " T";
  if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + " M";
  if (abs >= 1_000_000) return (value / 1_000_000).toFixed(2) + " Jt";
  if (abs >= 1_000) return (value / 1_000).toFixed(2) + " K";
  return formatNum(value, 0);
}

function formatPct(value: number | null): string {
  if (value === null || value === undefined) return "-";
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function getChangeClass(value: number | null): string {
  if (value === null || value === undefined) return "text-muted";
  if (value > 0) return "text-green-600 dark:text-green-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-muted";
}

const calculateWeightedReturns = (rows: Row[]): GroupReturn => {
  const validRows = rows.filter((row) => row.marketCap && row.marketCap > 0);
  if (validRows.length === 0) return { return1d: 0, return7d: 0, return30d: 0, totalMarketCap: 0 };
  const totalMarketCap = validRows.reduce((sum, row) => sum + (row.marketCap || 0), 0);
  const hasReturn1d = validRows.some((row) => row.return1d !== null && !isNaN(row.return1d));
  const hasReturn7d = validRows.some((row) => row.return7d !== null && !isNaN(row.return7d));
  const hasReturn30d = validRows.some((row) => row.return30d !== null && !isNaN(row.return30d));
  let weightedReturn1d = 0, weightedReturn7d = 0, weightedReturn30d = 0;
  if (totalMarketCap > 0) {
    validRows.forEach((row) => {
      const weight = (row.marketCap || 0) / totalMarketCap;
      if (hasReturn1d && row.return1d !== null && !isNaN(row.return1d)) weightedReturn1d += row.return1d * weight;
      if (hasReturn7d && row.return7d !== null && !isNaN(row.return7d)) weightedReturn7d += row.return7d * weight;
      if (hasReturn30d && row.return30d !== null && !isNaN(row.return30d)) weightedReturn30d += row.return30d * weight;
    });
  }
  return { return1d: hasReturn1d ? weightedReturn1d : 0, return7d: hasReturn7d ? weightedReturn7d : 0, return30d: hasReturn30d ? weightedReturn30d : 0, totalMarketCap };
};

export default function KongloTrackerPage() {
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [groupReturns, setGroupReturns] = useState<Record<string, GroupReturn>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/konglo")
      .then((res) => res.json())
      .then((res) => {
        const d: Row[] = res.data ?? [];
        const grouped: Record<string, Row[]> = {};
        const returns: Record<string, GroupReturn> = {};
        kongloList.forEach((group) => {
          const matched = d.filter((row) => group.tickers.includes(row.ticker));
          grouped[group.name] = matched;
          returns[group.name] = calculateWeightedReturns(matched);
        });
        setData(grouped);
        setGroupReturns(returns);
        setLoading(false);
      })
      .catch(() => { setData({}); setGroupReturns({}); setLoading(false); });
  }, []);

  const accordionItems = [
    {
      title: "Apa itu Konglo Tracker?",
      content: "Konglo Tracker adalah alat untuk memantau dan menganalisis saham-saham dari konglomerat besar Indonesia, termasuk pergerakan harga, PBV, PER, dan posisi harga saat ini dibandingkan ATH/ATL.",
    },
    {
      title: "Apa itu Return Rata-rata Berbobot?",
      content: "Return rata-rata berbobot adalah perhitungan return grup konglo dengan mempertimbangkan bobot market cap setiap saham. Saham dengan market cap lebih besar memiliki pengaruh lebih besar terhadap return rata-rata grup.",
    },
    {
      title: "Kenapa penting memantau saham konglomerat?",
      content: "Saham konglomerat sering menjadi indikator tren pasar dan stabilitas industri. Dengan memantau saham ini, investor dapat membuat keputusan yang lebih baik dan memahami pergerakan pasar secara lebih luas.",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <ToolHeaderCard title="Konglo Tracker" description="Memuat data..." tags={["Analisis"]}
          breadcrumbs={[{ label: "Home", href: "/", isHome: true }, { label: "Konglo Tracker" }]}
        />
        <div className="flex items-center justify-center py-16 text-muted">
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="Konglo Tracker"
        description="Pantau dan analisis saham-saham dari konglomerat besar Indonesia berdasarkan data pasar terkini."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Konglo Tracker" },
        ]}
        tags={["Analisis"]}
      />

      {kongloList.map((group) => {
        const rows = data[group.name] || [];
        const gr = groupReturns[group.name];
        return (
          <div key={group.name} className="rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft) overflow-x-auto">
            <div className="sticky left-0 z-10 bg-(--surface) border-b border-(--border) p-4">
              <div className="font-semibold text-lg text-foreground">
                {group.group && <>{group.group} - <span className="text-muted">{group.name}</span></>}
              </div>
              {gr && (
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Total Market Cap:</span>
                    <span className="font-semibold text-foreground">{formatCompact(gr.totalMarketCap)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Return 1H:</span>
                    <span className={getChangeClass(gr.return1d)}>{formatPct(gr.return1d)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Return 7H:</span>
                    <span className={getChangeClass(gr.return7d)}>{formatPct(gr.return7d)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Return 30H:</span>
                    <span className={getChangeClass(gr.return30d)}>{formatPct(gr.return30d)}</span>
                  </div>
                </div>
              )}
            </div>
            {rows.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-(--surface-strong) text-muted text-xs">
                  <tr>
                    <th className="p-3 text-left">Ticker</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Chg%</th>
                    <th className="p-3 text-right hidden md:table-cell">R 1H</th>
                    <th className="p-3 text-right hidden md:table-cell">R 7H</th>
                    <th className="p-3 text-right hidden md:table-cell">R 30H</th>
                    <th className="p-3 text-right hidden lg:table-cell">MC</th>
                    <th className="p-3 text-right hidden lg:table-cell">PBV</th>
                    <th className="p-3 text-right hidden lg:table-cell">PER</th>
                    <th className="p-3 text-right hidden lg:table-cell">From Low</th>
                    <th className="p-3 text-right hidden lg:table-cell">From High</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {rows.map((row) => (
                    <tr key={row.ticker} className="border-t border-(--border) hover:bg-(--surface-strong) transition-colors">
                      <td className="p-3 font-semibold">{row.ticker}</td>
                      <td className="p-3 text-right">{row.price !== null ? formatNum(row.price, 0) : "-"}</td>
                      <td className={`p-3 text-right ${getChangeClass(row.changePct)}`}>{formatPct(row.changePct)}</td>
                      <td className={`p-3 text-right hidden md:table-cell ${getChangeClass(row.return1d)}`}>{formatPct(row.return1d)}</td>
                      <td className={`p-3 text-right hidden md:table-cell ${getChangeClass(row.return7d)}`}>{formatPct(row.return7d)}</td>
                      <td className={`p-3 text-right hidden md:table-cell ${getChangeClass(row.return30d)}`}>{formatPct(row.return30d)}</td>
                      <td className="p-3 text-right hidden lg:table-cell">{formatCompact(row.marketCap)}</td>
                      <td className="p-3 text-right hidden lg:table-cell">{formatNum(row.pbv)}</td>
                      <td className="p-3 text-right hidden lg:table-cell">{formatNum(row.per)}</td>
                      <td className="p-3 text-right hidden lg:table-cell text-green-600">{formatPct(row.fromLow)}</td>
                      <td className="p-3 text-right hidden lg:table-cell text-red-600">{formatPct(row.fromHigh)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-sm text-muted">Tidak ada data untuk grup ini.</div>
            )}
          </div>
        );
      })}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang Konglo Tracker</h2>
          <p className="text-sm text-muted mt-2">
            Konglo Tracker adalah alat untuk memantau dan menganalisis saham-saham dari konglomerat besar Indonesia. Data yang ditampilkan meliputi pergerakan harga, return periode, PBV, PER, dan posisi harga dari ATH/ATL.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
