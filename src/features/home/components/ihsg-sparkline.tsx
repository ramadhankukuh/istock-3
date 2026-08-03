"use client";

import { useId } from "react";

type IHSGSparklineProps = {
  points: number[];
  positive?: boolean;
};

/**
 * Build SVG path coordinates with dynamic Y-axis scaling.
 * Uses min/max of data with tiny padding so intraday volatility
 * fills the chart instead of being compressed.
 */
function buildPath(points: number[], viewH: number, pad: number) {
  if (points.length === 0) return { line: "", area: "" };

  const rawMin = Math.min(...points);
  const rawMax = Math.max(...points);
  const rawRange = rawMax - rawMin || 1;

  // Tiny padding so the line doesn't touch the top/bottom edge
  const padding = rawRange * pad;
  const yMin = rawMin - padding;
  const yMax = rawMax + padding;
  const range = yMax - yMin;

  const count = points.length;
  const stepX = count > 1 ? 120 / (count - 1) : 0;

  const coordinates = points.map((value, index) => {
    const x = index * stepX;
    // Flip Y so higher values go up
    const y = viewH - ((value - yMin) / range) * (viewH - 4) - 2;
    return { x, y };
  });

  const last = coordinates[coordinates.length - 1];

  const line = coordinates
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const area = `${line} L ${last.x.toFixed(2)} ${viewH} L 0 ${viewH} Z`;

  return { line, area, lastX: last.x, lastY: last.y };
}

export default function IHSGSparkline({
  points,
  positive = true,
}: IHSGSparklineProps) {
  const gradientId = useId();

  // Validate data — log if too few points or suspicious range
  if (points.length < 2) {
    return <div className="h-full w-full" />;
  }

  const rawMin = Math.min(...points);
  const rawMax = Math.max(...points);
  const rawRange = rawMax - rawMin;

  // --- Debug: print data summary to console ---
  if (typeof window !== "undefined") {
    console.log("[IHSGSparkline]", {
      count: points.length,
      min: rawMin,
      max: rawMax,
      range: rawRange,
      first: points[0],
      last: points[points.length - 1],
      // First 5 intraday values (skip prevClose)
      earlyPoints: points.slice(1, 6),
    });
  }

  // viewBox height matches container proportionally
  const viewH = 120;
  const pad = 0.005; // 0.5% padding above/below min/max

  const { line, area, lastX, lastY } = buildPath(points, viewH, pad);
  const stroke = positive ? "#14b8a6" : "#ef4444";

  return (
    <svg
      viewBox={`0 0 120 ${viewH}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={area} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      {lastX !== undefined && lastY !== undefined && (
        <>
          <circle
            cx={lastX.toFixed(2)}
            cy={lastY.toFixed(2)}
            r="5"
            fill={stroke}
            opacity="0.25"
          >
            <animate
              attributeName="opacity"
              values="0.25;0.08;0.25"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="5;8;5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={lastX.toFixed(2)}
            cy={lastY.toFixed(2)}
            r="3"
            fill="#fff"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}
