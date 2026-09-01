"use client";

import { TabBar } from "@/components/ui/tab-bar";
import type { ChartTab } from "@/features/chart/types";

const TABS: { key: ChartTab; label: string }[] = [
  { key: "keystats", label: "Keystats" },
  { key: "analysis", label: "Analysis" },
  { key: "financials", label: "Financials" },
  { key: "seasonality", label: "Seasonality" },
  { key: "about", label: "About" },
];

type Props = {
  active: ChartTab;
  onChange: (tab: ChartTab) => void;
};

export function TabNav({ active, onChange }: Props) {
  return (
    <TabBar
      tabs={TABS}
      activeKey={active}
      onChange={onChange}
    />
  );
}
