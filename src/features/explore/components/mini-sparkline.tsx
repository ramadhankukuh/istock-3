"use client";

import { useId } from "react";

type MiniSparklineProps = {
  points: number[];
  positive?: boolean;
};

function buildPath(points: number[]) {
  if (points.length === 0) {
    return { line: "", area: "" };
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const count = points.length;
  const stepX = count > 1 ? 100 / (count - 1) : 0;

  const coordinates = points.map((value, index) => {
    const x = index * stepX;
    const y = 30 - ((value - min) / range) * 22;
    return { x, y };
  });

  const last = coordinates[coordinates.length - 1];

  const line = coordinates
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
  const area = `${line} L ${last.x.toFixed(2)} 36 L 0 36 Z`;

  return { line, area, lastX: last.x, lastY: last.y };
}

function MiniSparklineBase({ points, positive = true }: MiniSparklineProps) {
  const gradientId = useId();

  if (points.length < 2) {
    return <div className="h-12 w-full" />;
  }

  const { line, area, lastX, lastY } = buildPath(points);
  const stroke = positive ? "#14b8a6" : "#ef4444";

  return (
    <div className="h-12 w-full">
      <svg
        viewBox="0 0 108 36"
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
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {lastX !== undefined && lastY !== undefined && (
          <>
            {/* Pulse glow */}
            <circle
              cx={lastX.toFixed(2)}
              cy={lastY.toFixed(2)}
              r="4"
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
                values="4;7;4"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Dot — white centre + stroke border */}
            <circle
              cx={lastX.toFixed(2)}
              cy={lastY.toFixed(2)}
              r="2.5"
              fill="#fff"
              stroke={stroke}
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>
    </div>
  );
}

export { MiniSparklineBase as ExploreMiniSparkline };
export { MiniSparklineBase };
export default MiniSparklineBase;
