"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";

export default function RightIssueCalculatorPage() {
  const [oldPrice, setOldPrice] = useState<string>("");
  const [oldLot, setOldLot] = useState<string>("");
  const [ratioOld, setRatioOld] = useState<string>("");
  const [ratioNew, setRatioNew] = useState<string>("");
  const [subsPrice, setSubsPrice] = useState<string>("");
  const [marketPrice, setMarketPrice] = useState<string>("");
  const [participation, setParticipation] = useState<"all" | "none" | "partial">("all");
  const [subsPctManual, setSubsPctManual] = useState<string>("50");

  const oldShares = parseInt(oldLot || "0") * 100;
  const rightsShares = ratioOld && ratioNew ? (oldShares * parseFloat(ratioNew)) / parseFloat(ratioOld) : 0;
  const effectivePct = participation === "all" ? 100 : participation === "none" ? 0 : parseFloat(subsPctManual || "0");
  const rightsSubscribed = rightsShares * (effectivePct / 100);
  const newShares = oldShares + rightsSubscribed;
  const avgPrice = newShares > 0 ? (oldShares * parseFloat(oldPrice || "0") + rightsSubscribed * parseFloat(subsPrice || "0")) / newShares : 0;
  const totalValue = newShares * avgPrice;
  const gainLoss = marketPrice && avgPrice > 0 ? (parseFloat(marketPrice) - avgPrice) * newShares : 0;

  const accordionItems = [
    {
      title: "Apa itu Right Issue?",
      content: "Right Issue adalah aksi korporasi di mana perusahaan menerbitkan saham baru untuk ditawarkan kepada pemegang saham lama dengan harga tertentu. Tujuannya bisa untuk menambah modal kerja, ekspansi bisnis, atau membayar utang.",
    },
    {
      title: "Bagaimana cara menggunakan Right Issue Calculator?",
      content: "Masukkan data seperti harga saham lama, harga right issue, dan rasio penawaran (misalnya 1:2). Kalkulator akan otomatis menghitung harga teoritis setelah right issue (TERP), potensi keuntungan atau kerugian dari hak tersebut, dan persentase dilusi terhadap total saham.",
    },
    {
      title: "Apa manfaat menggunakan kalkulator ini?",
      content: "Dengan Right Issue Calculator, investor dapat memperkirakan dampak aksi right issue terhadap nilai investasinya. Alat ini membantu menilai apakah harga penawaran menarik dan bagaimana aksi tersebut memengaruhi kepemilikan serta harga saham setelah pelaksanaan.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="Right Issue Calculator"
        description="Hitung harga teoritis saham setelah penawaran umum terbatas (Right Issue). Alat ini membantu kamu mengetahui harga ex-rights (TERP), jumlah saham baru yang diterima, serta potensi dilusi kepemilikan."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Right Issue Calculator" },
        ]}
        tags={["Kalkulator"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-medium text-muted">Harga Lama</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="1000" value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Lot Lama</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="10" value={oldLot}
              onChange={(e) => setOldLot(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Rasio Right Issue (misal 1 : 2)</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="text" inputMode="numeric"
                className="w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
                placeholder="1" value={ratioOld}
                onChange={(e) => setRatioOld(e.target.value)}
              />
              <span className="text-muted">:</span>
              <input type="text" inputMode="numeric"
                className="w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
                placeholder="2" value={ratioNew}
                onChange={(e) => setRatioNew(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Harga Tebus</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="500" value={subsPrice}
              onChange={(e) => setSubsPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Partisipasi Right Issue</label>
            <select
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              value={participation}
              onChange={(e) => setParticipation(e.target.value as any)}
            >
              <option value="all">Ikut Semua</option>
              <option value="none">Tidak Ikut</option>
              <option value="partial">Sebagian</option>
            </select>
          </div>
          {participation === "partial" && (
            <div>
              <label className="text-xs font-medium text-muted">Persentase Rights Ditebus (%)</label>
              <input type="text" inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
                placeholder="50" value={subsPctManual}
                onChange={(e) => setSubsPctManual(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted">Harga Pasar Setelah RI</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="1200" value={marketPrice}
              onChange={(e) => setMarketPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {oldShares > 0 && rightsShares > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Hasil Perhitungan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-muted">Saham Lama</p>
              <p className="font-semibold text-foreground">{oldShares.toLocaleString()} lembar</p>
            </div>
            <div>
              <p className="text-muted">Hak Rights</p>
              <p className="font-semibold text-foreground">{rightsShares.toLocaleString()} lembar</p>
            </div>
            <div>
              <p className="text-muted">Rights Ditebus</p>
              <p className="font-semibold text-foreground">{rightsSubscribed.toLocaleString()} lembar</p>
            </div>
            <div>
              <p className="text-muted">Total Saham Baru</p>
              <p className="font-semibold text-foreground">{newShares.toLocaleString()} lembar</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6 text-sm border-t border-(--border) pt-6">
            <div>
              <p className="text-muted">Harga Rata-rata</p>
              <p className="font-bold text-(--accent) text-lg">Rp {avgPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-muted">Total Nilai Investasi</p>
              <p className="font-semibold text-foreground">Rp {totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            {marketPrice && (
              <div>
                <p className="text-muted">Untung/Rugi (Market)</p>
                <p className={`font-bold text-lg ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {gainLoss >= 0 ? "+" : ""}Rp {gainLoss.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang Right Issue Calculator</h2>
          <p className="text-sm text-muted mt-2">
            Right Issue Calculator membantu investor memperkirakan dampak aksi korporasi right issue terhadap nilai investasi mereka. Kalkulator ini menghitung harga rata-rata baru, jumlah saham yang dimiliki, serta potensi keuntungan atau kerugian berdasarkan harga pasar saat ini.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
