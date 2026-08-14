export type MacroKey =
  | "bi-rate"
  | "gdp"
  | "inflation"
  | "tpt"
  | "debt-to-pdp";

export type MacroIndicator = {
  key: MacroKey;
  label: string;
  subtitle: string;
  value: string;
  source: string;
  period: string;
  badge?: string;
  badgeTone?: "positive" | "negative" | "neutral";
  trend: string;
};

export type MacroHistoryPoint = {
  period: string;
  value: number;
};

export type MacroHistoryPayload = {
  key: MacroKey;
  label: string;
  description: string;
  points: MacroHistoryPoint[];
};
