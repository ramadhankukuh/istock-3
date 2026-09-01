"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  LineStyle,
  createChart,
} from "lightweight-charts";
import type {
  IPriceLine,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import type { CandlePoint } from "@/features/stock-analysis/types";
import type { TradeSetup } from "@/features/swing-screener/types";
import type { ChartRange, ChartStyle } from "@/features/chart/types";
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

/** Format timestamp (detik UTC) sebagai jam "HH:mm" — dipakai untuk intraday. */
function formatUTCClock(time: number): string {
  const date = new Date(time * 1000);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

const UTC_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Format timestamp (detik UTC) sebagai "DD MMM HH:mm" — dipakai hourly 1W. */
function formatUTCStamp(time: number): string {
  const date = new Date(time * 1000);
  return `${String(date.getUTCDate()).padStart(2, "0")} ${
    UTC_MONTHS[date.getUTCMonth()]
  } ${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

/**
 * Parse string waktu WIB → timestamp UTC (detik).
 * Dukung "YYYY-MM-DD HH:mm" (hourly) atau "HH:mm" + `dateStr` (intraday).
 */
function toTimestamp(timeStr: string, dateStr?: string): number {
  const full = timeStr.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (full) {
    const [, y, m, d, hh, mm] = full.map(Number);
    return Date.UTC(y, m - 1, d, hh, mm) / 1000;
  }
  const [hh, mm] = timeStr.split(":").map(Number);
  const [y, mo, d] = (dateStr ?? "").split("-").map(Number);
  const year = y || new Date().getFullYear();
  const month = (mo || new Date().getMonth() + 1) - 1;
  const day = d || new Date().getDate();
  return Date.UTC(year, month, day, hh || 0, mm || 0) / 1000;
}

/**
 * Filter candle harian berdasarkan rentang aktif. `1D` return [] — range 1D
 * pakai data intraday (15 menit), bukan candle harian.
 */
function getVisibleCandles(
  candles: CandlePoint[],
  range: ChartRange,
): CandlePoint[] {
  if (range === "1D") return [];
  const days: Partial<Record<ChartRange, number | null>> = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    YTD: null,
    "1Y": 365,
    "3Y": 365 * 3,
    "5Y": 365 * 5,
  };
  const rangeDays = days[range];
  const cutoff =
    range === "YTD"
      ? new Date(new Date().getFullYear(), 0, 1)
      : new Date(Date.now() - (rangeDays ?? 365) * 86_400_000);
  return candles.filter((c) => new Date(c.time) >= cutoff);
}

type Props = {
  candles: CandlePoint[];
  dark: boolean;
  range?: ChartRange;
  style?: ChartStyle;
  /** Titik intraday 15 menit — dipakai kalau range === "1D". */
  intraday?: { time: string; price: number }[];
  /** Tanggal sesi intraday ("YYYY-MM-DD") — wajib saat intraday terisi. */
  intradayDate?: string | null;
  /** Candle 1 jam (OHLC) 7 hari — dipakai kalau range === "1W". */
  hourly?: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  previousClose?: number | null;
  tradeSetup?: TradeSetup | null;
};

export default function TradingStyleChart({
  candles,
  dark,
  range,
  style,
  intraday,
  intradayDate,
  hourly,
  previousClose,
  tradeSetup,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zone, setZone] = useState<{
    top: number;
    height: number;
    stop: number;
  } | null>(null);
  const [hoverData, setHoverData] = useState<{
    date: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    value?: number;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const tooltipPosition = useMemo(() => {
    if (!hoverPosition) return null;

    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const containerHeight = containerRef.current?.clientHeight ?? 400;
    const tooltipWidth = 180;
    const tooltipHeight = 108;
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
      height: 400,

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
        // rightOffset 0 → setelah fitContent(), candle memenuhi seluruh lebar
        // chart sampai tepi kanan (tidak ada gap kosong untuk range pendek).
        rightOffset: 0,
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

    // ── Siapkan data berdasarkan range & style aktif ──
    const activeRange = range ?? "1Y";
    const activeStyle = style ?? "candle";
    const intradayPoints = activeRange === "1D" ? (intraday ?? []) : [];
    const hourlyPoints = activeRange === "1W" ? (hourly ?? []) : [];
    const useIntraday = intradayPoints.length > 0;
    const useHourly = hourlyPoints.length > 0;
    // Range 1D tidak punya OHLC (hanya price 15 menit) → paksa line mode.
    const effectiveStyle = activeRange === "1D" ? "line" : activeStyle;

    // Fallback 1D tanpa intraday (mis. fetch gagal): tampilkan ~30 candle
    // harian terakhir supaya chart tidak kosong.
    const dailyForChart =
      activeRange === "1D" && !useIntraday
        ? candles.filter(
            (c) =>
              new Date(c.time) >= new Date(Date.now() - 30 * 86_400_000),
          )
        : getVisibleCandles(candles, activeRange);

    const seriesData = useHourly
      ? hourlyPoints.map((p) => {
          const time = toTimestamp(p.time) as UTCTimestamp;
          return effectiveStyle === "candle"
            ? {
                time,
                open: p.open,
                high: p.high,
                low: p.low,
                close: p.close,
              }
            : { time, value: p.close };
        })
      : useIntraday
        ? intradayPoints.map((p) => ({
            // WIB wall-clock dikonversi ke timestamp UTC supaya label "HH:mm"
            // selalu tampil benar (lihat localization.timeFormatter di bawah).
            time: toTimestamp(
              p.time,
              intradayDate ?? undefined,
            ) as UTCTimestamp,
            value: p.price,
          }))
        : effectiveStyle === "candle"
          ? dailyForChart.map((item) => ({
              time: item.time,
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
            }))
          : dailyForChart.map((item) => ({
              time: item.time,
              value: item.close,
            }));

    let mainSeries: ISeriesApi<"Candlestick" | "Area">;
    let isCandle = false;

    if (useIntraday || effectiveStyle === "line") {
      mainSeries = chart.addSeries(AreaSeries, {
        lineColor: "#22c55e",
        topColor: dark ? "rgba(34,197,94,0.28)" : "rgba(34,197,94,0.22)",
        bottomColor: "rgba(34,197,94,0.02)",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
    } else {
      isCandle = true;
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
      });
    }

    mainSeries.setData(seriesData as any);

    // Intraday (1D) & hourly (1W): label sumbu waktu diformat dari timestamp
    // UTC (independen dari timezone browser). 1D → "HH:mm", 1W → "DD MMM HH:mm".
    if (useIntraday || useHourly) {
      chart.applyOptions({
        localization: {
          timeFormatter: (time: UTCTimestamp) =>
            useHourly
              ? formatUTCStamp(Number(time))
              : formatUTCClock(Number(time)),
        },
        timeScale: {
          tickMarkFormatter: (time: UTCTimestamp) =>
            useHourly
              ? formatUTCStamp(Number(time))
              : formatUTCClock(Number(time)),
        },
      });
    }

    // ── Garis harga BOW/TP1/TP2/SL via native createPriceLine (garis solid
    //    membentang penuh + label harga otomatis di axis kanan, tanpa teks title) ──
    const priceLines: IPriceLine[] = [];

    if (tradeSetup && isCandle) {
      const { buyOnWeakness, tp1, tp2, sl } = tradeSetup;

      priceLines.push(
        mainSeries.createPriceLine({
          price: buyOnWeakness,
          color: dark ? "#e5e7eb" : "#111827",
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
        }),
      );
      priceLines.push(
        mainSeries.createPriceLine({
          price: tp1,
          color: "#14b8a6",
          lineWidth: 1,
          lineStyle: tp2 != null ? LineStyle.Dashed : LineStyle.Solid,
          axisLabelVisible: true,
        }),
      );
      if (tp2 != null) {
        priceLines.push(
          mainSeries.createPriceLine({
            price: tp2,
            color: "#0d9488",
            lineWidth: 1,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
          }),
        );
      }
      priceLines.push(
        mainSeries.createPriceLine({
          price: sl,
          color: "#ef4444",
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
        }),
      );
    }

    // ── Previous close reference line (garis putus-putus) — hanya range 1D ──
    if (activeRange === "1D" && previousClose != null) {
      priceLines.push(
        mainSeries.createPriceLine({
          price: previousClose,
          color: "#94a3b8",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
        }),
      );
    }

    // ── Blok zona teal(atas)/pink(bawah) dari SL sampai TP, terbagi persis di
    //    garis entry (BOW). Koordinat piksel TIDAK dibaca langsung setelah
    //    setData() — price scale auto-range baru settle di render pass
    //    berikutnya (async), jadi `computeZone` dipanggil via rAF setelah
    //    fitContent() dan dihitung ulang tiap resize / pan / zoom. ──
    const computeZone = () => {
      if (!tradeSetup || !isCandle) {
        setZone(null);
        return;
      }

      const yTpTop = mainSeries.priceToCoordinate(
        tradeSetup.tp2 ?? tradeSetup.tp1,
      );
      const yBow = mainSeries.priceToCoordinate(
        tradeSetup.buyOnWeakness,
      );
      const ySl = mainSeries.priceToCoordinate(tradeSetup.sl);

      if (yTpTop != null && yBow != null && ySl != null) {
        setZone({
          top: Math.min(yTpTop, ySl),
          height: Math.abs(ySl - yTpTop),
          stop: (yBow - yTpTop) / (ySl - yTpTop),
        });
      } else {
        setZone(null);
      }
    };

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

      const point = param.seriesData?.get(mainSeries) as
        | { value?: number }
        | { open?: number; high?: number; low?: number; close?: number }
        | undefined;

      if (!point) {
        if (clearWhenInvalid) {
          setHoverData(null);
          setHoverPosition(null);
        }
        return;
      }

      if (typeof (point as { value?: number }).value === "number") {
        const value = (point as { value: number }).value;
        setHoverData({
          date: useHourly
            ? formatUTCStamp(param.time as number)
            : useIntraday
              ? formatUTCClock(param.time as number)
              : formatHoverDate(param.time),
          value,
        });
      } else {
        const candle = point as {
          open: number;
          high: number;
          low: number;
          close: number;
        };
        if (typeof candle.open !== "number") {
          if (clearWhenInvalid) {
            setHoverData(null);
            setHoverPosition(null);
          }
          return;
        }
        setHoverData({
          date: useHourly
            ? formatUTCStamp(param.time as number)
            : formatHoverDate(param.time),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      }

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

    // Double rAF: rAF pertama nunggu browser paint, rAF kedua mastiin
    // lightweight-charts udah selesai recompute auto-scale price range —
    // baru baca koordinat piksel zone (fix box nongol di luar range candle).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        computeZone();
      });
    });

    setContainerWidth(containerRef.current.clientWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: entry.contentRect.width });
      setContainerWidth(entry.contentRect.width);
      requestAnimationFrame(() => computeZone());
    });

    resizeObserver.observe(containerRef.current);

    // Recompute zone saat user pan/zoom biar blok tetap nempel di garis
    // BOW/TP/SL (posisi vertikal bisa berubah saat price scale berubah).
    const handleVisibleRangeChange = () => {
      requestAnimationFrame(() => computeZone());
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(
      handleVisibleRangeChange,
    );

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(
        handleVisibleRangeChange,
      );
      priceLines.forEach((line) => mainSeries.removePriceLine(line));
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.unsubscribeClick(handleChartClick);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [
    candles,
    dark,
    range,
    style,
    intraday,
    intradayDate,
    hourly,
    previousClose,
    tradeSetup,
  ]);

  return (
    <div className="relative h-100 w-full overflow-hidden rounded-xl">
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
          {hoverData.value != null ? (
            <p>
              <span className={dark ? "text-gray-400" : "text-gray-500"}>
                Harga:
              </span>{" "}
              {formatNumber(hoverData.value)}
            </p>
          ) : (
            <>
              <p>
                <span className={dark ? "text-gray-400" : "text-gray-500"}>
                  Open:
                </span>{" "}
                {formatNumber(hoverData.open ?? null)}
              </p>
              <p>
                <span className={dark ? "text-gray-400" : "text-gray-500"}>
                  High:
                </span>{" "}
                {formatNumber(hoverData.high ?? null)}
              </p>
              <p>
                <span className={dark ? "text-gray-400" : "text-gray-500"}>
                  Low:
                </span>{" "}
                {formatNumber(hoverData.low ?? null)}
              </p>
              <p>
                <span className={dark ? "text-gray-400" : "text-gray-500"}>
                  Close:
                </span>{" "}
                {formatNumber(hoverData.close ?? null)}
              </p>
            </>
          )}
        </div>
      )}
      {zone && containerWidth > 0 && (
        <div
          className="pointer-events-none absolute z-4"
          style={{
            // Blok mulai dari ~70% lebar chart ke kanan (area kosong di sisi kanan candle terakhir)
            left: containerWidth * 0.7,
            width: containerWidth - containerWidth * 0.7 - 8,
            top: zone.top,
            height: zone.height,
            // SATU box solid dari SL sampai TP, dibagi dua warna persis di
            // garis BOW — bukan dua div dengan jarak/gap di antaranya.
            background: `linear-gradient(
              to bottom,
              rgba(20, 184, 166, 0.18) 0%,
              rgba(20, 184, 166, 0.18) ${zone.stop * 100}%,
              rgba(239, 68, 68, 0.14) ${zone.stop * 100}%,
              rgba(239, 68, 68, 0.14) 100%
            )`,
          }}
        />
      )}

      <div
        className="h-100 w-full overflow-hidden rounded-xl"
        ref={containerRef}
      />
    </div>
  );
}
