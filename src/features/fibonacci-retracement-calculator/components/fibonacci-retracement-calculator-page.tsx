"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Label,
} from "recharts";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";

interface FibLevel {
  level: number;
  ratio: number;
  description: string;
  price: number;
}

const fibBase = [
  { level: 0, ratio: 0.0, description: "Level awal" },
  { level: 23.6, ratio: 0.236, description: "Support/resistance lemah" },
  { level: 38.2, ratio: 0.382, description: "Level entry potensial" },
  { level: 50, ratio: 0.5, description: "Level psikologis penting" },
  { level: 61.8, ratio: 0.618, description: "Golden ratio - level kuat" },
  { level: 100, ratio: 1.0, description: "Level akhir" },
];

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function FibonacciRetracementCalculatorPage() {
  const [high, setHigh] = useState<string>("");
  const [low, setLow] = useState<string>("");
  const [trend, setTrend] = useState<string>("uptrend");
  const [levels, setLevels] = useState<FibLevel[]>([]);

  const parseNum = (v: string) => parseFloat(v.replace(/[^\d.,-]/g, "").replace(",", "."));

  useEffect(() => {
    const h = parseNum(high);
    const l = parseNum(low);
    if (!h || !l || h <= 0 || l <= 0 || h <= l) { setLevels([]); return; }
    const diff = h - l;
    const isUptrend = trend === "uptrend";
    const result = fibBase.map((f) => ({ ...f, price: isUptrend ? l + diff * f.ratio : h - diff * f.ratio }));
    setLevels(result);
  }, [high, low, trend]);

  const accordionItems = [
    {
      title: "Apa itu Fibonacci Retracement?",
      content: "Fibonacci Retracement adalah metode analisis teknikal yang menggunakan rasio matematika dari deret Fibonacci untuk mengidentifikasi area kemungkinan koreksi atau pembalikan harga. Level umum yang digunakan adalah 23.6%, 38.2%, 50%, 61.8%, dan 78.6%.",
    },
    {
      title: "Bagaimana cara menggunakan Fibonacci Retracement Calculator?",
      content: "Masukkan harga tertinggi (High) dan terendah (Low) dari pergerakan saham. Kalkulator akan otomatis menampilkan level-level retracement Fibonacci berdasarkan data tersebut. Hasilnya bisa digunakan untuk melihat area potensi support dan resistance.",
    },
    {
      title: "Apa manfaat menggunakan Fibonacci Retracement?",
      content: "Fibonacci Retracement membantu trader dan investor menentukan area entry, target harga, dan stop-loss secara lebih strategis. Dengan memahami level-level Fibonacci, kamu dapat menganalisis peluang pembalikan harga dan mengoptimalkan strategi trading.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="Fibonacci Retracement Calculator"
        description="Hitung level-level Fibonacci retracement untuk analisis teknikal saham. Identifikasi area potensi support dan resistance berdasarkan rasio Fibonacci."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Fibonacci Retracement Calculator" },
        ]}
        tags={["Kalkulator"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted">Harga Tertinggi</label>
            <input type="text" inputMode="numeric" placeholder="Contoh: 15000"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              value={high} onChange={(e) => setHigh(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Harga Terendah</label>
            <input type="text" inputMode="numeric" placeholder="Contoh: 12000"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              value={low} onChange={(e) => setLow(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Arah Tren</label>
            <select value={trend} onChange={(e) => setTrend(e.target.value)}
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
            >
              <option value="uptrend">Uptrend (naik)</option>
              <option value="downtrend">Downtrend (turun)</option>
            </select>
          </div>
        </div>
      </div>

      {levels.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-2">Hasil Perhitungan</h2>

          <div className="overflow-hidden rounded-xl border border-(--border)">
            <table className="w-full text-sm">
              <thead className="bg-(--surface-strong) text-muted">
                <tr>
                  <th className="p-2 text-left">Level (%)</th>
                  <th className="p-2 text-left">Deskripsi</th>
                  <th className="p-2 text-left">Harga</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {levels.map((f, i) => {
                  const color = trend === "uptrend"
                    ? f.ratio <= 0.382 ? "text-green-500" : f.ratio >= 0.618 ? "text-red-500" : ""
                    : f.ratio >= 0.618 ? "text-green-500" : f.ratio <= 0.382 ? "text-red-500" : "";
                  return (
                    <tr key={i} className="border-t border-(--border)">
                      <td className="p-2">{f.level}%</td>
                      <td className="p-2">{f.description}</td>
                      <td className={`p-2 font-semibold ${color}`}>{formatPrice(f.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={levels} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                <XAxis dataKey="level" tick={{ fill: "#888" }} label={{ value: "Level (%)", position: "insideBottom", offset: -5, fill: "#888" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#888" }} label={{ value: "Harga", angle: -90, position: "insideLeft", offset: 0, fill: "#888" }} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={{ r: 5, fill: "#6366f1" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang Fibonacci Retracement Calculator</h2>
          <p className="text-sm text-muted mt-2">
            Fibonacci Retracement adalah metode analisis teknikal yang menggunakan rasio matematika dari deret Fibonacci untuk mengidentifikasi area kemungkinan koreksi atau pembalikan harga. Level umum yang digunakan adalah 23.6%, 38.2%, 50%, 61.8%, dan 78.6%.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
