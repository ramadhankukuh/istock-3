"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";

type MonthlyPrice = { date: string; close: number };

type PurchaseHistory = {
  monthLabel: string;
  price: number;
  boughtLot: number;
  spent: number;
  cashLeft: number;
};

type SimulationResult = {
  symbol: string;
  monthlyCapital: number;
  monthCount: number;
  history: PurchaseHistory[];
  totalModalContributed: number;
  totalLot: number;
  cashBalance: number;
  stockAssetValue: number;
  totalAssetValue: number;
  profitLossPercent: number;
};

const toPositiveInteger = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return Number.parseInt(cleaned, 10);
};

const formatInputNumber = (value: string): string => {
  const asNumber = toPositiveInteger(value);
  if (!asNumber) return "";
  return new Intl.NumberFormat("id-ID").format(asNumber);
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const normalizeStockCode = (rawCode: string): string => {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) return "";
  return normalized.endsWith(".JK") ? normalized : `${normalized}.JK`;
};

const formatMonthLabel = (dateIso: string): string =>
  new Date(dateIso).toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function DcaCalculatorPage() {
  const [stockCode, setStockCode] = useState<string>("ASII");
  const [monthlyCapitalInput, setMonthlyCapitalInput] = useState<string>("4.000.000");
  const [monthCountInput, setMonthCountInput] = useState<string>("12");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  const monthCount = useMemo(() => {
    const parsed = toPositiveInteger(monthCountInput);
    return Math.min(Math.max(parsed, 1), 24);
  }, [monthCountInput]);

  const simulateDca = (symbol: string, monthlyPrices: MonthlyPrice[], monthlyCapital: number): SimulationResult => {
    let cashBalance = 0;
    let totalLot = 0;
    const history: PurchaseHistory[] = [];

    for (const item of monthlyPrices) {
      const price = Math.round(item.close);
      const budget = monthlyCapital + cashBalance;
      const lotPrice = price * 100;
      const boughtLot = lotPrice > 0 ? Math.floor(budget / lotPrice) : 0;
      const spent = boughtLot * lotPrice;
      cashBalance = budget - spent;
      totalLot += boughtLot;
      history.push({ monthLabel: formatMonthLabel(item.date), price, boughtLot, spent, cashLeft: cashBalance });
    }

    const totalModalContributed = monthlyCapital * history.length;
    const lastPrice = history.length ? history[history.length - 1].price : 0;
    const stockAssetValue = totalLot * 100 * lastPrice;
    const totalAssetValue = stockAssetValue + cashBalance;
    const profitLossPercent = totalModalContributed > 0 ? ((totalAssetValue - totalModalContributed) / totalModalContributed) * 100 : 0;

    return { symbol, monthlyCapital, monthCount: history.length, history, totalModalContributed, totalLot, cashBalance, stockAssetValue, totalAssetValue, profitLossPercent };
  };

  const onCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = normalizeStockCode(stockCode);
    const monthlyCapital = toPositiveInteger(monthlyCapitalInput);

    if (!normalizedCode) { setError("Kode saham wajib diisi. Contoh: ASII"); setResult(null); return; }
    if (!monthlyCapital || monthlyCapital < 10_000) { setError("Modal investasi harus lebih dari Rp 10.000"); setResult(null); return; }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/dca?code=${encodeURIComponent(normalizedCode)}&months=${monthCount}`);
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Gagal mengambil data saham");
      if (!data.monthly?.length) throw new Error("Data historis bulanan tidak ditemukan");
      const simulation = simulateDca(data.symbol, data.monthly, monthlyCapital);
      setResult(simulation);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const accordionItems = [
    {
      title: "Apa itu DCA Calculator?",
      content: "DCA Calculator mensimulasikan strategi Dollar Cost Averaging: Anda menyetor modal yang sama setiap bulan lalu membeli saham secara bertahap berdasarkan harga bulanan. Hasil simulasi menunjukkan total lot, cash tersisa, nilai aset, dan estimasi profit/rugi.",
    },
    {
      title: "Bagaimana lot dihitung setiap bulan?",
      content: "Setiap bulan, modal baru ditambah sisa cash bulan sebelumnya. Lalu sistem membeli lot sebanyak mungkin dengan rumus floor((modal + sisa cash) / (harga x 100)). Jika masih ada dana, otomatis menjadi saldo cash RDN untuk bulan berikutnya.",
    },
    {
      title: "Apa perbedaan dengan beli sekaligus (lump sum)?",
      content: "DCA mengurangi risiko membeli di harga puncak karena pembelian tersebar dalam beberapa bulan. Dalam jangka panjang, strategi ini cenderung menghasilkan harga rata-rata yang lebih rendah ketimbang membeli di satu titik waktu, terutama di pasar yang volatil.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="DCA Calculator"
        description="Simulasikan strategi Dollar Cost Averaging (DCA) dengan modal rutin bulanan untuk akumulasi saham secara bertahap."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "DCA Calculator" },
        ]}
        tags={["Kalkulator"]}
      />

      <form onSubmit={onCalculate} className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted">Kode Saham</label>
            <input type="text"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring) uppercase"
              placeholder="ASII" value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Modal Bulanan</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="4.000.000" value={monthlyCapitalInput}
              onChange={(e) => setMonthlyCapitalInput(formatInputNumber(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Durasi (1-24 bulan)</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="12" value={monthCountInput}
              onChange={(e) => setMonthCountInput(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-(--accent) px-5 py-2.5 text-sm font-semibold text-(--accent-foreground) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Menghitung..." : "Simulasi DCA"}
        </button>
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-5"
        >
          <h2 className="text-lg font-bold text-foreground">Hasil Simulasi DCA</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted">Total Modal</p>
              <p className="font-semibold text-foreground">{formatCurrency(result.totalModalContributed)}</p>
            </div>
            <div>
              <p className="text-muted">Total Lot</p>
              <p className="font-semibold text-foreground">{result.totalLot}</p>
            </div>
            <div>
              <p className="text-muted">Nilai Aset Saham</p>
              <p className="font-semibold text-foreground">{formatCurrency(result.stockAssetValue)}</p>
            </div>
            <div>
              <p className="text-muted">Sisa Cash</p>
              <p className="font-semibold text-foreground">{formatCurrency(result.cashBalance)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-(--border) pt-4">
            <p className="text-muted text-sm">Total Nilai Aset</p>
            <p className="font-bold text-lg text-foreground">{formatCurrency(result.totalAssetValue)}</p>
            <span className={`font-bold text-lg ${result.profitLossPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
              {result.profitLossPercent >= 0 ? "+" : ""}{formatPercent(result.profitLossPercent)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-(--surface-strong) text-muted">
                <tr>
                  <th className="p-2 text-left">Bulan</th>
                  <th className="p-2 text-right">Harga</th>
                  <th className="p-2 text-right">Lot</th>
                  <th className="p-2 text-right">Terpakai</th>
                  <th className="p-2 text-right">Sisa Cash</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {result.history.map((h, i) => (
                  <tr key={i} className="border-t border-(--border)">
                    <td className="p-2">{h.monthLabel}</td>
                    <td className="p-2 text-right">{formatCurrency(h.price)}</td>
                    <td className="p-2 text-right">{h.boughtLot}</td>
                    <td className="p-2 text-right">{formatCurrency(h.spent)}</td>
                    <td className="p-2 text-right">{formatCurrency(h.cashLeft)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang DCA Calculator</h2>
          <p className="text-sm text-muted mt-2">
            DCA Calculator mensimulasikan strategi Dollar Cost Averaging — Anda menyetor modal yang sama setiap bulan lalu membeli saham secara bertahap berdasarkan harga historis bulanan dari Yahoo Finance.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
