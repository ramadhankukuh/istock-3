"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtInput = (s: string) => (s ? Number(s).toLocaleString("id-ID") : "");

export default function IPOAllotmentPredictorPage() {
  const [hargaIPO, setHargaIPO] = useState("");
  const [totalLot, setTotalLot] = useState("");
  const [totalInvestor, setTotalInvestor] = useState("");
  const [orderLot, setOrderLot] = useState("");
  const [rasio, setRasio] = useState<"1:2" | "1:1">("1:2");

  const harga = Number(hargaIPO);
  const totalLotNum = Number(totalLot);
  const investorNum = Number(totalInvestor);
  const orderLotNum = Number(orderLot);
  const valid = harga > 0 && totalLotNum > 0 && investorNum > 0 && orderLotNum > 0;

  const nilaiOrder = orderLotNum * harga * 100;
  const kategori = nilaiOrder < 100_000_000 ? "kecil" : "besar";

  const totalDana = totalLotNum * harga * 100;
  let ritelPercent = 0.125;
  if (totalDana < 250_000_000_000) ritelPercent = 0.25;
  else if (totalDana < 500_000_000_000) ritelPercent = 0.2;
  else if (totalDana < 1_000_000_000_000) ritelPercent = 0.175;
  else ritelPercent = 0.125;

  const nonRitelPercent = 1 - ritelPercent;
  const ritelPercentDisplay = (ritelPercent * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 });
  const nonRitelPercentDisplay = (nonRitelPercent * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 });
  const ritelPool = totalLotNum * ritelPercent;
  const nonRitelPool = totalLotNum * nonRitelPercent;

  const rasioKecil = 1;
  const rasioBesar = rasio === "1:1" ? 1 : 2;
  const totalRasio = rasioKecil + rasioBesar;
  const poolRitelKecil = (ritelPool * rasioKecil) / totalRasio;
  const poolRitelBesar = (ritelPool * rasioBesar) / totalRasio;

  const investorKecil = investorNum * 0.9;
  const investorBesar = investorNum * 0.1;
  const avgKecil = poolRitelKecil / investorKecil;
  const avgBesar = poolRitelBesar / investorBesar;
  const priorityFactor = 1.35;
  const avgFinal = kategori === "kecil" ? avgKecil : avgBesar * priorityFactor;

  const maxAllowedLots = rasio === "1:1" ? Math.max(1, Math.floor(totalLotNum * 0.1)) : Infinity;
  const estimasiMin = Math.max(1, Math.floor(avgFinal * 0.75));
  const estimasiMax = Math.min(orderLotNum, Math.ceil(avgFinal * 1.25), maxAllowedLots);
  const estimasiText = estimasiMin === estimasiMax ? `${estimasiMin}` : `${estimasiMin} – ${estimasiMax}`;

  const accordionItems = [
    {
      title: "Apa itu IPO Allotment Predictor?",
      content: "IPO Allotment Predictor adalah alat estimasi untuk memperkirakan jumlah lot saham IPO yang berpotensi kamu dapatkan berdasarkan jumlah pemesanan, total investor, dan skema pooling ritel.",
    },
    {
      title: "Apakah hasil ini pasti?",
      content: "Tidak. Hasil bersifat estimasi berdasarkan asumsi distribusi investor dan rasio pooling. Allotment final tetap ditentukan oleh underwriter dan sistem e-IPO.",
    },
    {
      title: "Apa arti rasio 1:2 dan 1:1?",
      content: "Rasio menunjukkan pembagian jatah ritel antara investor kecil (<100 juta) dan besar (>100 juta). Rasio 1:2 berarti investor besar mendapat porsi dua kali lebih besar.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="IPO Allotment Predictor"
        description="Perkirakan jatah lot saham IPO yang mungkin kamu dapatkan berdasarkan jumlah pemesanan, total investor, dan skema pooling ritel."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "IPO Allotment Predictor" },
        ]}
        tags={["Kalkulator"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-medium text-muted">Harga IPO</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="1.000" value={fmtInput(hargaIPO)}
              onChange={(e) => setHargaIPO(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Total Lot IPO</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="10.000.000" value={fmtInput(totalLot)}
              onChange={(e) => setTotalLot(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Total Investor (SID)</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="50.000" value={fmtInput(totalInvestor)}
              onChange={(e) => setTotalInvestor(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Order Lot Kamu</label>
            <input type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="100" value={fmtInput(orderLot)}
              onChange={(e) => setOrderLot(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Rasio Ritel</label>
            <div className="mt-1 flex w-full rounded-lg overflow-hidden border border-(--border)">
              <button onClick={() => setRasio("1:2")}
                className={`flex-1 p-2 text-sm font-medium transition ${
                  rasio === "1:2" ? "bg-(--accent) text-(--accent-foreground)" : "bg-(--surface-strong) text-foreground"
                }`}>1:2</button>
              <button onClick={() => setRasio("1:1")}
                className={`flex-1 p-2 text-sm font-medium transition ${
                  rasio === "1:1" ? "bg-(--accent) text-(--accent-foreground)" : "bg-(--surface-strong) text-foreground"
                }`}>1:1</button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--surface-strong) p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted">Total Dana Dihimpun</p>
              <p className="font-semibold text-foreground">{totalDana > 0 ? fmt(totalDana) : "-"}</p>
            </div>
            <div>
              <p className="text-muted">Pool Ritel ({ritelPercentDisplay}%)</p>
              <p className="font-semibold text-foreground">{ritelPool > 0 ? fmt(ritelPool) : "-"}</p>
            </div>
            <div>
              <p className="text-muted">Kategori Order</p>
              <p className="font-semibold text-foreground">{nilaiOrder > 0 ? (kategori === "kecil" ? "< 100 Juta" : "≥ 100 Juta") : "-"}</p>
            </div>
            <div>
              <p className="text-muted">Estimasi Lot</p>
              <p className="font-bold text-(--accent) text-lg">{valid ? estimasiText : "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {valid && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Detail Perhitungan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Pooling IPO</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Total Lot Tersedia</span>
                  <span className="font-semibold text-foreground">{fmt(totalLotNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Jatah Ritel ({ritelPercentDisplay}%)</span>
                  <span className="font-semibold text-foreground">{fmt(ritelPool)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Jatah Non-Ritel ({nonRitelPercentDisplay}%)</span>
                  <span className="font-semibold text-foreground">{fmt(nonRitelPool)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Distribusi Investor</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Estimasi Investor Kecil (90%)</span>
                  <span className="font-semibold text-foreground">{fmt(investorKecil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Estimasi Investor Besar (10%)</span>
                  <span className="font-semibold text-foreground">{fmt(investorBesar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Rata-rata per Investor</span>
                  <span className="font-semibold text-foreground">{fmt(Math.round(avgFinal))} lot</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang IPO Allotment Predictor</h2>
          <p className="text-sm text-muted mt-2">
            IPO Allotment Predictor adalah alat estimasi untuk memperkirakan jumlah lot saham IPO yang berpotensi kamu dapatkan. Perhitungan menggunakan asumsi pooling ritel berdasarkan total dana dihimpun dan distribusi investor.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
