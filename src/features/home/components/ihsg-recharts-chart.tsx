"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type DataPoint = {
  time: string;
  price: number;
};

type Props = {
  data: DataPoint[];
  prevClose: number | null;
  positive?: boolean;
  /** "stockbit" = OPSI 1, "intraday-only" = OPSI 2 */
  mode?: "stockbit" | "intraday-only";
};

// ──────────────────────────────────────────────────
// OPSI 1 — Meniru Stockbit
// ──────────────────────────────────────────────────
// Sisipkan prevClose sebagai titik "09:00" di awal
// data intraday.  Garis grafik mulai dari ReferenceLine
// lalu drop ke harga sesungguhnya.
// ──────────────────────────────────────────────────
function prepareStockbitData(
  original: DataPoint[],
  prevClose: number | null,
): DataPoint[] {
  if (prevClose === null || original.length === 0) return original;
  // Jika titik pertama sudah sama persis, jangan duplikasi
  if (original[0].price === prevClose) return original;
  return [{ time: "09:00", price: prevClose }, ...original];
}

// ──────────────────────────────────────────────────
// OPSI 2 — Autoscale Intraday
// ──────────────────────────────────────────────────
// Y-Axis domain hanya dari data intraday (prevClose
// tidak ikut skala).  ReferenceLine digambar di atas
// area chart — mungkin terpotong tapi intraday penuh.
// ──────────────────────────────────────────────────
function computeIntradayDomain(prices: number[]): [number, number] {
  const intraMin = Math.min(...prices);
  const intraMax = Math.max(...prices);
  const intraRange = intraMax - intraMin || 1;
  const pad = intraRange * 0.02; // 2 % padding tipis
  return [intraMin - pad, intraMax + pad];
}

export default function IHSGRechartsChart({
  data,
  prevClose,
  positive = true,
  mode = "stockbit",
}: Props) {
  const stroke = positive ? "#14b8a6" : "#ef4444";
  const gradientId = "ihsg-recharts-gradient";

  // ── Pilih data & domain sesuai mode ─────────────
  const chartData = useMemo(() => {
    if (mode === "stockbit") return prepareStockbitData(data, prevClose);
    return data;
  }, [data, prevClose, mode]);

  const yDomain = useMemo(() => {
    if (mode === "intraday-only")
      return computeIntradayDomain(chartData.map((d) => d.price));
    // stockbit mode: hitung dari data yg sudah disisipi prevClose
    return computeIntradayDomain(chartData.map((d) => d.price));
  }, [chartData, mode]);

  if (data.length < 2) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted">
        Data intraday belum tersedia
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ pointerEvents: "none" }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
      >
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Hidden axes — required by Recharts for scale computation */}
          <XAxis dataKey="time" hide />
          <YAxis hide domain={yDomain} />

          {/* Reference line untuk Previous Close */}
          {prevClose !== null && (
            <ReferenceLine
              y={prevClose}
              stroke="#4B5563"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          )}

          <Area
            type="linear"
            dataKey="price"
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
