"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ToolHeaderCard from "@/components/ui/tool-header-card";
import { Accordion } from "@/components/ui/accordion";

export default function ValueAtRiskCalculatorPage() {
  const [portfolioValue, setPortfolioValue] = useState<string>("");
  const [confidence, setConfidence] = useState<string>("95");
  const [volatility, setVolatility] = useState<string>("");
  const [days, setDays] = useState<string>("");
  const [result, setResult] = useState<{ value: number; percent: number; interpretation: string } | null>(null);

  const parseNum = (v: string) => parseFloat(v.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", "."));
  const formatCurrency = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const formatPercent = (n: number) => new Intl.NumberFormat("id-ID", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n / 100);
  const formatNumber = (n: string) => { const num = parseNum(n); return isNaN(num) ? n : new Intl.NumberFormat("id-ID").format(num); };

  const getZ = (conf: string): number => {
    const z: Record<string, number> = { "99": 2.326, "95": 1.645, "90": 1.282 };
    return z[conf] ?? 1.645;
  };

  useEffect(() => {
    const pv = parseNum(portfolioValue);
    const vol = parseNum(volatility);
    const t = parseNum(days);
    if (!pv || pv <= 0 || !vol || vol <= 0 || vol >= 100 || !t || t <= 0) { setResult(null); return; }
    const z = getZ(confidence);
    const varValue = pv * (vol / 100) * z * Math.sqrt(t);
    const varPercent = (varValue / pv) * 100;
    setResult({
      value: varValue,
      percent: varPercent,
      interpretation: `Dengan tingkat kepercayaan ${confidence}%, dalam periode ${t} hari ke depan, potensi kerugian maksimal portofolio Anda diperkirakan tidak akan melebihi ${formatCurrency(varValue)} (${formatPercent(varPercent)}) dari nilai portofolio.`,
    });
  }, [portfolioValue, volatility, days, confidence]);

  const accordionItems = [
    {
      title: "Apa itu Value at Risk (VaR)?",
      content: "Value at Risk (VaR) adalah metode statistik yang digunakan untuk memperkirakan potensi kerugian maksimum dari suatu aset atau portofolio dalam kondisi pasar normal selama periode waktu tertentu, dengan tingkat kepercayaan (confidence level) tertentu, seperti 95% atau 99%.",
    },
    {
      title: "Bagaimana cara menggunakan Value at Risk Calculator?",
      content: "Masukkan nilai portofolio, tingkat volatilitas (deviasi standar), periode waktu (dalam hari), dan tingkat kepercayaan yang diinginkan. Kalkulator akan menghitung estimasi potensi kerugian maksimum berdasarkan model VaR parametrik (variance-covariance) berbasis z-score.",
    },
    {
      title: "Apa manfaat menggunakan VaR Calculator?",
      content: "Dengan VaR Calculator, investor dapat memahami seberapa besar risiko yang dihadapi dalam investasi mereka. Alat ini berguna untuk manajemen risiko, evaluasi portofolio, serta pengambilan keputusan strategis dalam menjaga keseimbangan antara potensi keuntungan dan tingkat risiko.",
    },
  ];

  return (
    <div className="space-y-8">
      <ToolHeaderCard
        title="Value at Risk (VaR) Calculator"
        description="Ukur potensi kerugian maksimum dari portofolio investasi Anda dalam jangka waktu tertentu dengan tingkat kepercayaan tertentu menggunakan Value at Risk (VaR) Calculator."
        breadcrumbs={[
          { label: "Home", href: "/", isHome: true },
          { label: "Value at Risk (VaR) Calculator" },
        ]}
        tags={["Kalkulator"]}
      />

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted">Nilai Portofolio (Rp)</label>
            <input type="text" inputMode="numeric" placeholder="Contoh: 10.000.000"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              value={portfolioValue}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setPortfolioValue(raw === "" ? "" : formatNumber(raw));
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Volatilitas (%) per hari</label>
            <input type="text" inputMode="decimal" placeholder="Contoh: 2.5"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              value={volatility} onChange={(e) => setVolatility(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Periode (hari)</label>
            <input type="text" inputMode="numeric" placeholder="Contoh: 5"
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
              value={days} onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Tingkat Kepercayaan (%)</label>
            <select value={confidence} onChange={(e) => setConfidence(e.target.value)}
              className="mt-1 w-full rounded-lg border border-(--border) bg-(--surface-strong) p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--ring)"
            >
              <option value="99">99%</option>
              <option value="95">95%</option>
              <option value="90">90%</option>
            </select>
          </div>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-5"
        >
          <h2 className="text-lg font-bold text-foreground mb-3">Hasil Perhitungan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-muted">Nilai VaR</p>
              <p className="font-semibold text-(--accent) text-lg">{formatCurrency(result.value)}</p>
            </div>
            <div>
              <p className="text-muted">Persentase Risiko</p>
              <p className="font-semibold text-foreground">{formatPercent(result.percent)}</p>
            </div>
            <div>
              <p className="text-muted">Nilai Portofolio</p>
              <p className="font-semibold text-foreground">{formatCurrency(parseNum(portfolioValue))}</p>
            </div>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--surface-strong) p-4 text-sm text-muted">
            {result.interpretation}
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-soft) space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tentang Value at Risk (VaR) Calculator</h2>
          <p className="text-sm text-muted mt-2">
            Value at Risk (VaR) Calculator membantu investor mengukur potensi kerugian maksimum dari portofolio investasi dalam periode waktu tertentu dengan tingkat kepercayaan tertentu. Alat ini menggunakan metode parametrik (variance-covariance) untuk menghitung estimasi risiko berdasarkan volatilitas dan z-score.
          </p>
        </div>
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
