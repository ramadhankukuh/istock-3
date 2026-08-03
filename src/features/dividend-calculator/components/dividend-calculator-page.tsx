"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Percent } from "lucide-react";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";

export default function DividendCalculatorPage() {
  const [price, setPrice] = useState<string>("");
  const [lot, setLot] = useState<string>("");
  const [dps, setDps] = useState<string>("");
  const [tax, setTax] = useState<string>("10");

  const shares = parseInt(lot || "0") * 100;
  const bruto = shares * parseFloat(dps || "0");
  const pajak = (bruto * parseFloat(tax || "0")) / 100;
  const neto = bruto - pajak;
  const yieldPct = price && parseFloat(price) > 0 ? (parseFloat(dps || "0") / parseFloat(price)) * 100 : 0;

  const accordionItems = [
    {
      title: "Apa itu Dividen Calculator?",
      content: "Dividen Calculator adalah alat yang membantu investor menghitung total dividen yang diterima dari suatu saham, baik sebelum maupun setelah pajak. Dengan alat ini, kamu juga bisa mengetahui persentase dividend yield untuk menilai efisiensi return dari dividen.",
    },
    {
      title: "Bagaimana cara menggunakan Dividen Calculator?",
      content: "Masukkan harga saham per lembar, jumlah lot yang kamu miliki, dan nilai dividen per saham (DPS). Kalkulator akan otomatis menampilkan total dividen bruto, potongan pajak sesuai tarif, jumlah dividen bersih, serta persentase dividend yield dari harga saham.",
    },
    {
      title: "Apa manfaat menghitung dividend yield?",
      content: "Dividend yield membantu investor menilai seberapa besar potensi pendapatan pasif dari dividen dibandingkan dengan harga saham. Semakin tinggi yield, semakin besar potensi return dividen terhadap modal yang kamu investasikan.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="Dividen Calculator"
        description="Hitung total dividen yang diterima dari suatu saham, baik sebelum maupun setelah pajak. Alat ini juga menampilkan persentase dividend yield untuk menilai efisiensi return dari dividen."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Dividen Calculator" },
        ]}
        tags={["Kalkulator"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted">Harga Saham</label>
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
          <div>
            <label className="block text-xs font-medium text-muted">Dividen per Saham (DPS)</label>
            <input
              type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="50" value={dps}
              onChange={(e) => setDps(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Pajak (%)</label>
            <input
              type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="10" value={tax}
              onChange={(e) => setTax(e.target.value)}
            />
          </div>
        </div>
      </div>

      {shares > 0 && bruto > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Hasil Perhitungan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-muted">Total Lembar</p>
              <p className="font-semibold text-foreground">{shares.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">Dividen Bruto</p>
              <p className="font-semibold text-foreground">Rp {bruto.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">Pajak {tax}%</p>
              <p className="font-semibold text-red-500">- Rp {pajak.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">Dividen Neto</p>
              <p className="font-bold text-green-600">Rp {neto.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm">
            <Percent size={16} className="text-(--accent)" />
            <span className="text-muted">Dividend Yield</span>
            <span className="font-bold text-(--accent)">{yieldPct.toFixed(2)}%</span>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang Dividen Calculator</h2>
          <p className="text-sm text-muted mt-2">
            Dividen Calculator digunakan untuk menghitung total pendapatan dividen yang kamu terima dari kepemilikan saham tertentu. Dengan alat ini, kamu bisa mengetahui dividen bruto, potongan pajak, dan jumlah bersih (neto) yang kamu terima, serta menghitung rasio dividend yield berdasarkan harga saham yang dimiliki.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
