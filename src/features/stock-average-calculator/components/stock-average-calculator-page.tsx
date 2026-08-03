"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";

interface Transaction {
  id: number;
  price: number;
  lot: number;
}

export default function StockAverageCalculatorPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [price, setPrice] = useState<string>("");
  const [lot, setLot] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("stockTransactions");
    if (saved) {
      try { setTransactions(JSON.parse(saved)); } catch {}
    }
  }, []);

  const addTransaction = () => {
    const p = parseFloat(price);
    const l = parseInt(lot);
    if (!p || p <= 0) return;
    if (!l || l <= 0) return;
    setTransactions([...transactions, { id: Date.now(), price: p, lot: l }]);
    setPrice("");
    setLot("");
  };

  const removeTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const resetTransactions = () => {
    if (transactions.length === 0) return;
    setTransactions([]);
    setPrice("");
    setLot("");
    localStorage.removeItem("stockTransactions");
  };

  const saveTransactions = () => {
    if (transactions.length === 0) return;
    localStorage.setItem("stockTransactions", JSON.stringify(transactions));
  };

  const totalShares = transactions.reduce((sum, t) => sum + t.lot * 100, 0);
  const totalModal = transactions.reduce((sum, t) => sum + t.price * t.lot * 100, 0);
  const averagePrice = totalShares > 0 ? totalModal / totalShares : 0;

  const accordionItems = [
    {
      title: "Apa itu Stock Average Calculator?",
      content: "Stock Average Calculator membantu investor menghitung harga rata-rata pembelian dari beberapa transaksi saham. Misalnya, jika kamu membeli saham yang sama di harga berbeda, alat ini akan menampilkan harga rata-rata aktual dari seluruh pembelianmu.",
    },
    {
      title: "Bagaimana cara menggunakan Stock Average Calculator?",
      content: "Masukkan harga beli saham dan jumlah lot untuk setiap transaksi yang kamu lakukan. Tambahkan baris baru jika kamu memiliki lebih dari satu pembelian. Setelah semua data diisi, kalkulator akan otomatis menghitung harga rata-rata per lembar saham.",
    },
    {
      title: "Apa manfaat menghitung harga average?",
      content: "Mengetahui harga average sangat penting untuk menentukan titik impas (break-even point) dalam berinvestasi. Dengan informasi ini, kamu dapat menilai kapan waktu yang tepat untuk menjual saham agar mendapatkan keuntungan atau mengurangi kerugian.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="Stock Average Calculator"
        description="Hitung harga rata-rata pembelian saham dari beberapa transaksi dengan harga dan jumlah lot yang berbeda. Ketahui harga average per lembar saham untuk menentukan titik impas dan strategi jual atau beli."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Stock Average Calculator" },
        ]}
        tags={["Kalkulator"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted">Harga Beli</label>
            <input
              type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="3000" value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Lot</label>
            <input
              type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="10" value={lot}
              onChange={(e) => setLot(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={addTransaction}
            className="flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-semibold text-(--accent-foreground) transition hover:opacity-90"
          >
            <Plus size={16} /> Tambah Transaksi
          </button>
          {transactions.length > 0 && (
            <>
              <button onClick={saveTransactions}
                className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--surface-strong) px-4 py-2 text-sm font-semibold text-foreground transition hover:opacity-80"
              >
                <Save size={16} /> Simpan
              </button>
              <button onClick={resetTransactions}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:opacity-80 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      {transactions.length > 0 && (
        <>
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
            <h2 className="text-lg font-bold text-foreground mb-4">Daftar Transaksi</h2>
            <div className="space-y-2">
              {transactions.map((t, i) => (
                <div key={t.id}
                  className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-strong) p-3 text-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-muted">#{i + 1}</span>
                    <div>
                      <span className="font-semibold text-foreground">Rp {t.price.toLocaleString()}</span>
                      <span className="text-muted ml-2">× {t.lot} lot ({t.lot * 100} lembar)</span>
                    </div>
                  </div>
                  <button onClick={() => removeTransaction(t.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">Ringkasan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-muted">Total Lembar</p>
                <p className="font-semibold text-foreground">{totalShares.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted">Total Modal</p>
                <p className="font-semibold text-foreground">Rp {totalModal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted">Harga Rata-rata</p>
                <p className="font-bold text-(--accent) text-lg">Rp {averagePrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang Stock Average Calculator</h2>
          <p className="text-sm text-muted mt-2">
            Stock Average Calculator digunakan untuk menghitung harga rata-rata pembelian saham dari beberapa transaksi. Alat ini membantu investor mengetahui harga average per lembar saham untuk menentukan titik impas dan strategi jual atau beli.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
