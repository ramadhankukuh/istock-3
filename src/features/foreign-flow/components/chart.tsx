"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactRupiah } from "@/lib/utils/format";
import type { StockHistoryPoint } from "@/features/foreign-flow/types";

type ChartColors = Record<string, string>;

export default function ForeignChart({
  historyRows,
  foreignGradientId,
  foreignGradientOffset,
  closePriceDomain,
  chartColors,
}: {
  historyRows: StockHistoryPoint[];
  foreignGradientId: string;
  foreignGradientOffset: number;
  closePriceDomain: [number, number];
  chartColors: ChartColors;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={historyRows}>
        <defs>
          <linearGradient id={foreignGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset={Math.max(0, foreignGradientOffset - 0.001)}
              stopColor={chartColors.foreignPositive}
            />
            <stop
              offset={Math.min(1, foreignGradientOffset + 0.001)}
              stopColor={chartColors.foreignNegative}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <Legend wrapperStyle={{ color: chartColors.legend, fontSize: 12 }} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: chartColors.axis }}
          stroke={chartColors.axis}
        />
        <YAxis
          yAxisId="net"
          tick={{ fontSize: 12, fill: chartColors.axis }}
          stroke={chartColors.axis}
          tickFormatter={(value: number) => formatCompactRupiah(value)}
        />
        <YAxis
          yAxisId="close"
          orientation="right"
          domain={closePriceDomain}
          tickCount={6}
          tick={{ fontSize: 12, fill: chartColors.axis }}
          stroke={chartColors.axis}
          tickFormatter={(value: number) =>
            `Rp ${value.toLocaleString("id-ID")}`
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.tooltipBg,
            borderColor: chartColors.tooltipBorder,
            color: chartColors.tooltipText,
            borderRadius: 8,
          }}
          labelStyle={{ color: chartColors.tooltipText }}
          itemStyle={{ color: chartColors.tooltipText }}
          formatter={(value, name) => {
            const safeValue = Number(value) || 0;
            const normalizedName = String(name ?? "").toLowerCase();
            if (normalizedName.includes("area")) return null;
            if (normalizedName === "close" || normalizedName === "harga")
              return [`Rp ${safeValue.toLocaleString("id-ID")}`, "Harga"];
            return [formatCompactRupiah(safeValue), "Net Foreign"];
          }}
        />
        <ReferenceLine
          yAxisId="net"
          y={0}
          stroke={chartColors.referenceLine}
          strokeDasharray="4 4"
        />
        <Area
          yAxisId="net"
          type="monotone"
          dataKey="totalForeignNet"
          name="Area Net Foreign"
          legendType="none"
          stroke="none"
          fill={`url(#${foreignGradientId})`}
          fillOpacity={0.18}
          isAnimationActive={false}
        />
        <Line
          yAxisId="net"
          type="monotone"
          dataKey="totalForeignNet"
          name="Net Foreign"
          stroke={`url(#${foreignGradientId})`}
          strokeWidth={2}
          dot={{ r: 2.5 }}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="close"
          type="monotone"
          dataKey="close"
          name="Harga"
          stroke={chartColors.closeLine}
          strokeDasharray="6 4"
          strokeWidth={2}
          dot={{ r: 2.5 }}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
