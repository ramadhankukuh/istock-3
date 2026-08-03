"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";
import {
  getARAPercentage,
  getARBPercentage,
  getFloorPrice,
  applyPriceFraction,
  type BoardType,
} from "@/lib/ara-arb";

function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) {
    return "Rp " + (value / 1_000_000_000_000).toFixed(2) + " T";
  } else if (value >= 1_000_000_000) {
    return "Rp " + (value / 1_000_000_000).toFixed(2) + " M";
  } else if (value >= 1_000_000) {
    return "Rp " + (value / 1_000_000).toFixed(2) + " Jt";
  }
  return "Rp " + value.toLocaleString();
}

function formatNumberInput(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) return "";
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseNumberInput(value: string): number {
  return parseInt(value.replace(/\./g, ""), 10) || 0;
}

export default function AraArbCalculatorPage() {
  const [price, setPrice] = useState<string>("");
  const [lot, setLot] = useState<string>("");
  const [lotListed, setLotListed] = useState<string>("");
  const [days, setDays] = useState<string>("");
  const [boardType, setBoardType] = useState<BoardType>("main");

  const priceNum = parseNumberInput(price);
  const lotNum = parseNumberInput(lot);
  const lotListedNum = parseNumberInput(lotListed);
  const daysNum = Math.min(parseInt(days) || 0, 25);

  const totalShares = lotNum * 100;
  const totalModal = priceNum * totalShares;
  const floorPrice = getFloorPrice(boardType);
  const marketCap = priceNum * lotListedNum;
  const araPercent = getARAPercentage(priceNum, boardType);
  const arbPercent = getARBPercentage(priceNum, boardType);
  const allFilled = price !== "" && lot !== "" && days !== "";

  const generateARA = () => {
    let currentPrice = priceNum;
    const initialInvestment = priceNum * totalShares;
    const rows: any[] = [];
    for (let step = 1; step <= daysNum; step++) {
      const araPercentStep = getARAPercentage(currentPrice, boardType);
      const theoretical = currentPrice + (currentPrice * araPercentStep) / 100;
      const finalPrice = applyPriceFraction(theoretical, true, boardType);
      const currentValue = finalPrice * totalShares;
      const gainLoss = currentValue - initialInvestment;
      const stepGainPct = ((finalPrice - currentPrice) / currentPrice) * 100;
      const totalGainPct = ((finalPrice - priceNum) / priceNum) * 100;
      const marketCapStep = finalPrice * lotListedNum;
      rows.push({ step: `#${step}`, finalPrice, gainLoss, stepGainPct, totalGainPct, marketCap: marketCapStep });
      currentPrice = finalPrice;
    }
    return rows;
  };

  const generateARB = () => {
    let currentPrice = priceNum;
    const initialInvestment = priceNum * totalShares;
    const rows: any[] = [];
    if (currentPrice <= floorPrice) {
      return [{ step: "Floor", finalPrice: floorPrice, gainLoss: 0, stepGainPct: 0, totalGainPct: 0, marketCap: floorPrice * lotListedNum, isFloor: true }];
    }
    for (let step = 1; step <= daysNum; step++) {
      const arbPercentStep = getARBPercentage(currentPrice, boardType);
      const theoretical = currentPrice - (currentPrice * arbPercentStep) / 100;
      let finalPrice = applyPriceFraction(theoretical, false, boardType);
      if (finalPrice < floorPrice) finalPrice = floorPrice;
      const currentValue = finalPrice * totalShares;
      const gainLoss = currentValue - initialInvestment;
      const stepLossPct = ((finalPrice - currentPrice) / currentPrice) * 100;
      const totalGainPct = ((finalPrice - priceNum) / priceNum) * 100;
      const marketCapStep = finalPrice * lotListedNum;
      rows.push({ step: finalPrice === floorPrice ? "Floor" : `#${step}`, finalPrice, gainLoss, stepGainPct: stepLossPct, totalGainPct, marketCap: marketCapStep, isFloor: finalPrice === floorPrice });
      currentPrice = finalPrice;
      if (finalPrice === floorPrice) break;
    }
    return rows;
  };

  const accordionItems = [
    {
      title: "Apa itu ARA dan ARB?",
      content: "ARA (Auto Rejection Atas) dan ARB (Auto Rejection Bawah) adalah batas maksimum dan minimum pergerakan harga saham yang diatur oleh BEI setiap hari. Jika harga mencapai batas ini, maka perdagangan tidak dapat dilanjutkan di luar kisaran tersebut.",
    },
    {
      title: "Bagaimana cara menggunakan ARA/ARB Calculator?",
      content: "Masukkan harga saham terakhir dan pilih jenis papan perdagangan (Utama atau Akselerasi). Kalkulator akan otomatis menampilkan batas harga tertinggi (ARA) dan terendah (ARB) yang diizinkan, termasuk pembulatan sesuai fraksi tick harga.",
    },
    {
      title: "Apa manfaat menggunakan kalkulator ini?",
      content: "Dengan mengetahui batas ARA dan ARB, investor dapat memperkirakan potensi pergerakan harga harian serta memahami risiko volatilitas saham. Alat ini membantu dalam membuat strategi beli/jual yang lebih terukur.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="ARA ARB Calculator"
        description="Hitung batas harga maksimum (ARA) dan minimum (ARB) saham berdasarkan aturan Bursa Efek Indonesia (BEI). Alat ini membantu investor memahami potensi pergerakan harga harian sesuai papan perdagangan dan fraksi harga yang berlaku."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "ARA ARB Calculator" },
        ]}
        tags={["Kalkulator"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted">Papan</label>
          <div className="mt-1 flex w-full rounded-lg overflow-hidden border border-(--border)">
            <button
              onClick={() => setBoardType("main")}
              className={`flex-1 p-2 text-sm font-medium transition ${
                boardType === "main"
                  ? "bg-(--accent) text-(--accent-foreground)"
                  : "bg-(--surface-strong) text-foreground"
              }`}
            >
              Utama/Pengembangan
            </button>
            <button
              onClick={() => setBoardType("acceleration")}
              className={`flex-1 p-2 text-sm font-medium transition ${
                boardType === "acceleration"
                  ? "bg-(--accent) text-(--accent-foreground)"
                  : "bg-(--surface-strong) text-foreground"
              }`}
            >
              Akselerasi/FCA
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted">Harga Penutupan</label>
            <input
              type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="900"
              value={price}
              onChange={(e) => setPrice(formatNumberInput(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Lot</label>
            <input
              type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="10"
              value={lot}
              onChange={(e) => setLot(formatNumberInput(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Jumlah ARA & ARB</label>
            <input
              type="number" inputMode="numeric" min="1" max="25"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="5"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            {parseInt(days) > 25 && <p className="text-xs text-red-500 mt-1">Maksimal 25.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Total Saham <span className="text-muted/60">(opsional)</span></label>
            <input
              type="text" inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              placeholder="16.180.233"
              value={lotListed}
              onChange={(e) => setLotListed(formatNumberInput(e.target.value))}
            />
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--surface-strong) p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <p className="text-muted">Total Lembar</p>
              <p className="font-semibold text-foreground">{totalShares.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">Total Modal</p>
              <p className="font-semibold text-foreground">Rp {totalModal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">Floor Price</p>
              <p className="font-semibold text-foreground">{floorPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">Market Cap</p>
              <p className="font-semibold text-foreground">{marketCap > 0 ? formatMarketCap(marketCap) : "-"}</p>
            </div>
            <div>
              <p className="text-muted">ARA Limit</p>
              <p className="font-semibold text-green-600">+{araPercent}%</p>
            </div>
            <div>
              <p className="text-muted">ARB Limit</p>
              <p className="font-semibold text-red-600">-{arbPercent}%</p>
            </div>
          </div>
        </div>
      </div>

      {allFilled && (
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft) overflow-hidden"
          >
            <div className="bg-emerald-600 text-(--accent-foreground) flex items-center gap-2 px-4 py-3 font-semibold">
              <TrendingUp size={18} /> Upward Movement (ARA)
            </div>
            <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
              {generateARA().map((row, idx, arr) => {
                const prevPrice = idx === 0 ? priceNum : arr[idx - 1].finalPrice;
                const stepChange = row.finalPrice - prevPrice;
                return (
                  <div key={idx} className="rounded-xl border border-(--border) bg-(--surface-strong) p-3 shadow-sm">
                    <div className="grid grid-cols-3 items-center text-sm font-medium">
                      <span className="text-foreground">{row.finalPrice.toLocaleString()}</span>
                      <span className="text-center text-xs text-muted">{row.step}</span>
                      <span className="text-right font-semibold text-foreground">Rp {row.gainLoss.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 grid grid-cols-3 items-center text-sm">
                      <span className={`${stepChange >= 0 ? "text-green-600" : "text-red-600"} font-semibold`}>
                        {stepChange >= 0 ? "+" : ""}{stepChange.toLocaleString()}
                      </span>
                      <span className={`text-center ${row.stepGainPct >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {row.stepGainPct.toFixed(2)}%
                      </span>
                      <span className={`text-right font-bold ${row.totalGainPct >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {row.totalGainPct.toFixed(2)}%
                      </span>
                    </div>
                    {lotListedNum > 0 && (
                      <div className="mt-2 flex justify-center">
                        <span className="text-xs font-medium text-(--accent)">MC: {formatMarketCap(row.marketCap)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow-soft) overflow-hidden"
          >
            <div className="bg-red-600 text-(--accent-foreground) flex items-center gap-2 px-4 py-3 font-semibold">
              <TrendingDown size={18} /> Downward Movement (ARB)
            </div>
            <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
              {generateARB().map((row, idx, arr) => {
                const prevPrice = idx === 0 ? priceNum : arr[idx - 1].finalPrice;
                const stepChange = row.finalPrice - prevPrice;
                return (
                  <div key={idx} className="rounded-xl border border-(--border) bg-(--surface-strong) p-3 shadow-sm">
                    <div className="grid grid-cols-3 items-center text-sm font-medium">
                      <span className="text-foreground">{row.finalPrice.toLocaleString()}</span>
                      <span className="text-center text-xs text-muted">{row.step}</span>
                      <span className="text-right font-semibold text-foreground">Rp {row.gainLoss.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 grid grid-cols-3 items-center text-sm">
                      <span className={`${stepChange >= 0 ? "text-green-600" : "text-red-600"} font-semibold`}>
                        {stepChange >= 0 ? "+" : ""}{stepChange.toLocaleString()}
                      </span>
                      <span className={`text-center ${row.stepGainPct >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {row.stepGainPct.toFixed(2)}%
                      </span>
                      <span className={`text-right font-bold ${row.totalGainPct >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {row.totalGainPct.toFixed(2)}%
                      </span>
                    </div>
                    {lotListedNum > 0 && (
                      <div className="mt-2 flex justify-center">
                        <span className="text-xs font-medium text-(--accent)">MC: {formatMarketCap(row.marketCap)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {allFilled && (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft)">
          <h2 className="text-lg font-bold text-foreground mb-4">Visualisasi Pergerakan Harga</h2>
          <ResponsiveContainer width="100%" height={350} className="[&_*]:focus:outline-none">
            <LineChart data={[
              { step: 0, ARA: priceNum, ARB: priceNum },
              ...generateARA().map((d, i) => ({ step: d.step, ARA: d.finalPrice, ARB: generateARB()[i]?.finalPrice ?? null })),
            ]} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="4 4" className="stroke-gray-300 dark:stroke-gray-700" />
              <YAxis tick={{ fill: "#888" }} label={{ value: "Harga", angle: -90, position: "insideLeft", offset: -10, fill: "#888" }} />
              <XAxis dataKey="step" tick={{ fill: "#888" }} label={{ value: "Step", position: "insideBottom", offset: -5, fill: "#888" }} />
              <Tooltip />
              <Line type="monotone" dataKey="ARA" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="ARA" />
              <Line type="monotone" dataKey="ARB" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} name="ARB" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang ARA/ARB Calculator</h2>
          <p className="text-sm text-muted mt-2">
            ARA/ARB Calculator digunakan untuk mensimulasikan pergerakan harga saham dalam beberapa hari ke depan berdasarkan aturan auto rejection BEI. Alat ini akan menghitung batas harga maksimum (ARA) dan minimum (ARB) untuk setiap langkah, dengan mempertimbangkan papan perdagangan dan fraksi harga (tick) yang berlaku.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
