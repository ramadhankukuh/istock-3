"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PriceChartProps = {
  data: Array<{
    time: string;
    price: number;
  }>;
  positive?: boolean;
};

function computeDomain(prices: number[]): [number, number] {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = range * 0.02;
  return [min - pad, max + pad];
}

export function PriceChartBase({ data, positive = true }: PriceChartProps) {
  const yDomain = useMemo(
    () => computeDomain(data.map((d) => d.price)),
    [data],
  );

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
      >
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id={`price-chart-${positive ? "up" : "down"}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={positive ? "#14b8a6" : "#ef4444"}
                stopOpacity={0.36}
              />
              <stop
                offset="100%"
                stopColor={positive ? "#14b8a6" : "#ef4444"}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.22)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            yAxisId="price"
            domain={yDomain}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            width={42}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.1)",
            }}
          />
          <Area
            yAxisId="price"
            type="linear"
            dataKey="price"
            stroke={positive ? "#14b8a6" : "#ef4444"}
            strokeWidth={3}
            fill={`url(#price-chart-${positive ? "up" : "down"})`}
            connectNulls={false}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
