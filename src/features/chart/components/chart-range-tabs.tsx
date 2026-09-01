"use client";

import { TabBar } from "@/components/ui/tab-bar";
import type { ChartRange } from "@/features/chart/types";

const RANGES: { key: ChartRange; label: string }[] = [
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "YTD", label: "YTD" },
  { key: "1Y", label: "1Y" },
  { key: "3Y", label: "3Y" },
  { key: "5Y", label: "5Y" },
];

type Props = {
  active: ChartRange;
  onChange: (range: ChartRange) => void;
};

/** Tab rentang waktu chart (1D/1W/1M/3M/YTD/1Y/3Y/5Y) — underline aktif `--accent`. */
export function ChartRangeTabs({ active, onChange }: Props) {
  return (
    <TabBar
      tabs={RANGES}
      activeKey={active}
      onChange={onChange}
      baseline={false}
    />
  );
}
