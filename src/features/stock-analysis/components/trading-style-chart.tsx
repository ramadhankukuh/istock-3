"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  LineSeries,
  createChart,
} from "lightweight-charts";
import type { CandlePoint } from "@/features/stock-analysis/types";
import { formatNumber } from "@/features/stock-analysis/utils";

function formatHoverDate(time: unknown) {
  if (!time) return "-";

  if (typeof time === "string") {
    const parsed = new Date(time);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return time;
  }

  if (typeof time === "number") {
    return new Date(time * 1000).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (typeof time === "object" && time !== null && "year" in time) {
    const maybeDate = time as { year: number; month: number; day: number };
    return new Date(
      maybeDate.year,
      maybeDate.month - 1,
      maybeDate.day,
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return "-";
}

type Props = {
  candles: CandlePoint[];
  dark: boolean;
};

export default function TradingStyleChart({ candles, dark }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverData, setHoverData] = useState<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    ma20: number | null;
    ma50: number | null;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const tooltipPosition = useMemo(() => {
    if (!hoverPosition) return null;

    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const containerHeight = containerRef.current?.clientHeight ?? 520;
    const tooltipWidth = 180;
    const tooltipHeight = 128;
    const gap = 12;

    let left = hoverPosition.x + gap;
    let top = hoverPosition.y + gap;

    if (left + tooltipWidth > containerWidth - gap) {
      left = hoverPosition.x - tooltipWidth - gap;
    }

    if (top + tooltipHeight > containerHeight - gap) {
      top = hoverPosition.y - tooltipHeight - gap;
    }

    left = Math.max(gap, left);
    top = Math.max(gap, top);

    return { left, top };
  }, [hoverPosition]);

  useEffect(() => {
    if (!containerRef.current || !candles?.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        attributionLogo: false,
        background: {
          type: ColorType.Solid,
          color: dark ? "#0B1220" : "#FFFFFF",
        },
        textColor: dark ? "#94A3B8" : "#475569",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
      },

      width: containerRef.current.clientWidth,
      height: 520,

      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },

      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 8,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },

      grid: {
        vertLines: {
          color: dark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.2)",
          style: 1,
        },
        horzLines: {
          color: dark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.2)",
          style: 1,
        },
      },

      crosshair: {
        mode: 0,
        vertLine: {
          visible: true,
          width: 1,
          color: dark ? "rgba(148,163,184,0.55)" : "rgba(71,85,105,0.55)",
          style: 2,
          labelVisible: false,
        },
        horzLine: {
          visible: true,
          width: 1,
          color: dark ? "rgba(148,163,184,0.55)" : "rgba(71,85,105,0.55)",
          style: 2,
          labelVisible: false,
        },
      },
    });

    chart.applyOptions({
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
    });

    // ambil tanggal 1 tahun lalu
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // filter hanya 1 tahun terakhir
    const filteredCandles = candles.filter((c) => {
      const d = new Date(c.time);
      return d >= oneYearAgo;
    });

    candlestickSeries.setData(
      filteredCandles.map((item) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      })),
    );

    const calculateSma = (source: CandlePoint[], period: number) => {
      const points: { time: string; value: number }[] = [];
      let rollingSum = 0;

      for (let index = 0; index < source.length; index += 1) {
        rollingSum += source[index].close;

        if (index >= period) {
          rollingSum -= source[index - period].close;
        }

        if (index >= period - 1) {
          points.push({
            time: source[index].time,
            value: rollingSum / period,
          });
        }
      }

      return points;
    };

    const ma20Series = chart.addSeries(LineSeries, {
      title: "MA20",
      color: dark ? "#818cf8" : "#4f46e5",
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    const ma50Series = chart.addSeries(LineSeries, {
      title: "MA50",
      color: dark ? "#fbbf24" : "#d97706",
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    ma20Series.setData(calculateSma(filteredCandles, 20));
    ma50Series.setData(calculateSma(filteredCandles, 50));

    const updateHoverFromParam = (param: any, clearWhenInvalid = true) => {
      if (
        !param?.time ||
        !param?.point ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        if (clearWhenInvalid) {
          setHoverData(null);
          setHoverPosition(null);
        }
        return;
      }

      const candle = param.seriesData?.get(candlestickSeries);
      if (!candle) {
        if (clearWhenInvalid) {
          setHoverData(null);
          setHoverPosition(null);
        }
        return;
      }

      setHoverData({
        date: formatHoverDate(param.time),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        ma20:
          param.seriesData?.get(ma20Series)?.value !== undefined
            ? param.seriesData.get(ma20Series).value
            : null,
        ma50:
          param.seriesData?.get(ma50Series)?.value !== undefined
            ? param.seriesData.get(ma50Series).value
            : null,
      });

      const snappedX = chart.timeScale().timeToCoordinate(param.time);

      setHoverPosition({
        x: snappedX ?? param.point.x,
        y: param.point.y,
      });
    };

    const handleCrosshairMove = (param: any) => {
      updateHoverFromParam(param, true);
    };

    const handleChartClick = (param: any) => {
      updateHoverFromParam(param, false);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);
    chart.subscribeClick(handleChartClick);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: entry.contentRect.width });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.unsubscribeClick(handleChartClick);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, dark]);

  return (
    <div className="relative h-130 w-full overflow-hidden rounded-xl">
      <div className="pointer-events-none absolute left-3 top-3 z-6 flex items-center gap-3 text-[11px] font-medium">
        <span
          className={`inline-flex items-center gap-1 ${
            dark ? "text-indigo-300" : "text-indigo-700"
          }`}
        >
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{ backgroundColor: dark ? "#818cf8" : "#4f46e5" }}
          />
          MA20
        </span>
        <span
          className={`inline-flex items-center gap-1 ${
            dark ? "text-amber-300" : "text-amber-700"
          }`}
        >
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{ backgroundColor: dark ? "#fbbf24" : "#d97706" }}
          />
          MA50
        </span>
      </div>

      {hoverPosition && (
        <div
          className="pointer-events-none absolute bottom-0 top-0 z-5"
          style={{
            left: hoverPosition.x,
            width: 1,
            backgroundColor: dark
              ? "rgba(148,163,184,0.75)"
              : "rgba(71,85,105,0.75)",
          }}
        />
      )}

      {hoverData && tooltipPosition && (
        <div
          className={`pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-xs backdrop-blur ${
            dark
              ? "border border-gray-700 bg-gray-900/90 text-gray-100"
              : "border border-gray-300 bg-white/95 text-gray-900"
          }`}
          style={{
            left: tooltipPosition.left,
            top: tooltipPosition.top,
          }}
        >
          <p>
            <span className={dark ? "text-gray-400" : "text-gray-500"}>
              Tanggal:
            </span>{" "}
            {hoverData.date}
          </p>
          <p>
            <span className={dark ? "text-gray-400" : "text-gray-500"}>
              Open:
            </span>{" "}
            {formatNumber(hoverData.open)}
          </p>
          <p>
            <span className={dark ? "text-gray-400" : "text-gray-500"}>
              High:
            </span>{" "}
            {formatNumber(hoverData.high)}
          </p>
          <p>
            <span className={dark ? "text-gray-400" : "text-gray-500"}>
              Low:
            </span>{" "}
            {formatNumber(hoverData.low)}
          </p>
          <p>
            <span className={dark ? "text-gray-400" : "text-gray-500"}>
              Close:
            </span>{" "}
            {formatNumber(hoverData.close)}
          </p>
          <p>
            <span className={dark ? "text-indigo-300" : "text-indigo-700"}>
              MA20:
            </span>{" "}
            {formatNumber(hoverData.ma20)}
          </p>
          <p>
            <span className={dark ? "text-amber-300" : "text-amber-700"}>
              MA50:
            </span>{" "}
            {formatNumber(hoverData.ma50)}
          </p>
        </div>
      )}
      <div
        className="h-130 w-full overflow-hidden rounded-xl"
        ref={containerRef}
      />
    </div>
  );
}
