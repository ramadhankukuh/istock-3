"use client";

import { Section, StatItem } from "@/features/chart/components/stat-item";
import type { ChartData } from "@/features/chart/types";
import { formatNumber, formatPercentSigned } from "@/features/chart/utils";

function rangeValue(values: number[], direction: "min" | "max") {
  if (values.length === 0) return null;
  return direction === "min" ? Math.min(...values) : Math.max(...values);
}

export function PlanTab({ data }: { data: ChartData }) {
  const { quote, candles } = data;
  const recent = candles.slice(-20);
  const support = rangeValue(recent.map((candle) => candle.low), "min");
  const resistance = rangeValue(recent.map((candle) => candle.high), "max");
  const price = quote.price;
  const risk = price !== null && support !== null ? price - support : null;
  const reward =
    price !== null && resistance !== null ? resistance - price : null;
  const riskReward =
    risk !== null && risk > 0 && reward !== null ? reward / risk : null;
  const bias =
    quote.changePercent === null
      ? "Wait for confirmation"
      : quote.changePercent >= 0
        ? "Bullish bias"
        : "Bearish bias";

  return (
    <div className="space-y-4">
      <Section title="Trading Plan">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
          <StatItem label="Bias" value={bias} />
          <StatItem label="Reference Price" value={formatNumber(price)} />
          <StatItem label="Support (20D)" value={formatNumber(support)} />
          <StatItem label="Resistance (20D)" value={formatNumber(resistance)} />
          <StatItem label="Risk / Share" value={formatNumber(risk)} />
          <StatItem label="Reward / Share" value={formatNumber(reward)} />
          <StatItem
            label="Risk / Reward"
            value={riskReward === null ? "-" : `${riskReward.toFixed(2)}R`}
          />
          <StatItem
            label="Today's Change"
            value={formatPercentSigned(quote.changePercent)}
            valueClassName={
              quote.changePercent !== null && quote.changePercent < 0
                ? "text-red-500"
                : "text-emerald-500"
            }
          />
        </div>
      </Section>

      <Section title="Execution Rules">
        <ul className="space-y-3 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-foreground">Entry:</strong> tunggu harga
            bertahan di atas support atau breakout resistance dengan volume yang
            menguat.
          </li>
          <li>
            <strong className="text-foreground">Stop loss:</strong> keluar jika
            harga menembus support dan candle ditutup di bawahnya.
          </li>
          <li>
            <strong className="text-foreground">Take profit:</strong> gunakan
            resistance sebagai target awal dan naikkan stop secara bertahap
            setelah posisi bergerak sesuai rencana.
          </li>
          <li>
            <strong className="text-foreground">Position sizing:</strong>{" "}
            batasi risiko per transaksi sesuai toleransi akun; level di atas
            adalah referensi teknikal, bukan sinyal pasti.
          </li>
        </ul>
      </Section>

      <p className="text-xs leading-relaxed text-muted">
        Trading plan ini dihitung dari quote dan 20 candle terakhir. Validasi
        kembali level, likuiditas, dan kondisi pasar sebelum mengambil posisi.
      </p>
    </div>
  );
}
